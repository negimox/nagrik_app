"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, Layers, MapPin, Search, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MyMap from "@/components/map";
import Map from "@/components/index";
import { useToast } from "@/hooks/use-toast";
export default function MapPage() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const { toast } = useToast();

  // Function to parse coordinates string to lat/lng object
  const parseCoordinates = (coordinatesString: string) => {
    try {
      // Example format: "40.7128° N, 74.0060° W"
      const regex = /(\d+\.\d+)° ([NS]), (\d+\.\d+)° ([EW])/;
      const match = coordinatesString.match(regex);
      console.log("Coordinates String:", coordinatesString);
      console.log("Regex Match:", match);
      if (!match) return { lat: 30.3275, lng: 78.0325 }; // Default coordinates if parsing fails

      let lat = parseFloat(match[1]);
      let lng = parseFloat(match[3]);

      // Adjust for N/S and E/W
      if (match[2] === "S") lat = lat;
      if (match[4] === "W") lng = lng;
      console.log("Parsed Coordinates:", { lat, lng });
      return { lat, lng };
    } catch (err) {
      console.error("Error parsing coordinates:", err);
      return { lat: 30.3275, lng: 78.0325 }; // Default coordinates
    }
  };
  // Fetch reports from the API
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build the query parameters for the API call
      let queryParams = new URLSearchParams();

      // Add filters if needed
      if (categoryFilter !== "all") {
        queryParams.append("category", categoryFilter);
      }
      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter);
      }
      if (priorityFilter !== "all") {
        queryParams.append("priority", priorityFilter);
      }

      // Make the API request
      const response = await fetch(`/api/report?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.result && Array.isArray(data.result)) {
        // Transform the API data to the format needed for map markers
        const markers = data.result.map((report: any) => {
          // Parse coordinates from the string format
          const { lat, lng } = parseCoordinates(report.coordinates || "");

          return {
            id: report.id || report._id,
            title: report.title || "Unknown Issue",
            category: report.category || "Other",
            status: report.status || "Pending",
            priority: report.priority || "Medium",
            location: report.location || "Unknown Location",
            lat,
            lng,
            date: report.createdAt
              ? new Date(report.createdAt).toLocaleDateString()
              : "Unknown Date",
            description: report.description,
            submittedBy: report.submittedBy,
            assignedTo: report.assignedTo,
            estimatedCompletion: report.estimatedCompletion,
            images: report.images || [],
            updates: report.updates || [],
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
          };
        });

        toast({
          title: "Map data loaded",
          description: `Successfully loaded ${markers.length} reports.`,
        });

        setMapMarkers(markers);
      } else {
        setMapMarkers([]);
        toast({
          title: "No reports found",
          description: "No reports match your current filter criteria.",
        });
      }
    } catch (err) {
      console.error("Error fetching reports for map:", err);
      setError("Failed to load map data. Please try again later.");
      setMapMarkers([]);
      toast({
        title: "Error",
        description: "Failed to load map data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [categoryFilter, statusFilter, priorityFilter]); // Refetch when filters change

  // We don't include locationFilter in the dependency array
  // because we want to control when that search happens manually

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-300"
          >
            Pending
          </Badge>
        );
      case "Assigned":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            Assigned
          </Badge>
        );
      case "In Progress":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            In Progress
          </Badge>
        );
      case "Resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Low":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Low
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            Medium
          </Badge>
        );
      case "High":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            High
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-md p-6">
        <h1 className="text-xl font-bold text-[#003A70] mb-4">Issue Map</h1>
        <p className="text-sm text-gray-600">
          View and manage infrastructure issues geographically. Filter by
          category, status, or priority.
        </p>
      </div>
      <div className="bg-white border rounded-md">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-[#003A70]">Map View</h2>
          <div className="flex items-center gap-2">
            {" "}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchReports();
                }}
              >
                <input
                  type="search"
                  placeholder="Search location..."
                  className="h-9 w-[200px] rounded-md border border-gray-300 bg-white pl-8 pr-3 text-sm"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchReports();
                    }
                  }}
                />
              </form>
            </div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 border-[#003A70] text-[#003A70]"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </SheetTrigger>{" "}
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filter Issues</SheetTitle>
                  <SheetDescription>
                    Customize which issues appear on the map
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Issue Categories</h3>
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => setCategoryFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="road">Road Damage</SelectItem>
                        <SelectItem value="streetlight">
                          Streetlights
                        </SelectItem>
                        <SelectItem value="sanitation">Sanitation</SelectItem>
                        <SelectItem value="water">Water/Drainage</SelectItem>
                        <SelectItem value="property">
                          Public Property
                        </SelectItem>
                        <SelectItem value="traffic">Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Status</h3>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Priority</h3>
                    <Select
                      value={priorityFilter}
                      onValueChange={(value) => setPriorityFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Time Period</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCategoryFilter("all");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button
                      className="bg-[#003A70] hover:bg-[#004d94]"
                      onClick={() => {
                        fetchReports();
                        setFilterOpen(false);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>{" "}
            <div className="relative flex items-center group">
              {" "}
              <Button
                variant="outline"
                size="icon"
                className={`h-9 w-9 ${
                  showHeatmap
                    ? "bg-[#003A70] text-white"
                    : "border-[#003A70] text-[#003A70]"
                }`}
                onClick={() => {
                  const newValue = !showHeatmap;
                  setShowHeatmap(newValue);
                  toast({
                    title: newValue ? "Heatmap Enabled" : "Marker View Enabled",
                    description: newValue
                      ? "Showing issue density heatmap"
                      : "Showing individual issue markers",
                  });
                }}
              >
                <Layers className="h-4 w-4" />
              </Button>{" "}
              <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                {showHeatmap
                  ? "Switch to Individual Markers"
                  : "Switch to Heatmap Density View"}
              </span>
            </div>
          </div>
        </div>{" "}
        <div className="relative bg-gray-100 h-[600px]">
          {" "}
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#003A70]" />
                <p className="mt-2 text-sm text-[#003A70]">
                  Loading map data...
                </p>
              </div>
            </div>
          )}
          {/* Error state */}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="max-w-md p-4 text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <Button
                  onClick={fetchReports}
                  size="sm"
                  className="bg-[#003A70] hover:bg-[#004d94]"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          {/* Map component will be inserted at the bottom of the page */}
          {/* Placeholder when no markers are found */}
          {!isLoading && !error && mapMarkers.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No issues found for the selected filters</p>
              </div>
            </div>
          )}{" "}
          {/* Map component */}
          {!isLoading && !error && mapMarkers.length > 0 && (
            <Map
              // Only show markers when heatmap is disabled
              markers={showHeatmap ? [] : mapMarkers}
              onSelectMarker={(id) => setSelectedIssue(id)}
              // Control heatmap display based on user preference
              showHeatmap={showHeatmap && mapMarkers.length > 3}
              heatmapPoints={mapMarkers.map((marker) => [
                marker.lat,
                marker.lng,
                marker.priority === "High"
                  ? 1.0
                  : marker.priority === "Medium"
                  ? 0.6
                  : 0.3,
              ])}
            />
          )}
          {/* Selected issue details */}
          {selectedIssue && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {mapMarkers.find((m) => m.id === selectedIssue)
                          ?.title || "Unknown Issue"}
                      </CardTitle>
                      <CardDescription>
                        {mapMarkers.find((m) => m.id === selectedIssue)
                          ?.location || "Unknown Location"}
                        <span className="text-xs ml-2 text-gray-500">
                          ID: {selectedIssue}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mt-1 -mr-2"
                      onClick={() => setSelectedIssue(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <div>
                        {getStatusBadge(
                          mapMarkers.find((m) => m.id === selectedIssue)
                            ?.status || "Pending"
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Priority</p>
                      <div>
                        {getPriorityBadge(
                          mapMarkers.find((m) => m.id === selectedIssue)
                            ?.priority || "Medium"
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p>
                        {mapMarkers.find((m) => m.id === selectedIssue)
                          ?.category || "Other"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reported</p>
                      <p>
                        {mapMarkers.find((m) => m.id === selectedIssue)?.date ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 pb-4">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="mt-2 text-sm">
                      <p>
                        {mapMarkers.find((m) => m.id === selectedIssue)
                          ?.description ||
                          "Additional details about this issue would be displayed here, including description, reporter information, and any attached media."}
                      </p>
                      <div className="mt-2">
                        <p className="text-gray-500 text-xs">Coordinates</p>
                        <p className="text-xs">
                          Lat:{" "}
                          {mapMarkers
                            .find((m) => m.id === selectedIssue)
                            ?.lat.toFixed(4)}
                          , Lng:{" "}
                          {mapMarkers
                            .find((m) => m.id === selectedIssue)
                            ?.lng.toFixed(4)}
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="actions" className="mt-2 space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-[#003A70] hover:bg-[#004d94]"
                        onClick={() => {
                          toast({
                            title: "Action triggered",
                            description: `Assigning issue ${selectedIssue} to a team.`,
                          });
                        }}
                      >
                        Assign Issue
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-[#003A70] text-[#003A70]"
                        onClick={() => {
                          toast({
                            title: "Action triggered",
                            description: `Update status of issue ${selectedIssue}.`,
                          });
                        }}
                      >
                        Update Status
                      </Button>
                    </TabsContent>
                    <TabsContent value="history" className="mt-2 text-sm">
                      <div className="text-xs space-y-2">
                        {mapMarkers.find((m) => m.id === selectedIssue)?.updates
                          ?.length > 0 ? (
                          mapMarkers
                            .find((m) => m.id === selectedIssue)
                            ?.updates?.map((update, idx) => (
                              <div
                                key={idx}
                                className="border-l-2 border-gray-200 pl-2"
                              >
                                <p className="font-medium">
                                  {update.date} {update.time}
                                </p>
                                <p>
                                  {update.status}: {update.comment}
                                </p>
                                <p className="text-gray-500">By: {update.by}</p>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500">
                            No activity recorded yet
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>{" "}
      <div className="bg-[#E6EEF4] border rounded-md p-4">
        <h2 className="font-bold text-[#003A70] mb-2">Map Usage Notes</h2>
        <ul className="text-xs space-y-1 text-gray-700">
          <li>• Click on map markers to view issue details.</li>
          <li>
            • Use the filter button to customize which issues are displayed.
          </li>
          <li>
            • High priority issues are marked in red, medium in blue, and low in
            green.
          </li>
          <li>
            • The map is updated in real-time as new reports are submitted.
          </li>
        </ul>
      </div>
    </div>
  );
}
