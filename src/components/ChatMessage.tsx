
import React from "react";
import { format } from "date-fns";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border"
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {format(message.timestamp, "HH:mm")}
        </div>
      </div>
    </div>
  );
}
