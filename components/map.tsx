import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import MapMarker from "./MapMarker";
import HeatmapLayer from "./HeatmapLayer";
import { Icon } from "leaflet";

interface Marker {
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
  markers?: Marker[];
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
    zoom,
    onSelectMarker,
    showHeatmap = false,
    heatmapPoints,
    heatmapOptions,
  } = props;

  // Default position if no markers or position provided
  const mapCenter =
    position ||
    (markers.length > 0
      ? ([markers[0].lat, markers[0].lng] as [number, number])
      : ([40.7128, -74.006] as [number, number]));

  // Generate heatmap points from markers if not provided explicitly
  const generatedHeatmapPoints =
    !heatmapPoints && markers.length > 0
      ? markers.map((marker) => {
          // Use priority to determine intensity (High: 1.0, Medium: 0.6, Low: 0.3)
          let intensity;
          switch (marker.priority) {
            case "High":
              intensity = 1.0;
              break;
            case "Medium":
              intensity = 0.6;
              break;
            case "Low":
              intensity = 0.3;
              break;
            default:
              intensity = 0.5;
          }
          return [marker.lat, marker.lng, intensity] as [
            number,
            number,
            number
          ];
        })
      : heatmapPoints;

  // Default marker props
  const defaultIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const handleSelectMarker = (id: string) => {
    if (onSelectMarker) {
      onSelectMarker(id);
    }
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom || 13}
      scrollWheelZoom={true}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render heatmap if showHeatmap is true and we have points */}
      {showHeatmap &&
        generatedHeatmapPoints &&
        generatedHeatmapPoints.length > 0 && (
          <HeatmapLayer
            points={generatedHeatmapPoints}
            options={heatmapOptions}
          />
        )}

      {/* Render individual marker if position is provided */}
      {position && (
        <Marker position={position} icon={defaultIcon}>
          <Popup>Marker position</Popup>
        </Marker>
      )}

      {/* Render markers from markers array */}
      {markers &&
        markers.length > 0 &&
        markers.map((marker) => (
          <MapMarker
            key={marker.id}
            marker={marker}
            onSelect={handleSelectMarker}
          />
        ))}
    </MapContainer>
  );
}
