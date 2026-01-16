import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, UserSignOut } = useContext(AuthContext);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const brokenDefaultUrl = "https://i.ibb.co/T0h48vD/default-profile.png";
  const photoUrl = user?.photoURL || "";
  const isValidPhoto =
    photoUrl && !imgError && !photoUrl.includes(brokenDefaultUrl);

  const handleSignOut = () => {
    UserSignOut()
      .then(() => {
        toast.success("Logout success");
        navigate("/");
      })
      .catch((err) => {
      });
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-amber-100 text-amber-700 shadow-soft"
        : "text-clay hover:text-cocoa hover:bg-cream"
    }`;

  const links = (
    <>
      <NavLink className={navLinkClass} to="/">
        Home
      </NavLink>

      <NavLink className={navLinkClass} to="/availableFood">
        Available Foods
      </NavLink>

      {user && user.email ? (
        <NavLink className={navLinkClass} to="/dashboard">
          Dashboard
        </NavLink>
      ) : (
        ""
      )}

      <NavLink className={navLinkClass} to="/faq">
        FAQ
      </NavLink>
    </>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-parchment/90 backdrop-blur border-b border-sand/70">
      <div className="page-wrap-wide">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <div className="dropdown lg:hidden">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content card-surface mt-3 w-56 p-2 shadow-card text-cocoa"
              >
                {links}
              </ul>
            </div>

            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <svg
                  viewBox="0 0 48 48"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="24" cy="24" r="18" />
                  <circle cx="24" cy="24" r="8" opacity="0.4" />
                  <path
                    d="M30 14c-4 1-7 4-8 8 4-1 7-4 8-8z"
                    fill="currentColor"
                    stroke="none"
                    opacity="0.7"
                  />
                </svg>
              </span>
              <span className="hidden sm:flex flex-col leading-tight">
                <span className="text-lg font-semibold text-cocoa">
                  ReServe
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-clay">
                  Food sharing
                </span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-2">{links}</nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="avatar shrink-0">
                  <div className="w-11 h-11 rounded-full ring-2 ring-amber-100 overflow-hidden bg-sand">
                    <Link to="/my-profile" className="block w-full h-full">
                      {isValidPhoto ? (
                        <img
                          src={photoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-sand" />
                      )}
                    </Link>
                  </div>
                </div>
                <button className="btn-ghost-warm" onClick={handleSignOut}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link className="btn-ghost-warm" to="/login">
                  Login
                </Link>
                <Link className="btn-warm" to="register">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
