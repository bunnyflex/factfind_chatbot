"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 justify-start animate-in slide-in-from-bottom-2 duration-300">
      <Avatar className="w-8 h-8 bg-primary">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            AI is typing...
          </span>
        </div>
      </div>
    </div>
  );
}
