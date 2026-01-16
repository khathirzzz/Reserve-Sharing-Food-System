import React, { useContext, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import { FcGoogle } from "react-icons/fc";
import { sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import toast from "react-hot-toast";
import UseTitle from "../components/UseTitle";

const Login = () => {
  const { userSignIn, setUser, googleLogin } = useContext(AuthContext);
  const [error, setError] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const emailRef = useRef();
  UseTitle("Login");

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    setError({});

    userSignIn(email, password)
      .then((result) => {
        const user = result.user;
        toast.success("Login success");
        setUser(user);

        const redirectPath =
          location?.state?.from?.pathname ||
          (typeof location?.state === "string" ? location.state : null) ||
          "/dashboard";
        navigate(redirectPath, { replace: true });
      })
      .catch((err) => {
        let errorMessage = "Login failed. Please try again.";

        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMessage = "Incorrect email or password.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
          default:
            errorMessage = err.message;
        }

        setError({ ...error, login: errorMessage });
        toast.error(errorMessage);
      });
  };

  const handleGoogleSignIn = async () => {
    signInWithPopup(auth, googleLogin())
      .then((result) => {
        const user = result.user;
        toast.success("Login success");
        setUser(user);

        const redirectPath =
          location?.state?.from?.pathname ||
          (typeof location?.state === "string" ? location.state : null) ||
          "/dashboard";
        navigate(redirectPath, { replace: true });
      })
      .catch((error) => {
      });
  };

  const handleForgetPassword = () => {
    const email = emailRef.current.value;
    if (!email) {
      toast.error("Please provide a valid email");
    } else {
      sendPasswordResetEmail(auth, email).then(() => {
        alert("Password reset email sent. Please check your email.");
      });
    }
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="flex justify-center">
          <div className="card-surface w-full max-w-md p-8 sm:p-10">
            <p className="section-kicker">Welcome back</p>
            <h2 className="section-title mt-3 text-2xl">Login to your account</h2>
            <p className="text-sm text-clay mt-2">
              Continue sharing and reserving food in your community.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  ref={emailRef}
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
                  name="password"
                  placeholder="password"
                  className="input-warm"
                  required
                />
                {error.login && (
                  <label className="label text-sm text-red-600">
                    {error.login}
                  </label>
                )}
                <label onClick={handleForgetPassword} className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>

              <button className="btn-warm w-full">Login</button>
            </form>

            <div className="divider text-sm text-clay my-6">Or</div>

            <button
              onClick={handleGoogleSignIn}
              className="btn-ghost-warm w-full gap-2"
            >
              <FcGoogle className="text-lg" /> Login With Google
            </button>

            <p className="text-center text-sm text-clay mt-6">
              Don't have an account?{" "}
              <Link className="text-amber-700 font-semibold" to="/register">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
