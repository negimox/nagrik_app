"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ImageDetector } from "@/components/ui/image-detector";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type DetectedObject = {
  name: string;
  confidence: number;
};

export default function AIImageDetectionDemo() {
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);

  const handleDetectionComplete = (objects: DetectedObject[]) => {
    setDetectedObjects(objects);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Google Gemini AI Image Detection Demo
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload an Image</CardTitle>
            <CardDescription>
              Use the image uploader below to test the Google Gemini AI object
              detection. You can either upload an image or take a photo with
              your camera.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageDetector onDetectionComplete={handleDetectionComplete} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>
              The results from the Google Gemini AI model will appear here after
              processing an image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detectedObjects.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {detectedObjects.map((obj, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md"
                      >
                        <p className="text-lg font-medium">{obj.name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-[#003A70] h-2.5 rounded-full"
                            style={{ width: `${obj.confidence}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right mt-1">
                          Confidence: {obj.confidence.toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-2">Raw detection data:</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(detectedObjects, null, 2)}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <p className="text-gray-500 mb-4">
                  No image has been processed yet. Upload an image to see the AI
                  detection results.
                </p>
                <p className="text-sm text-gray-400">
                  The AI model will attempt to identify objects, focusing on
                  infrastructure or civic issues like potholes, garbage, broken
                  facilities, etc.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>
            Upload an image or take a photo using the controls on the left.
          </li>
          <li>The image is processed by the Google Gemini AI Vision model.</li>
          <li>
            The AI identifies objects in the image, focusing on infrastructure
            issues.
          </li>
          <li>
            Results are displayed with confidence scores on the right panel.
          </li>
          <li>
            The detected objects can be used to auto-fill form fields in the
            reporting interface.
          </li>
        </ol>

        <div className="mt-6 border-t pt-6">
          <h3 className="font-medium mb-2">Technical Implementation:</h3>
          <p className="text-sm">
            This demo uses the Google Gemini AI API through the{" "}
            <code>@google/genai</code> package. The image is processed
            client-side: it's resized, converted to a data URL, and sent to
            Gemini. The AI returns a structured JSON response with object names
            and confidence scores.
          </p>
        </div>
      </div>
    </div>
  );
}
