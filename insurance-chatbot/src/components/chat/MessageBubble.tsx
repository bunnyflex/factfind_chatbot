"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageBubbleProps } from "@/types/chat";
import { useEffect, useState } from "react";

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    // Format time on client side to avoid hydration mismatch
    setTimeString(
      message.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [message.timestamp]);

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 bg-primary">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
        <div
          className={cn(
            "text-xs mt-2 opacity-70",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {timeString}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 bg-secondary">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
