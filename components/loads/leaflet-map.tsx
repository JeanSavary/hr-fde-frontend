"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  originLabel: string;
  destLabel: string;
}

export function LeafletMap({ originLat, originLng, destLat, destLng, originLabel, destLabel }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
    mapInstance.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const makeIcon = (color: string, label: string) =>
      L.divIcon({
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;box-shadow:0 2px 8px ${color}44;transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${label}</span></div>`,
      });

    L.marker([originLat, originLng], { icon: makeIcon("#6366f1", "A") })
      .bindPopup(`<strong>Pickup</strong><br/>${originLabel}`)
      .addTo(map);
    L.marker([destLat, destLng], { icon: makeIcon("#34d399", "B") })
      .bindPopup(`<strong>Delivery</strong><br/>${destLabel}`)
      .addTo(map);

    // Curved route line
    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;
    const offset = Math.abs(originLng - destLng) * 0.15;
    const curvedMidLat = midLat + offset * 0.5;
    const points: [number, number][] = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const lat = (1 - t) * (1 - t) * originLat + 2 * (1 - t) * t * curvedMidLat + t * t * destLat;
      const lng = (1 - t) * (1 - t) * originLng + 2 * (1 - t) * t * midLng + t * t * destLng;
      points.push([lat, lng]);
    }
    L.polyline(points, { color: "#6366f1", weight: 3, opacity: 0.7, dashArray: "8 6" }).addTo(map);
    L.polyline(points, { color: "#6366f1", weight: 1.5, opacity: 0.15 }).addTo(map);

    map.fitBounds(L.latLngBounds([[originLat, originLng], [destLat, destLng]]), { padding: [60, 60] });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [originLat, originLng, destLat, destLng, originLabel, destLabel]);

  return <div ref={mapRef} className="h-full w-full" />;
}
