import React, { useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import toast from "react-hot-toast";
import UseTitle from "../components/UseTitle";
import useAxiosSecure from "../hooks/useAxiosSecure";
import BackButton from "../components/BackButton";

import { evaluatePrice } from "../utils/pricingEngine";

const FoodDetails = () => {
  const axiosSecure = useAxiosSecure();
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const food = useLoaderData();
  UseTitle("Details");

  const {
    _id,
    foodName,
    foodImage,
    foodQuantity,
    pickupLocation,
    expiredDate,
    additionalNotes,
    donator,
    foodStatus,
    price,
    quantityValue,
    quantityUnit,
  } = food;

  const isOwnFood = user?.email === donator?.email;

  const statusBadgeClass =
    foodStatus === "available" ? "badge-available" : "badge-status";

  const priceFeedback = evaluatePrice({
    itemType: "cooked_meal",
    expiryDate: expiredDate,
    quantityValue: Number(quantityValue),
    quantityUnit: quantityUnit || "item",
    userPrice: Number(price),
  });

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setDate(`${year}-${month}-${day}`);
  }, []);

  const handleRequest = async () => {
    if (isOwnFood) {
      toast.error("You cannot request your own food");
      return;
    }

    try {
      const requestData = {
        foodId: _id,
        foodName,
        donorEmail: donator.email,
        donorName: donator.name,
        requesterEmail: user.email,
        requesterName: user.displayName,
        pickupLocation,
        expiredDate,
      };

      const { data } = await axiosSecure.post("/requests", requestData);

      if (data.insertedId) {
        toast.success("Request sent to donor for approval");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("This food already has a pending request");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case "Fair":
        return "bg-sage-100 text-sage-700 border-sage-200";
      case "Slightly High":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Unfair":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-cream text-clay border-sand";
    }
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="mb-6">
          <BackButton fallbackTo="/availableFood" />
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="section-kicker">Listing details</p>
            <h1 className="section-title mt-3">Food Details</h1>
          </div>
          <span className={statusBadgeClass}>Status: {foodStatus}</span>
        </div>

        <div className="card-surface overflow-hidden mt-8 grid grid-cols-1 md:grid-cols-2">
          <div className="h-full">
            <img
              className="h-full w-full min-h-[280px] object-cover"
              src={foodImage}
              alt="Food"
            />
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-4">
              <img
                className="w-14 h-14 rounded-full border-2 border-cream shadow-soft object-cover"
                src={donator?.image}
                alt="Donator"
              />
              <div>
                <h2 className="text-lg font-semibold text-cocoa">
                  {donator?.name}
                </h2>
                <h3 className="text-sm text-clay">{donator?.email}</h3>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-cocoa">{foodName}</h2>
              <p className="text-sm text-clay mt-1">
                Pickup Location: {pickupLocation}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xl font-semibold text-amber-700">
                Price: RM {price}
              </p>
              {priceFeedback && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 ${getVerdictStyle(
                    priceFeedback.verdict
                  )}`}
                >
                  <span className="uppercase tracking-[0.2em]">AI</span>
                  {priceFeedback.verdict} Value
                </div>
              )}
            </div>

            {priceFeedback && (
              <div className="text-xs text-clay bg-cream/80 p-3 rounded-lg border border-sand/60">
                AI Insight: {priceFeedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-clay">
              <p>
                <span className="font-semibold text-cocoa">Quantity:</span>{" "}
                {foodQuantity}
              </p>
              <p>
                <span className="font-semibold text-cocoa">Expires:</span>{" "}
                {expiredDate}
              </p>
              <p>
                <span className="font-semibold text-cocoa">Additional Notes:</span>{" "}
                {additionalNotes}
              </p>
            </div>

            <div className="card-actions justify-end">
              <div className="relative group">
                <button
                  disabled={isOwnFood || foodStatus !== "available"}
                  onClick={() =>
                    document.getElementById("my_modal_5").showModal()
                  }
                  className={`btn-warm ${
                    isOwnFood || foodStatus !== "available"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isOwnFood
                    ? "Your Food"
                    : foodStatus !== "available"
                    ? "Not available"
                    : "Request"}
                </button>

                {(isOwnFood || foodStatus !== "available") && (
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-cocoa text-parchment text-xs px-3 py-1 rounded-lg shadow-soft whitespace-nowrap z-50">
                    {isOwnFood
                      ? "You cannot request your own food"
                      : "This food is no longer available"}
                  </div>
                )}
              </div>
            </div>

            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box card-surface p-6 space-y-4">
                <h3 className="font-semibold text-xl text-cocoa">{foodName}</h3>
                <img
                  className="w-full h-44 rounded-lg object-cover"
                  src={foodImage}
                  alt="Food"
                />

                <div className="space-y-2 text-sm text-clay">
                  <p>
                    <span className="font-semibold text-cocoa">ID:</span> {_id}
                  </p>
                  <p>
                    <span className="font-semibold text-cocoa">Donor Email:</span>{" "}
                    {donator?.email}
                  </p>
                  <p>
                    <span className="font-semibold text-cocoa">Donor Name:</span>{" "}
                    {donator?.name}
                  </p>
                  <p>
                    <span className="font-semibold text-cocoa">User Email:</span>{" "}
                    {user?.email}
                  </p>
                  <p>
                    <span className="font-semibold text-cocoa">Current Date:</span>{" "}
                    {date}
                  </p>
                  <p className="font-semibold text-amber-700">Price: RM {price}</p>
                  <p>Pickup Location: {pickupLocation}</p>
                  <p>Expires: {expiredDate}</p>
                  <p>{additionalNotes}</p>
                </div>

                <div className="flex justify-between gap-3">
                  <button onClick={() => handleRequest(food)} className="btn-warm">
                    Request
                  </button>
                  <button
                    onClick={() => document.getElementById("my_modal_5").close()}
                    className="btn-ghost-warm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
