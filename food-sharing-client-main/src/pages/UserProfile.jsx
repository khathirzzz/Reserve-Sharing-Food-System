import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BackButton from "../components/BackButton";

const UserProfile = () => {
  const { email } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!email) return;

    setLoading(true);

    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/users/public/${email}`),
      axios.get(`${import.meta.env.VITE_API_URL}/reviews/public/${email}`),
    ])
      .then(([profileRes, reviewsRes]) => {
        setProfile(profileRes.data);
        setReviews(reviewsRes.data || []);
      })
      .catch((err) => {
        console.error("Failed to load profile data:", err);
      })
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-[300px] flex justify-center items-center">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center mt-20">User not found</p>;
  }

  const averageRating =
    profile.totalRatings && profile.totalRatings > 0 ? profile.averageRating : 5;

  const getReliabilityStats = () => {
    const successful = profile.pickupsCompleted || 0;
    const accepted = profile.totalAcceptedRequests || successful;

    if (accepted === 0) return { rate: 100, color: "text-sage-600" };

    const rate = Math.min((successful / accepted) * 100, 100).toFixed(0);

    let color = "text-sage-600";
    if (rate < 85) color = "text-amber-600";
    if (rate < 50) color = "text-red-600";

    return { rate, color, successful, accepted };
  };

  const reliability = getReliabilityStats();

  return (
    <section className="section-pad">
      <div className="page-wrap flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <BackButton fallbackTo="/availableFood" />
          </div>

          <div className="card-surface w-full p-6 sm:p-8 space-y-8">
            <div className="flex flex-col items-center text-center gap-3">
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border border-sand ring-4 ring-amber-100"
              />

              <h2 className="text-2xl font-semibold text-cocoa leading-tight mb-0">
                {profile.name}
              </h2>
              <div className="flex flex-col items-center gap-1">
                <p className="text-clay">{profile.email}</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-amber-600">
                    {Number(averageRating || 5).toFixed(1)}
                  </span>
                  <span className="text-sm text-clay">
                    / 5 ({profile.totalRatings || 0} reviews)
                  </span>
                </div>
                <p className="text-xs text-clay">
                  Member since{" "}
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-cocoa">About Me</h3>
              <div className="card-soft p-4 text-sm text-clay whitespace-pre-line">
                {profile.description?.trim()
                  ? profile.description
                  : "No description yet"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <StatBox
                label="Food Saved"
                value={`${Number(profile.totalFoodSavedKg || 0)
                  .toFixed(2)
                  .replace(/\.00$/, "")} kg`}
              />

              <div
                className="flex flex-col items-center justify-center p-4 bg-cream rounded-xl shadow-soft border border-sand/60 transition-transform hover:-translate-y-1 tooltip tooltip-bottom"
                data-tip="This shows how often this user successfully completes a pickup after approval."
              >
                <span className="text-clay text-xs uppercase font-semibold tracking-wider">
                  Reliability Rate
                </span>
                <span className={`text-xl font-bold mt-1 ${reliability.color}`}>
                  {reliability.rate}%
                </span>
                <span className="text-xs text-clay mt-1">
                  {reliability.successful} / {reliability.accepted} completed
                </span>
              </div>

              <StatBox label="Donations Given" value={profile.pickupsGiven || 0} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cocoa">Reviews</h3>

              {reviews.length === 0 ? (
                <p className="text-clay">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r, idx) => (
                    <div key={idx} className="card-soft p-4">
                      <p className="font-semibold text-amber-600">
                        Rating {r.rating} / 5
                        <span className="ml-2 text-sm text-clay">
                          ({r.raterRole})
                        </span>
                      </p>
                      {r.comment && (
                        <p className="mt-2 text-clay">{r.comment}</p>
                      )}
                      <p className="text-xs text-clay/70 mt-1">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatBox = ({ label, value }) => (
  <div className="p-4 bg-cream rounded-xl text-center shadow-soft border border-sand/60">
    <p className="text-xl font-bold text-cocoa">{value}</p>
    <p className="text-sm text-clay">{label}</p>
  </div>
);

export default UserProfile;
