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
  Database,
  Bot,
  User,
  Loader2,
  TrendingUp,
  ExternalLink,
  Expand,
  SparklesIcon,
} from "lucide-react";
import { useEnhancedMongoRAG } from "@/hooks/use-enhanced-rag";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";

interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  sources?: any[];
}

interface AuthorityRAGChatBotProps {
  className?: string;
}

export function AuthorityRAGChatBot({ className }: AuthorityRAGChatBotProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);

  const { queryWithReportsContext, fetchAnalytics, isLoading, error } =
    useEnhancedMongoRAG();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load analytics on first open
  useEffect(() => {
    if (isOpen && !analytics) {
      fetchAnalytics().then(() => {
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          type: "system",
          content:
            "Welcome to the Authority RAG Assistant! I can help you analyze infrastructure reports, identify patterns, and provide insights based on historical data. Try asking questions like:\n\n• What are the most common issues in downtown?\n• Show me resolution patterns for electrical problems\n• Which areas need the most attention?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      });
    }
  }, [isOpen, analytics, fetchAnalytics]);

  // Hide chatbot if on nagrik-ai route - AFTER all hooks
  if (pathname === "/authority/nagrik-ai") {
    return null;
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Get AI response using enhanced RAG
    try {
      const result = await queryWithReportsContext(
        inputMessage,
        undefined, // location - will be auto-detected from context
        undefined, // category - will be auto-detected from context
        {
          includeIndianContext: true,
          regionalContext: "north", // Can be made dynamic
          governanceContext: {
            state: "Uttarakhand",
            district: "Dehradun",
            governanceLevel: "municipal",
          },
          temperature: 0.4,
          maxDocuments: 8,
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
    "What are the most common infrastructure issues?",
    "Show me recent resolution trends",
    "Which areas have the highest priority issues?",
    "Compare issue patterns by category",
  ];

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-red-700 text-white opacity-80 hover:opacity-100"
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
        <CardHeader className="pb-3 bg-gradient-to-r from-primary to-red-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg ">
              <SparklesIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              Nagrik AI
            </CardTitle>
            <div className="flex items-center gap-1">
              <Link href="/authority/nagrik-ai">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-card text-card-foreground/20 h-8 w-8 p-0"
                  title="Open Full Screen"
                >
                  <Expand className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-card text-card-foreground/20 h-8 w-8 p-0"
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
                className="text-white hover:bg-card text-card-foreground/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Analytics Summary */}
          {analytics && !isMinimized && (
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">
                  {analytics.totalReports || 0}
                </div>
                <div className="opacity-80">Reports</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {analytics.resolvedReports || 0}
                </div>
                <div className="opacity-80">Resolved</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {analytics.pendingReports || 0}
                </div>
                <div className="opacity-80">Pending</div>
              </div>
            </div>
          )}
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
                            ? "bg-primary text-white"
                            : "bg-muted/50"
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
                          ? "bg-primary text-white ml-auto"
                          : message.type === "bot"
                          ? "bg-muted/50 text-foreground"
                          : "bg-blue-50 text-blue-900 border border-blue-200"
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
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Sources:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.slice(0, 3).map((source, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {source.category || "Report"}
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
                      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing reports...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-muted/50 flex-shrink-0">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Quick Questions:
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                      className="justify-start text-left h-auto p-2 text-xs"
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
                  placeholder="Ask about infrastructure reports..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="mt-2 text-xs w-full"
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
