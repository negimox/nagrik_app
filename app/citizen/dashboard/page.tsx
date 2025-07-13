"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

interface Report {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  location: string;
}

export default function CitizenDashboard() {
  const { user } = useUser();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300"
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

  // Fetch data
  useEffect(() => {
    // Fetch recent reports from the API
    const fetchReports = async () => {
      if (!user || !user.uid) {
        console.log("No user data available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/report?uid=${user.uid}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched reports:", data);

        if (data.result && Array.isArray(data.result)) {
          // Format the reports data for display
          const formattedReports = data.result.map((report: any) => ({
            id: report.id || report._id,
            title: report.title,
            category: report.category,
            status: report.status,
            date: report.date,
            location: report.location,
          }));
          setRecentReports(formattedReports);
        }
      } catch (error) {
        console.error("Error fetching recent reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-md p-6">
        <h1 className="text-xl font-bold text-[#003A70] mb-4">
          {user?.providerData?.[0]?.displayName || "Citizen"}'s Dashboard
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Monitor your infrastructure reports and their progress. If you find a
          new issue, please use the "Report Issue" button.
        </p>
        <Link href="/citizen/report">
          <Button className="bg-[#003A70] hover:bg-[#004d94]">
            Report Issue
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentReports.length}</div>
            <p className="text-xs text-gray-500">Your reported issues</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentReports.filter((r) => r.status === "Resolved").length}
            </div>
            <p className="text-xs text-gray-500">Completed reports</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentReports.filter((r) => r.status === "In Progress").length}
            </div>
            <p className="text-xs text-gray-500">Being addressed</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentReports.filter((r) => r.status === "Pending").length}
            </div>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-md">
        <div className="p-4 border-b">
          <h2 className="font-bold text-[#003A70]">Recent Reports</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading reports...
          </div>
        ) : recentReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reports found. Use the "Report Issue" button to create your first
            report.
          </div>
        ) : (
          <table className="w-full text-sm hidden md:block">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Report ID
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Issue
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Category
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Location
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Date
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{report.id}</td>
                  <td className="py-3 px-4">{report.title}</td>
                  <td className="py-3 px-4">{report.category}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{report.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{report.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(report.status)}</td>
                  <td className="py-3 px-4">
                    <Link href={`/citizen/reports/${report.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#003A70] border-[#003A70]"
                      >
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="p-4 text-center border-t">
          <Link
            href="/citizen/reports"
            className="text-[#003A70] text-sm hover:underline"
          >
            View All Reports
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border rounded-md">
          <div className="p-4 border-b">
            <h2 className="font-bold text-[#003A70]">Announcements</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 pr-4 align-top w-24 text-gray-500">
                    May 1, 2023
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-[#003A70] text-white px-2 py-0.5">
                        NEW
                      </span>
                    </div>
                    <Link href="#" className="text-[#003A70] hover:underline">
                      System upgrade has been implemented
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 align-top w-24 text-gray-500">
                    April 15, 2023
                  </td>
                  <td className="py-3">
                    <Link href="#" className="text-[#003A70] hover:underline">
                      Seeking citizen feedback on road repair efficiency
                      improvements
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 align-top w-24 text-gray-500">
                    April 1, 2023
                  </td>
                  <td className="py-3">
                    <Link href="#" className="text-[#003A70] hover:underline">
                      Information session on using the Infrastructure Monitoring
                      System
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 text-center border-t">
            <Link
              href="/citizen/notifications"
              className="text-[#003A70] text-sm hover:underline"
            >
              View All Announcements
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-md">
          <div className="p-4 border-b">
            <h2 className="font-bold text-[#003A70]">Quick Links</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <Link href="/citizen/report">
              <div className="border rounded p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="text-[#003A70] font-bold mb-2">
                  Report Issue
                </div>
                <p className="text-xs text-gray-500">
                  Report a new infrastructure problem
                </p>
              </div>
            </Link>
            <Link href="/citizen/map">
              <div className="border rounded p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="text-[#003A70] font-bold mb-2">View Map</div>
                <p className="text-xs text-gray-500">
                  See reported issues on a map
                </p>
              </div>
            </Link>
            <Link href="/citizen/reports">
              <div className="border rounded p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="text-[#003A70] font-bold mb-2">My Reports</div>
                <p className="text-xs text-gray-500">
                  Check your past reports and their status
                </p>
              </div>
            </Link>
            <Link href="/citizen/help">
              <div className="border rounded p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="text-[#003A70] font-bold mb-2">Help</div>
                <p className="text-xs text-gray-500">
                  Learn how to use the system
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#E6EEF4] border rounded-md p-4">
        <h2 className="font-bold text-[#003A70] mb-2">Important Notes</h2>
        <ul className="text-xs space-y-1 text-gray-700">
          <li>• Please do not include personal information in your reports.</li>
          <li>
            • For urgent or dangerous situations, please contact City Hall
            directly at (123) 456-7890.
          </li>
          <li>
            • Reported issues are reviewed by the relevant department. Response
            times may vary based on priority.
          </li>
          <li>• For system inquiries, please use the "Contact Us" form.</li>
        </ul>
      </div>
    </div>
  );
}
