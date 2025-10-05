import { useEffect } from "react";

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
}

// Simple error tracking utility
export const useErrorTracking = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorLog: ErrorLog = {
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error("Tracked Error:", errorLog);
      }

      // In production, you could send to a service like Sentry
      // For now, just log it locally
      logError(errorLog);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorLog: ErrorLog = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      if (import.meta.env.DEV) {
        console.error("Tracked Promise Rejection:", errorLog);
      }

      logError(errorLog);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
};

const logError = async (error: ErrorLog) => {
  try {
    // Store in localStorage for now (in production, send to error tracking service)
    const errors = JSON.parse(localStorage.getItem("errorLogs") || "[]");
    errors.push(error);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }
    
    localStorage.setItem("errorLogs", JSON.stringify(errors));

    // For critical errors, you could send to external service like Sentry
    // Example: Sentry.captureException(error);
  } catch (e) {
    console.error("Failed to log error:", e);
  }
};

export const ErrorTracker = () => {
  useErrorTracking();
  return null;
};
