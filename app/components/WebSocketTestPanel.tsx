/**
 * WebSocket Test Panel - Development Component
 *
 * Tests the WebSocket RPC name resolution system
 * Only shown in development mode
 */

"use client";

import { useState } from "react";
import {
  useWebSocketConnection,
  useWebSocketAddressDisplay,
} from "@/hooks/useWebSocketNameResolver";

export default function WebSocketTestPanel() {
  const [testAddress, setTestAddress] = useState(
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  ); // vitalik.eth

  // WebSocket hooks
  const wsConnection = useWebSocketConnection();
  const { displayName, source, isLoading, wsAvailable } =
    useWebSocketAddressDisplay(testAddress);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2">WebSocket RPC Test</h3>

      {/* WebSocket Availability */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${wsAvailable ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span>WebSocket Available: {wsAvailable ? "Yes" : "No"}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-2">
        <div className="text-gray-400 mb-1">Connection Status:</div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${wsConnection.mainnet.connected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span>
            Mainnet:{" "}
            {wsConnection.mainnet.connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${wsConnection.base.connected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span>
            Base: {wsConnection.base.connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="text-gray-400">
          Mainnet Reconnects: {wsConnection.mainnet.reconnectAttempts}
        </div>
        <div className="text-gray-400">
          Base Reconnects: {wsConnection.base.reconnectAttempts}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={wsConnection.reconnect}
          className="px-2 py-1 bg-blue-600 rounded text-xs"
          disabled={!wsAvailable}
        >
          Reconnect
        </button>
      </div>

      {/* Test Address Resolution */}
      <div className="mb-2">
        <input
          type="text"
          value={testAddress}
          onChange={(e) => setTestAddress(e.target.value)}
          placeholder="Test address..."
          className="w-full px-2 py-1 bg-gray-800 rounded text-xs"
        />
      </div>

      {/* Resolution Result */}
      <div className="mb-2">
        <div className="text-gray-400">Name Resolution:</div>
        {isLoading ? (
          <div className="text-yellow-400">Loading...</div>
        ) : (
          <div>
            <div className="text-green-400">{displayName}</div>
            <div className="text-gray-400">Source: {source}</div>
            <div className="text-gray-400">
              Method:{" "}
              {wsAvailable &&
              (wsConnection.mainnet.connected || wsConnection.base.connected)
                ? "WebSocket + HTTP"
                : "HTTP Only"}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <button
        onClick={() =>
          console.log("WebSocket Status:", { wsConnection, wsAvailable })
        }
        className="px-2 py-1 bg-gray-600 rounded text-xs"
      >
        Log Status
      </button>
    </div>
  );
}
