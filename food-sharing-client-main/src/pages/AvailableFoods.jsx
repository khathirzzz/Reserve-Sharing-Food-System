import { useEffect, useState } from "react";
import FeaturedFoodCard from "../components/FeaturedFoodCard";
import UseTitle from "../components/UseTitle";
import { motion } from "framer-motion";
import FoodMap from "../components/FoodMap";

const AvailableFoods = () => {
  const [foods, setFoods] = useState([]);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [layout, setLayout] = useState(true);
  const [loading, setLoading] = useState(true);
  const [availableData, setAvailableData] = useState([]);
  UseTitle("Available Foods");

  const toggleLayout = () => {
    setLayout(!layout);
  };

  useEffect(() => {
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/foods?search=${search}&sort=${sort}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch foods");
        }
        return res.json();
      })
      .then((data) => {
        setFoods(data);
      })
      .catch((error) => {
        console.error("Fetch foods error:", error);
        setFoods([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, sort]);

  useEffect(() => {
    const filterFoods = foods?.filter((food) => food.foodStatus === "available");
    setAvailableData(filterFoods);
  }, [foods]);

  return (
    <div className="section-pad">
      <div className="page-wrap">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="section-kicker">Browse listings</p>
              <h1 className="section-title mt-3">Available Foods</h1>
              <p className="section-subtitle mt-2">
                Search, sort, and explore nearby meals on the map.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("grid")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  view === "grid"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-cream text-clay hover:text-cocoa"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  view === "map"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-cream text-clay hover:text-cocoa"
                }`}
              >
                Map View
              </button>
            </div>
          </div>

          <div className="card-surface p-4 sm:p-5 flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:w-56">
              <label className="text-xs uppercase tracking-[0.2em] text-clay">
                Sort
              </label>
              <select
                onChange={(e) => setSort(e.target.value)}
                className="select-warm w-full mt-2"
              >
                <option value="">Sort By Expired Date</option>
                <option value="dsc">Descending Order</option>
                <option value="asc">Ascending Order</option>
              </select>
            </div>

            <div className="w-full md:flex-1">
              <label className="text-xs uppercase tracking-[0.2em] text-clay">
                Search
              </label>
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or location"
                className="input-warm w-full mt-2"
              />
            </div>

            {view === "grid" && (
              <button onClick={toggleLayout} className="btn-ghost-warm">
                Change layout
              </button>
            )}
          </div>

          {loading ? (
            view === "map" ? (
              <div className="card-surface h-[420px] animate-pulse" />
            ) : (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                  layout ? "lg:grid-cols-3" : "lg:grid-cols-2"
                }`}
              >
                {Array.from({ length: layout ? 6 : 4 }).map((_, idx) => (
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
            )
          ) : view === "map" ? (
            <FoodMap foods={availableData} />
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                layout ? "lg:grid-cols-3" : "lg:grid-cols-2"
              } min-h-[300px]`}
            >
              {availableData.length === 0 ? (
                <div className="col-span-full">
                  <div className="card-soft p-10 text-center">
                    <h2 className="text-2xl font-semibold text-cocoa">
                      No available foods right now
                    </h2>
                    <p className="text-sm text-clay mt-2">
                      Check back later or be the first to add a food.
                    </p>
                  </div>
                </div>
              ) : (
                [...availableData].reverse().map((food) => (
                  <motion.div
                    key={food._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <FeaturedFoodCard food={food} />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableFoods;
