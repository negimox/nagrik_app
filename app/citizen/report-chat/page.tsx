"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Loader2,
  TrendingUp,
  FileText,
  Minimize,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEnhancedMongoRAG } from "@/hooks/use-enhanced-rag";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  sources?: any[];
}

export default function CitizenReportChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userReports, setUserReports] = useState<any>(null);

  const { queryWithReportsContext, isLoading, error } = useEnhancedMongoRAG();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's reports and welcome message on mount
  useEffect(() => {
    if (user) {
      fetchUserReports().then(() => {
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          type: "system",
          content:
            "Welcome to your Personal Report Assistant! I have access to all your submitted reports and can help you track their progress. Here are some things I can help you with:\n\n• **Track your report status** - Get real-time updates on any of your submissions\n• **View resolution timeline** - See how long your reports typically take to resolve\n• **Compare your reports** - Understand patterns in your submissions\n• **Get status summaries** - Quick overviews of all your pending/resolved reports\n\nTry asking questions like:\n• What is the status of my latest report?\n• How many reports have I submitted this month?\n• Show me my pending streetlight reports\n• When was my last pothole report resolved?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      });
    }
  }, [user]);

  const fetchUserReports = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/report?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setUserReports(data);
      }
    } catch (err) {
      console.error("Failed to fetch user reports:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Get AI response using enhanced RAG with user-specific context
    try {
      const result = await queryWithReportsContext(
        inputMessage,
        undefined, // location - will be auto-detected from context
        undefined, // category - will be auto-detected from context
        {
          includeIndianContext: true,
          regionalContext: "north",
          governanceContext: {
            state: "Uttarakhand",
            district: "Dehradun",
            governanceLevel: "municipal",
          },
          temperature: 0.2, // Very low temperature for factual responses
          maxDocuments: 5,
          userSpecific: true, // Flag for user-specific queries
          userId: user.uid, // Pass user ID to filter reports
        }
      );

      if (result) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: result.answer,
          timestamp: new Date(),
          sources: result.sources,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickQuestions = [
    "What is the status of my latest report?",
    "How many reports have I submitted this month?",
    "Show me my pending reports",
    "When was my last report resolved?",
    "Which of my reports took the longest to resolve?",
    "Compare my streetlight vs pothole reports",
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            Please Log In
          </h1>
          <p className="text-green-600 mb-4">
            You need to be logged in to access your personal report assistant.
          </p>
          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-green-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-green-800">
                My Reports Assistant
              </h1>
              <p className="text-green-600 text-sm">
                Personal AI assistant for your infrastructure reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/citizen/dashboard">
              <Button variant="outline" size="sm">
                <Minimize className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type !== "user" && (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        message.type === "bot"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100"
                      )}
                    >
                      {message.type === "bot" ? (
                        <Bot className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg p-4",
                      message.type === "user"
                        ? "bg-green-600 text-white ml-auto"
                        : message.type === "bot"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-green-50 text-green-900 border border-green-200"
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {message.type === "user" ? (
                        message.content
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 space-y-1 my-2">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            h3: ({ children }) => (
                              <h3 className="font-semibold text-lg mb-2 mt-4 first:mt-0">
                                {children}
                              </h3>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-2">
                          Based on your reports:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.sources.slice(0, 5).map((source, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {source.category || "Report"} - {source.status}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking your reports...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-6 border-t bg-green-50">
              <div className="text-sm font-medium text-green-700 mb-3">
                Quick Questions:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputMessage(question)}
                    className="justify-start text-left h-auto p-3 text-sm hover:bg-green-100"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your reports..."
                disabled={isLoading}
                className="flex-1 text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="mt-3 text-sm w-full hover:bg-green-100"
              >
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
