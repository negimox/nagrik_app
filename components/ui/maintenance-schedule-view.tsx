"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  CircleAlert,
  Clock,
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  ClipboardCheck,
} from "lucide-react";
import { MaintenanceSchedule } from "./maintenance-scheduler";

interface MaintenanceSchedulerViewProps {
  schedules: MaintenanceSchedule[];
  onStatusChange?: (id: number, status: MaintenanceSchedule["status"]) => void;
}

export function MaintenanceScheduleView({
  schedules,
  onStatusChange,
}: MaintenanceSchedulerViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [schedulesForDate, setSchedulesForDate] = useState<
    MaintenanceSchedule[]
  >([]);

  // Determine which dates have maintenance scheduled
  const scheduleDates = schedules.reduce((dates, schedule) => {
    if (schedule.date) {
      const dateStr = format(schedule.date, "yyyy-MM-dd");
      dates[dateStr] = dates[dateStr] ? dates[dateStr] + 1 : 1;
    }
    return dates;
  }, {} as Record<string, number>);

  // When selectedDate changes, filter schedules for that date
  useEffect(() => {
    if (selectedDate) {
      const filtered = schedules.filter(
        (schedule) =>
          schedule.date &&
          format(schedule.date, "yyyy-MM-dd") ===
            format(selectedDate, "yyyy-MM-dd")
      );
      setSchedulesForDate(filtered);
    } else {
      setSchedulesForDate([]);
    }
  }, [selectedDate, schedules]);

  // Function to determine the badge color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 hover:bg-red-600";
      case "high":
        return "bg-orange-500 hover:bg-orange-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  // Function to determine the status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "in-progress":
        return <PlayCircle className="h-5 w-5 text-orange-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to handle status change
  const handleStatusChange = (
    index: number,
    newStatus: MaintenanceSchedule["status"]
  ) => {
    if (onStatusChange) {
      onStatusChange(index, newStatus);
    }
  };

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Maintenance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              booked: (date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return !!scheduleDates[dateStr];
              },
            }}
            modifiersStyles={{
              booked: {
                fontWeight: "bold",
                backgroundColor: "#f0f9ff",
                border: "2px solid #3b82f6",
              },
            }}
            className="rounded-md border"
          />
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? `Maintenance on ${format(selectedDate, "MMMM d, yyyy")}`
              : "Select a Date"}
            {schedulesForDate.length > 0 && (
              <Badge className="ml-2">
                {schedulesForDate.length} scheduled
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedulesForDate.length > 0 ? (
            <div className="space-y-4">
              {schedulesForDate.map((schedule, index) => (
                <Card key={index} className="overflow-hidden">
                  <div
                    className={`h-1 ${getPriorityColor(schedule.priority)}`}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">
                          {schedule.issue}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {schedule.timeSlot === "morning"
                              ? "8:00 - 12:00"
                              : schedule.timeSlot === "afternoon"
                              ? "12:00 - 16:00"
                              : "16:00 - 20:00"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {schedule.crew}
                          </div>
                          <div className="flex items-center gap-1">
                            <ClipboardCheck className="h-4 w-4" />
                            {schedule.estimatedDuration} hour(s)
                          </div>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              {getStatusIcon(schedule.status)}
                              <Badge
                                className={`ml-2 ${getPriorityColor(
                                  schedule.priority
                                )}`}
                              >
                                {schedule.priority}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Status: {schedule.status}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {schedule.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                        {schedule.notes}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end space-x-2">
                      {schedule.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(index, "cancelled")
                            }
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(index, "in-progress")
                            }
                          >
                            <PlayCircle className="mr-1 h-4 w-4" />
                            Start Work
                          </Button>
                        </>
                      )}
                      {schedule.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(index, "completed")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
              {selectedDate ? (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    No maintenance scheduled
                  </p>
                  <p className="text-gray-500">
                    There are no maintenance tasks scheduled for this date.
                  </p>
                </>
              ) : (
                <p className="text-gray-500">
                  Select a date to view scheduled maintenance.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
