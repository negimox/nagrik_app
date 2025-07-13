"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Download,
  FileDown,
  BarChart3,
  PieChart,
  LineChart,
  Map,
  Zap,
  Save,
} from "lucide-react";
import { genAI } from "@/lib/genai-utils";
import {
  generateReportInsights,
  generateStructuredInsights,
  generateGeospatialInsights,
  InsightType,
  type AnalyticsRequest,
  type StructuredAnalyticsResponse,
} from "@/lib/analytics-utils";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [aiGeneratedInsights, setAiGeneratedInsights] = useState("");
  const [showPolicyImpact, setShowPolicyImpact] = useState(false);

  // Mock data for analytics
  const overviewStats = {
    totalReports: 5,
    resolvedReports: 0,
    pendingReports: 5,
    inProgressReports: 5,
    averageResolutionTime: "4.2 days",
    citizenSatisfaction: 80,
    reportIncrease: 12,
    resolutionRateIncrease: 8,
  };

  // Mock data for category distribution
  const categoryData = [
    { category: "Road Damage", count: 3, percentage: 50, change: 5 },
    { category: "Streetlights", count: 1, percentage: 25, change: -2 },
    { category: "Sanitation", count: 0, percentage: 0, change: 0 },
    { category: "Water/Drainage", count: 0, percentage: 0, change: 0 },
    { category: "Public Property", count: 1, percentage: 25, change: 1 },
  ];

  // Mock data for district distribution
  const districtData = [
    { district: "East Hope Town", count: 3, percentage: 50, change: 4 },
    { district: "Jhajra", count: 1, percentage: 25, change: 6 },
    { district: "Dhulkot", count: 1, percentage: 25, change: -3 },
  ];

  // Mock data for resolution time
  const resolutionTimeData = [
    { category: "Road Damage", time: 5.2, previousTime: 5.9, change: -12 },
    { category: "Streetlights", time: 2.8, previousTime: 3.7, change: -24 },
    { category: "Sanitation", time: 1.5, previousTime: 1.6, change: -8 },
    { category: "Water/Drainage", time: 3.7, previousTime: 3.5, change: 5 },
    { category: "Public Property", time: 4.1, previousTime: 4.5, change: -9 },
  ];

  // Mock data for monthly reports
  const monthlyReportData = [
    { month: "January", total: 98, resolved: 92, pending: 6 },
    { month: "February", total: 112, resolved: 105, pending: 7 },
    { month: "March", total: 124, resolved: 115, pending: 9 },
    { month: "April", total: 136, resolved: 120, pending: 16 },
    { month: "May", total: 148, resolved: 125, pending: 23 },
    { month: "June", total: 156, resolved: 130, pending: 26 },
  ];

  // State for structured analytics data
  const [structuredInsights, setStructuredInsights] =
    useState<StructuredAnalyticsResponse | null>(null);
  const [activeInsightTypes, setActiveInsightTypes] = useState<InsightType[]>([
    InsightType.EXECUTIVE_SUMMARY,
    InsightType.ANOMALY_DETECTION,
    InsightType.POLICY_IMPACT,
    InsightType.PREDICTIVE_FORECAST,
  ]);
  const [geoInsights, setGeoInsights] = useState<string>("");
  const [resourceInsights, setResourceInsights] = useState<string>("");

  // Generated AI insights function with real Gemini integration
  const generateAiInsights = async () => {
    setIsGeneratingInsights(true);

    try {
      // Create the analytics request from our available data
      const request: AnalyticsRequest = {
        timeRange,
        reportData: overviewStats,
        categoryData,
        districtData,
        resolutionTimeData,
        policyImpactData,
        anomalyData,
        selectedDistricts:
          selectedDistrict === "all" ? undefined : [selectedDistrict],
        selectedCategories:
          selectedCategory === "all" ? undefined : [selectedCategory],
        insightTypes: activeInsightTypes,
        maxRecommendations: 5,
      };

      // Generate both text and structured insights in parallel
      const [textInsights, structuredData] = await Promise.all([
        generateReportInsights(request),
        generateStructuredInsights(request),
      ]);

      // Set the generated insights
      setAiGeneratedInsights(textInsights);
      setStructuredInsights(structuredData);

      // If "all" districts are selected, also generate geospatial insights
      if (selectedDistrict === "all") {
        const geoData = await generateGeospatialInsights(districtData, [
          ...categoryData.map((c) => ({ ...c, type: "category" })),
          ...anomalyData.map((a) => ({ ...a, type: "anomaly" })),
        ]);
        setGeoInsights(geoData);
      }

      // Generate resource allocation insights if that insight type is active
      //   if (activeInsightTypes.includes(InsightType.RESOURCE_ALLOCATION)) {
      //     const resData = await generateResourceAllocationInsights(
      //       categoryData,
      //       resolutionTimeData
      //     );
      //     setResourceInsights(resData);
      //   }
    } catch (error) {
      console.error("Error generating insights:", error);
      setAiGeneratedInsights(
        "Failed to generate insights. Please try again later."
      );
      setStructuredInsights(null);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Mock data for policy impact analysis
  const policyImpactData = [
    {
      policyName: "Pothole Rapid Response Initiative",
      implementedDate: "Jan 15, 2025",
      targetDistricts: ["Downtown", "North District"],
      beforeMetrics: {
        avgResolutionTime: 7.2,
        reportFrequency: 28,
        citizenSatisfaction: 72,
      },
      afterMetrics: {
        avgResolutionTime: 2.8,
        reportFrequency: 16,
        citizenSatisfaction: 86,
      },
      impact: "high",
      notes:
        "This policy improved response time by 61% and reduced new reports by 43%",
    },
    {
      policyName: "Streetlight Modernization Program",
      implementedDate: "Feb 10, 2025",
      targetDistricts: ["East District", "South District"],
      beforeMetrics: {
        avgResolutionTime: 4.1,
        reportFrequency: 22,
        citizenSatisfaction: 78,
      },
      afterMetrics: {
        avgResolutionTime: 2.1,
        reportFrequency: 11,
        citizenSatisfaction: 92,
      },
      impact: "high",
      notes:
        "LED replacements and smart monitoring reduced outage time by 48% and reports by 50%",
    },
    {
      policyName: "Sanitation Improvement Regulation",
      implementedDate: "Mar 5, 2025",
      targetDistricts: ["West District", "Downtown"],
      beforeMetrics: {
        avgResolutionTime: 3.5,
        reportFrequency: 18,
        citizenSatisfaction: 65,
      },
      afterMetrics: {
        avgResolutionTime: 2.8,
        reportFrequency: 14,
        citizenSatisfaction: 72,
      },
      impact: "medium",
      notes:
        "Initial improvements seen, but requires longer observation period",
    },
  ];

  // Mock data for anomaly detection
  const anomalyData = [
    {
      category: "Water/Drainage",
      district: "North District",
      detectionDate: "Apr 28, 2025",
      normalRate: 5,
      anomalyRate: 28,
      increase: 460,
      potentialCause: "Heavy rainfall combined with blocked drainage system",
      recommendedAction: "Immediate drainage system inspection and clearance",
    },
    {
      category: "Road Damage",
      district: "Downtown",
      detectionDate: "Apr 15, 2025",
      normalRate: 12,
      anomalyRate: 35,
      increase: 192,
      potentialCause: "Possible water main leak undermining road surface",
      recommendedAction: "Coordinate with water department for inspection",
    },
  ];

  // Mock data for predictive insights
  const predictiveInsightsData = [
    {
      category: "Road Damage",
      district: "East District",
      predictedIssueCount: 41,
      confidence: 87,
      timeframe: "Next 30 days",
      contributingFactors:
        "Aging infrastructure, predicted heavy rainfall, high traffic volume",
      recommendedAction:
        "Preventive maintenance in high-risk areas before monsoon season",
    },
    {
      category: "Streetlights",
      district: "West District",
      predictedIssueCount: 24,
      confidence: 82,
      timeframe: "Next 30 days",
      contributingFactors:
        "Aging electrical infrastructure, previous replacement patterns",
      recommendedAction: "Batch replacement of lights approaching end-of-life",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-md p-6">
        <h1 className="text-xl font-bold text-[#003A70] mb-4">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Analyze infrastructure report data, track performance metrics, and
          identify trends to improve city services.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] border-gray-300">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-[#003A70] text-[#003A70]"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-[#003A70] text-[#003A70]"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.totalReports}
            </div>
            <p className="text-xs text-gray-500">
              +{overviewStats.reportIncrease}% from previous {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.resolvedReports}
            </div>
            <p className="text-xs text-gray-500">
              +{overviewStats.resolutionRateIncrease}% from previous {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.pendingReports}
            </div>
            <p className="text-xs text-gray-500">
              {Math.round(
                (overviewStats.pendingReports / overviewStats.totalReports) *
                  100
              )}
              % of total reports
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              Avg. Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats.averageResolutionTime}
            </div>
            <p className="text-xs text-gray-500">
              -0.3 days from previous {timeRange}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-md">
        <Tabs
          defaultValue="overview"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="border-b">
            <TabsList className="w-full justify-start p-0 bg-transparent h-auto">
              <TabsTrigger
                value="overview"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="districts"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                Districts
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                Trends
              </TabsTrigger>
              <TabsTrigger
                value="ai-insights"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                AI Insights
              </TabsTrigger>
              <TabsTrigger
                value="policy-impact"
                className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#003A70] data-[state=active]:text-[#003A70] data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                Policy Impact
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-4 mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold mb-4">
                  Report Status Distribution
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Resolved</span>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (overviewStats.resolvedReports /
                            overviewStats.totalReports) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (overviewStats.resolvedReports /
                          overviewStats.totalReports) *
                        100
                      }
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">In Progress</span>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (overviewStats.inProgressReports /
                            overviewStats.totalReports) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (overviewStats.inProgressReports /
                          overviewStats.totalReports) *
                        100
                      }
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-yellow-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (overviewStats.pendingReports /
                            overviewStats.totalReports) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (overviewStats.pendingReports /
                          overviewStats.totalReports) *
                        100
                      }
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-4">
                  Monthly Report Volume
                </h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-medium text-gray-500">
                          Month
                        </TableHead>
                        <TableHead className="font-medium text-gray-500">
                          Total
                        </TableHead>
                        <TableHead className="font-medium text-gray-500">
                          Resolved
                        </TableHead>
                        <TableHead className="font-medium text-gray-500">
                          Pending
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReportData.map((month) => (
                        <TableRow
                          key={month.month}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {month.month}
                          </TableCell>
                          <TableCell>{month.total}</TableCell>
                          <TableCell>{month.resolved}</TableCell>
                          <TableCell>{month.pending}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold mb-4">Citizen Satisfaction</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full border-8 border-[#003A70] flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {overviewStats.citizenSatisfaction}%
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">
                    Overall citizen satisfaction with infrastructure issue
                    resolution is at {overviewStats.citizenSatisfaction}%, which
                    is 3% higher than the previous {timeRange}.
                  </p>
                  <p className="text-sm text-gray-500">
                    Based on feedback collected from citizens after issue
                    resolution.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="p-4 mt-0">
            <h3 className="text-sm font-bold mb-4">
              Report Categories Distribution
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {categoryData.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#003A70]"></div>
                        <span className="text-sm">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {category.percentage}%
                        </span>
                        <Badge
                          variant="outline"
                          className={`${
                            category.change > 0
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          {category.change > 0 ? "+" : ""}
                          {category.change}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={category.percentage}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-[#003A70]"
                    />
                  </div>
                ))}
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium text-gray-500">
                        Category
                      </TableHead>
                      <TableHead className="font-medium text-gray-500">
                        Reports
                      </TableHead>
                      <TableHead className="font-medium text-gray-500">
                        Percentage
                      </TableHead>
                      <TableHead className="font-medium text-gray-500">
                        Change
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryData.map((category) => (
                      <TableRow
                        key={category.category}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {category.category}
                        </TableCell>
                        <TableCell>{category.count}</TableCell>
                        <TableCell>{category.percentage}%</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              category.change > 0
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {category.change > 0 ? "+" : ""}
                            {category.change}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="districts" className="p-4 mt-0">
            <h3 className="text-sm font-bold mb-4">
              Report Distribution by District
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {districtData.map((district) => (
                  <div key={district.district} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#003A70]"></div>
                        <span className="text-sm">{district.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {district.percentage}%
                        </span>
                        <Badge
                          variant="outline"
                          className={`${
                            district.change > 0
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          {district.change > 0 ? "+" : ""}
                          {district.change}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={district.percentage}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-[#003A70]"
                    />
                  </div>
                ))}
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium text-gray-500">
                        District
                      </TableHead>
                      <TableHead className="font-medium text-gray-500">
                        Reports
                      </TableHead>
                      <TableHead className="font-medium text-gray-500">
                        Percentage
                      </TableHead>
                      <TableHead className="font-medium text-gray-500">
                        Change
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districtData.map((district) => (
                      <TableRow
                        key={district.district}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {district.district}
                        </TableCell>
                        <TableCell>{district.count}</TableCell>
                        <TableCell>{district.percentage}%</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              district.change > 0
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {district.change > 0 ? "+" : ""}
                            {district.change}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="p-4 mt-0">
            <h3 className="text-sm font-bold mb-4">
              Resolution Performance by Category
            </h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium text-gray-500">
                      Category
                    </TableHead>
                    <TableHead className="font-medium text-gray-500">
                      Avg. Resolution Time
                    </TableHead>
                    <TableHead className="font-medium text-gray-500">
                      Previous Period
                    </TableHead>
                    <TableHead className="font-medium text-gray-500">
                      Change
                    </TableHead>
                    <TableHead className="font-medium text-gray-500">
                      Efficiency
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolutionTimeData.map((item) => (
                    <TableRow key={item.category} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {item.category}
                      </TableCell>
                      <TableCell>{item.time} days</TableCell>
                      <TableCell>{item.previousTime} days</TableCell>
                      <TableCell
                        className={
                          item.change < 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {item.change}%
                      </TableCell>
                      <TableCell>
                        <Progress
                          value={100 - (item.time / 7) * 100}
                          className="h-2 w-24"
                          indicatorClassName={
                            item.time < 3
                              ? "bg-green-500"
                              : item.time < 5
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold mb-4">Resolution Rate</h3>
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {Math.round(
                          (overviewStats.resolvedReports /
                            overviewStats.totalReports) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-sm text-gray-500">
                        Overall resolution rate
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      +{overviewStats.resolutionRateIncrease}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    The resolution rate has improved by{" "}
                    {overviewStats.resolutionRateIncrease}% compared to the
                    previous {timeRange}, indicating more efficient issue
                    handling and team performance.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-4">
                  Average Response Time
                </h3>
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold">1.2 days</div>
                      <div className="text-sm text-gray-500">
                        Initial response time
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      -15%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    The average time between report submission and initial
                    assessment has decreased by 15% compared to the previous{" "}
                    {timeRange}, showing improved responsiveness.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="p-4 mt-0">
            <h3 className="text-sm font-bold mb-4">Monthly Report Trends</h3>
            <div className="border rounded-md p-4">
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-md mb-4">
                <p className="text-gray-500">
                  Monthly report trend chart would be displayed here
                </p>
              </div>
              <p className="text-sm text-gray-600">
                The chart above shows the trend of reports submitted over the
                past 6 months, broken down by category. There has been a steady
                increase in overall reports, with Road Damage consistently being
                the most reported issue.
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold mb-4">Seasonal Patterns</h3>
                <div className="border rounded-md p-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Season
                        </th>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Top Issue
                        </th>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Volume
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-3 px-4">Spring</td>
                        <td className="py-3 px-4">Road Damage</td>
                        <td className="py-3 px-4">High</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Summer</td>
                        <td className="py-3 px-4">Water/Drainage</td>
                        <td className="py-3 px-4">Medium</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Fall</td>
                        <td className="py-3 px-4">Streetlights</td>
                        <td className="py-3 px-4">Medium</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Winter</td>
                        <td className="py-3 px-4">Road Damage</td>
                        <td className="py-3 px-4">Very High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-4">
                  Year-over-Year Comparison
                </h3>
                <div className="border rounded-md p-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Metric
                        </th>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Current Year
                        </th>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Previous Year
                        </th>
                        <th className="py-2 px-4 text-left font-medium text-gray-500">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-3 px-4">Total Reports</td>
                        <td className="py-3 px-4">1,248</td>
                        <td className="py-3 px-4">1,087</td>
                        <td className="py-3 px-4 text-green-600">+14.8%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Resolution Rate</td>
                        <td className="py-3 px-4">78.7%</td>
                        <td className="py-3 px-4">72.3%</td>
                        <td className="py-3 px-4 text-green-600">+6.4%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Avg. Resolution Time</td>
                        <td className="py-3 px-4">4.2 days</td>
                        <td className="py-3 px-4">5.1 days</td>
                        <td className="py-3 px-4 text-green-600">-17.6%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Citizen Satisfaction</td>
                        <td className="py-3 px-4">87%</td>
                        <td className="py-3 px-4">81%</td>
                        <td className="py-3 px-4 text-green-600">+6.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="p-4 mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">
                AI-Generated Infrastructure Insights
              </h3>
              <div className="flex gap-2 items-center">
                <Select
                  defaultValue={activeInsightTypes.join(",")}
                  onValueChange={(val) => {
                    const insights = val
                      .split(",")
                      .map((v) => v as InsightType);
                    setActiveInsightTypes(insights);
                  }}
                >
                  <SelectTrigger className="w-[180px] border-gray-300">
                    <SelectValue placeholder="Select insight types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={[
                        InsightType.EXECUTIVE_SUMMARY,
                        InsightType.ANOMALY_DETECTION,
                        InsightType.POLICY_IMPACT,
                        InsightType.PREDICTIVE_FORECAST,
                      ].join(",")}
                    >
                      Standard Analysis
                    </SelectItem>
                    <SelectItem
                      value={[
                        InsightType.EXECUTIVE_SUMMARY,
                        InsightType.RESOURCE_ALLOCATION,
                        InsightType.BUDGET_OPTIMIZATION,
                      ].join(",")}
                    >
                      Resource Planning
                    </SelectItem>
                    <SelectItem
                      value={[
                        InsightType.ANOMALY_DETECTION,
                        InsightType.PREDICTIVE_FORECAST,
                      ].join(",")}
                    >
                      Anomaly & Prediction
                    </SelectItem>
                    <SelectItem
                      value={[
                        InsightType.DEMOGRAPHIC_ANALYSIS,
                        InsightType.SEASONAL_PATTERNS,
                      ].join(",")}
                    >
                      Pattern Analysis
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={generateAiInsights}
                  disabled={isGeneratingInsights}
                  variant="outline"
                  className="gap-2 border-[#003A70] text-[#003A70]"
                >
                  {isGeneratingInsights ? (
                    <>
                      <div className="h-4 w-4 border-2 border-b-transparent border-[#003A70] rounded-full animate-spin"></div>
                      <span>Analyzing Data...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Generate Insights</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              {structuredInsights?.summaryMetrics
                ?.slice(0, 3)
                .map((metric, index) => (
                  <Card key={index} className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold">
                        {metric.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        {metric.change && (
                          <Badge
                            variant="outline"
                            className={
                              metric.trend === "up"
                                ? metric.label.includes("Time")
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : "bg-green-100 text-green-800 border-green-300"
                                : metric.trend === "down"
                                ? metric.label.includes("Time")
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }
                          >
                            {metric.change > 0 ? "+" : ""}
                            {metric.change}%{metric.trend === "up" && " ↑"}
                            {metric.trend === "down" && " ↓"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="md:col-span-2">
                <div className="border rounded-md p-6 bg-white h-full">
                  {aiGeneratedInsights ? (
                    <div className="prose prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiGeneratedInsights
                            .replace(
                              /^#\s+(.+)$/gm,
                              '<h2 class="text-xl font-bold text-[#003A70] mb-3">$1</h2>'
                            )
                            .replace(
                              /^##\s+(.+)$/gm,
                              '<h3 class="text-lg font-bold text-[#003A70] mb-2">$1</h3>'
                            )
                            .replace(
                              /^###\s+(.+)$/gm,
                              '<h4 class="text-base font-bold text-[#003A70] mb-2">$1</h4>'
                            )
                            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                            .replace(
                              /\n\s*-\s+(.+)/g,
                              '<li class="mb-1">$1</li>'
                            )
                            .replace(
                              /(<li[^>]*>.+<\/li>\n?)+/g,
                              '<ul class="list-disc pl-5 mb-4">$&</ul>'
                            )
                            .replace(/\n+/g, "<br/>")
                            .replace(
                              /\n([0-9]+)\.\s+(.+)/g,
                              '<li class="mb-1">$2</li>'
                            )
                            .replace(
                              /(<li class="mb-1">[^<]+<\/li>\n?)+/g,
                              '<ol class="list-decimal pl-5 mb-4">$&</ol>'
                            ),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <p className="text-gray-500 mb-4">
                        Generate AI insights to get a comprehensive analysis of
                        your infrastructure report data.
                      </p>
                      <Button
                        onClick={generateAiInsights}
                        disabled={isGeneratingInsights}
                        className="bg-[#003A70]"
                      >
                        {isGeneratingInsights
                          ? "Analyzing Data..."
                          : "Generate Insights"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">
                      Priority Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {structuredInsights?.recommendations ? (
                      <div className="space-y-2">
                        {structuredInsights.recommendations.map(
                          (recommendation, index) => (
                            <div
                              key={index}
                              className="flex gap-2 p-2 border rounded-md"
                            >
                              <span className="text-[#003A70] font-bold">
                                {index + 1}.
                              </span>
                              <p className="text-sm">{recommendation}</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Generate insights to see recommendations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center">
                  <PieChart className="h-4 w-4 mr-2 text-red-500" />
                  Anomaly Detection
                </h3>
                <div className="space-y-4">
                  {structuredInsights?.anomalies &&
                  structuredInsights.anomalies.length > 0
                    ? structuredInsights.anomalies.map((anomaly, index) => (
                        <Card
                          key={index}
                          className="border-l-4 border-l-red-500"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-bold">
                                {anomaly.category} in {anomaly.district}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 border-red-300"
                              >
                                +{anomaly.percentageIncrease}%
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-2">
                              <div className="text-sm font-medium">
                                Normal Rate: {anomaly.normalRate} reports/week
                              </div>
                              <div className="text-sm font-medium">
                                Current Rate: {anomaly.currentRate} reports/week
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Potential Cause:</strong>{" "}
                              {anomaly.potentialCause}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <strong>Confidence:</strong>
                              <Progress
                                value={anomaly.confidence}
                                className="h-2 flex-1 bg-gray-100"
                                indicatorClassName="bg-red-500"
                              />
                              <span>{anomaly.confidence}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    : anomalyData.map((anomaly, index) => (
                        <Card
                          key={index}
                          className="border-l-4 border-l-red-500"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-bold">
                                {anomaly.category} in {anomaly.district}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 border-red-300"
                              >
                                +{anomaly.increase}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              Detected on {anomaly.detectionDate}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-2">
                              <div className="text-sm font-medium">
                                Normal Rate: {anomaly.normalRate} reports/week
                              </div>
                              <div className="text-sm font-medium">
                                Current Rate: {anomaly.anomalyRate} reports/week
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Potential Cause:</strong>{" "}
                              {anomaly.potentialCause}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Recommendation:</strong>{" "}
                              {anomaly.recommendedAction}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                  Predictive Insights
                </h3>
                <div className="space-y-4">
                  {structuredInsights?.trends &&
                  structuredInsights.trends.length > 0
                    ? structuredInsights.trends.map((trend, index) => (
                        <Card
                          key={index}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-bold">
                                {trend.category}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 border-blue-300"
                              >
                                {trend.confidence}% confidence
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Past Trend:</strong> {trend.pastTrend}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Future Forecast:</strong>{" "}
                              {trend.futureForecast}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    : predictiveInsightsData.map((prediction, index) => (
                        <Card
                          key={index}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-bold">
                                {prediction.category} in {prediction.district}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 border-blue-300"
                              >
                                {prediction.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              Prediction for {prediction.timeframe}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-2">
                              <div className="text-sm font-medium">
                                Predicted Issues:{" "}
                                {prediction.predictedIssueCount}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Contributing Factors:</strong>{" "}
                              {prediction.contributingFactors}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Recommendation:</strong>{" "}
                              {prediction.recommendedAction}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                </div>
              </div>
            </div>

            {/* Resource Allocation Insights */}
            {activeInsightTypes.includes(InsightType.RESOURCE_ALLOCATION) &&
              resourceInsights && (
                <div className="mt-6 border rounded-md p-6 bg-white">
                  <h3 className="text-lg font-bold text-[#003A70] mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Resource Allocation Insights
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: resourceInsights
                          .replace(
                            /^##\s+(.+)$/gm,
                            '<h3 class="text-lg font-bold text-[#003A70] mb-2">$1</h3>'
                          )
                          .replace(
                            /^###\s+(.+)$/gm,
                            '<h4 class="text-base font-bold text-[#003A70] mb-2">$1</h4>'
                          )
                          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n\s*-\s+(.+)/g, '<li class="mb-1">$1</li>')
                          .replace(
                            /(<li[^>]*>.+<\/li>\n?)+/g,
                            '<ul class="list-disc pl-5 mb-4">$&</ul>'
                          )
                          .replace(
                            /\n\s*[0-9]+\.\s+(.+)/g,
                            '<li class="mb-1">$1</li>'
                          )
                          .replace(
                            /(<li class="mb-1">[^<]+<\/li>\n?)+/g,
                            '<ol class="list-decimal pl-5 mb-4">$&</ol>'
                          ),
                      }}
                    />
                  </div>
                </div>
              )}

            {/* Geospatial Analysis */}
            {selectedDistrict === "all" && geoInsights && (
              <div className="mt-6 border rounded-md p-6 bg-white">
                <h3 className="text-lg font-bold text-[#003A70] mb-4 flex items-center">
                  <Map className="h-5 w-5 mr-2" />
                  Geospatial Analysis
                </h3>
                <div className="h-64 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  <p className="text-gray-500">
                    Interactive map visualization would be displayed here
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto">
                    {geoInsights.slice(0, 300)}...
                  </pre>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Save className="h-4 w-4 mr-2" />
                    Export GeoJSON
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="policy-impact" className="p-4 mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Policy Impact Assessment</h3>
              <div className="flex gap-2">
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="w-[140px] border-gray-300">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Downtown">Downtown</SelectItem>
                    <SelectItem value="North District">
                      North District
                    </SelectItem>
                    <SelectItem value="East District">East District</SelectItem>
                    <SelectItem value="South District">
                      South District
                    </SelectItem>
                    <SelectItem value="West District">West District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {policyImpactData.map((policy, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${
                    policy.impact === "high"
                      ? "border-l-green-500"
                      : policy.impact === "medium"
                      ? "border-l-yellow-500"
                      : "border-l-orange-500"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-bold">
                        {policy.policyName}
                      </CardTitle>
                      <Badge
                        variant={
                          policy.impact === "high" ? "outline" : "secondary"
                        }
                        className={`${
                          policy.impact === "high"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : policy.impact === "medium"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : "bg-orange-100 text-orange-800 border-orange-300"
                        }`}
                      >
                        {policy.impact === "high"
                          ? "High Impact"
                          : policy.impact === "medium"
                          ? "Medium Impact"
                          : "Low Impact"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {policy.targetDistricts.map((district) => (
                        <Badge
                          key={district}
                          variant="secondary"
                          className="bg-gray-100"
                        >
                          {district}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Implemented on {policy.implementedDate}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-1">
                          Resolution Time
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="text-2xl font-bold">
                            {policy.afterMetrics.avgResolutionTime.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500 mb-1">days</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-500">
                            From{" "}
                            {policy.beforeMetrics.avgResolutionTime.toFixed(1)}{" "}
                            days
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-300"
                          >
                            {Math.round(
                              (1 -
                                policy.afterMetrics.avgResolutionTime /
                                  policy.beforeMetrics.avgResolutionTime) *
                                100
                            )}
                            % faster
                          </Badge>
                        </div>
                      </div>

                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-1">
                          Report Frequency
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="text-2xl font-bold">
                            {policy.afterMetrics.reportFrequency}
                          </div>
                          <div className="text-sm text-gray-500 mb-1">
                            per week
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-500">
                            From {policy.beforeMetrics.reportFrequency} per week
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-300"
                          >
                            {Math.round(
                              (1 -
                                policy.afterMetrics.reportFrequency /
                                  policy.beforeMetrics.reportFrequency) *
                                100
                            )}
                            % fewer
                          </Badge>
                        </div>
                      </div>

                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-1">
                          Citizen Satisfaction
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="text-2xl font-bold">
                            {policy.afterMetrics.citizenSatisfaction}%
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-500">
                            From {policy.beforeMetrics.citizenSatisfaction}%
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-300"
                          >
                            +
                            {policy.afterMetrics.citizenSatisfaction -
                              policy.beforeMetrics.citizenSatisfaction}
                            %
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      <strong>Analysis:</strong> {policy.notes}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 border rounded-md p-4">
              <h3 className="text-sm font-bold mb-4">
                Policy Implementation Timeline
              </h3>
              <div className="relative">
                <div className="absolute h-full w-0.5 bg-gray-200 left-2 top-0"></div>
                <div className="space-y-6 relative">
                  {policyImpactData.map((policy, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-4 h-4 rounded-full bg-[#003A70] z-10 mt-1"></div>
                      <div>
                        <div className="text-sm font-bold">
                          {policy.policyName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {policy.implementedDate}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Target areas: {policy.targetDistricts.join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-white border rounded-md p-4">
        <h3 className="text-sm font-bold mb-4">Generate Reports</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FileDown className="h-5 w-5 text-[#003A70]" />
              <h4 className="font-bold text-[#003A70]">Monthly Summary</h4>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Generate a comprehensive monthly report with key metrics and
              trends.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#003A70] text-[#003A70]"
            >
              Generate
            </Button>
          </div>
          <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FileDown className="h-5 w-5 text-[#003A70]" />
              <h4 className="font-bold text-[#003A70]">Category Analysis</h4>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Detailed breakdown of reports by category with resolution metrics.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#003A70] text-[#003A70]"
            >
              Generate
            </Button>
          </div>
          <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FileDown className="h-5 w-5 text-[#003A70]" />
              <h4 className="font-bold text-[#003A70]">Team Performance</h4>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Analysis of team performance metrics and workload distribution.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#003A70] text-[#003A70]"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#E6EEF4] border rounded-md p-4">
        <h2 className="font-bold text-[#003A70] mb-2">Analytics Notes</h2>
        <ul className="text-xs space-y-1 text-gray-700">
          <li>• Data is updated daily at midnight.</li>
          <li>• Reports can be exported in PDF, CSV, or Excel formats.</li>
          <li>• Historical data is available for the past 5 years.</li>
          <li>
            • For custom analytics requests, please contact the IT department.
          </li>
        </ul>
      </div>
    </div>
  );
}
