"use client";

import dynamic from "next/dynamic";
import "./map.css";

const LocationMap = dynamic(() => import("./map-canvas").then((module) => module.LocationMapCanvas), {
  ssr: false,
  loading: () => <div className="map-loading location-map" role="status">Loading location map…</div>,
});

export function LocationPicker(props: {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}) {
  return <LocationMap {...props} />;
}
