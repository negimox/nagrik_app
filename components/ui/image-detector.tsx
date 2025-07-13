"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon, UploadIcon, Loader2 } from "lucide-react";
import { useReport } from "@/contexts/ReportContext";
import {
  detectObjectsInImage,
  EnhancedDetectedObject,
} from "@/lib/genai-utils";

type DetectedObject = EnhancedDetectedObject;

interface ImageDetectorProps {
  onDetectionComplete?: (objects: DetectedObject[]) => void;
}

export function ImageDetector({ onDetectionComplete }: ImageDetectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { imageData, setImageData } = useReport();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load image data from context on component mount
  useEffect(() => {
    // If there's already image data in context, use that
    // No need to do anything else since context already has the data
  }, []);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);

    try {
      // Use Google Gemini AI to detect objects in the image
      const detectedObjects = await detectObjectsInImage(file);

      // Update context with image data and AI results
      setImageData({
        file,
        preview: previewUrl,
        detectedObjects,
      });

      // Call the callback if provided
      if (onDetectionComplete) {
        onDetectionComplete(detectedObjects);

        // Log what's happening for debug purposes
        console.log("AI Detection complete:", detectedObjects);
        console.log(
          "Form fields will be auto-filled based on detected objects"
        );
      }
    } catch (error) {
      console.error("Error processing image with AI:", error);

      // Set error message
      setErrorMessage(
        "There was a problem analyzing the image with AI. Please try again."
      );

      // In case of error, still show the image but with an error message
      setImageData({
        file,
        preview: previewUrl,
        detectedObjects: [{ name: "Error analyzing image", confidence: 100 }],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />{" "}
      {imageData.preview ? (
        <div className="border rounded-md overflow-hidden relative">
          <img
            src={imageData.preview}
            alt="Upload preview"
            className="w-full h-auto object-cover"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">
                  Google Gemini AI Analysis in progress...
                </p>
                <p className="text-xs mt-1">
                  Detecting objects and generating form content
                </p>
              </div>
            </div>
          )}

          {!isProcessing && errorMessage && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-white p-2 text-xs">
              <p className="font-medium mb-1">Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {!isProcessing &&
            !errorMessage &&
            imageData.detectedObjects.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                <p className="font-medium mb-1">AI detected:</p>{" "}
                <div className="flex flex-col gap-2">
                  {imageData.detectedObjects.map((obj, idx) => (
                    <div key={idx} className="bg-white/20 rounded px-2 py-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{obj.name}</span>
                        {obj.severity && (
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              obj.severity === "High"
                                ? "bg-red-500/60"
                                : obj.severity === "Medium"
                                ? "bg-yellow-500/60"
                                : "bg-green-500/60"
                            }`}
                          >
                            {obj.severity}
                          </span>
                        )}
                      </div>
                      {obj.condition && (
                        <span className="text-xs block">
                          Condition: {obj.condition}
                        </span>
                      )}
                      <div className="w-full bg-black/30 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-white h-1.5 rounded-full"
                          style={{ width: `${obj.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">
                        {Math.round(obj.confidence)}% confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="rounded-full bg-gray-100 p-3">
              <UploadIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mt-2">Upload an image</h3>
            <p className="text-gray-500 text-xs max-w-[250px]">
              Upload a clear image of the issue. Our AI will help analyze and
              categorize it.
            </p>
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-center">
        <Button
          type="button"
          onClick={triggerFileDialog}
          variant="outline"
          className="border-[#003A70] text-[#003A70]"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>{" "}
        <Button
          type="button"
          variant="outline"
          className="border-[#003A70] text-[#003A70]"
          disabled={isProcessing}
          onClick={() => {
            // Check if device has camera support
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const videoRef = document.createElement("video");
              const canvasRef = document.createElement("canvas");

              navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                  videoRef.srcObject = stream;
                  videoRef.play();

                  // Add a temporary UI for capturing the photo
                  const modal = document.createElement("div");
                  modal.style.position = "fixed";
                  modal.style.top = "0";
                  modal.style.left = "0";
                  modal.style.width = "100%";
                  modal.style.height = "100%";
                  modal.style.backgroundColor = "rgba(0,0,0,0.8)";
                  modal.style.zIndex = "1000";
                  modal.style.display = "flex";
                  modal.style.flexDirection = "column";
                  modal.style.justifyContent = "center";
                  modal.style.alignItems = "center";

                  videoRef.style.maxWidth = "90%";
                  videoRef.style.maxHeight = "70vh";

                  const captureBtn = document.createElement("button");
                  captureBtn.innerText = "Capture";
                  captureBtn.style.marginTop = "20px";
                  captureBtn.style.padding = "10px 20px";
                  captureBtn.style.backgroundColor = "#003A70";
                  captureBtn.style.color = "white";
                  captureBtn.style.borderRadius = "4px";
                  captureBtn.style.border = "none";

                  const cancelBtn = document.createElement("button");
                  cancelBtn.innerText = "Cancel";
                  cancelBtn.style.marginTop = "10px";
                  cancelBtn.style.padding = "10px 20px";
                  cancelBtn.style.backgroundColor = "#6b7280";
                  cancelBtn.style.color = "white";
                  cancelBtn.style.borderRadius = "4px";
                  cancelBtn.style.border = "none";

                  modal.appendChild(videoRef);
                  modal.appendChild(captureBtn);
                  modal.appendChild(cancelBtn);
                  document.body.appendChild(modal);

                  // Handle capture
                  captureBtn.onclick = () => {
                    canvasRef.width = videoRef.videoWidth;
                    canvasRef.height = videoRef.videoHeight;
                    canvasRef.getContext("2d")!.drawImage(videoRef, 0, 0);

                    // Convert to file
                    canvasRef.toBlob(async (blob) => {
                      if (blob) {
                        const file = new File([blob], "camera-photo.png", {
                          type: "image/png",
                        });
                        const previewUrl = URL.createObjectURL(file);

                        setIsProcessing(true);

                        try {
                          // Process with Gen AI
                          const detectedObjects = await detectObjectsInImage(
                            file
                          );

                          // Update image data with results
                          setImageData({
                            file,
                            preview: previewUrl,
                            detectedObjects,
                          });

                          if (onDetectionComplete) {
                            onDetectionComplete(detectedObjects);
                          }
                        } catch (error) {
                          console.error(
                            "Error processing camera image:",
                            error
                          );
                          setErrorMessage(
                            "There was a problem analyzing the camera image with AI. Please try again."
                          );
                          setImageData({
                            file,
                            preview: previewUrl,
                            detectedObjects: [
                              {
                                name: "Error analyzing image",
                                confidence: 100,
                              },
                            ],
                          });
                        } finally {
                          setIsProcessing(false);

                          // Clean up
                          document.body.removeChild(modal);
                          const tracks = stream.getTracks();
                          tracks.forEach((track) => track.stop());
                        }
                      }
                    }, "image/png");
                  };

                  // Handle cancel
                  cancelBtn.onclick = () => {
                    document.body.removeChild(modal);
                    const tracks = stream.getTracks();
                    tracks.forEach((track) => track.stop());
                  };
                })
                .catch((err) => {
                  console.error("Error accessing camera:", err);
                  alert(
                    "Unable to access the camera. Please check your camera permissions."
                  );
                });
            } else {
              alert("Your device doesn't support camera access.");
            }
          }}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
      </div>
    </div>
  );
}
