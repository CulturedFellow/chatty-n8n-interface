
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

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

      const response = await fetch("https://n8n.seoengine.agency/webhook/3f19a2fd-4157-4d00-8add-b19b7a31e6ee/chat", {
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

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message || "Sorry, I couldn't process your request",
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
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto">
      <div className="bg-card rounded-t-lg p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">SEO Engine AI Chat</h1>
          <p className="text-muted-foreground">Chat with your AI assistant</p>
        </div>
        <button
          onClick={startNewSession}
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm"
        >
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Welcome to SEO Engine AI Chat</h2>
              <p className="text-muted-foreground">Ask me anything about SEO!</p>
              <p className="text-xs mt-4 text-muted-foreground">Session ID: {sessionId.slice(0, 8)}...</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {loading && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "200ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "400ms" }}></div>
            </div>
            <span className="text-sm text-muted-foreground">AI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-card rounded-b-lg border-t">
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
