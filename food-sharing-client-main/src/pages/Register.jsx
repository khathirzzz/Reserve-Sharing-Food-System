import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase/firebase.config";
import UseTitle from "../components/UseTitle";

const Register = () => {
  const { creatUser, setUser, updateUserProfile, googleLogin } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  UseTitle("Register");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const imageFile = form.querySelector('input[type="file"]').files[0];

    if (password.length < 6) {
      setError("Password should be 6 characters or longer");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password should have uppercase and lowercase letters");
      return;
    }

    try {
      setUploading(true);

      const imageData = new FormData();
      imageData.append("file", imageFile);
      imageData.append("upload_preset", "imagesreserve");

      const cloudinaryRes = await fetch(
        "https://api.cloudinary.com/v1_1/drqscxu20/image/upload",
        {
          method: "POST",
          body: imageData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      const photoURL = cloudinaryData.secure_url;

      const result = await creatUser(email, password);
      const user = result.user;

      await updateUserProfile({
        displayName: name,
        photoURL,
      });

      await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          name,
          photoURL,
        }),
      });

      navigate("/");

      setUser({
        ...user,
        displayName: name,
        photoURL,
      });

      toast.success("Registered successfully");
      navigate("/");
    } catch (error) {
      console.error(error);
      setError(error.message || "Registration failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleLogin())
      .then((result) => {
        const user = result.user;
        setUser(user);
        navigate("/");
      })
      .catch((error) => {
      });
  };
  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="flex justify-center">
          <div className="card-surface w-full max-w-lg p-8 sm:p-10">
            <p className="section-kicker">Get started</p>
            <h2 className="section-title mt-3 text-2xl">
              Register your account
            </h2>
            <p className="text-sm text-clay mt-2">
              Create your profile to start sharing and reserving food.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="name"
                  name="name"
                  className="input-warm"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Profile Photo</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="file-input file-input-bordered border-sand bg-cream"
                  onChange={(e) =>
                    setPreview(URL.createObjectURL(e.target.files[0]))
                  }
                />

                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 w-24 h-24 rounded-full object-cover border border-sand"
                  />
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  name="email"
                  className="input-warm"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="password"
                  name="password"
                  className="input-warm"
                  required
                />
              </div>
              <button disabled={uploading} className="btn-warm w-full">
                {uploading ? "Uploading..." : "Register"}
              </button>
            </form>

            <div className="divider text-sm text-clay my-6">Or</div>
            <button
              onClick={handleGoogleSignIn}
              className="btn-ghost-warm w-full gap-2"
            >
              <FcGoogle className="text-lg" /> Sign Up With Google
            </button>
            {error && (
              <span className="text-sm text-red-600 text-center block mt-3">
                {error}
              </span>
            )}
            <p className="text-center text-sm text-clay mt-6">
              Already have an account?{" "}
              <Link className="text-amber-700 font-semibold" to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
