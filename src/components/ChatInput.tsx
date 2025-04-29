
import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about SEO optimization..."
        disabled={disabled}
        className="min-h-[60px] resize-none bg-slate-800 border-blue-500/30 text-slate-100 focus:ring-blue-500 placeholder:text-slate-400"
      />
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          type="submit" 
          disabled={disabled || !message.trim()} 
          className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-500"
        >
          <Send className="h-5 w-5" />
        </Button>
      </motion.div>
    </form>
  );
}
