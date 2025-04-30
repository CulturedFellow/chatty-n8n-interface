
import React from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const { signOut, clientInfo, user } = useAuth();
  
  // Check if user is admin (using email for simplicity)
  const isAdmin = user?.email?.includes('admin');

  return (
    <motion.div 
      className="container py-8 bg-gradient-to-br from-slate-900 to-slate-950 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-4">
          {clientInfo && (
            <span className="text-blue-300 hidden md:inline">
              Logged in as {clientInfo.name}
            </span>
          )}
          
          {isAdmin && (
            <Link to="/admin">
              <Button 
                variant="outline" 
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-blue-700"
              >
                <Settings size={18} className="mr-2" />
                Admin Panel
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut} 
            className="text-slate-300 hover:text-white hover:bg-blue-700"
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      <ChatInterface />
    </motion.div>
  );
}
