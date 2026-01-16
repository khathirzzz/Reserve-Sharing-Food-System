import React, { useEffect, useRef } from "react";
import useGoogleMaps from "../hooks/useGoogleMaps";

const LocationAutocomplete = ({
  value,
  onChange,
  onSelectLocation,
  placeholder,
}) => {
  const inputRef = useRef(null);
  const googleLoaded = useGoogleMaps();

  useEffect(() => {
    if (!googleLoaded || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: [],
        componentRestrictions: { country: "my" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      onChange(place.formatted_address);
      onSelectLocation({
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  }, [googleLoaded]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-warm w-full"
    />
  );
};

export default LocationAutocomplete;
