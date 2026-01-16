import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";

const FeaturedFoodCard = ({ food }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    _id,
    foodName,
    foodImage,
    foodQuantity,
    quantityValue,
    quantityUnit,
    foodStatus,
    expiredDate,
    donator,
  } = food;

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${donator.email}`);
    } else {
      navigate("/login", { state: location.pathname });
    }
  };

  const statusClass =
    foodStatus === "available" ? "badge-available" : "badge-status";
  const quantityText =
    foodQuantity ||
    (quantityValue !== undefined && quantityValue !== null && quantityValue !== ""
      ? `${quantityValue} ${quantityUnit || ""}`.trim()
      : null);
  const quantityDisplay =
    quantityText && String(quantityText).trim() !== "" ? quantityText : "—";

  return (
    <div className="card-surface overflow-hidden transition duration-200 hover:-translate-y-1">
      <img
        src={foodImage}
        alt="Food"
        className="w-full h-48 object-cover"
      />

      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-cocoa">{foodName}</h3>
          <span className={statusClass}>{foodStatus}</span>
        </div>

        {donator && (
          <p className="text-sm text-clay">
            Donated by{" "}
            <span
              onClick={handleProfileClick}
              className="text-amber-700 hover:underline font-medium cursor-pointer"
            >
              {donator.name}
            </span>
          </p>
        )}

        <div className="text-sm text-clay space-y-1">
          <p>
            <span className="font-medium text-cocoa">Quantity:</span>{" "}
            {quantityDisplay}
          </p>
          <p>
            <span className="font-medium text-cocoa">Expires:</span>{" "}
            {expiredDate}
          </p>
        </div>

        <Link to={`/foods/${_id}`} className="inline-flex">
          <button className="btn-warm">View Details</button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedFoodCard;
