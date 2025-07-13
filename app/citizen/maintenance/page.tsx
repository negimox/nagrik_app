"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageDetector } from "@/components/ui/image-detector";
import {
  MaintenanceScheduler,
  MaintenanceSchedule,
} from "@/components/ui/maintenance-scheduler";
import { MaintenanceScheduleView } from "@/components/ui/maintenance-schedule-view";
import { NotificationsMenu } from "@/components/ui/notifications-menu";
import { EnhancedDetectedObject } from "@/lib/genai-utils";
import { Badge } from "@/components/ui/badge";
import { format, addDays, subDays } from "date-fns";
import {
  notifyMaintenanceScheduled,
  notifyMaintenanceStatusChange,
} from "@/lib/notification-utils";

export default function MaintenancePage() {
  const [detectedObjects, setDetectedObjects] = useState<
    EnhancedDetectedObject[]
  >([]);
  const [selectedIssue, setSelectedIssue] = useState<
    EnhancedDetectedObject | undefined
  >(undefined);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<
    MaintenanceSchedule[]
  >([]);
  const [activeTab, setActiveTab] = useState("detection");

  // Demo data - pre-populated maintenance schedules
  useEffect(() => {
    const demoSchedules: MaintenanceSchedule[] = [
      {
        issue: "Pothole",
        date: addDays(new Date(), 1),
        timeSlot: "morning",
        crew: "roads",
        priority: "high",
        notes:
          "Deep pothole near intersection causing traffic hazard. Approximately 30cm diameter and 10cm deep.",
        estimatedDuration: "2",
        status: "scheduled",
      },
      {
        issue: "Streetlight",
        date: new Date(),
        timeSlot: "afternoon",
        crew: "electrical",
        priority: "medium",
        notes:
          "Flickering streetlight near park entrance. Pole number ST-4872.",
        estimatedDuration: "1",
        status: "in-progress",
      },
      {
        issue: "Water Leak",
        date: subDays(new Date(), 1),
        timeSlot: "morning",
        crew: "plumbing",
        priority: "urgent",
        notes:
          "Water main leak causing flooding on sidewalk. Potential damage to nearby properties.",
        estimatedDuration: "3",
        status: "completed",
      },
    ];

    setMaintenanceSchedules(demoSchedules);
  }, []);

  const handleDetectionComplete = (objects: EnhancedDetectedObject[]) => {
    setDetectedObjects(objects);

    // If we have detected objects, select the first one as the default
    if (objects.length > 0) {
      setSelectedIssue(objects[0]);
      setActiveTab("schedule");
    }
  };

  const handleIssueSelect = (issue: EnhancedDetectedObject) => {
    setSelectedIssue(issue);
    setActiveTab("schedule");
  };
  const handleScheduleComplete = (scheduleData: MaintenanceSchedule) => {
    // Add the new schedule to the list
    setMaintenanceSchedules([...maintenanceSchedules, scheduleData]);

    // Create a notification for the new maintenance schedule
    notifyMaintenanceScheduled(scheduleData);

    // Switch to the calendar view to see the new schedule
    setActiveTab("calendar");
  };
  const handleStatusChange = (
    index: number,
    status: MaintenanceSchedule["status"]
  ) => {
    const updatedSchedules = [...maintenanceSchedules];
    const originalSchedule = updatedSchedules[index];

    // Only create notification if status has changed
    if (originalSchedule.status !== status) {
      updatedSchedules[index] = {
        ...originalSchedule,
        status,
      };

      // Create a notification for the status change
      notifyMaintenanceStatusChange(updatedSchedules[index], status);
      setMaintenanceSchedules(updatedSchedules);
    }
  };

  // Get counts for each status type for the dashboard
  const getStatusCounts = () => {
    return {
      scheduled: maintenanceSchedules.filter((s) => s.status === "scheduled")
        .length,
      inProgress: maintenanceSchedules.filter((s) => s.status === "in-progress")
        .length,
      completed: maintenanceSchedules.filter((s) => s.status === "completed")
        .length,
      cancelled: maintenanceSchedules.filter((s) => s.status === "cancelled")
        .length,
    };
  };

  const statusCounts = getStatusCounts();

  // Get the urgent issues count
  const urgentCount = maintenanceSchedules.filter(
    (s) =>
      s.priority === "urgent" &&
      s.status !== "completed" &&
      s.status !== "cancelled"
  ).length;

  return (
    <div className="container mx-auto py-8">
      {" "}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Maintenance Management</h1>
          <p className="text-gray-600">
            Detect infrastructure issues and schedule maintenance efficiently
          </p>
        </div>
        <NotificationsMenu />
      </div>
      {/* Status Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold">{statusCounts.scheduled}</p>
            </div>
            <Badge className="bg-blue-500">{statusCounts.scheduled}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{statusCounts.inProgress}</p>
            </div>
            <Badge className="bg-orange-500">{statusCounts.inProgress}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{statusCounts.completed}</p>
            </div>
            <Badge className="bg-green-500">{statusCounts.completed}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Urgent Issues</p>
              <p className="text-2xl font-bold">{urgentCount}</p>
            </div>
            <Badge className="bg-red-500">{urgentCount}</Badge>
          </CardContent>
        </Card>
      </div>
      <div className="grid md:grid-cols-7 gap-6">
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload Infrastructure Image</CardTitle>
              <CardDescription>
                Upload or take a photo of infrastructure issues to detect and
                schedule maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageDetector onDetectionComplete={handleDetectionComplete} />

              {detectedObjects.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">
                    {detectedObjects.length} issue(s) detected - click to
                    schedule maintenance
                  </p>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {detectedObjects.map((obj, idx) => (
                      <div
                        key={idx}
                        className={`bg-white border rounded-md p-3 cursor-pointer transition hover:bg-gray-50 ${
                          selectedIssue === obj
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200"
                        }`}
                        onClick={() => handleIssueSelect(obj)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{obj.name}</span>
                          {obj.severity && (
                            <Badge
                              className={
                                obj.severity === "High"
                                  ? "bg-red-500"
                                  : obj.severity === "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }
                            >
                              {obj.severity}
                            </Badge>
                          )}
                        </div>
                        {obj.condition && (
                          <p className="text-sm text-gray-600">
                            Condition: {obj.condition}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Maintenance Management</CardTitle>
              <CardDescription>
                Schedule and view maintenance tasks for detected issues
              </CardDescription>

              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="detection">Detection</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              <Tabs>
                <TabsContent value="detection" className="mt-0">
                  {detectedObjects.length > 0 ? (
                    <div className="space-y-4">
                      {detectedObjects.map((obj, idx) => (
                        <Card key={idx} className="overflow-hidden">
                          <div
                            className={`h-2 ${
                              obj.severity === "High"
                                ? "bg-red-500"
                                : obj.severity === "Medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          />

                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">
                                  {obj.name}
                                </h3>
                                {obj.condition && (
                                  <p className="text-sm text-gray-500">
                                    Condition: {obj.condition}
                                  </p>
                                )}
                              </div>
                              {obj.severity && (
                                <Badge
                                  className={
                                    obj.severity === "High"
                                      ? "bg-red-500"
                                      : obj.severity === "Medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }
                                >
                                  {obj.severity}
                                </Badge>
                              )}
                            </div>

                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${obj.confidence}%` }}
                              />
                            </div>
                            <p className="text-xs text-right mt-1">
                              Confidence: {obj.confidence.toFixed(1)}%
                            </p>

                            {obj.description && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                                {obj.description}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <p className="text-gray-500">
                        No infrastructure issues have been detected yet.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Upload an image to analyze infrastructure issues with
                        AI.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="schedule" className="mt-0">
                  {selectedIssue ? (
                    <MaintenanceScheduler
                      detectedIssue={selectedIssue}
                      onScheduleComplete={handleScheduleComplete}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <p className="text-gray-500">
                        No issue selected for scheduling.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Detect and select an infrastructure issue to schedule
                        maintenance.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <MaintenanceScheduleView
                    schedules={maintenanceSchedules}
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Infrastructure Maintenance Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This maintenance management system combines AI-powered issue
            detection with scheduling and tracking capabilities to efficiently
            manage infrastructure repairs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">1. AI Detection</h3>
              <p className="text-sm text-gray-600">
                Upload images of infrastructure issues and let AI identify
                problems, assess their conditions, and determine severity levels
                automatically.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Maintenance Scheduling</h3>
              <p className="text-sm text-gray-600">
                Schedule repairs with appropriate maintenance crews, set
                priorities based on AI assessments, and manage the maintenance
                calendar efficiently.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">3. Status Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor maintenance progress from scheduling through completion,
                update statuses, and keep track of all infrastructure repair
                activities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
