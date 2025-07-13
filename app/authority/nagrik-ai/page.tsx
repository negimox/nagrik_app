"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  MapPin,
  HelpCircle,
  Send,
  User,
  Bot,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  ragResponse?: any;
}

export default function UttarakhandRAGTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample queries for quick access
  const sampleQueries = [
    "What are some recent streetlight issues raised?",
    "Road condition on Chakrata Road near Dhoolkot",
    "Water drainage issues in Selakui area during monsoon",
    "Power outage problems in hill areas of Dehradun",
    "Landslide damage on mountain roads in Uttarakhand",
    "Spring water contamination in hill stations",
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (queryText?: string) => {
    const messageText = queryText || currentQuery.trim();
    if (!messageText || loading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/rag/enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: messageText,
          config: {
            regionalContext: "north",
            governanceContext: {
              state: "Uttarakhand",
              district: "Dehradun",
              locality: "Urban Hills",
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add assistant message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.answer || "I'm sorry, I couldn't process your request.",
          timestamp: new Date(),
          ragResponse: data,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("API request failed");
      }
    } catch (error) {
      console.error("Error:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentQuery("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="absolute inset-0 bg-gray-50 flex flex-col"
      style={{ top: "120px" }}
    >
      {/* Chat Messages Area - Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 min-h-full flex flex-col">
          {/* Clear Chat Button - Now positioned in the top right */}
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Welcome to Uttarakhand Infrastructure Assistant
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Ask me about infrastructure issues, road conditions, utilities,
                or any other civic concerns in Uttarakhand.
              </p>

              {/* Sample Queries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-3xl mx-auto">
                {sampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(query)}
                    disabled={loading}
                    className="text-left justify-start p-3 h-auto whitespace-normal"
                  >
                    <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{query}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`${
                      message.type === "user"
                        ? "max-w-[80%] bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg"
                        : "flex-1 bg-white border rounded-r-lg rounded-tl-lg"
                    } p-4 shadow-sm`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {message.type === "user" ? (
                        // For user messages, use simple text splitting
                        message.content.split("\n").map((line, index) => (
                          <p
                            key={index}
                            className={`mb-2 last:mb-0 text-primary-foreground`}
                          >
                            {line}
                          </p>
                        ))
                      ) : (
                        // For assistant messages, render Markdown
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Customize list styling
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 space-y-1 text-foreground">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm text-foreground">
                                {children}
                              </li>
                            ),
                            // Customize heading styling
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-3 text-foreground">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-semibold mb-2 text-foreground">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold mb-2 text-foreground">
                                {children}
                              </h3>
                            ),
                            // Customize paragraph styling
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 text-sm leading-relaxed text-foreground">
                                {children}
                              </p>
                            ),
                            // Customize strong/bold styling
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">
                                {children}
                              </strong>
                            ),
                            // Customize code styling
                            code: ({ children }) => (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-foreground">
                                {children}
                              </code>
                            ),
                            // Customize blockquote styling
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-foreground">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    <div
                      className={`text-xs mt-2 ${
                        message.type === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                      {message.ragResponse && (
                        <span className="ml-2">
                          •{" "}
                          {Math.round(
                            (message.ragResponse.confidence || 0) * 100
                          )}
                          % confidence
                        </span>
                      )}
                    </div>

                    {/* Enhanced RAG Response Details */}
                    {message.type === "assistant" && message.ragResponse && (
                      <div className="mt-4 space-y-3">
                        {/* Sources */}
                        {message.ragResponse.sources &&
                          message.ragResponse.sources.length > 0 && (
                            <div className="border-t pt-3">
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Sources ({message.ragResponse.sources.length})
                              </h4>
                              <div className="space-y-2">
                                {message.ragResponse.sources
                                  .slice(0, 3)
                                  .map((source: any, index: number) => (
                                    <div
                                      key={index}
                                      className="text-xs bg-gray-50 p-2 rounded border"
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium">
                                          {source.metadata?.title ||
                                            source.title}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {source.metadata?.category ||
                                            source.category}
                                        </Badge>
                                      </div>
                                      {source.metadata?.location && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span>
                                            {source.metadata.location}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Suggestions */}
                        {message.ragResponse.suggestions &&
                          message.ragResponse.suggestions.length > 0 && (
                            <div className="border-t pt-3">
                              <h4 className="text-sm font-semibold mb-2">
                                Suggestions
                              </h4>
                              <ul className="text-sm space-y-1">
                                {message.ragResponse.suggestions
                                  .slice(0, 3)
                                  .map((suggestion: string, index: number) => (
                                    <li
                                      key={index}
                                      className="text-muted-foreground"
                                    >
                                      • {suggestion}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}

                        {/* FAQ */}
                        {message.ragResponse.faq &&
                          message.ragResponse.faq.length > 0 && (
                            <div className="border-t pt-3">
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                <HelpCircle className="h-3 w-3" />
                                Related FAQs
                              </h4>
                              <div className="space-y-2">
                                {message.ragResponse.faq
                                  .slice(0, 2)
                                  .map((faqItem: any, index: number) => (
                                    <div key={index} className="text-xs">
                                      <div className="font-medium mb-1">
                                        {faqItem.question}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {faqItem.answer}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {message.type === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border rounded-r-lg rounded-tl-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing your query...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
          {/* Spacer to push content up when needed */}
          <div className="flex-1 min-h-[100px]"></div>
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask about infrastructure issues in Uttarakhand..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={loading || !currentQuery.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground">
                Quick queries:
              </span>
              {sampleQueries.slice(0, 3).map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendMessage(query)}
                  disabled={loading}
                  className="text-xs h-6 px-2"
                >
                  {query}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
