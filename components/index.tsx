import dynamic from "next/dynamic";

// Define TypeScript interface for map props
interface MapProps {
  markers?: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    location: string;
    lat: number;
    lng: number;
    date: string;
  }>;
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

// Use dynamic import for the map component to disable server-side rendering
const Map = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <p className="text-center py-6">Loading map...</p>,
});

// Forward all props to the map component
export default function MapWrapper(props: MapProps) {
  return <Map {...props} />;
}
