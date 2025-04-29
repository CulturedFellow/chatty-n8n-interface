
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
        <p className="text-sm">
          If the "Simple Memory" node in n8n shows errors, make sure it's configured to use the "sessionid" parameter 
          from the incoming webhook request.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
