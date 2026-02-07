"use client";

/**
 * Citizen Voice Assistant Component
 * Provides voice-based interaction using Vapi.ai
 * Superset of the chatbot with voice capabilities
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  X,
  Minimize2,
  Maximize2,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Vapi from "@vapi-ai/web";

interface VoiceMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  urls?: string[]; // Optional URLs extracted from the message
}

interface CitizenVoiceAssistantProps {
  className?: string;
}

export function CitizenVoiceAssistant({
  className,
}: CitizenVoiceAssistantProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Vapi State
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Conversation State
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const publicKeyRef = useRef(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
  const currentAssistantMessageRef = useRef<string>(""); // Accumulate assistant transcript chunks

  // Initialize Vapi client
  useEffect(() => {
    // Don't initialize if user not logged in or on excluded routes
    if (
      !user ||
      pathname === "/citizen/my-reports" ||
      pathname === "/citizen/report-chat"
    ) {
      return;
    }
    if (!publicKeyRef.current) {
      console.error("Vapi public key not found");
      return;
    }

    const vapiInstance = new Vapi(publicKeyRef.current);
    setVapi(vapiInstance);

    // Setup event listeners
    vapiInstance.on("call-start", () => {
      console.log("📞 Call started");
      setIsCallActive(true);
      setIsConnecting(false);
      addSystemMessage("Voice assistant connected. How can I help you?");
    });

    vapiInstance.on("call-end", () => {
      console.log("📞 Call ended");
      setIsCallActive(false);
      setIsConnecting(false);
      setCurrentTranscript("");
      addSystemMessage("Voice assistant disconnected.");
    });

    vapiInstance.on("speech-start", () => {
      console.log("🎤 User started speaking");
    });

    vapiInstance.on("speech-end", () => {
      console.log("🎤 User stopped speaking");
    });

    vapiInstance.on("message", (message: any) => {
      console.log("💬 Message received:", message);

      if (message.type === "transcript" && message.role === "user") {
        // User's speech transcribed
        setCurrentTranscript(message.transcript);
        if (message.transcriptType === "final") {
          addUserMessage(message.transcript);
          setCurrentTranscript("");
        }
      } else if (
        message.type === "transcript" &&
        message.role === "assistant"
      ) {
        // Assistant's response transcript (what is being spoken) - show in real-time
        if (message.transcriptType === "final") {
          console.log("🎤 Assistant transcript chunk:", message.transcript);
          // Accumulate transcript chunks in ref
          const updated = currentAssistantMessageRef.current
            ? `${currentAssistantMessageRef.current} ${message.transcript}`
            : message.transcript;
          currentAssistantMessageRef.current = updated;
          console.log("📝 Accumulated transcript:", updated);
        }
      } else if (message.type === "voice-input") {
        // Assistant's actual response text (contains links) - add URLs to message
        console.log(
          "🗣️ Voice input (original text with links):",
          message.input,
        );

        // Extract URLs from the voice-input
        const rawUrls = detectUrls(message.input);
        const urls = rawUrls.map(normalizeUrl).filter((url) => url.length > 0);
        console.log("🔗 Extracted URLs from voice-input:", urls);

        // Use accumulated transcript if available, otherwise clean the voice-input text
        const finalContent =
          currentAssistantMessageRef.current ||
          removeUrlsFromText(message.input);
        console.log("✅ Final content to display:", finalContent);

        // Add the message with URLs
        addAssistantMessageWithUrls(finalContent, urls);

        // Reset for next message
        currentAssistantMessageRef.current = "";
      } else if (
        message.type === "speech-update" &&
        message.status === "started" &&
        message.role === "assistant"
      ) {
        // New assistant turn starting - reset the accumulator
        console.log("New assistant speech starting, resetting accumulator");
        currentAssistantMessageRef.current = "";
      } else if (message.type === "function-call") {
        // Function being called
        console.log("🔧 Function call:", message.functionCall);
        addSystemMessage(`Processing: ${message.functionCall.name}...`);
      } else if (message.type === "hang") {
        // Call ended by user or system
        console.log("👋 Call hung up");
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("❌ Vapi error:", error);
      addSystemMessage("An error occurred. Please try again.");
      setIsCallActive(false);
      setIsConnecting(false);
    });

    vapiInstance.on("volume-level", (level: number) => {
      setVolumeLevel(level);
    });

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [user, pathname]);

  // Auto-scroll to bottom when messages change or transcript updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages, currentTranscript]);

  // Hide on certain routes or when user not logged in
  if (
    !user ||
    pathname === "/citizen/my-reports" ||
    pathname === "/citizen/report-chat"
  ) {
    return null;
  }

  // Helper functions for adding messages
  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const addAssistantMessage = (content: string) => {
    console.log("📝 Processing assistant message:", content);

    // Detect URLs in the message
    const rawUrls = detectUrls(content);
    console.log("🔍 Detected URLs:", rawUrls);

    // Normalize URLs (convert relative to absolute, clean markdown)
    const urls = rawUrls.map(normalizeUrl).filter((url) => url.length > 0);
    console.log("✅ Normalized URLs:", urls);

    // If URLs found, remove them from content for display
    const displayContent =
      urls.length > 0 ? removeUrlsFromText(content) : content;
    console.log("💬 Display content:", displayContent);

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: displayContent,
        timestamp: new Date(),
        urls: urls.length > 0 ? urls : undefined,
      },
    ]);
  };

  const addSystemMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        type: "system",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // Helper function to add assistant message with URLs (for hybrid approach)
  const addAssistantMessageWithUrls = (content: string, urls: string[]) => {
    console.log("📝 Adding assistant message with URLs:", { content, urls });

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content,
        timestamp: new Date(),
        urls: urls.length > 0 ? urls : undefined,
      },
    ]);
  };

  // Helper function to detect URLs in text (both full URLs and relative paths)
  const detectUrls = (text: string): string[] => {
    const urls: string[] = [];

    // Detect full URLs (http:// or https://)
    const fullUrlRegex = /(https?:\/\/[^\s\)]+)/g;
    const fullUrls = text.match(fullUrlRegex) || [];
    urls.push(...fullUrls);

    // Detect relative paths that look like routes (starting with /)
    const relativePathRegex = /(\/[a-zA-Z0-9\-_\/]+)/g;
    const relativePaths = text.match(relativePathRegex) || [];
    urls.push(...relativePaths);

    // Detect markdown-style links [text](url)
    const markdownRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let match;
    while ((match = markdownRegex.exec(text)) !== null) {
      urls.push(match[2]); // Extract URL from markdown
    }

    // Remove duplicates
    return [...new Set(urls)];
  };

  // Helper function to extract link text from markdown-style links
  const getLinkLabel = (url: string): string => {
    // Remove any markdown wrappers or extra characters
    const cleanUrl = url.replace(/[\[\]\(\)\*]/g, "").trim();

    // Check if it's a report submission link
    if (
      cleanUrl.includes("/citizen/report") &&
      !cleanUrl.includes("/reports/")
    ) {
      return "📝 Submit Report";
    }
    // Check if it's a report detail link
    if (cleanUrl.includes("/citizen/reports/")) {
      const reportId = cleanUrl.split("/").pop();
      return `📋 View Report ${reportId}`;
    }
    // Check for other citizen routes
    if (cleanUrl.includes("/citizen/dashboard")) {
      return "🏠 Dashboard";
    }
    if (cleanUrl.includes("/citizen/maintenance")) {
      return "🔧 Maintenance";
    }
    // Default label
    return "🔗 Open Link";
  };

  // Helper function to normalize URLs (convert relative to absolute if needed)
  const normalizeUrl = (url: string): string => {
    const cleanUrl = url.replace(/[\[\]\(\)\*]/g, "").trim();

    // If it's already a full URL, return as is
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return cleanUrl;
    }

    // If it's a relative path, make it relative to current domain
    if (cleanUrl.startsWith("/")) {
      return cleanUrl; // Next.js Link component handles relative paths
    }

    return cleanUrl;
  };

  // Helper function to remove URLs from text and replace with friendly message
  const removeUrlsFromText = (text: string): string => {
    const urls = detectUrls(text);
    if (urls.length === 0) return text;

    let modifiedText = text;

    // Remove markdown-style links [text](url)
    modifiedText = modifiedText.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, "");

    // Remove full URLs
    modifiedText = modifiedText.replace(/(https?:\/\/[^\s\)]+)/g, "");

    // Remove relative paths (but be careful not to remove legitimate text)
    modifiedText = modifiedText.replace(
      /\s+(\/[a-zA-Z0-9\-_\/]+)(\s+|\.|\,|$)/g,
      " ",
    );

    // Remove markdown bold markers
    modifiedText = modifiedText.replace(/\*\*/g, "");

    // Clean up extra whitespace and punctuation
    modifiedText = modifiedText
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s+\./g, ".")
      .replace(/\s+\,/g, ",");

    // Check if message already mentions sharing link
    const alreadyMentionsLink =
      modifiedText.includes("लिंक शेयर") ||
      modifiedText.includes("link share") ||
      modifiedText.includes("shared the link") ||
      modifiedText.includes("चैट में लिंक");

    if (alreadyMentionsLink) {
      return modifiedText;
    }

    // Add a friendly message if the text is now empty or very short
    if (modifiedText.length < 10) {
      return "मैंने चैट में लिंक शेयर कर दिया है। / I've shared the link in the chat.";
    }

    // Add the message at the end if there's content
    if (urls.length > 0 && modifiedText.length > 10) {
      modifiedText += " मैंने चैट में लिंक शेयर कर दिया है।";
    }

    return modifiedText;
  };

  // Start voice call
  const startCall = async () => {
    if (!vapi || !user) return;

    setIsConnecting(true);

    try {
      // Determine if we're in production (HTTPS) or development (HTTP)
      const isProduction = window.location.protocol === "https:";

      // Create assistant configuration
      const assistantConfig: any = {
        name: "Nagrik Infrastructure Assistant",
        model: {
          provider: "openai" as const,
          model: "gpt-4" as const,
          messages: [
            {
              role: "system" as const,
              content: `You are a helpful bilingual voice assistant for the Nagrik Infrastructure Monitoring System. You help citizens check report status, get statistics, and answer infrastructure questions.

LANGUAGE INSTRUCTIONS:
- Respond primarily in HINDI (हिंदी) by default
- If user speaks in English, respond in English
- Support code-mixing (Hinglish) naturally
- Detect language from user's speech and mirror it

CRITICAL LINK HANDLING RULES:
- NEVER speak URLs or links out loud in your voice response
- When providing a link, say "मैंने चैट में लिंक शेयर कर दिया है" (Hindi) or "I've shared the link in the chat" (English)
- Still include the actual URL in your text response for the chat display
- Example: "आप रिपोर्ट सबमिट कर सकते हैं। मैंने चैट में लिंक शेयर कर दिया है। [Link: /citizen/report]"

Current user ID: ${user.uid}

Be concise and clear. Keep responses under 3 sentences for voice. Always confirm actions before taking them.

When users ask about reports (रिपोर्ट के बारे में), you should:
- Ask for report ID if checking specific report (विशिष्ट रिपोर्ट जांचते समय रिपोर्ट आईडी पूछें)
- For general queries, provide summary information
- Guide users to submit reports and include the link
- Explain report statuses clearly: pending (लंबित), in-progress (प्रगति में), resolved (हल हो गया)

Available information:
- Report status: pending (लंबित), in-progress (प्रगति में), resolved (हल हो गया)
- Report categories: road damage (सड़क क्षति), streetlight (स्ट्रीटलाइट), drainage (जल निकासी), etc.
- User can have multiple reports (उपयोगकर्ता के पास कई रिपोर्ट हो सकती हैं)

RESPONSE EXAMPLES:
- Hindi: "आपकी सबसे हालिया रिपोर्ट मेन स्ट्रीट पर सड़क क्षति की है, जो 25 नवंबर को जमा की गई थी। वर्तमान स्थिति लंबित है।"
- English: "Your latest report is a road damage report at Main Street, submitted on November 25. The current status is pending."
- Hinglish: "Aapki latest report Main Street par road damage ki hai, jo 25 November ko submit hui thi. Current status pending hai."`,
            },
          ],
        },
        voice: {
          provider: "azure" as const,
          voiceId: "hi-IN-SwaraNeural", // Natural Hindi female voice
          // Alternative options:
          // "hi-IN-MadhurNeural" - Hindi male voice
          // "hi-IN-AnanyaNeural" - Hindi female voice (child)
          // "en-IN-NeerjaNeural" - English-Indian female (for Hinglish)
          // "en-IN-PrabhatNeural" - English-Indian male (for Hinglish)
        },
        // Multi-language transcription support
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "hi" as const, // Default to Hindi
          // Enable smart language detection and switching
          smartFormat: true,
          keywords: ["report", "status", "pending", "resolved", "submit"],
        },
        firstMessage:
          "नमस्ते! मैं आपकी नागरिक इंफ्रास्ट्रक्चर सहायक हूं। मैं आपकी कैसे मदद कर सकती हूं?",
        // Hindi: Hello! I'm your Nagrik Infrastructure Assistant. How can I help you?
      };

      // Only add serverUrl in production (HTTPS)
      if (isProduction) {
        assistantConfig.serverUrl = `${window.location.origin}/api/voice-assistant?userId=${user.uid}`;
        assistantConfig.serverUrlSecret = user.uid;
        assistantConfig.functions = [
          {
            name: "getReportStatus",
            description:
              "Get the current status and details of reports for the user",
            parameters: {
              type: "object",
              properties: {
                reportId: {
                  type: "string",
                  description: "The ID of the report to check (optional)",
                },
              },
            },
          },
          {
            name: "getLatestReport",
            description: "Get the most recent report submitted by the user",
            parameters: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "getPendingReports",
            description: "Get all pending reports for the user",
            parameters: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "getReportCount",
            description: "Get the total count of reports submitted by the user",
            parameters: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  description: "Optional status filter",
                  enum: ["pending", "in-progress", "resolved", "all"],
                },
              },
            },
          },
          {
            name: "getReportSubmitLink",
            description: "Get the link to submit a new report",
            parameters: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "queryInfrastructure",
            description: "Ask questions about infrastructure issues using RAG",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The infrastructure question",
                },
              },
              required: ["query"],
            },
          },
        ];
      } else {
        // In development, add a note about limited functionality
        console.log("🎤 Voice Assistant running in development mode (HTTP)");
        console.log("⚠️  Function calling disabled - HTTPS required by Vapi");
        addSystemMessage(
          "Voice assistant connected in demo mode. Function calling requires HTTPS.",
        );
      }

      await vapi.start(assistantConfig);
    } catch (error) {
      console.error("Failed to start call:", error);
      addSystemMessage("Failed to connect. Please try again.");
      setIsConnecting(false);
    }
  };

  // End voice call
  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (vapi) {
      if (isMuted) {
        vapi.setMuted(false);
      } else {
        vapi.setMuted(true);
      }
      setIsMuted(!isMuted);
    }
  };

  // Render floating button when closed
  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-24 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-80 hover:opacity-100"
          title="Voice Assistant"
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Render voice assistant panel
  return (
    <div className={cn("fixed bottom-6 right-24 z-50", className)}>
      <Card
        className={cn(
          "w-96 shadow-2xl transition-all duration-300 flex flex-col",
          isMinimized ? "h-16" : "h-[600px]",
        )}
      >
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="h-4 w-4" />
              Voice Assistant
              {isCallActive && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  Live
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
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
                onClick={() => {
                  setIsOpen(false);
                  if (isCallActive) endCall();
                }}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        {!isMinimized && (
          <>
            <CardContent className="flex-1 p-4 flex flex-col overflow-hidden min-h-0">
              {/* Messages */}
              <div className="flex-1 mb-4 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col",
                          message.type === "user" ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 max-w-[80%]",
                            message.type === "user"
                              ? "bg-purple-600 text-white"
                              : message.type === "assistant"
                                ? "bg-gray-100 text-gray-900"
                                : "bg-yellow-100 text-yellow-900 text-xs",
                          )}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Display URLs as plain text for debugging */}
                        {message.urls && message.urls.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.urls.map((url, index) => (
                              <div
                                key={`${message.id}-url-${index}`}
                                className="text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1"
                              >
                                <Link
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {url}
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Current transcript */}
                    {currentTranscript && (
                      <div className="flex justify-end">
                        <div className="bg-purple-400 text-white rounded-lg px-3 py-2 max-w-[80%] opacity-75">
                          <div className="text-sm">{currentTranscript}</div>
                          <div className="text-xs opacity-70 mt-1">
                            Speaking...
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Controls */}
              <div className="border-t pt-4">
                {/* Volume Level Indicator */}
                {isCallActive && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Volume2 className="h-3 w-3" />
                      <span>Volume Level</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-100"
                        style={{
                          width: `${Math.min(volumeLevel * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Call Controls */}
                <div className="flex items-center justify-center gap-3">
                  {!isCallActive ? (
                    <Button
                      onClick={startCall}
                      disabled={isConnecting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <PhoneCall className="h-5 w-5 mr-2" />
                          Start Voice Chat
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={toggleMute}
                        variant="outline"
                        size="lg"
                        className="flex-1"
                      >
                        {isMuted ? (
                          <>
                            <MicOff className="h-5 w-5 mr-2" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <Mic className="h-5 w-5 mr-2" />
                            Mute
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={endCall}
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                      >
                        <PhoneOff className="h-5 w-5 mr-2" />
                        End Call
                      </Button>
                    </>
                  )}
                </div>

                {/* Quick Tips - Bilingual */}
                {!isCallActive && messages.length === 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs font-semibold text-purple-900 mb-2">
                      🎙️ कहने की कोशिश करें / Try saying:
                    </div>
                    <div className="space-y-1 text-xs text-purple-700">
                      <div>• "मेरी रिपोर्ट का स्टेटस क्या है?"</div>
                      <div>• "मैंने कितनी रिपोर्ट जमा की हैं?"</div>
                      <div>• "मुझे मेरी पेंडिंग रिपोर्ट दिखाओ"</div>
                      <div>• "नई रिपोर्ट कैसे सबमिट करूं?"</div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-600">
                      💬 हिंदी, English, या Hinglish में बोलें
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
