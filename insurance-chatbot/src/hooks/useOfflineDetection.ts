"use client";

import { useState, useEffect, useCallback } from "react";

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  lastOnlineTime: Date | null;
  reconnectAttempts: number;
  isInitializing: boolean;
}

interface UseOfflineDetectionOptions {
  pingUrl?: string;
  pingInterval?: number;
  maxReconnectAttempts?: number;
  slowConnectionThreshold?: number;
}

// Extend Navigator interface for connection properties
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
  mozConnection?: {
    effectiveType?: string;
  };
  webkitConnection?: {
    effectiveType?: string;
  };
}

const useOfflineDetection = (options: UseOfflineDetectionOptions = {}) => {
  const {
    pingUrl = "/api/health",
    pingInterval = 30000, // 30 seconds
    maxReconnectAttempts = 5,
    slowConnectionThreshold = 2000, // 2 seconds
  } = options;

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true, // Start optimistically online
    isSlowConnection: false,
    connectionType: "unknown",
    lastOnlineTime: new Date(),
    reconnectAttempts: 0,
    isInitializing: true, // Start in initializing state
  });

  // Get connection type if available
  const getConnectionType = useCallback(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;
    return connection?.effectiveType || "unknown";
  }, []);

  // Ping server to verify actual connectivity
  const pingServer = useCallback(async (): Promise<{
    isOnline: boolean;
    responseTime: number;
  }> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(pingUrl, {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        isOnline: response.ok,
        responseTime,
      };
    } catch (error) {
      console.warn("Network ping failed:", error);
      return {
        isOnline: false,
        responseTime: Infinity,
      };
    }
  }, [pingUrl]);

  // Handle online status change
  const handleOnline = useCallback(async () => {
    console.log("Browser detected online status");

    // Verify with server ping
    const { isOnline, responseTime } = await pingServer();

    setNetworkStatus((prev) => ({
      ...prev,
      isOnline,
      isSlowConnection: responseTime > slowConnectionThreshold,
      connectionType: getConnectionType(),
      lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
      reconnectAttempts: isOnline ? 0 : prev.reconnectAttempts,
    }));
  }, [pingServer, slowConnectionThreshold, getConnectionType]);

  // Handle offline status change
  const handleOffline = useCallback(() => {
    console.log("Browser detected offline status");

    setNetworkStatus((prev) => ({
      ...prev,
      isOnline: false,
      isSlowConnection: false,
      connectionType: getConnectionType(),
    }));
  }, [getConnectionType]);

  // Attempt to reconnect
  const attemptReconnect = useCallback(async () => {
    setNetworkStatus((prev) => {
      if (prev.reconnectAttempts >= maxReconnectAttempts) {
        return prev;
      }

      return {
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1,
      };
    });

    const { isOnline, responseTime } = await pingServer();

    if (isOnline) {
      setNetworkStatus((prev) => ({
        ...prev,
        isOnline: true,
        isSlowConnection: responseTime > slowConnectionThreshold,
        lastOnlineTime: new Date(),
        reconnectAttempts: 0,
      }));
      return true;
    }

    return false;
  }, [pingServer, maxReconnectAttempts, slowConnectionThreshold]);

  // Manual refresh of network status
  const refreshNetworkStatus = useCallback(async () => {
    const { isOnline, responseTime } = await pingServer();

    setNetworkStatus((prev) => ({
      ...prev,
      isOnline,
      isSlowConnection: responseTime > slowConnectionThreshold,
      connectionType: getConnectionType(),
      lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
    }));
  }, [pingServer, slowConnectionThreshold, getConnectionType]);

  // Initial network status check - run once on mount
  useEffect(() => {
    let mounted = true;

    const checkInitialStatus = async () => {
      const { isOnline, responseTime } = await pingServer();

      if (mounted) {
        setNetworkStatus((prev) => ({
          ...prev,
          isOnline,
          isSlowConnection: responseTime > slowConnectionThreshold,
          connectionType: getConnectionType(),
          lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
          isInitializing: false, // Initialization complete
        }));
      }
    };

    checkInitialStatus();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run only once

  // Set up event listeners and intervals
  useEffect(() => {
    // Set up event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set up periodic ping when online
    let pingIntervalId: NodeJS.Timeout;

    if (networkStatus.isOnline) {
      pingIntervalId = setInterval(async () => {
        const { isOnline, responseTime } = await pingServer();

        setNetworkStatus((prev) => ({
          ...prev,
          isOnline,
          isSlowConnection: responseTime > slowConnectionThreshold,
          connectionType: getConnectionType(),
          lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
        }));
      }, pingInterval);
    }

    // Set up automatic reconnection attempts when offline
    let reconnectIntervalId: NodeJS.Timeout;

    if (
      !networkStatus.isOnline &&
      networkStatus.reconnectAttempts < maxReconnectAttempts
    ) {
      reconnectIntervalId = setInterval(() => {
        attemptReconnect();
      }, 5000); // Try to reconnect every 5 seconds
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (pingIntervalId) clearInterval(pingIntervalId);
      if (reconnectIntervalId) clearInterval(reconnectIntervalId);
    };
  }, [
    handleOnline,
    handleOffline,
    networkStatus.isOnline,
    networkStatus.reconnectAttempts,
    pingServer,
    pingInterval,
    maxReconnectAttempts,
    slowConnectionThreshold,
    getConnectionType,
    attemptReconnect,
  ]);

  return {
    ...networkStatus,
    attemptReconnect,
    refreshNetworkStatus,
    canReconnect: networkStatus.reconnectAttempts < maxReconnectAttempts,
  };
};

export default useOfflineDetection;
