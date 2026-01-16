import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import useAxiosSecure from "../hooks/useAxiosSecure";
import UseTitle from "../components/UseTitle";
import { MdTipsAndUpdates } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";
import RatingModal from "../components/RatingModal";

const ManageFood = () => {
  const { user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [requests, setRequests] = useState([]);
  const [prevRequestCount, setPrevRequestCount] = useState(0);
  const axiosSecure = useAxiosSecure();
  const [rateOpen, setRateOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  UseTitle("Manage Food");

  useEffect(() => {
    if (!user?.email) return;

    fetchAllFoods();
    fetchRequests();

    const interval = setInterval(() => {
      fetchRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.email]);

  const fetchAllFoods = async () => {
    const { data } = await axiosSecure.get(`/foods/${user?.email}`);
    setFoods(data);
  };

  const submitRating = async ({ rating, comment }) => {
    try {
      await axiosSecure.post("/reviews", {
        requestId: ratingTarget.requestId,
        toEmail: ratingTarget.toEmail,
        rating,
        comment,
        raterRole: "donor",
      });

      toast.success("Rating submitted");
      setRateOpen(false);
      setRatingTarget(null);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit rating");
    }
  };

  const fetchRequests = async () => {
    const { data } = await axiosSecure.get(`/requests/donor/${user.email}`);
    setRequests(data);
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axiosSecure.delete(`/foods/${id}`);
      toast.success("Deleted successfully");
      fetchAllFoods();
    } catch (error) {
    }
  };

  const handleDonorConfirm = async (requestId) => {
    await axiosSecure.patch(`/requests/${requestId}/donor-confirm`);
    toast.success("Collection confirmed");
    fetchRequests();
    fetchAllFoods();
  };

  const handleDecision = async (requestId, status, foodId) => {
    await axiosSecure.patch(`/requests/${requestId}`, {
      status,
      foodId,
    });

    toast.success(`Request ${status}`);
    fetchRequests();
    fetchAllFoods();
  };

  const pendingRequests = requests.filter(
    (req) =>
      req.status === "pending" ||
      req.status === "approved" ||
      req.status === "completed"
  );

  const deleteFood = (id) => {
    toast((t) => (
      <div className="flex gap-3 items-center">
        <div>
          <p>Want to delete?</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded-md"
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete(id);
            }}
          >
            Yes
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="text-xs text-clay">
                <Link to="/dashboard" className="hover:text-cocoa">
                  Dashboard
                </Link>{" "}
                <span className="text-sand">/</span>{" "}
                <span className="text-cocoa">Manage Foods</span>
              </div>
              <h2 className="section-title mt-2">My Posted Foods</h2>
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

          {foods.length === 0 ? (
            <div className="card-soft p-8 text-center">
              <h3 className="text-xl font-semibold text-cocoa">
                No foods posted yet
              </h3>
              <p className="text-clay mt-2">
                Share your first listing to start helping the community.
              </p>
            </div>
          ) : (
            <div className="card-surface overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-cream text-clay">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      Food Name & Location
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Additional Notes & Quantity
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Expired Date
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {foods?.map((food) => (
                    <tr
                      key={food._id}
                      className="border-b border-sand/60 hover:bg-parchment/70 transition"
                    >
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img
                          className="w-12 h-12 rounded-xl object-cover border border-sand"
                          src={food.foodImage}
                          alt="Food"
                        />
                        <div>
                          <p className="text-sm font-semibold text-cocoa">
                            {food.foodName}
                          </p>
                          <p className="text-sm text-clay">
                            {food.pickupLocation}
                          </p>
                        </div>
                      </td>
                    <td className="px-6 py-4 text-cocoa">
                      <div className="space-y-1 text-sm">
                        <p className="text-clay">
                          <span className="font-semibold text-cocoa/80">
                            Notes:
                          </span>{" "}
                          <span className="text-cocoa">
                            {food.additionalNotes || "—"}
                          </span>
                        </p>
                        <p className="text-clay">
                          <span className="font-semibold text-cocoa/80">
                            Qty:
                          </span>{" "}
                          <span className="text-cocoa">
                            {food.foodQuantity ||
                              (food.quantityValue !== undefined &&
                              food.quantityValue !== null &&
                              food.quantityValue !== ""
                                ? `${food.quantityValue} ${food.quantityUnit || ""}`.trim()
                                : food.quantity) ||
                              "—"}
                          </span>
                        </p>
                      </div>
                    </td>
                      <td className="px-6 py-4 text-cocoa">
                        {food.expiredDate}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/updateFood/${food._id}`}>
                            <button className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white p-2 hover:bg-amber-600">
                              <MdTipsAndUpdates />
                            </button>
                          </Link>

                          <button
                            onClick={() => deleteFood(food._id)}
                            className="inline-flex items-center justify-center rounded-full bg-red-500 text-white p-2 hover:bg-red-600"
                          >
                            <RiDeleteBin6Fill />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <div>
                <p className="section-kicker">Requests</p>
                <h2 className="section-title mt-3">Pending & Previous Requests</h2>
              </div>

              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="card-surface p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm text-clay">
                        <span className="font-semibold text-cocoa">Food:</span> {req.foodName}
                      </p>
                      <p className="text-sm text-clay">
                        <span className="font-semibold text-cocoa">Requested by:</span>{" "}
                        <Link
                          to={`/profile/${req.requesterEmail}`}
                          className="text-amber-700 hover:underline"
                        >
                          {req.requesterName}
                        </Link>
                      </p>
                      <p className="text-xs text-clay">{req.requesterEmail}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {req.status === "approved" && req.securityCode && (
                        <div className="flex flex-col items-center px-3 py-2 bg-sage-100 rounded-lg border border-sage-200">
                          <span className="text-[10px] uppercase font-bold text-sage-700">
                            Verify Buyer
                          </span>
                          <span className="text-lg font-mono font-bold text-sage-700 tracking-wider">
                            {req.securityCode}
                          </span>
                        </div>
                      )}

                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleDecision(req._id, "approved", req.foodId)
                            }
                            className="btn-warm"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleDecision(req._id, "rejected", req.foodId)
                            }
                            className="btn-ghost-warm"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {req.status === "approved" &&
                        req.buyerConfirmed &&
                        !req.donorConfirmed && (
                          <button
                            onClick={() => handleDonorConfirm(req._id)}
                            className="btn-warm"
                          >
                            Confirm collection
                          </button>
                        )}

                      {req.status === "approved" && !req.buyerConfirmed && (
                        <span className="text-amber-700 font-semibold">
                          Waiting for buyer
                        </span>
                      )}

                      {req.status === "completed" && (
                        <span className="text-sage-700 font-bold">
                          Completed
                        </span>
                      )}
                      {req.status === "completed" && !req.donorRated && (
                        <button
                          onClick={() => {
                            setRatingTarget({
                              requestId: req._id,
                              toEmail: req.requesterEmail,
                              targetName: req.requesterName || "Buyer",
                            });
                            setRateOpen(true);
                          }}
                          className="btn-ghost-warm"
                        >
                          Rate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RatingModal
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        onSubmit={submitRating}
        targetName={ratingTarget?.targetName}
      />
    </section>
  );
};

export default ManageFood;
