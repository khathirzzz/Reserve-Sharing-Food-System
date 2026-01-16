import axios from "axios";
import { useContext, useEffect } from "react";
import { AuthContext } from "../provider/AuthProvider";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
const useAxiosSecure = () => {
  const { UserSignOut } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
  const interceptor = axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        UserSignOut()
          .then(() => {
            navigate("/login");
          })
          .catch(() => {});
      }

      return Promise.reject(error);
    }
  );

  // cleanup interceptor on unmount
  return () => {
    axiosInstance.interceptors.response.eject(interceptor);
  };
}, [navigate, UserSignOut]);

  return axiosInstance;
};

export default useAxiosSecure;
