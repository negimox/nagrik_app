"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-border border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
    </div>
  );
}

interface LoadingPulseProps {
  className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
  return (
    <div
      className={cn("h-4 w-4 bg-primary rounded-full animate-pulse", className)}
    />
  );
}

interface PageLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export function PageLoading({
  message = "Loading...",
  showLogo = true,
}: PageLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {showLogo && (
          <div className="flex justify-center mb-8">
            <div className="text-4xl font-bold text-primary">Nagrik</div>
          </div>
        )}

        <div className="relative">
          <LoadingSpinner size="xl" className="mx-auto" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <LoadingDots className="justify-center" />
        </div>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLoading({
  message = "Loading...",
  size = "md",
  className,
}: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <LoadingSpinner size={size} />
      <span className="text-muted-foreground">{message}</span>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 items-center">
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[120px] w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
      <Skeleton className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function DashboardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground border rounded-md p-6 space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      <div className="bg-card text-card-foreground border rounded-md p-4">
        <div className="mb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="w-1/2 max-w-[80%] rounded-lg bg-muted p-4 self-start">
        <Skeleton className="h-4 w-3/4 bg-primary/20 mb-2" />
        <Skeleton className="h-4 w-1/2 bg-primary/20" />
      </div>
      <div className="w-[60%] max-w-[80%] rounded-lg bg-muted p-4 self-end">
        <Skeleton className="h-4 w-full bg-primary/20 mb-2" />
        <Skeleton className="h-4 w-full bg-primary/20 mb-2" />
        <Skeleton className="h-4 w-5/6 bg-primary/20" />
      </div>
      <div className="w-1/2 max-w-[80%] rounded-lg bg-muted p-4 self-start">
        <Skeleton className="h-4 w-2/3 bg-primary/20" />
      </div>
    </div>
  )
}

