"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Compass } from "lucide-react";
import { divIcon, latLngBounds, type LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LABEL_NAMES, type PublicReport } from "@/lib/contracts";
import { formatCoordinates } from "@/lib/complaint";
import "leaflet/dist/leaflet.css";
import "./map.css";

const KOLKATA: LatLngExpression = [22.5726, 88.3639];
const pin = divIcon({
  className: "spotter-map-pin",
  html: '<svg width="28" height="36" viewBox="0 0 28 36" aria-hidden="true"><path d="M14 1C6.8 1 1 6.8 1 14c0 9.2 13 21 13 21s13-11.8 13-21C27 6.8 21.2 1 14 1Z" fill="currentColor" stroke="var(--surface)" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="var(--surface)"/></svg>',
  iconSize: [44, 44],
  iconAnchor: [22, 43],
  popupAnchor: [0, -36],
});
const selectedPin = divIcon({
  ...pin.options,
  className: "spotter-map-pin spotter-map-pin-selected",
});

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function ReportViewport({ reports, selectedId }: { reports: PublicReport[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const selected = reports.find((report) => report.id === selectedId);
    if (selected) {
      map.setView([selected.latitude, selected.longitude], 14, { animate: false });
    } else if (reports.length) {
      map.fitBounds(latLngBounds(reports.map((report) => [report.latitude, report.longitude])), {
        padding: [36, 36], maxZoom: 14, animate: false,
      });
    } else {
      map.setView(KOLKATA, 12, { animate: false });
    }
  }, [map, reports, selectedId]);
  return null;
}

function MapTiles({ onFailure }: { onFailure: (failed: boolean) => void }) {
  return (
    <TileLayer
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      maxZoom={19}
      eventHandlers={{ tileerror: () => onFailure(true), tileload: () => onFailure(false) }}
    />
  );
}

export function ReportMapCanvas({
  reports, selectedId, onSelect,
}: {
  reports: PublicReport[];
  selectedId: string | null;
  onSelect: (report: PublicReport) => void;
}) {
  const [tileFailure, setTileFailure] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div className="map-frame">
      <MapContainer key={reduceMotion ? "reduced" : "standard"} center={KOLKATA} zoom={12} className="spotter-map" scrollWheelZoom={false} zoomAnimation={!reduceMotion} markerZoomAnimation={!reduceMotion} fadeAnimation={!reduceMotion} inertia={!reduceMotion} aria-label="Map of published observations">
        <MapTiles onFailure={setTileFailure} />
        <ResizeMap />
        <ReportViewport reports={reports} selectedId={selectedId} />
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={report.id === selectedId ? selectedPin : pin}
            title={`${report.is_demo ? "Sample: " : ""}${report.labels.map((label) => LABEL_NAMES[label]).join(", ")}`}
            alt={`Observation at ${formatCoordinates(report.latitude, report.longitude)}`}
            eventHandlers={{ click: () => onSelect(report) }}
          >
            <Popup autoPan={!reduceMotion}>
              <div className="map-popup">
                <strong>{report.is_demo ? "Sample observation" : "Reviewed observation"}</strong>
                <p>{report.evidence}</p>
                <span>{formatCoordinates(report.latitude, report.longitude)}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-context-strip"><span><Compass size={14} strokeWidth={1.7} aria-hidden />Drag to explore</span><span>{reports.length ? "Select a pin or a report" : "Report locations appear as pins"}</span></div>
      {tileFailure && <p className="map-tile-notice" role="status">Map tiles could not load. Report coordinates and details are available below.</p>}
    </div>
  );
}

function PickerEvents({ latitude, longitude, disabled, onChange }: {
  latitude: number | null;
  longitude: number | null;
  disabled: boolean;
  onChange: (latitude: number, longitude: number) => void;
}) {
  const map = useMapEvents({
    click(event) {
      if (!disabled) onChange(Number(event.latlng.lat.toFixed(6)), Number(event.latlng.wrap().lng.toFixed(6)));
    },
  });
  useEffect(() => {
    if (latitude !== null && longitude !== null) map.panTo([latitude, longitude], { animate: false });
  }, [latitude, longitude, map]);
  return null;
}

export function LocationMapCanvas({ latitude, longitude, onChange, disabled = false }: {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}) {
  const [tileFailure, setTileFailure] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div className={`map-frame location-map-frame${disabled ? " location-map-disabled" : ""}`}>
      <MapContainer key={reduceMotion ? "reduced" : "standard"} center={KOLKATA} zoom={12} className="spotter-map location-map" scrollWheelZoom={false} zoomAnimation={!reduceMotion} markerZoomAnimation={!reduceMotion} fadeAnimation={!reduceMotion} inertia={!reduceMotion} aria-label="Choose your observation location on the map">
        <MapTiles onFailure={setTileFailure} />
        <ResizeMap />
        <PickerEvents latitude={latitude} longitude={longitude} disabled={disabled} onChange={onChange} />
        {latitude !== null && longitude !== null && (
          <Marker position={[latitude, longitude]} icon={selectedPin} title="Your selected location" alt="Your selected observation location" />
        )}
      </MapContainer>
      {tileFailure && <p className="map-tile-notice" role="status">Map tiles could not load. Use the coordinate fields to choose your location.</p>}
    </div>
  );
}
