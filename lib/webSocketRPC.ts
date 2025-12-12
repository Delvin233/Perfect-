/**
 * WebSocket RPC Client for Alchemy
 *
 * Simple WebSocket client for making RPC calls to Alchemy
 * No inter-client communication - just faster RPC calls
 */

import { EventEmitter } from "events";

interface RPCRequest {
  id: string;
  method: string;
  params: unknown[];
}

interface RPCResponse {
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

export class AlchemyWebSocketRPC extends EventEmitter {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private network: "mainnet" | "base";
  private isConnected = false;
  private requestId = 0;
  private pendingRequests = new Map<
    string,
    {
      resolve: (result: unknown) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(apiKey: string, network: "mainnet" | "base") {
    super();
    this.apiKey = apiKey;
    this.network = network;
  }

  /**
   * Connect to Alchemy WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected || this.ws) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl();
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit("connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response: RPCResponse = JSON.parse(event.data);
            this.handleResponse(response);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.ws = null;
          this.emit("disconnected");

          // Auto-reconnect if not intentionally closed
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.emit("error", error);
          reject(new Error("WebSocket connection failed"));
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            this.ws?.close();
            reject(new Error("WebSocket connection timeout"));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isConnected = false;

    // Clear pending requests
    for (const request of this.pendingRequests.values()) {
      clearTimeout(request.timeout);
      request.reject(new Error("Connection closed"));
    }
    this.pendingRequests.clear();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Make RPC call via WebSocket
   */
  async call(method: string, params: unknown[] = []): Promise<unknown> {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const id = (++this.requestId).toString();
      const request: RPCRequest = {
        id,
        method,
        params,
      };

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC call timeout: ${method}`));
      }, 30000);

      // Store pending request
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
      });

      // Send request
      try {
        this.ws?.send(JSON.stringify(request));
      } catch (error) {
        this.pendingRequests.delete(id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Resolve ENS name via WebSocket
   */
  async resolveENS(address: string): Promise<string | null> {
    try {
      // Use eth_call to query ENS reverse resolver
      await this.call("eth_call", [
        {
          to: "0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C", // ENS Public Resolver
          data: `0x691f3431${address.slice(2).padStart(64, "0")}`, // reverse(bytes32)
        },
        "latest",
      ]);

      // For now, return null and let HTTP API handle it
      // Full implementation would need proper ABI decoding
      return null;
    } catch (error) {
      console.warn("ENS resolution failed via WebSocket:", error);
      return null;
    }
  }

  /**
   * Get WebSocket URL for Alchemy
   */
  private getWebSocketUrl(): string {
    const baseUrl =
      this.network === "mainnet"
        ? "wss://eth-mainnet.g.alchemy.com/v2"
        : "wss://base-mainnet.g.alchemy.com/v2";

    return `${baseUrl}/${this.apiKey}`;
  }

  /**
   * Handle WebSocket response
   */
  private handleResponse(response: RPCResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      return;
    }

    this.pendingRequests.delete(response.id);
    clearTimeout(pending.timeout);

    if (response.error) {
      pending.reject(new Error(`RPC Error: ${response.error.message}`));
    } else {
      pending.resolve(response.result);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts - 1),
      10000,
    );

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch(() => {
          // Will try again if under limit
        });
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      network: this.network,
      reconnectAttempts: this.reconnectAttempts,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Singleton instances
const clients = new Map<string, AlchemyWebSocketRPC>();

/**
 * Get WebSocket RPC client for network
 */
export function getWebSocketRPC(
  network: "mainnet" | "base",
): AlchemyWebSocketRPC | null {
  // Only works in browser
  if (typeof window === "undefined") {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    console.warn(
      "NEXT_PUBLIC_ALCHEMY_API_KEY not configured for WebSocket RPC",
    );
    return null;
  }

  const key = `${network}-${apiKey}`;

  if (!clients.has(key)) {
    clients.set(key, new AlchemyWebSocketRPC(apiKey, network));
  }

  return clients.get(key)!;
}

/**
 * Check if WebSocket RPC is available
 */
export function isWebSocketRPCAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "WebSocket" in window &&
    !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  );
}
