import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to home if already authenticated
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(emailOrUsername, password);
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    console.log("[Login.tsx LOG]: setTimeout about to be scheduled in handleForgotPassword");
    setTimeout(() => {
      console.log("[Login.tsx LOG]: setTimeout CALLBACK executing");
      const success = Math.random() > 0.5; // Simulate API call success/failure
      if (success) {
        setForgotPasswordSuccess("Password reset email sent successfully! Please check your inbox.");
        console.log("[Login.tsx LOG]: Forgot Password: Success - Email sent.");
      } else {
        setForgotPasswordError("Failed to send password reset email. Please try again.");
        console.error("[Login.tsx LOG]: Forgot Password: Error - Failed to send email.");
      }
      setIsForgotPasswordLoading(false);
      console.log("[Login.tsx LOG]: Forgot Password state updates complete.");
    }, 2000);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md bg-opacity-20 bg-black backdrop-blur-lg rounded-xl shadow-2xl p-10 border border-opacity-30 border-purple-500"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="text-center mb-10">
          {/* Logo Placeholder */}
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <span className="text-white text-2xl font-bold">LOGO</span> 
          </motion.div>

          <motion.h1
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            SEO Engine AI Bot
          </motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Client Login
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="emailOrUsername" className="text-sm text-gray-300 block font-medium">
              Email / Username
            </label>
            <Input
              id="emailOrUsername"
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              className="w-full bg-gray-800 bg-opacity-50 border-purple-500/50 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-gray-300 block font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full bg-gray-800 bg-opacity-50 border-purple-500/50 text-gray-200 placeholder:text-gray-500 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
            />
          </div>

          <div className="text-right space-y-2">
            <a
              href="#" // Placeholder link
              className={`text-sm text-purple-400 hover:text-purple-300 hover:underline ${isForgotPasswordLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                if (!isForgotPasswordLoading) {
                  handleForgotPassword();
                }
              }}
            >
              Forgot Password?
              {isForgotPasswordLoading && <span className="ml-1 animate-pulse">Sending...</span>}
            </a>
            {forgotPasswordError && (
              <p className="text-xs text-red-400">{forgotPasswordError}</p>
            )}
            {forgotPasswordSuccess && (
              <p className="text-xs text-green-400">{forgotPasswordSuccess}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-3"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <motion.div
          className="mt-10 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Contact support for login credentials
        </motion.div>
      </motion.div>
    </motion.div>
  );
}