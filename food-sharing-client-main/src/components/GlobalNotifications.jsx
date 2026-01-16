import { useEffect, useContext, useRef } from "react";
import { AuthContext } from "../provider/AuthProvider";
import axios from "axios"; // 👈 Use standard axios, not axiosSecure
import { notifyUser } from "../utils/notifyUser";

const GlobalNotifications = () => {
  const { user } = useContext(AuthContext);

  // 🔹 Refs to track state
  const prevRequestCountRef = useRef(0);
  const prevStatusMapRef = useRef({});
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!user?.email) return;

    // 🔹 TIMING FIX: Wait 3 seconds before starting the first check.
    // This allows the JWT cookie to be fully set after login.
    const initialDelay = setTimeout(() => {
      checkNotifications(); // Run once
      
      // Start the interval ONLY after the initial delay
      const interval = setInterval(checkNotifications, 10000); // 10 seconds

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, 3000); 

    return () => clearTimeout(initialDelay);
  }, [user?.email]);

  const checkNotifications = async () => {
    if (!user?.email) return;

    try {
      // 🔹 Use standard axios with credentials (cookies)
      // We avoid axiosSecure here so a background 401 doesn't log you out.
      const axiosConfig = { withCredentials: true };

      // =================================================
      // 1. BUYER LOGIC
      // =================================================
      const myRequestsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/requests/user/${user.email}`, 
        axiosConfig
      );
      const myRequests = myRequestsRes.data;

      myRequests.forEach((req) => {
        const prevStatus = prevStatusMapRef.current[req._id];
        if (prevStatus && prevStatus === "pending" && req.status !== "pending") {
          notifyUser({
            title: req.status === "approved" ? "Request Approved! 🎉" : "Request Rejected ❌",
            body: `Your request for "${req.foodName}" has been ${req.status}.`,
          });
        }
        prevStatusMapRef.current[req._id] = req.status;
      });

      // =================================================
      // 2. DONOR LOGIC
      // =================================================
      const donorRequestsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/requests/donor/${user.email}`,
        axiosConfig
      );
      const donorRequests = donorRequestsRes.data;

      if (
        !isFirstLoadRef.current &&
        prevRequestCountRef.current > 0 && 
        donorRequests.length > prevRequestCountRef.current
      ) {
        notifyUser({
          title: "New food request 🍽️",
          body: "Someone has requested your food",
        });
      }

      prevRequestCountRef.current = donorRequests.length;
      isFirstLoadRef.current = false;

    } catch (error) {
      // 🔹 Silent Fail: If 401 happens here, just ignore it.
      // Don't log to console to keep it clean.
      if (error.response?.status === 401) {
         // console.warn("Notification check skipped (Auth not ready)");
      }
    }
  };

  return null;
};

export default GlobalNotifications;