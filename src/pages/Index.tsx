
import React from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { motion } from "framer-motion";

export default function Index() {
  return (
    <motion.div 
      className="container py-8 bg-gradient-to-br from-slate-900 to-slate-950 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ChatInterface />
    </motion.div>
  );
}
