"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  TrendingUp,
  Expand,
  SparklesIcon,
  FileText,
} from "lucide-react";
import { useEnhancedMongoRAG } from "@/hooks/use-enhanced-rag";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  sources?: any[];
}

interface CitizenRAGChatBotProps {
  className?: string;
}

export function CitizenRAGChatBot({ className }: CitizenRAGChatBotProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  // Load user's reports on first open
  useEffect(() => {
    if (isOpen && !userReports && user) {
      fetchUserReports().then(() => {
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          type: "system",
          content:
            "Welcome to your Personal Report Assistant! I can help you track your submitted reports and provide updates. Try asking questions like:\n\n• What is the status of my latest report?\n• How many reports have I submitted?\n• Show me my pending reports\n• When was my last report resolved?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      });
    }
  }, [isOpen, userReports, user]);

  // Hide chatbot if on certain routes or user not logged in
  if (
    !user ||
    pathname === "/citizen/my-reports" ||
    pathname === "/citizen/report-chat"
  ) {
    return null;
  }

  const fetchUserReports = async () => {
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

    // Debug logging for user information
    console.log("🎯 Citizen RAG Chatbot - User Info:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      query: inputMessage,
    });

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
      console.log("🔍 Sending query with userId:", user.uid);

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
          temperature: 0.3, // Lower temperature for more factual responses
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
    "How many reports have I submitted?",
    "Show me my pending reports",
    "When was my last report resolved?",
  ];

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-600 to-blue-600 text-white opacity-80 hover:opacity-100"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card
        className={cn(
          "w-96 shadow-2xl transition-all duration-300 flex flex-col",
          isMinimized ? "h-16" : "h-[600px]"
        )}
      >
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              My Reports Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Link href="/citizen/report-chat">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Open Full Screen"
                >
                  <Expand className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type !== "user" && (
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          message.type === "bot"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100"
                        )}
                      >
                        {message.type === "bot" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3 text-sm",
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
                                <ul className="list-disc pl-4 space-y-1">
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
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">
                            Your Reports:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.slice(0, 3).map((source, idx) => (
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

                      <div className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm">
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
              <div className="p-4 border-t bg-green-50 flex-shrink-0">
                <div className="text-xs font-medium text-green-700 mb-2">
                  Quick Questions:
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                      className="justify-start text-left h-auto p-2 text-xs hover:bg-green-100"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your reports..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="mt-2 text-xs w-full hover:bg-green-100"
                >
                  Clear Chat
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
