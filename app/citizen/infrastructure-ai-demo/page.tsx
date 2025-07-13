"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageDetector } from "@/components/ui/image-detector";
import { EnhancedDetectedObject } from "@/lib/genai-utils";
import { Button } from "@/components/ui/button";

export default function InfrastructureAIDemo() {
  const [detectedObjects, setDetectedObjects] = useState<
    EnhancedDetectedObject[]
  >([]);
  const [activeTab, setActiveTab] = useState("detection");

  const handleDetectionComplete = (objects: EnhancedDetectedObject[]) => {
    setDetectedObjects(objects);
  };

  // Get the highest severity among detected objects
  const getHighestSeverity = (): string => {
    if (detectedObjects.length === 0) return "";

    if (detectedObjects.some((obj) => obj.severity === "High")) return "High";
    if (detectedObjects.some((obj) => obj.severity === "Medium"))
      return "Medium";
    if (detectedObjects.some((obj) => obj.severity === "Low")) return "Low";
    return "";
  };

  const highestSeverity = getHighestSeverity();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Infrastructure AI Issue Detection Demo
      </h1>

      <div className="grid md:grid-cols-7 gap-6">
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload an Infrastructure Image</CardTitle>
              <CardDescription>
                Upload or take a photo of infrastructure issues like potholes,
                broken streetlights, or garbage. Our AI will analyze the image
                and provide detailed information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageDetector onDetectionComplete={handleDetectionComplete} />

              {detectedObjects.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">
                    {detectedObjects.length} issue(s) detected
                  </p>

                  {highestSeverity && (
                    <Badge
                      className={
                        highestSeverity === "High"
                          ? "bg-red-500 hover:bg-red-600"
                          : highestSeverity === "Medium"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-500 hover:bg-green-600"
                      }
                    >
                      Highest severity: {highestSeverity}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>
                Detailed information about detected issues, their condition, and
                severity
              </CardDescription>
              {detectedObjects.length > 0 && (
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="detection">Detection</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>
            <CardContent>
              {detectedObjects.length > 0 ? (
                <TabsContent value={activeTab} className="mt-0">
                  {activeTab === "detection" && (
                    <ScrollArea className="h-[400px] pr-4">
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
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
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
                    </ScrollArea>
                  )}

                  {activeTab === "details" && (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Most Critical Issue</h3>
                        {detectedObjects.length > 0 && (
                          <div className="space-y-2">
                            <p>
                              <span className="font-medium">Type:</span>{" "}
                              {detectedObjects[0].name}
                            </p>
                            {detectedObjects[0].condition && (
                              <p>
                                <span className="font-medium">Condition:</span>{" "}
                                {detectedObjects[0].condition}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Severity:</span>{" "}
                              {detectedObjects[0].severity || "Unknown"}
                            </p>
                            {detectedObjects[0].description && (
                              <div>
                                <span className="font-medium">
                                  Description:
                                </span>
                                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                                  {detectedObjects[0].description}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-6 pt-4 border-t">
                          <h3 className="font-medium mb-2">
                            Recommended Actions
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {highestSeverity === "High" && (
                              <>
                                <li>Immediate attention required</li>
                                <li>
                                  Dispatch maintenance team within 24 hours
                                </li>
                                <li>Place safety barriers if needed</li>
                                <li>Notify nearby residents</li>
                              </>
                            )}
                            {highestSeverity === "Medium" && (
                              <>
                                <li>Schedule repair within 7 days</li>
                                <li>Monitor for changes in condition</li>
                                <li>Add to maintenance priority list</li>
                              </>
                            )}
                            {highestSeverity === "Low" && (
                              <>
                                <li>Add to routine maintenance schedule</li>
                                <li>Monitor during regular inspections</li>
                              </>
                            )}
                            {!highestSeverity && (
                              <li>No specific actions needed</li>
                            )}
                          </ul>
                        </div>

                        <div className="flex justify-end mt-4 space-x-2">
                          <Button>Create Report</Button>
                          <Button variant="outline">Download Analysis</Button>
                        </div>
                      </div>
                    </ScrollArea>
                  )}

                  {activeTab === "raw" && (
                    <ScrollArea className="h-[400px] pr-4">
                      <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto">
                        {JSON.stringify(detectedObjects, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}
                </TabsContent>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <p className="text-gray-500 mb-4">
                    No image has been analyzed yet. Upload an image to see the
                    AI analysis results.
                  </p>
                  <p className="text-sm text-gray-400 max-w-md">
                    Our advanced Google Gemini AI will analyze the image to
                    detect infrastructure issues, assess their condition,
                    determine severity, and generate detailed descriptions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How the Enhanced AI Analysis Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">1. Object Detection</h3>
              <p className="text-sm text-gray-600">
                Google's Gemini AI model identifies infrastructure objects in
                the image, such as roads, streetlights, buildings, and more,
                with confidence scores.
              </p>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">2. Condition Assessment</h3>
              <p className="text-sm text-gray-600">
                The AI evaluates the condition of each detected object, noting
                damage, deterioration, or defects like "broken", "cracked", or
                "leaking".
              </p>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">3. Severity Classification</h3>
              <p className="text-sm text-gray-600">
                Based on the detected issues, the AI assigns a severity rating
                (Low, Medium, High) to prioritize maintenance and repairs based
                on urgency and safety concerns.
              </p>
            </div>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">
              <strong>Technical Details:</strong> This demo uses the Google
              Gemini 2.0 Flash multimodal model to analyze images and detect
              infrastructure issues. The model has been prompted to specifically
              focus on civic and infrastructure problems, providing detailed
              assessments of their condition and severity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
