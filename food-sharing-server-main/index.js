const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://reserve-project-5d333.web.app",
      "https://reserve-project-5d333.firebaseapp.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// verify token

// quantityToKg  
function quantityToKg(value, unit) {
  if (!value || value <= 0) return 0;

  switch (unit) {
    case "kg":
      return value;
    case "g":
      return value / 1000;
    case "item":
      return value * 0.5;      // assume 0.5kg per item
    case "portion":
      return value * 0.4;      // assume 0.4kg per portion
    default:
      return 0;
  }
}

const uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    
    await client.connect();

    const db = client.db("reserveDB")

    const foodsCollection = db.collection("foods");
    const foodRequestCollection = db.collection("requests");
    const usersCollection = db.collection("users");
    const reviewsCollection = db.collection("reviews");

    const verifyToken = (req, res, next) => {
      const token = req?.cookies?.token;
      if (!token) {
        return res.status(401).send({ message: "Unauthorized access" });
      }

      jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: "Unauthorized access" });
        }

        // SECURITY CHECK: Is this the most recent session?
        const user = await usersCollection.findOne(
           { email: decoded.email },
           { projection: { currentSessionId: 1 } }
        );

        // If the session ID in the token doesn't match the one in DB, kick them out
        if (!user || user.currentSessionId !== decoded.sessionId) {
          return res.status(403).send({ message: "Session expired. Logged in on another device." });
        }

        req.user = decoded;
        next();
      });
    };

    const cleanupExpiredFoods = async () => {           //cleanup expired foods
      try {
        // 1. Get today's date in YYYY-MM-DD format
      
        const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kuala_Lumpur" 
});

        // 2. Define the criteria
        // We only delete foods that are:
        // A) "available" (don't delete 'booked' items currently being picked up!)
        // B) Expiry date is strictly LESS than today
        const query = {
          foodStatus: "available",
          expiredDate: { $lt: today } 
        };

        // 3. Delete the foods
        const result = await foodsCollection.deleteMany(query);

      } catch (error) {
        console.error("Error in auto-cleanup:", error);
      }
    };

    // Run immediately on startup
    cleanupExpiredFoods();

    // Then run every 60 seconds (60000 ms)
    setInterval(cleanupExpiredFoods, 60000);  //setInterval cleanup expired foods
    
    // ---------------------------------------------------------

    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ uid: 1 }, { unique: true, sparse: true });
    await reviewsCollection.createIndex({ toEmail: 1, createdAt: -1 });

// Prevent duplicate rating by same side for same request
// buyerRole and donorRole will be "buyer" or "donor"
await reviewsCollection.createIndex(
  { requestId: 1, raterRole: 1 },
  { unique: true }
);

      const EXPIRE_AFTER_MS = 60 * 60 * 1000; // 1 hour

    const expireOldRequests = async () => {
      const now = new Date();

      const expiredRequests = await foodRequestCollection.find({
        status: "pending",
        createdAt: { $lt: new Date(now - EXPIRE_AFTER_MS) },
      }).toArray();

      for (const req of expiredRequests) {
        // Mark request as expired
        await foodRequestCollection.updateOne(
          { _id: req._id },
          { $set: { status: "expired" } }
        );

        // Restore food to available
        await foodsCollection.updateOne(
          { _id: new ObjectId(req.foodId) },
          { $set: { foodStatus: "available" } }
        );
      }
    };



    // generating jwt
   app.post("/jwt", async (req, res) => {
      const { email } = req.body;

      // 🔹 1. Generate a random Session ID (timestamp + random number)
      const sessionId = new Date().getTime() + "-" + Math.random();

      // 🔹 2. Save this ID to the user in MongoDB
      await usersCollection.updateOne(
        { email },
        { $set: { currentSessionId: sessionId } },
        { upsert: true } // Create user field if it doesn't exist
      );

      //  3 Bake the sessionId into the Token
      const token = jwt.sign(
        { email, sessionId }, // Add sessionId here
        process.env.SECRET_KEY,
        { expiresIn: "10h" }
      );

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // clear cookie
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // foods related apis

    // save a food data in db
    app.post("/foods", async (req, res) => {
     const food = req.body;

     // We check if THIS user already has a food with the SAME details
  const duplicateQuery = {                 //duplicate checked
    "donator.email": food.donator.email,
    foodName: food.foodName,
    pickupLocation: food.pickupLocation,
    expiredDate: food.expiredDate,
    price: food.price,
    quantityValue: food.quantityValue,
    quantityUnit: food.quantityUnit,
  };

  const existingFood = await foodsCollection.findOne(duplicateQuery);

  if (existingFood) {
    return res.status(409).send({ message: "You have already added this exact food item." });
  }

     const newFood = {
    ...food,
    // If none provided, default to empty string
    collectionInstructions: food.collectionInstructions || "" 
  };

     const result = await foodsCollection.insertOne(food);

  // Update donor stats
  await usersCollection.updateOne(
    { email: food.donator.email },
    {
      $inc: {
        donationsCount: 1,
        totalFoodDonatedKg:
          food.quantityUnit === "kg" ? food.quantityValue : 0,
      },
    }
  );

  res.send(result);
    });

    // get all data
    app.get("/foods", async (req, res) => {
      await expireOldRequests();
      const { search } = req.query;
      const { sort } = req.query;

      let options = {};

      if (sort) {
        options = { sort: { expiredDate: sort === "asc" ? 1 : -1 } };
      }
      let query = {};
      if (search) {
        query = { foodName: { $regex: search, $options: "i" } };
      }

      
      const foods = await foodsCollection.find(query, options).toArray();
      res.send(foods);
    });

    // get specific users posted data
    app.get("/foods/:email", verifyToken, async (req, res) => {
      const email = req.params.email;

     const query = { 
        "donator.email": email,
        foodStatus: { $ne: "completed" } // $ne means "Not Equal"
      };

      if (req.user.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    });

    // delete a data
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });

    // specific food detail
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });

    // update a food
    app.put("/updateFood/:id", async (req, res) => {
      const id = req.params.id;
      const formData = req.body;
      const updated = {
        $set: formData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await foodsCollection.updateOne(query, updated, options);
      res.send(result);
    });

app.post("/users", async (req, res) => {
  const { email, name, photoURL } = req.body;

  const existingUser = await usersCollection.findOne({ email });

  if (existingUser) {
    const updates = {};
    const existingName = (existingUser.name || "").trim();
    const incomingName = (name || "").trim();
    if (!existingName && incomingName) {
      updates.name = incomingName;
    }

    const brokenDefaultUrl = "https://i.ibb.co/T0h48vD/default-profile.png";
    const existingPhoto = (existingUser.photoURL || "").trim();
    const incomingPhoto = (photoURL || "").trim();
    const hasBrokenPhoto =
      existingPhoto === brokenDefaultUrl ||
      existingPhoto.includes(brokenDefaultUrl);

    if ((!existingPhoto || hasBrokenPhoto) && incomingPhoto) {
      updates.photoURL = incomingPhoto;
    }

    if (Object.keys(updates).length > 0) {
      await usersCollection.updateOne({ email }, { $set: updates });
      return res.send({ message: "User profile updated", created: false, updated: true });
    }

    return res.send({ message: "User already exists", created: false, updated: false });
  }

  const newUser = {
    email,
    name,
    photoURL,
    bio: "",
    createdAt: new Date(),

    // stats
    donationsCount: 0,
    pickupsCompleted: 0,
    pickupsGiven: 0,
    totalFoodSavedKg: 0,

    // ratings
    ratingSum: 0,
    averageRating: 5,
    totalRatings: 0,
  };

  await usersCollection.insertOne(newUser);
  res.send({ message: "User profile created", created: true, updated: false });
});



        app.post("/requests", async (req, res) => {
  const { foodId } = req.body;
  const REQUEST_EXPIRY_MINUTES = 30;
  


  const existingRequest = await foodRequestCollection.findOne({
    foodId,
    status: "pending",
  });

  const food = await foodsCollection.findOne({
  _id: new ObjectId(foodId),
});

  if (existingRequest) {
    return res.status(400).send({
      message: "This food already has a pending request",
    });
  }

 const requestData = {
  ...req.body,

  // Persist quantity info INSIDE the request
  quantityValue: food.quantityValue,
  quantityUnit: food.quantityUnit,

  price:food.price,

  status: "pending",
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + REQUEST_EXPIRY_MINUTES * 60 * 1000),

  buyerConfirmed: false,
  donorConfirmed: false,
  buyerRated: false,
  donorRated: false,
};

 

  

  const result = await foodRequestCollection.insertOne(requestData);

  // Hide food immediately
  await foodsCollection.updateOne(
    { _id: new ObjectId(foodId) },
    { $set: { foodStatus: "requested" } }
  );

  res.send(result);
});

app.patch("/users/me", verifyToken, async (req, res) => {
  const email = req.user.email;
  const { name, photoURL, description, bio } = req.body;

  await usersCollection.updateOne(
    { email },
    {
      $set: {
        name,
        photoURL,
        description,
        updatedAt: new Date(),
      },
    }
  );

  res.send({ success: true });
});

app.get("/users/me", verifyToken, async (req, res) => {

  const email = req.user.email;


  let user = await usersCollection.findOne({ email });

  // CREATE USER IF MISSING (THIS IS THE FIX)
  if (!user) {
    const newUser = {
      email,
      name: "",
      photoURL: "",
      description: "",
      createdAt: new Date(),

      donationsCount: 0,
      pickupsCompleted: 0,
      pickupsGiven: 0,
      totalFoodSavedKg: 0,

      ratingSum: 0,
      totalRatings: 0,
      averageRating: 5,
    };

    await usersCollection.insertOne(newUser);
    user = newUser;
  }


  
  // ✅ SAFE RATING CALCULATION
  const totalRatings = user.totalRatings || 0;
  const ratingSum = user.ratingSum || 0;

  const averageRating =
    totalRatings > 0
      ? Number((ratingSum / totalRatings).toFixed(2))
      : 5;

  res.send({
    ...user,
    averageRating,
  });
});


app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  const user = await usersCollection.findOne(
    { email },
    {
      projection: {
        _id: 0,
        email: 1,
        name: 1,
        photoURL: 1,
        donationsCount: Number,
  pickupsRequested: Number,
  pickupsCompleted: Number,
  pickupsGiven: Number,
  totalFoodSavedKg: Number,
        createdAt: 1,
      },
    }
  );

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  const pickupRate =
    user.pickupsGiven > 0
      ? Math.round((user.pickupsCompleted / user.pickupsGiven) * 100)
      : 100;

  res.send({ ...user, pickupRate });
});

app.patch("/requests/:id/buyer-confirm", verifyToken, async (req, res) => {
  const id = req.params.id;

  const request = await foodRequestCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!request) {
    return res.status(404).send({ message: "Request not found" });
  }

  if (request.requesterEmail !== req.user.email) {
    return res.status(403).send({ message: "Forbidden" });
  }

  if (request.buyerConfirmed) {
    return res.send({ success: true });
  }

  await foodRequestCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { buyerConfirmed: true } }
  );

  res.send({ success: true });
});

app.patch("/requests/:id/donor-confirm", verifyToken, async (req, res) => {
  const id = req.params.id;

  const request = await foodRequestCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!request) {
    return res.status(404).send({ message: "Request not found" });
  }

  // Security check
  if (request.donorEmail !== req.user.email) {
    return res.status(403).send({ message: "Forbidden" });
  }

  if (!request.buyerConfirmed) {
    return res.status(400).send({
      message: "Buyer has not confirmed collection yet",
    });
  }

  // Prevent double completion
  if (request.status === "completed") {
    return res.send({ success: true });
  }

  //  Mark request completed
  await foodRequestCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        donorConfirmed: true,
        status: "completed",
      },
    }
  );

  //  Mark food completed
  await foodsCollection.updateOne(
    { _id: new ObjectId(request.foodId) },
    { $set: { foodStatus: "completed" } }
  );

  // quantityToKg         
 
const quantityKg = quantityToKg(
  request.quantityValue,
  request.quantityUnit
);

  //  Update BUYER profile
  await usersCollection.updateOne(
    { email: request.requesterEmail },
    {
      $inc: {
        pickupsCompleted: 1,
        totalFoodSavedKg: quantityKg,
      },
    }
  );

  //  Update DONOR profile
  await usersCollection.updateOne(
    { email: request.donorEmail },
    {
      $inc: {
        pickupsGiven: 1,
        totalFoodSavedKg: quantityKg,
      },
    }
  );

  res.send({ success: true });
});

app.patch("/requests/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const { status, foodId } = req.body;

  const request = await foodRequestCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!request) {
    return res.status(404).send({ message: "Request not found" });
  }

  if (request.donorEmail !== req.user.email) {
    return res.status(403).send({ message: "Forbidden" });
  }

  // 🔹 NEW LOGIC: If Approving, fetch donor's instructions first
  let updateDoc = { status };

  if (status === "approved") {

    const requestDoc = await foodRequestCollection.findOne({ _id: new ObjectId(id) });

    if (requestDoc) {
      await usersCollection.updateOne(
        { email: requestDoc.requesterEmail },
        { $inc: { totalAcceptedRequests: 1 } }
      );
    }

    const securityCode = Math.floor(1000 + Math.random() * 9000).toString();
    updateDoc.securityCode = securityCode; // Save it to the request
    
    const foodItem = await foodsCollection.findOne({ _id: new ObjectId(foodId) });
    updateDoc.collectionInstructions = foodItem?.collectionInstructions || "No specific instructions provided.";
    
    
    await foodsCollection.updateOne(
      { _id: new ObjectId(foodId) },
      { $set: { foodStatus: "booked" } }
    );
  }

  if (status === "rejected") {
    await foodsCollection.updateOne(
      { _id: new ObjectId(foodId) },
      { $set: { foodStatus: "available" } }
    );
  }

  if (status === "completed") {
     const requestDoc = await foodRequestCollection.findOne({ _id: new ObjectId(id) });
     
     // Increment successful pickups for buyer
     await usersCollection.updateOne(
        { email: requestDoc.requesterEmail },
        { $inc: { successfulPickups: 1 } }
     );
  }

  await foodRequestCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateDoc }
  );

  res.send({ success: true });
});



// Logged-in user updates THEIR own profile fields
app.patch("/users/me", verifyToken, async (req, res) => {
  const email = req.user.email;
  // collectionInstructions HERE
  const { name, photoURL, description, collectionInstructions } = req.body;

  const update = {
    $set: {
      ...(name !== undefined ? { name } : {}),
      ...(photoURL !== undefined ? { photoURL } : {}),
      ...(description !== undefined ? { description } : {}),
      
      ...(collectionInstructions !== undefined ? { collectionInstructions } : {}),
      updatedAt: new Date(),
    },
  };

  const result = await usersCollection.updateOne({ email }, update);
  res.send(result);
});

    app.get("/requests/donor/:email", verifyToken, async (req, res) => {
      await expireOldRequests();
      const email = req.params.email;

      const requests = await foodRequestCollection
        .find({
            donorEmail: email,
            status: { $in: ["pending", "approved", "completed"] },
          })
        .toArray();

      res.send(requests);
    });


app.get("/users/public/:email", async (req, res) => {
  const email = req.params.email;

  const user = await usersCollection.findOne(
    { email },
    {
      projection: {
        _id: 0,
        name: 1,
        email: 1,
        photoURL: 1,
        description: 1,
        pickupsGiven: 1,
        pickupsCompleted: 1,
        totalFoodSavedKg: 1,
        averageRating:1,
        totalRatings: 1,
        createdAt: 1,
      },
    }
  );

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  res.send(user);
});


    app.get("/requests/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;

      if (req.user.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const requests = await foodRequestCollection
        .find({ requesterEmail: email })
        .toArray();

      res.send(requests);
    });


    setInterval(async () => {
        const now = new Date();

        const expiredRequests = await foodRequestCollection
          .find({
            status: "pending",
            expiresAt: { $lte: now },
          })
          .toArray();

        for (const req of expiredRequests) {
          // Mark request expired
          await foodRequestCollection.updateOne(
            { _id: req._id },
            { $set: { status: "expired" } }
          );

          // Make food available again
          await foodsCollection.updateOne(
            { _id: new ObjectId(req.foodId) },
            { $set: { foodStatus: "available" } }  
          );
        }
      }, 60 * 1000); // runs every 1 minute

app.get("/reviews/public/:email", async (req, res) => {
  const email = req.params.email;

  const reviews = await reviewsCollection
    .find(
      { toEmail: email },
      {
        projection: {
          _id: 0,
          rating: 1,
          comment: 1,
          raterRole: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  res.send(reviews);
});


app.post("/reviews", verifyToken, async (req, res) => {
  const { requestId, toEmail, rating, comment, raterRole } = req.body;

  if (!requestId || !toEmail || !rating || !raterRole) {
    return res.status(400).send({ message: "Missing required fields" });
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).send({ message: "Rating must be an integer 1-5" });
  }

  const request = await foodRequestCollection.findOne({
    _id: new ObjectId(requestId),
  });

  if (!request) return res.status(404).send({ message: "Request not found" });

  if (request.status !== "completed") {
    return res.status(400).send({ message: "Request is not completed yet" });
  }

  // Auth check
  if (raterRole === "buyer") {
    if (request.requesterEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden" });
    }
    if (request.buyerRated) {
      return res.status(400).send({ message: "Buyer already rated" });
    }
  } else if (raterRole === "donor") {
    if (request.donorEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden" });
    }
    if (request.donorRated) {
      return res.status(400).send({ message: "Donor already rated" });
    }
  } else {
    return res.status(400).send({ message: "Invalid raterRole" });
  }

  const otherPartyEmail =
    raterRole === "buyer" ? request.donorEmail : request.requesterEmail;

  if (toEmail !== otherPartyEmail) {
    return res.status(400).send({ message: "Invalid recipient (toEmail)" });
  }

  // 1️⃣ Insert Review
  const reviewDoc = {
    requestId: String(requestId),
    toEmail,
    rating: ratingNum,
    comment: (comment || "").slice(0, 500),
    raterRole,
    fromEmail: req.user.email,
    createdAt: new Date(),
  };

  await reviewsCollection.insertOne(reviewDoc);

  // 2️⃣ Mark Request as Rated
  if (raterRole === "buyer") {
    await foodRequestCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { buyerRated: true } }
    );
  } else {
    await foodRequestCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { donorRated: true } }
    );
  }

  // 3️⃣ Update User Stats (Simplified Logic)
  // Step A: Increment the totals safely
  await usersCollection.updateOne(
    { email: toEmail },
    {
      $inc: { 
        ratingSum: ratingNum, 
        totalRatings: 1 
      }
    }
  );

  // Step B: Calculate and save the new Average
  const updatedUser = await usersCollection.findOne({ email: toEmail });

  if (updatedUser) {
    const newTotal = updatedUser.totalRatings || 0;
    const newSum = updatedUser.ratingSum || 0;
    
    // Calculate Average (Default to 5 if no ratings to prevent 0/0)
    const newAvg = newTotal > 0 
      ? Number((newSum / newTotal).toFixed(2)) 
      : 5;

    await usersCollection.updateOne(
      { email: toEmail },
      { $set: { averageRating: newAvg } }
    );
  }

  res.send({ success: true });
});

    // get specific request data
    app.get("/my-request/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };

      if (req.user.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await foodRequestCollection.find(query).toArray();
      res.send(result);
    });


app.get("/", (req, res) => {
  res.send("foods are here");
});


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
});
