"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EnhancedDetectedObject } from "@/lib/genai-utils";

interface MaintenanceSchedulerProps {
  detectedIssue?: EnhancedDetectedObject;
  onScheduleComplete?: (scheduleData: MaintenanceSchedule) => void;
}

export interface MaintenanceSchedule {
  issue: string;
  date: Date | undefined;
  timeSlot: string;
  crew: string;
  priority: "urgent" | "high" | "medium" | "low";
  notes: string;
  estimatedDuration: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

export function MaintenanceScheduler({
  detectedIssue,
  onScheduleComplete,
}: MaintenanceSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("");
  const [crew, setCrew] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("1");
  const [priority, setPriority] = useState<
    "urgent" | "high" | "medium" | "low"
  >(
    detectedIssue?.severity === "High"
      ? "urgent"
      : detectedIssue?.severity === "Medium"
      ? "medium"
      : "low"
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSchedule = () => {
    setIsScheduling(true);

    // Prepare the schedule data
    const scheduleData: MaintenanceSchedule = {
      issue: detectedIssue ? detectedIssue.name : "Unspecified issue",
      date,
      timeSlot,
      crew,
      priority,
      notes,
      estimatedDuration,
      status: "scheduled",
    };

    // Simulate API call
    setTimeout(() => {
      setIsScheduling(false);
      setIsComplete(true);

      // Call the callback with the schedule data
      if (onScheduleComplete) {
        onScheduleComplete(scheduleData);
      }

      // Reset form after a delay
      setTimeout(() => {
        setIsComplete(false);
      }, 3000);
    }, 1500);
  };

  // Determine suggested priority based on issue severity
  const suggestedPriority =
    detectedIssue?.severity === "High"
      ? "urgent"
      : detectedIssue?.severity === "Medium"
      ? "high"
      : "medium";

  // Generate notes suggestion based on issue details
  const notesSuggestion = detectedIssue
    ? `Maintenance for ${detectedIssue.name}${
        detectedIssue.condition
          ? ` in ${detectedIssue.condition} condition`
          : ""
      }. ${detectedIssue.description || ""}`
    : "";

  return (
    <div className="space-y-4">
      {isComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-xl font-medium text-green-800 mb-1">
            Maintenance Scheduled!
          </h3>
          <p className="text-green-700">
            The maintenance has been successfully scheduled.
          </p>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="issue">Issue</Label>
            <Input
              id="issue"
              value={detectedIssue ? detectedIssue.name : ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="timeSlot">Time Slot</Label>
              <Select onValueChange={setTimeSlot}>
                <SelectTrigger id="timeSlot">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Morning (8:00 - 12:00)
                  </SelectItem>
                  <SelectItem value="afternoon">
                    Afternoon (12:00 - 16:00)
                  </SelectItem>
                  <SelectItem value="evening">
                    Evening (16:00 - 20:00)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crew">Maintenance Crew</Label>
              <Select onValueChange={setCrew}>
                <SelectTrigger id="crew">
                  <SelectValue placeholder="Select crew" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roads">Road Maintenance</SelectItem>
                  <SelectItem value="electrical">
                    Electrical Services
                  </SelectItem>
                  <SelectItem value="plumbing">Water & Plumbing</SelectItem>
                  <SelectItem value="general">General Maintenance</SelectItem>
                  <SelectItem value="emergency">Emergency Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: "urgent" | "high" | "medium" | "low") =>
                  setPriority(value)
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">
                    Urgent - Immediate action required
                  </SelectItem>
                  <SelectItem value="high">High - Within 24 hours</SelectItem>
                  <SelectItem value="medium">Medium - Within 3 days</SelectItem>
                  <SelectItem value="low">
                    Low - Schedule when convenient
                  </SelectItem>
                </SelectContent>
              </Select>
              {suggestedPriority && suggestedPriority !== priority && (
                <p className="text-xs mt-1 text-amber-600">
                  Based on AI analysis, we suggest "{suggestedPriority}"
                  priority
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Estimated Duration</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="duration"
                type="number"
                min="0"
                max="8"
                step="0.5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-20"
              />
              <span>hours</span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any specific instructions or requirements"
              value={notes || notesSuggestion}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSchedule}
            className="w-full"
            disabled={!date || !timeSlot || !crew || isScheduling}
          >
            {isScheduling ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Maintenance"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
