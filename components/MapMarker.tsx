import { Icon } from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";

// Define the marker interface
interface MapMarkerProps {
  marker: {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    location: string;
    lat: number;
    lng: number;
    date: string;
  };
  onSelect: (id: string) => void;
}

export default function MapMarker({ marker, onSelect }: MapMarkerProps) {
  // Custom marker icons by priority
  const priorityIcons = {
    High: new Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    Medium: new Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    Low: new Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
  };

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={
        priorityIcons[marker.priority as keyof typeof priorityIcons] ||
        priorityIcons.Medium
      }
      eventHandlers={{
        click: () => {
          onSelect(marker.id);
        },
      }}
    >
      <Popup>
        <div>
          <h3 className="font-bold">{marker.title}</h3>
          <p className="text-sm">{marker.category}</p>
          <p className="text-xs text-gray-500">{marker.location}</p>
          <p className="text-xs mt-2">
            {marker.status} • {marker.date}
          </p>
        </div>
      </Popup>
      <Tooltip>{marker.title}</Tooltip>
    </Marker>
  );
}
