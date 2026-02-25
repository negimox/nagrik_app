"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface MarkerData {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  lat: number;
  lng: number;
  date: string;
}

interface MapProps {
  markers?: MarkerData[];
  position?: [number, number];
  zoom?: number;
  onSelectMarker?: (id: string) => void;
  showHeatmap?: boolean;
  heatmapPoints?: Array<[number, number, number?]>;
  heatmapOptions?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    gradient?: Record<string, string>;
    minOpacity?: number;
    useLocalExtrema?: boolean;
  };
}

export default function MyMap(props: MapProps) {
  const {
    markers = [],
    position,
    zoom = 13,
    onSelectMarker,
    showHeatmap = false,
    heatmapPoints,
    heatmapOptions,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LeafletMarker[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayerRef = useRef<any>(null);

  // Flips to true only after the async Leaflet import resolves and the map
  // instance is ready. Marker/heatmap effects depend on this so they re-run
  // after the map has initialised, not before.
  const [mapReady, setMapReady] = useState(false);

  const mapCenter: [number, number] =
    position ??
    (markers.length > 0 ? [markers[0].lat, markers[0].lng] : [30.3275, 78.0325]);

  // ─── Map initialisation (once on mount) ───────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // cancelled flag prevents the stale async callback (from React StrictMode's
    // first mount) from firing after the cleanup + second mount has already run.
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;

      const el = containerRef.current!;

      // Clear any stale _leaflet_id left by a previous mount (StrictMode /
      // Turbopack HMR). Without this Leaflet throws "already initialized".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((el as any)._leaflet_id != null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as any)._leaflet_id = null;
      }

      // Also destroy any live instance that might already occupy this ref
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(el, { zoomControl: true }).setView(mapCenter, zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      setMapReady(true);
    });

    return () => {
      cancelled = true; // cancel the async callback if it hasn't fired yet
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Sync markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      const map = mapRef.current;
      if (!map) return;

      // Remove existing markers
      markerLayerRef.current.forEach((m) => m.remove());
      markerLayerRef.current = [];

      if (showHeatmap) return; // individual markers hidden while heatmap is on

      const priorityColor: Record<string, string> = {
        High: "#ef4444",
        Medium: "#3b82f6",
        Low: "#22c55e",
      };

      markers.forEach((data) => {
        const color = priorityColor[data.priority] ?? "#6b7280";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:${color};border:2px solid #fff;
            box-shadow:0 1px 4px rgba(0,0,0,.5);">
          </div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          popupAnchor: [0, -10],
        });

        const marker = L.marker([data.lat, data.lng], { icon })
          .bindPopup(
            `<div style="min-width:190px;font-family:sans-serif;line-height:1.6;">
              <strong style="font-size:13px;">${data.title}</strong><br/>
              <span style="color:#888;font-size:11px;">${data.location}</span>
              <hr style="margin:6px 0;border:none;border-top:1px solid #eee"/>
              <table style="font-size:12px;width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding-right:10px;">Status</td><td><b>${data.status}</b></td></tr>
                <tr><td style="color:#888;">Priority</td><td><b style="color:${color};">${data.priority}</b></td></tr>
                <tr><td style="color:#888;">Category</td><td>${data.category}</td></tr>
                <tr><td style="color:#888;">Reported</td><td>${data.date}</td></tr>
              </table>
            </div>`,
            { maxWidth: 260 }
          )
          .addTo(map);

        marker.on("click", () => {
          marker.openPopup();
          if (onSelectMarker) onSelectMarker(data.id);
        });

        markerLayerRef.current.push(marker);
      });

      if (position) {
        const defaultIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        const m = L.marker(position, { icon: defaultIcon })
          .bindPopup("Selected location")
          .addTo(map);
        markerLayerRef.current.push(m);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, markers, showHeatmap, position]);

  // ─── Sync heatmap ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;

    // Remove old heat layer whenever deps change
    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    if (!showHeatmap) return;

    const points: Array<[number, number, number?]> =
      heatmapPoints ??
      markers.map((m) => [
        m.lat,
        m.lng,
        m.priority === "High" ? 1.0 : m.priority === "Medium" ? 0.6 : 0.3,
      ]);

    if (points.length === 0) return;

    // Import both leaflet and the heatLayer named export from leaflet-heat.
    // We use the named export directly instead of L.heatLayer because
    // @linkurious/leaflet-heat patches window.L (the global), not the ES module
    // export — so (L as any).heatLayer is undefined in an ESM context.
    Promise.all([
      import("leaflet"),
      import("@linkurious/leaflet-heat"),
    ]).then(([L, { heatLayer }]) => {
      if (cancelled) return;
      const map = mapRef.current;
      if (!map) return;

      const layer = heatLayer(points, {
        radius: heatmapOptions?.radius ?? 25,
        blur: heatmapOptions?.blur ?? 15,
        maxZoom: heatmapOptions?.maxZoom ?? 17,
        max: heatmapOptions?.max ?? 1.0,
        gradient: heatmapOptions?.gradient,
        minOpacity: heatmapOptions?.minOpacity ?? 0.3,
      });
      // heatLayer returns a Leaflet layer — add it to the map
      (layer as unknown as L.Layer).addTo(map);
      heatLayerRef.current = layer;
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, showHeatmap, markers, heatmapPoints, heatmapOptions]);

  return <div ref={containerRef} style={{ height: "600px", width: "100%" }} />;
}
