import React, { useState } from "react";
import toast from "react-hot-toast";

const RatingModal = ({ open, onClose, onSubmit, targetName }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!Number.isInteger(Number(rating))) {
      toast.error("Rating must be a whole number");
      return;
    }
    await onSubmit({ rating: Number(rating), comment });
    setRating(5);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-cocoa/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-surface w-full max-w-md p-6 relative">
        <h3 className="text-xl font-semibold text-cocoa mb-2">
          Rate {targetName || "User"}
        </h3>

        <p className="text-sm text-clay mb-4">
          Rating: <span className="font-semibold text-cocoa">{rating}</span> / 5
        </p>

        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="range range-primary"
        />

        <textarea
          className="textarea-warm w-full mt-4"
          rows={4}
          maxLength={500}
          placeholder="Write a short comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost-warm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-warm" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
