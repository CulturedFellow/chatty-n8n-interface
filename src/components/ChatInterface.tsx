
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    // Generate a unique session ID when the component is first mounted
    return crypto.randomUUID();
  });
  const { clientInfo } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    if (!clientInfo?.webhook_url) {
      toast.error("No webhook URL configured for your account");
      return;
    }

    // Add user message to the chat
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Format the payload according to the n8n workflow expectation
      const payload = {
        action: "sendMessage",
        sessionId: sessionId,
        chatInput: content
      };

      const response = await fetch(clientInfo.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot");
      }

      const data = await response.json();
      
      // Add assistant message - using 'output' property instead of 'message'
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.output || "Sorry, I couldn't process your request",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from the chatbot");
    } finally {
      setLoading(false);
    }
  };

  // Add a function to start a new chat session
  const startNewSession = () => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    toast.success("Started a new chat session");
  };

  return (
    <motion.div 
      className="flex flex-col h-[80vh] max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-t-lg p-4 border-b border-blue-500/30 flex justify-between items-center"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            {clientInfo?.name || "SEO Engine AI Bot"}
          </h1>
          <p className="text-blue-300">Your intelligent SEO assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={startNewSession}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="hidden sm:inline">New Chat</span>
          </motion.button>
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
        {messages.length === 0 ? (
          <motion.div 
            className="flex items-center justify-center h-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-white">Welcome to {clientInfo?.name || "SEO Engine AI Bot"}</h2>
              <p className="text-blue-300">Ask me anything about SEO optimization!</p>
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-3 h-3 rounded-full bg-blue-300 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
              <p className="text-xs mt-8 text-slate-500">Session ID: {sessionId.slice(0, 8)}...</p>
            </div>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <ChatMessage message={message} />
            </motion.div>
          ))
        )}
        {loading && (
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "200ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "400ms" }}></div>
            </div>
            <span className="text-sm text-blue-300">AI is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 rounded-b-lg border-t border-blue-500/30">
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </motion.div>
  );
}
