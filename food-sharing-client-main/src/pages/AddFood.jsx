import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../provider/AuthProvider";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UseTitle from "../components/UseTitle";
import useAxiosSecure from "../hooks/useAxiosSecure";
import LocationAutocomplete from "../components/LocationAutocomplete";
import { evaluatePrice } from "../utils/pricingEngine";

const AddFood = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  UseTitle("Add Foods");

  const [price, setPrice] = useState("");
  const [priceFeedback, setPriceFeedback] = useState(null);
  const [expiredDate, setExpiredDate] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("item");
  const [preview, setPreview] = useState(null);

  const [foodName, setFoodName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [collectionInstructions, setCollectionInstructions] = useState("");

  const [loading, setLoading] = useState(false);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const priceNum = Number(price);
    const quantityNum = Number(quantityValue);

    if (
      !expiredDate ||
      isNaN(priceNum) ||
      isNaN(quantityNum) ||
      priceNum < 0 ||
      quantityNum <= 0
    ) {
      setPriceFeedback(null);
      return;
    }

    const result = evaluatePrice({
      itemType: "cooked_meal",
      expiryDate: expiredDate,
      quantityValue: quantityNum,
      quantityUnit,
      userPrice: priceNum,
    });

    setPriceFeedback(result);
  }, [price, quantityValue, quantityUnit, expiredDate]);

  const handleAddFood = async (e) => {
    e.preventDefault();

    const priceNum = Number(price);
    const quantityNum = Number(quantityValue);

    if (priceNum < 0 || quantityNum <= 0) {
      toast.error("Price and quantity must be greater than or equal to zero");
      return;
    }

    setLoading(true);

    if (expiredDate < getTodayString()) {
      toast.error("Expiry date cannot be in the past");
      setLoading(false);
      return;
    }

    const form = e.target;
    const fileInput = form.querySelector('input[type="file"]');
    const imageFile = fileInput?.files?.[0];

    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      const imageData = new FormData();
      imageData.append("file", imageFile);
      imageData.append("upload_preset", "imagesreserve");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/drqscxu20/image/upload",
        imageData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      const formData = {
        foodName,
        price: Number(price),
        quantityValue: Number(quantityValue),
        quantityUnit,
        foodImage: imageUrl,
        donator: {
          image: user?.photoURL,
          name: user?.displayName,
          email: user?.email,
        },
        pickupLocation,
        location: locationData,
        expiredDate,
        additionalNotes,
        foodStatus: "available",
        collectionInstructions,
      };

      const { data } = await axiosSecure.post("/foods", formData);

      if (data.insertedId) {
        toast.success("Food added successfully");
        navigate("/manageFood");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="text-xs text-clay">
                <Link to="/dashboard" className="hover:text-cocoa">
                  Dashboard
                </Link>{" "}
                <span className="text-sand">/</span>{" "}
                <span className="text-cocoa">Add Food</span>
              </div>
              <h2 className="section-title mt-2">Add a Food</h2>
              <p className="section-subtitle mt-2">
                Describe your meal, set a pickup location, and make it available
                for the community.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="btn-ghost-warm inline-flex items-center gap-2 text-xs self-start"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="card-surface p-6 sm:p-8">
            <form onSubmit={handleAddFood} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Food Name</span>
                  </label>
                  <input
                    type="text"
                    name="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Food Name"
                    required
                    className="input-warm w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Food Image</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    className="file-input file-input-bordered border-sand bg-cream w-full"
                    onChange={(e) =>
                      setPreview(URL.createObjectURL(e.target.files[0]))
                    }
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mt-3 w-32 h-32 object-cover rounded-xl border border-sand"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Food Quantity</span>
                  </label>
                  <input
                    type="number"
                    value={quantityValue}
                    onChange={(e) => setQuantityValue(e.target.value)}
                    placeholder="Quantity"
                    required
                    className="input-warm w-full"
                  />

                  <select
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="select-warm mt-2"
                  >
                    <option value="item">Item(s)</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="portion">Portion(s)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Pickup Location</span>
                  </label>
                  <LocationAutocomplete
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    onSelectLocation={setLocationData}
                    placeholder="Start typing address..."
                  />

                  <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <strong>Safety note:</strong> For safety, avoid adding your
                    exact location. Use a nearby street or public pickup spot.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price (RM)</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    required
                    className="input-warm w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Expired Date</span>
                  </label>
                  <input
                    type="date"
                    name="expiredDate"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    required
                    min={getTodayString()}
                    className="input-warm w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Collection Instructions</span>
                  </label>
                  <textarea
                    className="textarea-warm w-full"
                    rows="3"
                    placeholder="Meet at the guard house, look for a red car..."
                    value={collectionInstructions}
                    onChange={(e) => setCollectionInstructions(e.target.value)}
                  ></textarea>
                  <label className="label">
                    <span className="label-text-alt text-clay">
                      These instructions appear only after you approve a request.
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Additional Notes</span>
                  </label>
                  <input
                    type="text"
                    name="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Additional Notes"
                    required
                    className="input-warm w-full"
                  />
                </div>
              </div>

              <input
                type="submit"
                value={loading ? "Processing..." : "Add Food"}
                disabled={loading}
                className={`btn-warm w-full ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
            </form>

            {priceFeedback && (
              <div
                key={priceFeedback.verdict}
                className={`price-feedback-inline ${
                  priceFeedback.verdict === "Fair"
                    ? "is-fair"
                    : priceFeedback.verdict === "Slightly High"
                    ? "is-slightly-high"
                    : "is-unfair"
                }`}
              >
                <strong>{priceFeedback.verdict}</strong>
                <p>{priceFeedback.message}</p>
                <small>Suggested price: RM {priceFeedback.suggestedPrice}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddFood;
