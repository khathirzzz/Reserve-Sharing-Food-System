import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../provider/AuthProvider";
import useAxiosSecure from "../hooks/useAxiosSecure";
import UseTitle from "../components/UseTitle";
import CountdownTimer from "../components/CountdownTimer";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import RatingModal from "../components/RatingModal";

const FoodRequest = () => {
  const [foodRequests, setFoodRequests] = useState([]);
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [prevStatuses, setPrevStatuses] = useState({});
  const prevRequestsRef = useRef([]);
  const isFirstLoadRef = useRef(true);
  const [rateOpen, setRateOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);

  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const [selectedInstructions, setSelectedInstructions] = useState("");

  UseTitle("My Request");

  useEffect(() => {
    if (!user?.email) return;

    fetchAllFoodsRequests();

    const interval = setInterval(() => {
      fetchAllFoodsRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.email]);

  const handleBuyerConfirm = async (requestId) => {
    try {
      await axiosSecure.patch(`/requests/${requestId}/buyer-confirm`);
      toast.success("Marked as collected. Waiting for donor confirmation.");
      fetchAllFoodsRequests();
    } catch (err) {
      toast.error("Failed to confirm collection");
    }
  };

  const submitRating = async ({ rating, comment }) => {
    try {
      await axiosSecure.post("/reviews", {
        requestId: ratingTarget.requestId,
        toEmail: ratingTarget.toEmail,
        rating,
        comment,
        raterRole: ratingTarget.raterRole,
      });

      toast.success("Rating submitted");
      setRateOpen(false);
      setRatingTarget(null);
      fetchAllFoodsRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit rating");
    }
  };

  const fetchAllFoodsRequests = async () => {
    const { data } = await axiosSecure.get(`/requests/user/${user?.email}`);

    setFoodRequests(data);
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="text-xs text-clay">
                <Link to="/dashboard" className="hover:text-cocoa">
                  Dashboard
                </Link>{" "}
                <span className="text-sand">/</span>{" "}
                <span className="text-cocoa">Food Requests</span>
              </div>
              <h2 className="section-title mt-2">My Food Requests</h2>
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

          {foodRequests.length === 0 ? (
            <div className="card-soft p-8 text-center">
              <h3 className="text-xl font-semibold text-cocoa">
                No requests yet
              </h3>
              <p className="text-clay mt-2">
                When you request food, it will appear here with updates.
              </p>
            </div>
          ) : (
            <div className="card-surface overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-cream text-clay uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Food Item</th>
                    <th className="px-6 py-4 text-left">Donor Name</th>
                    <th className="px-6 py-4 text-left">Pickup Location</th>
                    <th className="px-6 py-4 text-left">Expire Date</th>
                    <th className="px-6 py-4 text-left">Request Date</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-cocoa text-sm">
                  {foodRequests?.map((request, idx) => (
                    <tr
                      key={request._id}
                      className="border-b border-sand/60 hover:bg-parchment/70 transition"
                    >
                      <td className="px-6 py-4">{idx + 1}</td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-cocoa text-base">
                          {request.foodName}
                        </p>
                        <p className="text-xs text-clay mt-1">
                          <span className="font-semibold text-amber-700">
                            {request.price ? `RM ${request.price}` : "RM -"}
                          </span>
                          <span className="mx-2">|</span>
                          <span>
                            {request.quantityValue} {request.quantityUnit}
                          </span>
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/profile/${request.donorEmail}`}
                          className="text-amber-700 hover:underline"
                        >
                          {request.donorName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{request?.pickupLocation}</td>
                      <td className="px-6 py-4">{request?.expiredDate}</td>
                      <td className="px-6 py-4">
                        {request?.requestDate
                          ? request.requestDate
                          : request?.createdAt
                          ? new Date(request.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-6 py-4 font-semibold space-y-2">
                        {request.status === "pending" && (
                          <CountdownTimer expiresAt={request.expiresAt} />
                        )}

                        {request.status === "approved" &&
                          request.securityCode && (
                            <div className="bg-sage-100 border border-sage-200 rounded p-2 text-center">
                              <p className="text-xs text-sage-700 uppercase font-bold">
                                Security Code
                              </p>
                              <p className="text-xl font-mono font-bold tracking-widest text-sage-700">
                                {request.securityCode}
                              </p>
                            </div>
                          )}

                        {request.status === "approved" &&
                          !request.buyerConfirmed && (
                            <button
                              onClick={() => handleBuyerConfirm(request._id)}
                              className="btn-warm"
                            >
                              Mark as collected
                            </button>
                          )}

                        {request.status === "approved" &&
                          request.buyerConfirmed && (
                            <span className="text-amber-700">
                              Waiting for donor confirmation
                            </span>
                          )}

                        {request.status === "completed" && (
                          <span className="text-sage-700 font-bold">
                            Completed
                          </span>
                        )}

                        {request.status === "rejected" && (
                          <span className="text-red-600 font-bold">
                            Rejected
                          </span>
                        )}

                        {request.status === "expired" && (
                          <span className="text-clay">Expired</span>
                        )}

                        {request.status === "completed" &&
                          !request.buyerRated && (
                            <button
                              onClick={() => {
                                setRatingTarget({
                                  requestId: request._id,
                                  toEmail: request.donorEmail,
                                  targetName: request.donorName || "Donor",
                                  raterRole: "buyer",
                                });
                                setRateOpen(true);
                              }}
                              className="btn-ghost-warm"
                            >
                              Rate
                            </button>
                          )}

                        {request.status === "approved" &&
                          !request.buyerConfirmed && (
                            <button
                              onClick={() => {
                                setSelectedInstructions(
                                  request.collectionInstructions ||
                                    "No instructions provided."
                                );
                                setInstructionModalOpen(true);
                              }}
                              className="btn-ghost-warm"
                            >
                              View instructions
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {instructionModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box card-surface">
            <h3 className="font-semibold text-lg text-cocoa">
              Collection Instructions
            </h3>
            <div className="py-4 bg-cream p-4 rounded-lg mt-2 border border-sand/60">
              <p className="whitespace-pre-line text-clay">
                {selectedInstructions}
              </p>
            </div>
            <div className="modal-action">
              <button
                className="btn-ghost-warm"
                onClick={() => setInstructionModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};

export default FoodRequest;
