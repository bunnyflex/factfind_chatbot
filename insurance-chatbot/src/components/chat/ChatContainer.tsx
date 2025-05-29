"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import QuickReplies, { getQuickRepliesForMessage } from "./QuickReplies";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useConversation } from "@/contexts/ConversationContext";
import { generateSystemPrompt } from "@/lib/prompts/systemPrompt";

interface QuickReply {
  text: string;
  value: string;
  emoji?: string;
}

export default function ChatContainer() {
  const { state, addMessage, updateData } = useConversation();
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [currentQuickReplies, setCurrentQuickReplies] = useState<QuickReply[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Add initial welcome message if no messages exist
  useEffect(() => {
    if (state.messages.length === 0) {
      addMessage(
        "assistant",
        "Hi there! I'm Alex, your friendly insurance advisor 😊 I'm here to help you find the perfect insurance coverage. Let's have a quick chat about your needs - it'll be much more fun than filling out boring forms! First up: are you UK domiciled and a UK tax resident?"
      );
    }
  }, [state.messages.length, addMessage]);

  // Update quick replies when the last message changes
  useEffect(() => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      const quickReplies = getQuickRepliesForMessage(lastMessage.content);
      setCurrentQuickReplies(quickReplies);
      setShowQuickReplies(quickReplies.length > 0 && !isTyping);
    } else {
      setShowQuickReplies(false);
    }
  }, [state.messages, isTyping]);

  // Helper function to update collected data with extracted information
  const updateCollectedDataFromExtraction = (
    extractedData: Record<string, string | number | boolean>
  ) => {
    Object.entries(extractedData).forEach(([field, value]) => {
      // Map extracted fields to the correct data categories
      const fieldMappings: Record<
        string,
        { category: keyof typeof state.collectedData; field: string }
      > = {
        ukResident: { category: "personal", field: "ukResident" },
        maritalStatus: { category: "personal", field: "maritalStatus" },
        hasDependents: { category: "personal", field: "hasDependents" },
        numDependents: { category: "personal", field: "numDependents" },
        dependentAges: { category: "personal", field: "dependentAges" },
        employmentStatus: { category: "personal", field: "employmentStatus" },
        occupation: { category: "personal", field: "occupation" },
        smokingStatus: { category: "personal", field: "smokingStatus" },
        height: { category: "personal", field: "height" },
        weight: { category: "personal", field: "weight" },
      };

      const mapping = fieldMappings[field];
      if (mapping) {
        updateData(mapping.category, mapping.field, value);
        console.log(`Updated ${mapping.category}.${mapping.field} = ${value}`);
      }
    });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Hide quick replies when user sends a message
    setShowQuickReplies(false);

    // Add user message
    addMessage("user", content);
    setIsTyping(true);

    try {
      // Prepare the API request with conversation context
      const requestBody = {
        messages: [
          {
            role: "user" as const,
            content: content,
          },
        ],
        conversationState: state,
        systemPrompt: generateSystemPrompt({ conversationState: state }),
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      // **NEW: Handle extraction data**
      if (
        data.extractionData &&
        Object.keys(data.extractionData.extracted).length > 0
      ) {
        const { extracted, confidence, needsClarification } =
          data.extractionData;

        console.log("Received extraction data:", {
          extracted,
          confidence,
          needsClarification,
        });

        // Only process extraction data if confidence is high enough and it's meaningful
        if (confidence > 0.85) {
          // Update conversation state with extracted data
          updateCollectedDataFromExtraction(extracted);
        } else if (confidence > 0.75) {
          // For medium confidence, update data but don't show feedback message
          updateCollectedDataFromExtraction(extracted);
        }
        // For low confidence (< 0.75), ignore the extraction entirely
      }

      // Add AI response
      addMessage("assistant", data.message);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(
        "assistant",
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (value: string) => {
    sendMessage(value);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header with Progress */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Insurance Advisor AI
              </h1>
              <p className="text-sm text-muted-foreground">
                UK Insurance Fact-Find Interview
              </p>
            </div>
          </div>
          {/* Integrated Progress Indicator */}
          <ProgressIndicator className="mt-2" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {state.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  id: message.id,
                  text: message.content,
                  sender: message.role === "user" ? "user" : "ai",
                  timestamp: message.timestamp,
                }}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Quick Replies */}
      {showQuickReplies && (
        <QuickReplies
          replies={currentQuickReplies}
          onReplySelect={handleQuickReply}
          disabled={isTyping}
        />
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        disabled={isTyping}
        placeholder="Answer the fact-find questions..."
      />
    </div>
  );
}
