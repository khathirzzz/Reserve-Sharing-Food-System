import FeaturedFoodCard from "./FeaturedFoodCard";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const FeaturedFoods = () => {
  const [availableData, setAvailableData] = useState([]);

  const { data: foods, isLoading } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/foods`);
      return data;
    },
  });

  useEffect(() => {
    const filterFoods = foods?.filter((food) => food.foodStatus === "available");
    setAvailableData(filterFoods);
  }, [foods]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="card-surface p-4 animate-pulse">
            <div className="h-40 bg-sand/50 rounded-xl" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-3/4 bg-sand/60 rounded" />
              <div className="h-3 w-1/2 bg-sand/50 rounded" />
              <div className="h-3 w-2/3 bg-sand/40 rounded" />
              <div className="h-9 w-28 bg-sand/50 rounded-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableData
          ?.slice(0, 6)
          .reverse()
          ?.map((food, index) => (
            <motion.div
              key={food._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <FeaturedFoodCard food={food} />
            </motion.div>
          ))}
      </div>

      <div className="flex justify-center mt-10">
        <Link to="/availableFood">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="btn-ghost-warm"
          >
            Show All
          </motion.button>
        </Link>
      </div>
    </>
  );
};

export default FeaturedFoods;
