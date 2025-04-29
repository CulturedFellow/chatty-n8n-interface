
import React from "react";
import { ChatInterface } from "@/components/ChatInterface";

export default function Index() {
  return (
    <div className="container py-8">
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-2">How to use this chat</h2>
        <p className="text-sm mb-2">
          This interface connects to your n8n chatbot workflow. Each conversation has a unique session ID that helps 
          n8n maintain conversation context.
        </p>
        <p className="text-sm mb-2">
          The chat now sends messages in the required format:
        </p>
        <pre className="text-xs bg-slate-800 text-white p-2 rounded mb-2 overflow-x-auto">
{`{
  "action": "sendMessage",
  "sessionId": "unique-session-id",
  "chatInput": "user message"
}`}
        </pre>
        <p className="text-sm">
          If you're still experiencing issues, check your n8n workflow configuration.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
