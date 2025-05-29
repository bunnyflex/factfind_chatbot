import { Message } from "@/types/chat";

export interface ChatAPIResponse {
  message: {
    role: "assistant";
    content: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  timestamp: string;
}

export interface ChatAPIErrorResponse {
  error: string;
  details?: string;
}

export class ChatAPIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  }

  /**
   * Send a message to the chat API and get AI response
   */
  async sendMessage(
    messages: Message[],
    userContext?: string,
    signal?: AbortSignal
  ): Promise<ChatAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          userContext,
        }),
        signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ChatAPIError(
          data.error || "Unknown error occurred",
          response.status
        );
      }

      return data as ChatAPIResponse;
    } catch (error) {
      if (error instanceof ChatAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ChatAPIError("Request was cancelled", 0);
        }

        if (error.message.includes("fetch")) {
          throw new ChatAPIError(
            "Network error. Please check your connection.",
            0
          );
        }
      }

      throw new ChatAPIError("An unexpected error occurred", 0);
    }
  }

  /**
   * Check if the chat API is healthy
   */
  async healthCheck(signal?: AbortSignal): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "GET",
        signal,
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export class ChatAPIError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ChatAPIError";
    this.statusCode = statusCode;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }
}

// Default client instance
export const chatAPI = new ChatAPIClient();

// Utility functions
export const createChatMessage = (
  text: string,
  sender: "user" | "ai"
): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  text,
  sender,
  timestamp: new Date(),
});

export const formatErrorMessage = (error: ChatAPIError): string => {
  if (error.isNetworkError) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  if (error.isRateLimited) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  if (error.isServerError) {
    return "Our service is temporarily unavailable. Please try again in a few minutes.";
  }

  return error.message || "Something went wrong. Please try again.";
};
