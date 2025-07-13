"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LoadingSpinner,
  LoadingDots,
  InlineLoading,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
} from "@/components/ui/loading";
import {
  useGlobalLoading,
  useAsyncLoading,
  useSimulateLoading,
} from "@/hooks/use-loading";

export default function LoadingDemo() {
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const { loading: asyncLoading, error, execute } = useAsyncLoading();
  const { isLoading: simulatedLoading, simulate } = useSimulateLoading(3000);
  const [localLoading, setLocalLoading] = useState(false);

  const handleGlobalLoading = () => {
    showLoading("Processing your request...");
    setTimeout(() => {
      hideLoading();
    }, 3000);
  };

  const handleWithLoading = async () => {
    await withLoading(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return "Success!";
    }, "Fetching data...");
  };

  const handleAsyncLoading = async () => {
    await execute(async () => {
      // Simulate API call that might fail
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (Math.random() > 0.7) {
        throw new Error("Random error occurred");
      }
      return "Data loaded successfully";
    });
  };

  const handleLocalLoading = () => {
    setLocalLoading(true);
    setTimeout(() => {
      setLocalLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Loading System Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of all loading components and states in the application
        </p>
      </div>

      {/* Loading Spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Spinners</CardTitle>
          <CardDescription>
            Different sizes and styles of loading spinners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
            <span>Small</span>
          </div>
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="md" />
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="lg" />
            <span>Large</span>
          </div>
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="xl" />
            <span>Extra Large</span>
          </div>
        </CardContent>
      </Card>

      {/* Loading Dots */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Dots</CardTitle>
          <CardDescription>Animated dot indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <LoadingDots />
            <span>Loading dots animation</span>
          </div>
        </CardContent>
      </Card>

      {/* Inline Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Inline Loading States</CardTitle>
          <CardDescription>Loading indicators with text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InlineLoading message="Fetching data..." size="sm" />
          <InlineLoading message="Processing request..." size="md" />
          <InlineLoading message="Uploading files..." size="lg" />
        </CardContent>
      </Card>

      {/* Global Loading Demos */}
      <Card>
        <CardHeader>
          <CardTitle>Global Loading States</CardTitle>
          <CardDescription>Full-screen loading overlays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGlobalLoading}>Show Global Loading</Button>
          <Button onClick={handleWithLoading} variant="outline">
            Async with Global Loading
          </Button>
        </CardContent>
      </Card>

      {/* Async Loading Hook Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Async Loading Hook</CardTitle>
          <CardDescription>
            Local loading states with error handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAsyncLoading}
            disabled={asyncLoading}
            className="w-full"
          >
            {asyncLoading ? (
              <InlineLoading message="Loading..." size="sm" />
            ) : (
              "Test Async Loading"
            )}
          </Button>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulate Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Simulated Loading</CardTitle>
          <CardDescription>Loading simulation for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={simulate}
            disabled={simulatedLoading}
            variant="secondary"
          >
            {simulatedLoading ? "Loading..." : "Simulate 3s Loading"}
          </Button>
          {simulatedLoading && <LoadingDots />}
        </CardContent>
      </Card>

      {/* Local State Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Local State Loading</CardTitle>
          <CardDescription>Component-level loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLocalLoading} disabled={localLoading}>
            {localLoading ? <LoadingSpinner size="sm" /> : "Local Loading"}
          </Button>
        </CardContent>
      </Card>

      {/* Skeleton Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loading</CardTitle>
          <CardDescription>Placeholder content while loading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Basic Skeletons</h4>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Card Skeleton</h4>
            <CardSkeleton />
          </div>

          <div>
            <h4 className="font-medium mb-2">Table Skeleton</h4>
            <TableSkeleton rows={3} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
