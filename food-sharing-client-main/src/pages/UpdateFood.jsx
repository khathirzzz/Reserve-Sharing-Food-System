import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import UseTitle from "../components/UseTitle";
import Lottie from "lottie-react";
import updateLottieData from "../assets/update.json";

import useAxiosSecure from "../hooks/useAxiosSecure";
import LocationAutocomplete from "../components/LocationAutocomplete";

import { evaluatePrice } from "../utils/pricingEngine";

const UpdateFood = () => {
  const axiosSecure = useAxiosSecure();
  const [food, setFood] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  const [preview, setPreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);

  const [price, setPrice] = useState("");
  const [priceFeedback, setPriceFeedback] = useState(null);

  const [foodName, setFoodName] = useState("");
  const [foodQuantity, setFoodQuantity] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [quantityValue, setQuantityValue] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("item");

  const [collectionInstructions, setCollectionInstructions] = useState("");

  UseTitle("Update Food");

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (id) {
      fetchFood();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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

  const fetchFood = async () => {
    const { data } = await axiosSecure.get(`/food/${id}`);
    setFood(data);

    setFoodName(data.foodName || "");

    const address = data?.location?.address || data?.pickupLocation || "";
    setPickupLocation(data.pickupLocation);

    setLocationData(data.location);

    setExpiredDate(data.expiredDate || "");
    setAdditionalNotes(data.additionalNotes || "");

    setQuantityValue(data.quantityValue || "");
    setQuantityUnit(data.quantityUnit || "item");

    setPrice(data.price || "");

    setCollectionInstructions(data.collectionInstructions || "");
  };

  const handleCancel = () => {
    navigate("/manageFood");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (expiredDate < getTodayString()) {
      toast.error("Expiry date cannot be in the past");
      setLoading(false);
      return;
    }

    let imageUrl = food.foodImage;

    if (newImageFile) {
      const imageData = new FormData();
      imageData.append("file", newImageFile);
      imageData.append("upload_preset", "imagesreserve");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/drqscxu20/image/upload",
        imageData
      );

      imageUrl = cloudinaryRes.data.secure_url;
    }

    const formData = {
      foodName,
      price: Number(price),
      foodImage: imageUrl,
      quantityValue: Number(quantityValue),
      quantityUnit,
      pickupLocation,
      location: locationData,
      expiredDate,
      additionalNotes,
      foodStatus: food.foodStatus,
      collectionInstructions,
    };

    const { data } = await axiosSecure.put(`/updateFood/${id}`, formData);

    if (data.modifiedCount || data.upsertedCount) {
      toast.success("Food updated successfully");
      navigate("/manageFood");
    }
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="flex flex-col gap-6">
          <div>
            <p className="section-kicker">Update listing</p>
            <h2 className="section-title mt-3">Update Food</h2>
            <p className="section-subtitle mt-2">
              Refresh details to keep your listing accurate and trusted.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
            <div className="card-surface p-6 sm:p-8">
              <form className="space-y-8" onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">Food Name</label>
                    <input
                      type="text"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      className="input-warm w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">Food Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input file-input-bordered border-sand bg-cream w-full"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewImageFile(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    {(preview || food?.foodImage) && (
                      <img
                        src={preview || food.foodImage}
                        alt="Preview"
                        className="mt-3 w-32 h-32 object-cover rounded-xl border border-sand"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">Food Quantity</label>
                    <input
                      type="number"
                      value={quantityValue}
                      onChange={(e) => setQuantityValue(e.target.value)}
                      className="input-warm w-full"
                      required
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
                    <label className="label">Pickup Location</label>
                    <LocationAutocomplete
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      onSelectLocation={setLocationData}
                      placeholder="Pickup Location"
                    />

                    <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <strong>Safety note:</strong> Please do not add your exact
                      location. Use a nearby street or public pickup spot.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">Price (RM)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input-warm w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">Expired Date</label>
                    <input
                      type="date"
                      value={expiredDate}
                      onChange={(e) => setExpiredDate(e.target.value)}
                      className="input-warm w-full"
                      required
                      min={getTodayString()}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">Additional Notes</label>
                  <input
                    type="text"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="input-warm w-full"
                    required
                  />
                </div>

                {priceFeedback && (
                  <div
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

                <div>
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

                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="btn-warm flex-1">
                    Update Food
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-ghost-warm flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div className="hidden lg:block">
              <div className="card-surface p-4">
                <Lottie animationData={updateLottieData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdateFood;
