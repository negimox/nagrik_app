"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  sources?: any[];
  suggestions?: string[];
  escalationPath?: string;
  relatedIssues?: string[];
  faq?: { question: string; answer: string }[];
  priority?: "high" | "medium" | "low";
  confidence?: number;
}

interface EnhancedAuthorityRAGChatBotProps {
  className?: string;
  initialContext?: {
    state?: string;
    district?: string;
    ward?: string;
    governanceLevel?: string;
  };
}

export function EnhancedAuthorityRAGChatBot({
  className,
  initialContext,
}: EnhancedAuthorityRAGChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [currentSeason, setCurrentSeason] = useState<string>("monsoon");
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Determine current season
  useEffect(() => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) setCurrentSeason("monsoon");
    else if (month >= 3 && month <= 5) setCurrentSeason("summer");
    else setCurrentSeason("winter");
  }, []);

  // Load analytics and welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchAnalytics();
      addWelcomeMessage();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/rag/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      type: "system",
      content: `नमस्ते! Welcome to the Enhanced Authority RAG Assistant for Indian Infrastructure! 🇮🇳

I can help you with:
• Municipal governance and procedures (नगरीय शासन)
• Infrastructure analysis across different seasons
• Region-specific insights and solutions
• Escalation paths and proper authorities
• Monsoon preparedness and post-monsoon recovery
• Compliance with Indian standards (IRC, BIS, NBC)

Current Context:
🌍 Region: ${initialContext?.state || "India"}
🏛️ Level: ${initialContext?.governanceLevel || "Municipal Corporation"}
🌦️ Season: ${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}
${initialContext?.ward ? `📍 Ward: ${initialContext.ward}` : ""}

Try asking: "What are common monsoon issues in urban areas?" or "How to report drainage problems in my ward?"`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

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
    setIsLoading(true);
    setError(null);

    try {
      // Enhanced RAG query with Indian context
      const response = await fetch("/api/rag/enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputMessage,
          config: {
            includeIndianContext: true,
            governanceContext: {
              ...initialContext,
              seasonalContext: currentSeason,
            },
            regionalContext: getRegionalContext(initialContext?.state),
            temperature: 0.4,
            maxDocuments: 8,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: result.answer,
        timestamp: new Date(),
        sources: result.sources,
        suggestions: result.suggestions,
        escalationPath: result.escalationPath,
        relatedIssues: result.relatedIssues,
        faq: result.faq,
        confidence: result.confidence,
        priority: determinePriority(inputMessage),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content:
          "Sorry, I encountered an error processing your request. Please try again or contact technical support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRegionalContext = (state?: string): string | undefined => {
    if (!state) return undefined;

    const stateToRegion: Record<string, string> = {
      Maharashtra: "west",
      Gujarat: "west",
      Rajasthan: "west",
      "Tamil Nadu": "south",
      Karnataka: "south",
      Kerala: "south",
      "Andhra Pradesh": "south",
      "West Bengal": "east",
      Odisha: "east",
      Assam: "east",
      Punjab: "north",
      Haryana: "north",
      "Uttar Pradesh": "north",
      Delhi: "north",
    };

    return stateToRegion[state];
  };

  const determinePriority = (query: string): "high" | "medium" | "low" => {
    const highPriorityTerms = [
      "emergency",
      "accident",
      "fallen tree",
      "electrical",
      "sewage overflow",
    ];
    const mediumPriorityTerms = [
      "pothole",
      "street light",
      "drainage",
      "garbage",
    ];

    const queryLower = query.toLowerCase();

    if (highPriorityTerms.some((term) => queryLower.includes(term)))
      return "high";
    if (mediumPriorityTerms.some((term) => queryLower.includes(term)))
      return "medium";
    return "low";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    addWelcomeMessage();
  };

  const quickQuestions = [
    "What are common monsoon drainage issues? (मानसून की समस्याएं)",
    "How to report infrastructure problems in my ward? (समस्या की रिपोर्ट कैसे करें)",
    "Which department handles road maintenance? (सड़क रखरखाव विभाग)",
    "What are the escalation procedures for urgent issues? (तत्काल समस्याओं की प्रक्रिया)",
    "How to check complaint status online? (शिकायत की स्थिति कैसे देखें)",
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-orange-600 bg-orange-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return null;
    if (confidence > 0.8)
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (confidence > 0.6) return <Clock className="h-3 w-3 text-orange-500" />;
    return <AlertTriangle className="h-3 w-3 text-red-500" />;
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#003A70] to-[#0056B3] hover:from-[#002654] hover:to-[#003D82]"
        >
          <div className="flex flex-col items-center">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">🇮🇳</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card
        className={cn(
          "w-[420px] shadow-2xl transition-all duration-300 border-2 border-[#003A70]/20",
          isMinimized ? "h-20" : "h-[700px]"
        )}
      >
        {/* Enhanced Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-[#003A70] to-[#0056B3] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              <div>
                <div>Authority RAG Assistant</div>
                <div className="text-xs opacity-80 font-normal">
                  Enhanced for India 🇮🇳
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger className="w-16 h-6 text-xs border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              )}
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

          {/* Enhanced Analytics Summary */}
          {analytics && !isMinimized && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {analytics.totalReports || 0}
                  </div>
                  <div className="opacity-80">कुल रिपोर्ट्स</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {analytics.resolvedReports || 0}
                  </div>
                  <div className="opacity-80">हल किए गए</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {analytics.pendingReports || 0}
                  </div>
                  <div className="opacity-80">लंबित</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {currentSeason === "monsoon"
                      ? "🌧️"
                      : currentSeason === "summer"
                      ? "☀️"
                      : "❄️"}
                  </div>
                  <div className="opacity-80">{currentSeason}</div>
                </div>
              </div>

              {initialContext && (
                <div className="flex items-center gap-2 text-xs opacity-90">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {initialContext.state}
                    {initialContext.ward && ` • Ward ${initialContext.ward}`}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(700px-180px)]">
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                {error}
              </div>
            )}

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
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
                            ? "bg-gradient-to-r from-[#003A70] to-[#0056B3] text-white"
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
                        "max-w-[85%] rounded-lg p-3 text-sm",
                        message.type === "user"
                          ? "bg-gradient-to-r from-[#003A70] to-[#0056B3] text-white ml-auto"
                          : message.type === "bot"
                          ? "bg-gray-50 text-gray-900 border border-gray-200"
                          : "bg-blue-50 text-blue-900 border border-blue-200"
                      )}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {/* Priority and Confidence indicators */}
                      {message.type === "bot" &&
                        (message.priority || message.confidence) && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                            {message.priority && (
                              <Badge
                                variant="outline"
                                className={getPriorityColor(message.priority)}
                              >
                                Priority: {message.priority.toUpperCase()}
                              </Badge>
                            )}
                            {message.confidence && (
                              <div className="flex items-center gap-1">
                                {getConfidenceIcon(message.confidence)}
                                <span className="text-xs text-gray-600">
                                  {Math.round(message.confidence * 100)}%
                                  confident
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Suggestions */}
                      {message.suggestions &&
                        message.suggestions.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                              <Lightbulb className="h-3 w-3" />
                              Suggested Actions:
                            </div>
                            <div className="space-y-1">
                              {message.suggestions.map((suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs bg-blue-50 p-2 rounded text-blue-800"
                                >
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Escalation Path */}
                      {message.escalationPath && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                            <ArrowUp className="h-3 w-3" />
                            Escalation Path:
                          </div>
                          <div className="text-xs bg-orange-50 p-2 rounded text-orange-800">
                            {message.escalationPath}
                          </div>
                        </div>
                      )}

                      {/* Related Issues */}
                      {message.relatedIssues &&
                        message.relatedIssues.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Related Issues:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {message.relatedIssues.map((issue, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* FAQ */}
                      {message.faq && message.faq.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                            <HelpCircle className="h-3 w-3" />
                            Frequently Asked Questions:
                          </div>
                          <div className="space-y-2">
                            {message.faq.slice(0, 3).map((faqItem, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-gray-50 p-2 rounded border"
                              >
                                <div className="font-medium text-gray-800 mb-1">
                                  Q: {faqItem.question}
                                </div>
                                <div className="text-gray-600">
                                  A: {faqItem.answer}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">
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

                      <div className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#003A70] to-[#0056B3] text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing with Indian context...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Quick Questions (त्वरित प्रश्न):
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMessage(question.split(" (")[0])}
                      className="justify-start text-left h-auto p-2 text-xs hover:bg-white/50"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedLanguage === "hi"
                      ? "अपनी समस्या के बारे में पूछें..."
                      : "Ask about infrastructure issues..."
                  }
                  disabled={isLoading}
                  className="flex-1 border-gray-300 focus:border-[#003A70]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3 bg-gradient-to-r from-[#003A70] to-[#0056B3] hover:from-[#002654] hover:to-[#003D82]"
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
                  Clear Chat (चैट साफ़ करें)
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
