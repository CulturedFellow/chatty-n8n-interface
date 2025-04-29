
import React from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

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
      <motion.div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-slate-800 border border-blue-500/20 text-slate-100"
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isUser ? (
          <div className="text-sm break-words">{message.content}</div>
        ) : (
          <div className="markdown-body text-sm break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <div className="text-xs mt-1 opacity-70">
          {format(message.timestamp, "HH:mm")}
        </div>
      </motion.div>
    </div>
  );
}
