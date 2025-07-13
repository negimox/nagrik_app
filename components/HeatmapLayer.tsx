import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { heatLayer } from "@linkurious/leaflet-heat";

interface HeatmapLayerProps {
  points: Array<[number, number, number?]>;
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    gradient?: Record<string, string>;
    minOpacity?: number;
    useLocalExtrema?: boolean;
  };
}

export default function HeatmapLayer({
  points,
  options = {},
}: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Create the heat layer
    const heat = heatLayer(points, {
      radius: options.radius || 25,
      blur: options.blur || 15,
      maxZoom: options.maxZoom || 10,
      max: options.max || 1.0,
      gradient: options.gradient,
      minOpacity: options.minOpacity || 0.05,
      useLocalExtrema: options.useLocalExtrema || false,
    });

    // Add the heat layer to the map
    map.addLayer(heat);

    // Clean up function
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, options]);

  return null;
}
