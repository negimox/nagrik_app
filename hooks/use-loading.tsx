"use client";

import { useState, useCallback } from "react";
import { useLoading } from "@/contexts/LoadingContext";

export interface UseAsyncLoadingReturn<T> {
  loading: boolean;
  error: string | null;
  execute: (asyncFn: () => Promise<T>) => Promise<T | undefined>;
}

export function useAsyncLoading<T = any>(): UseAsyncLoadingReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFn();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, execute };
}

export interface UseGlobalLoadingReturn {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: (asyncFn: () => Promise<any>, message?: string) => Promise<any>;
}

export function useGlobalLoading(): UseGlobalLoadingReturn {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = useCallback(
    async (asyncFn: () => Promise<any>, message = "Loading...") => {
      try {
        showLoading(message);
        const result = await asyncFn();
        return result;
      } catch (error) {
        console.error("Error in withLoading:", error);
        return undefined;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return {
    showLoading,
    hideLoading,
    withLoading,
  };
}

// Hook for simulating loading states (useful for testing)
export function useSimulateLoading(duration = 2000) {
  const [isLoading, setIsLoading] = useState(false);

  const simulate = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, duration);
  }, [duration]);

  return { isLoading, simulate };
}
