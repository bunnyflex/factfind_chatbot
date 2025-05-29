"use client";

import React from "react";
import { WifiOff, Wifi, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import useOfflineDetection from "../hooks/useOfflineDetection";

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = "",
  showDetails = false,
}) => {
  const {
    isOnline,
    isSlowConnection,
    connectionType,
    lastOnlineTime,
    reconnectAttempts,
    attemptReconnect,
    canReconnect,
    isInitializing,
  } = useOfflineDetection();

  // Debug logging
  React.useEffect(() => {
    console.log("OfflineIndicator status:", {
      isOnline,
      isSlowConnection,
      connectionType,
      isInitializing,
      reconnectAttempts,
    });
  }, [
    isOnline,
    isSlowConnection,
    connectionType,
    isInitializing,
    reconnectAttempts,
  ]);

  // Don't show anything if online and connection is good
  if (isOnline && !isSlowConnection) {
    return null;
  }

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 min-w-max">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Checking connection...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-500";
    if (isSlowConnection) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (isSlowConnection) return "Slow Connection";
    return "Online";
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isSlowConnection) return <AlertCircle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const formatLastOnlineTime = () => {
    if (!lastOnlineTime) return "Unknown";

    const now = new Date();
    const diff = now.getTime() - lastOnlineTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div
        className={`${getStatusColor()} text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 min-w-max`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>

        {!isOnline && canReconnect && (
          <button
            onClick={attemptReconnect}
            className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Try to reconnect"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-600 min-w-max">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">{getStatusText()}</span>
            </div>

            <div className="flex justify-between">
              <span>Connection:</span>
              <span className="font-medium capitalize">{connectionType}</span>
            </div>

            {!isOnline && (
              <>
                <div className="flex justify-between">
                  <span>Last Online:</span>
                  <span className="font-medium">{formatLastOnlineTime()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Reconnect Attempts:</span>
                  <span className="font-medium">{reconnectAttempts}</span>
                </div>
              </>
            )}

            {isSlowConnection && (
              <div className="text-yellow-600 text-xs mt-2">
                Your connection appears to be slow. Some features may be
                limited.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
