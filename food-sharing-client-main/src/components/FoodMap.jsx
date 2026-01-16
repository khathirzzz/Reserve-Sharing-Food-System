import React, { useMemo, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Link } from "react-router-dom";

const libraries = ["places"];

const containerStyle = {
  width: "100%",
  height: "480px",
  borderRadius: "18px",
};

const FoodMap = ({ foods = [] }) => {
  const [selectedFood, setSelectedFood] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const foodsWithCoords = useMemo(() => {
    return foods.filter(
      (f) => f?.location?.lat != null && f?.location?.lng != null
    );
  }, [foods]);

  const center = useMemo(() => {
    if (foodsWithCoords.length > 0) {
      return {
        lat: foodsWithCoords[0].location.lat,
        lng: foodsWithCoords[0].location.lng,
      };
    }
    return { lat: 3.139, lng: 101.6869 };
  }, [foodsWithCoords]);

  if (!isLoaded) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="card-surface overflow-hidden">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
          {foodsWithCoords.map((food) => (
            <MarkerF
              key={food._id}
              position={{
                lat: Number(food.location.lat),
                lng: Number(food.location.lng),
              }}
              onClick={() => setSelectedFood(food)}
            />
          ))}

          {selectedFood && (
            <InfoWindow
              position={{
                lat: Number(selectedFood.location.lat),
                lng: Number(selectedFood.location.lng),
              }}
              onCloseClick={() => setSelectedFood(null)}
            >
              <div className="max-w-[220px]">
                <p className="font-semibold text-cocoa">
                  {selectedFood.foodName}
                </p>
                {selectedFood.foodImage && (
                  <img
                    src={selectedFood.foodImage}
                    alt={selectedFood.foodName}
                    className="mt-2 w-full h-24 object-cover rounded-lg"
                  />
                )}
                <p className="text-sm mt-2 text-clay">
                  {selectedFood.location?.address ||
                    selectedFood.pickupLocation}
                </p>

                <Link to={`/foods/${selectedFood._id}`}>
                  <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                    View details
                  </button>
                </Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {foodsWithCoords.length === 0 && (
        <p className="text-center text-clay mt-4">
          No foods have map locations yet. Add a pickup location using
          autocomplete.
        </p>
      )}
    </div>
  );
};

export default FoodMap;
