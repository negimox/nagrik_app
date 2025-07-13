"use client";

import { useState, useEffect } from "react";
import Map from "../../../components/index";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface ReportMarker {
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

export default function HeatmapAnalyticsPage() {
  const [reports, setReports] = useState<ReportMarker[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom heatmap options
  const heatmapOptions = {
    radius: 30,
    blur: 20,
    maxZoom: 14,
    gradient: {
      "0.0": "blue",
      "0.4": "lime",
      "0.6": "yellow",
      "0.8": "orange",
      "1.0": "red",
    },
    useLocalExtrema: true,
  };

  useEffect(() => {
    // In a real app, this would be an API call
    // Simulating API data fetch
    setTimeout(() => {
      const sampleData = [
        {
          id: "1",
          title: "Pothole on Main Street",
          category: "road",
          status: "Open",
          priority: "High",
          location: "Main St & 5th Ave",
          lat: 40.712,
          lng: -74.006,
          date: "2025-05-01",
        },
        {
          id: "2",
          title: "Broken Streetlight",
          category: "streetlight",
          status: "In Progress",
          priority: "Medium",
          location: "Broadway & 7th St",
          lat: 40.717,
          lng: -74.005,
          date: "2025-05-02",
        },
        {
          id: "3",
          title: "Garbage Overflow",
          category: "garbage",
          status: "Open",
          priority: "Low",
          location: "Park Ave & 3rd St",
          lat: 40.715,
          lng: -74.009,
          date: "2025-05-03",
        },
        {
          id: "4",
          title: "Flooding on Park Avenue",
          category: "water",
          status: "Open",
          priority: "High",
          location: "Park Ave & 10th St",
          lat: 40.714,
          lng: -74.002,
          date: "2025-05-04",
        },
        {
          id: "5",
          title: "Damaged Road Sign",
          category: "property",
          status: "Open",
          priority: "Medium",
          location: "Lexington & 25th St",
          lat: 40.71,
          lng: -74.008,
          date: "2025-05-05",
        },
        {
          id: "6",
          title: "Fallen Tree",
          category: "property",
          status: "In Progress",
          priority: "High",
          location: "Central Park West",
          lat: 40.718,
          lng: -74.011,
          date: "2025-05-05",
        },
        {
          id: "7",
          title: "Water Main Break",
          category: "water",
          status: "Open",
          priority: "High",
          location: "34th St & 8th Ave",
          lat: 40.708,
          lng: -74.004,
          date: "2025-05-06",
        },
        {
          id: "8",
          title: "Graffiti on Public Building",
          category: "property",
          status: "Open",
          priority: "Low",
          location: "City Hall",
          lat: 40.716,
          lng: -74.012,
          date: "2025-05-06",
        },
        {
          id: "9",
          title: "Traffic Light Malfunction",
          category: "streetlight",
          status: "In Progress",
          priority: "Medium",
          location: "42nd & Broadway",
          lat: 40.719,
          lng: -74.007,
          date: "2025-05-07",
        },
        {
          id: "10",
          title: "Sinkhole",
          category: "road",
          status: "Open",
          priority: "High",
          location: "5th Ave & 23rd St",
          lat: 40.711,
          lng: -74.001,
          date: "2025-05-07",
        },
      ];
      setReports(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter reports based on selected filters
  const filteredReports = reports.filter((report) => {
    let includeReport = true;

    if (categoryFilter && report.category !== categoryFilter) {
      includeReport = false;
    }

    if (statusFilter && report.status !== statusFilter) {
      includeReport = false;
    }

    return includeReport;
  });

  // Get unique categories and statuses for filters
  const categories = [...new Set(reports.map((report) => report.category))];
  const statuses = [...new Set(reports.map((report) => report.status))];

  // Get statistics
  const stats = {
    total: filteredReports.length,
    highPriority: filteredReports.filter((r) => r.priority === "High").length,
    mediumPriority: filteredReports.filter((r) => r.priority === "Medium")
      .length,
    lowPriority: filteredReports.filter((r) => r.priority === "Low").length,
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        Infrastructure Issues Heatmap Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Total Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {stats.highPriority}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.mediumPriority}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.lowPriority}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Incident Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-heatmap"
                checked={showHeatmap}
                onCheckedChange={setShowHeatmap}
              />
              <Label htmlFor="show-heatmap">Show Heatmap</Label>
            </div>

            <div className="w-[180px]">
              <Label htmlFor="category-filter" className="block mb-1 text-sm">
                Category
              </Label>
              <Select
                value={categoryFilter || "all"}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <Label htmlFor="status-filter" className="block mb-1 text-sm">
                Status
              </Label>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(categoryFilter || statusFilter) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter(null);
                    setStatusFilter(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          <div
            className="border rounded-lg overflow-hidden"
            style={{ height: "700px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading map data...</p>
              </div>
            ) : (
              <Map
                markers={filteredReports}
                zoom={13}
                showHeatmap={showHeatmap}
                heatmapOptions={heatmapOptions}
                onSelectMarker={(id) => {
                  console.log(`Selected marker: ${id}`);
                  // In a real app, you could show details or navigate to the report
                }}
              />
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              Heatmap reflects the density and priority of reported issues. Red
              areas indicate high concentration of high-priority issues.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Based on the heatmap analysis:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Areas with concentrated red indicate urgent attention is needed
              </li>
              <li>
                The highest concentration of issues appears to be in the
                downtown area
              </li>
              <li>
                Water-related issues show a pattern along the eastern district
              </li>
              <li>
                Road infrastructure reports are distributed across the entire
                region
              </li>
            </ul>
            <p>Recommended actions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dispatch maintenance teams to high-priority clusters</li>
              <li>Schedule preventative maintenance in yellow zones</li>
              <li>Allocate resources based on issue density and severity</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
