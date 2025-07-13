/**
 * Enhanced Image Detector with RAG capabilities
 * This component provides AI-powered image analysis with contextual knowledge
 */

import React, { useState, useRef, useCallback } from "react";
import { Camera, Upload, Brain, Lightbulb, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRAGImageAnalysis, useRAGQuery } from "@/hooks/use-rag";
import type { EnhancedDetectedObject } from "@/lib/genai-utils";

interface RAGImageDetectorProps {
  onDetectionComplete?: (
    objects: EnhancedDetectedObject[],
    insights?: any
  ) => void;
  className?: string;
}

export function RAGImageDetector({
  onDetectionComplete,
  className,
}: RAGImageDetectorProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState(0.2);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    analyzeImage,
    isLoading: isAnalyzing,
    error: analysisError,
    analysis,
    contextualInsights,
  } = useRAGImageAnalysis();

  const {
    query: askQuestion,
    isLoading: isQuerying,
    response: ragResponse,
  } = useRAGQuery();

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-capture.jpg", {
                type: "image/jpeg",
              });
              setSelectedImage(file);
              setImagePreview(canvas.toDataURL());

              // Stop camera stream
              const stream = video.srcObject as MediaStream;
              if (stream) {
                stream.getTracks().forEach((track) => track.stop());
              }
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;

    const result = await analyzeImage(
      selectedImage,
      customQuery || undefined,
      temperature
    );

    if (result?.analysis?.detected_objects && onDetectionComplete) {
      onDetectionComplete(
        result.analysis.detected_objects,
        result.contextualInsights
      );
    }
  }, [
    selectedImage,
    customQuery,
    temperature,
    analyzeImage,
    onDetectionComplete,
  ]);

  const handleCustomQuery = useCallback(async () => {
    if (!customQuery.trim()) return;

    await askQuestion(
      customQuery,
      "You are an expert infrastructure analyst. Provide detailed, actionable insights.",
      temperature
    );
  }, [customQuery, askQuestion, temperature]);

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Image Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            RAG-Enhanced Image Analysis
          </CardTitle>
          <CardDescription>
            Upload or capture an image for AI-powered infrastructure analysis
            with contextual knowledge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
            <Button
              onClick={startCamera}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Use Camera
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Camera Video */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-w-md rounded-lg border hidden"
              playsInline
            />
            {videoRef.current?.srcObject && (
              <div className="mt-2">
                <Button onClick={capturePhoto} className="w-full">
                  Capture Photo
                </Button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Selected"
                className="w-full max-w-md rounded-lg border shadow-sm"
              />

              {/* Advanced Options */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </Button>

                {showAdvanced && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium">
                        Custom Analysis Query (Optional)
                      </label>
                      <Textarea
                        placeholder="e.g., Focus on road conditions and safety hazards..."
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Temperature: {temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-full mt-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Lower = more focused, Higher = more creative
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Analyze with RAG
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis?.detected_objects && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              AI Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.detected_objects.map(
                (obj: EnhancedDetectedObject, index: number) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold capitalize">{obj.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {obj.confidence?.toFixed(1)}% confidence
                        </Badge>
                        {obj.severity && (
                          <Badge className={getSeverityColor(obj.severity)}>
                            {obj.severity} Priority
                          </Badge>
                        )}
                      </div>
                    </div>

                    {obj.condition && (
                      <p className="text-sm">
                        <strong>Condition:</strong> {obj.condition}
                      </p>
                    )}

                    {obj.description && (
                      <p className="text-sm text-gray-600">{obj.description}</p>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contextual Insights */}
      {contextualInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Contextual Insights
              <Badge variant="outline">
                {(contextualInsights.confidence * 100).toFixed(1)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">
                  {contextualInsights.answer}
                </p>
              </div>

              {contextualInsights.sources.length > 0 && (
                <details className="space-y-2">
                  <summary className="cursor-pointer font-medium text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Knowledge Sources ({contextualInsights.sources.length})
                  </summary>
                  <div className="space-y-2 mt-2">
                    {contextualInsights.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-gray-50 rounded border-l-2 border-blue-200"
                      >
                        <div className="font-medium">{source.title}</div>
                        <div className="text-gray-600">
                          Category: {source.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Query Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Ask Infrastructure Expert
          </CardTitle>
          <CardDescription>
            Get contextual answers about infrastructure issues from our
            knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask any question about infrastructure, maintenance, or reporting best practices..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            rows={3}
          />

          <Button
            onClick={handleCustomQuery}
            disabled={isQuerying || !customQuery.trim()}
            className="w-full"
          >
            {isQuerying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Thinking...
              </>
            ) : (
              "Get Expert Answer"
            )}
          </Button>

          {ragResponse && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Expert Response</span>
                <Badge variant="outline">
                  {(ragResponse.confidence * 100).toFixed(1)}% confidence
                </Badge>
              </div>
              <p className="text-sm whitespace-pre-wrap">
                {ragResponse.answer}
              </p>

              {ragResponse.sources.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer">
                    Sources ({ragResponse.sources.length})
                  </summary>
                  <ul className="mt-1 space-y-1">
                    {ragResponse.sources.map((source, idx) => (
                      <li key={idx} className="ml-4">
                        • {source.title} ({source.category})
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {analysisError && (
        <Alert variant="destructive">
          <AlertDescription>{analysisError.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
