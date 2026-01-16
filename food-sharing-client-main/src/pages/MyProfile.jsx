import { useContext, useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthContext } from "../provider/AuthProvider";
import { getAuth } from "firebase/auth";
import BackButton from "../components/BackButton";

const MyProfile = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading: authLoading, setUser, updateUserProfile, refreshUser } =
    useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [photoURL, setPhotoURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.email) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchMyProfile = async () => {
      try {
        setLoading(true);

        const [profileRes, reviewsRes] = await Promise.all([
          axiosSecure.get("/users/me"),
          axios.get(`${import.meta.env.VITE_API_URL}/reviews/public/${user.email}`),
        ]);

        setProfile(profileRes.data);
        setReviews(reviewsRes.data || []);

        setName(profileRes.data.name || "");
        setPhotoURL(profileRes.data.photoURL || "");
        setDescription(profileRes.data.description || "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, [user?.email, authLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      let finalPhotoURL = photoURL;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "imagesreserve");

        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/drqscxu20/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await cloudinaryRes.json();
        if (data.secure_url) {
          finalPhotoURL = data.secure_url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const auth = getAuth();

      await axiosSecure.patch("/users/me", {
        name,
        photoURL: finalPhotoURL,
        description,
      });

      await updateUserProfile({
        displayName: name,
        photoURL: finalPhotoURL,
      });

      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });

      setProfile((prev) => ({
        ...prev,
        name,
        photoURL: finalPhotoURL,
        description,
      }));

      setPhotoURL(finalPhotoURL);
      setSelectedFile(null);
      setPreview(null);

      if (refreshUser) {
        await refreshUser();
      }

      toast.success("Profile updated");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex justify-center items-center">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center mt-20">Profile not found</p>;
  }

  const calculateSuccessRate = (successful, accepted) => {
    const totalAccepted = accepted || successful || 0;
    const totalSuccessful = successful || 0;

    if (totalAccepted === 0) return 0;

    let rate = (totalSuccessful / totalAccepted) * 100;
    return Math.min(rate, 100).toFixed(0);
  };

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
            <BackButton fallbackTo="/" />
            <button
              onClick={() => {
                setName(profile.name || "");
                setDescription(profile.description || "");
                setPhotoURL(profile.photoURL || "");
                setPreview(null);
                setSelectedFile(null);
                setOpen(true);
              }}
              className="btn-warm"
            >
              Edit profile
            </button>
          </div>

          <div className="card-surface w-full p-6 sm:p-8 space-y-8">
            <div className="flex flex-col items-center text-center gap-3">
              <img
                src={
                  profile.photoURL || user?.photoURL
                    ? `${profile.photoURL || user?.photoURL}?t=${Date.now()}`
                    : "https://i.ibb.co/T0h48vD/default-profile.png"
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://i.ibb.co/T0h48vD/default-profile.png";
                }}
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
                    {Number(profile.averageRating || 5).toFixed(1)}
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
                data-tip="This shows how often you successfully complete a pickup after it is approved."
              >
                <span className="text-clay text-xs uppercase font-semibold tracking-wider">
                  Reliability Rate
                </span>
                <span className={`text-2xl font-bold mt-1 ${reliability.color}`}>
                  {reliability.rate}%
                </span>
                <span className="text-xs text-clay mt-1">
                  {reliability.successful} completed / {reliability.accepted} accepted
                </span>
              </div>

              <StatBox label="Donations Given" value={profile.pickupsGiven || 0} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cocoa">
                Reviews About You
              </h3>
              {reviews.length === 0 ? (
                <p className="text-clay">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="card-soft p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600">
                          Rating {review.rating}/5
                        </span>
                        <span className="text-sm text-clay">
                          ({review.raterRole})
                        </span>
                      </div>
                      <p className="mt-2 text-clay">{review.comment}</p>
                      <p className="text-xs text-clay/70 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-cocoa/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="card-surface w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-cocoa mb-4">
              Edit profile
            </h3>

            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              className="input-warm w-full mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />

            <label className="label">
              <span className="label-text">Profile Photo</span>
            </label>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered border-sand bg-cream w-full mb-3"
              onChange={handleFileChange}
            />

            {(preview || photoURL) && (
              <div className="mb-4 flex justify-center">
                <img
                  src={preview || photoURL}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border border-sand"
                />
              </div>
            )}

            <label className="label">
              <span className="label-text">Bio / Description</span>
            </label>
            <textarea
              className="textarea-warm w-full mb-4"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short bio..."
            />

            <div className="flex gap-3 justify-end">
              <button
                className="btn-ghost-warm"
                onClick={() => setOpen(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn-warm"
                onClick={handleSave}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const StatBox = ({ label, value }) => (
  <div className="p-4 bg-cream rounded-xl text-center shadow-soft border border-sand/60">
    <p className="text-xl font-bold text-cocoa">{value}</p>
    <p className="text-sm text-clay">{label}</p>
  </div>
);

export default MyProfile;
