/**
 * Enhanced Gemini Prompt component with RAG capabilities
 * This replaces the original Prompt.tsx with context-aware AI responses
 */

import { GoogleGenAI } from "@google/genai";
import { useAtom } from "jotai";
import getStroke from "perfect-freehand";
import { useState, useEffect } from "react";
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  CustomPromptsAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  LinesAtom,
  PointsAtom,
  PromptsAtom,
  ShareStream,
  TemperatureAtom,
  VideoRefAtom,
} from "./atoms";
import { lineOptions } from "./consts";
import { getSvgPathFromStroke, loadImage } from "./utils";
import {
  generateRAGResponse,
  analyzeImageWithContext,
  initializeKnowledgeBase,
  addKnowledgeDocument,
  knowledgeBase,
  type RAGResponse,
} from "../lib/rag-utils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function EnhancedPrompt() {
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [showCustomPrompt] = useState(false);
  const [targetPrompt, setTargetPrompt] = useState("infrastructure issues");
  const [labelPrompt, setLabelPrompt] = useState("");
  const [showRawPrompt, setShowRawPrompt] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [contextualQuery, setContextualQuery] = useState("");
  const [ragResponse, setRagResponse] = useState<RAGResponse | null>(null);
  const [isKnowledgeBaseReady, setIsKnowledgeBaseReady] = useState(false);
  const [showKnowledgeManager, setShowKnowledgeManager] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("custom");

  const [prompts, setPrompts] = useAtom(PromptsAtom);
  const [customPrompts, setCustomPrompts] = useAtom(CustomPromptsAtom);

  const is2d = detectType === "2D bounding boxes";

  // Initialize knowledge base on component mount
  useEffect(() => {
    const initKB = async () => {
      try {
        await initializeKnowledgeBase();
        setIsKnowledgeBaseReady(true);
        console.log("RAG Knowledge Base initialized successfully");
      } catch (error) {
        console.error("Failed to initialize knowledge base:", error);
        setIsKnowledgeBaseReady(false);
      }
    };

    initKB();
  }, []);

  const get2dPrompt = () =>
    `Detect ${targetPrompt}, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in "box_2d" and ${
      labelPrompt || "a text label"
    } in "label".`;

  const handleAddKnowledgeDocument = async () => {
    if (!newDocTitle || !newDocContent) return;

    try {
      const docId = await addKnowledgeDocument(
        newDocTitle,
        newDocContent,
        newDocCategory,
        { addedBy: "user", addedAt: new Date().toISOString() }
      );

      console.log(`Added knowledge document: ${docId}`);
      setNewDocTitle("");
      setNewDocContent("");
      setNewDocCategory("custom");
      alert("Knowledge document added successfully!");
    } catch (error) {
      console.error("Error adding knowledge document:", error);
      alert("Failed to add knowledge document");
    }
  };

  const handleRAGQuery = async () => {
    if (!contextualQuery || !isKnowledgeBaseReady) return;

    try {
      const response = await generateRAGResponse(
        contextualQuery,
        "You are an expert infrastructure analyst. Provide detailed, actionable insights based on your knowledge base.",
        { temperature: temperature }
      );
      setRagResponse(response);
    } catch (error) {
      console.error("Error generating RAG response:", error);
      alert("Failed to generate contextual response");
    }
  };

  async function handleSend() {
    let activeDataURL;
    const maxSize = 640;
    const copyCanvas = document.createElement("canvas");
    const ctx = copyCanvas.getContext("2d")!;

    if (stream) {
      // screenshare
      const video = videoRef.current!;
      const scale = Math.min(
        maxSize / video.videoWidth,
        maxSize / video.videoHeight
      );
      copyCanvas.width = video.videoWidth * scale;
      copyCanvas.height = video.videoHeight * scale;
      ctx.drawImage(
        video,
        0,
        0,
        video.videoWidth * scale,
        video.videoHeight * scale
      );
    } else if (imageSrc) {
      const image = await loadImage(imageSrc);
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      copyCanvas.width = image.width * scale;
      copyCanvas.height = image.height * scale;
      console.log(copyCanvas);
      ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
    }
    activeDataURL = copyCanvas.toDataURL("image/png");

    if (lines.length > 0) {
      for (const line of lines) {
        const p = new Path2D(
          getSvgPathFromStroke(
            getStroke(
              line[0].map(([x, y]: [number, number]) => [
                x * copyCanvas.width,
                y * copyCanvas.height,
                0.5,
              ]),
              lineOptions
            )
          )
        );
        ctx.fillStyle = line[1];
        ctx.fill(p);
      }
      activeDataURL = copyCanvas.toDataURL("image/png");
    }

    // Enhanced prompt with RAG context if enabled
    let enhancedPrompt = is2d ? get2dPrompt() : prompts[detectType].join(" ");

    if (useRAG && isKnowledgeBaseReady) {
      try {
        // Convert canvas to File object for RAG analysis
        const blob = await new Promise<Blob>((resolve) => {
          copyCanvas.toBlob((blob) => resolve(blob!), "image/png");
        });
        const file = new File([blob], "image.png", { type: "image/png" });

        // Get contextual analysis
        const contextualAnalysis = await analyzeImageWithContext(
          file,
          `Infrastructure analysis for ${targetPrompt}`,
          temperature
        );

        // Add contextual insights to the prompt
        const contextualInfo = contextualAnalysis.contextualInsights.answer;
        enhancedPrompt = `${enhancedPrompt}

CONTEXTUAL KNOWLEDGE:
${contextualInfo}

Use this contextual knowledge to provide more accurate and detailed analysis of the infrastructure elements in the image.`;

        console.log("Enhanced prompt with RAG context:", enhancedPrompt);
      } catch (error) {
        console.error("Error adding RAG context:", error);
        // Continue with original prompt if RAG fails
      }
    }

    setHoverEntered(false);
    const config: {
      temperature: number;
      thinkingConfig?: { thinkingBudget: number };
    } = {
      temperature,
    };

    // All tasks except for segmentation use 2.0 Flash (for now).
    let model = "models/gemini-2.0-flash";
    if (detectType === "Segmentation masks") {
      // Segmentation uses 2.5 Flash.
      model = "models/gemini-2.5-flash-preview-04-17";
      // Disable thinking when using 2.5 Flash.
      config["thinkingConfig"] = { thinkingBudget: 0 };
    }

    let response = (
      await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: activeDataURL.replace("data:image/png;base64,", ""),
                  mimeType: "image/png",
                },
              },
              { text: enhancedPrompt },
            ],
          },
        ],
        config,
      })
    ).text;

    if (response && response.includes("```json")) {
      response = response.split("```json")[1].split("```")[0];
    }

    if (!response) {
      throw new Error("No response received from AI model");
    }

    const parsedResponse = JSON.parse(response);

    // Process response based on detection type (same as original)
    if (detectType === "2D bounding boxes") {
      const formattedBoxes = parsedResponse.map(
        (box: { box_2d: [number, number, number, number]; label: string }) => {
          const [ymin, xmin, ymax, xmax] = box.box_2d;
          return {
            x: xmin / 1000,
            y: ymin / 1000,
            width: (xmax - xmin) / 1000,
            height: (ymax - ymin) / 1000,
            label: box.label,
          };
        }
      );
      setHoverEntered(false);
      setBoundingBoxes2D(formattedBoxes);
    } else if (detectType === "Points") {
      const formattedPoints = parsedResponse.map(
        (point: { point: [number, number]; label: string }) => {
          return {
            point: {
              x: point.point[1] / 1000,
              y: point.point[0] / 1000,
            },
            label: point.label,
          };
        }
      );
      setPoints(formattedPoints);
    } else if (detectType === "Segmentation masks") {
      const formattedBoxes = parsedResponse.map(
        (box: {
          box_2d: [number, number, number, number];
          label: string;
          mask: ImageData;
        }) => {
          const [ymin, xmin, ymax, xmax] = box.box_2d;
          return {
            x: xmin / 1000,
            y: ymin / 1000,
            width: (xmax - xmin) / 1000,
            height: (ymax - ymin) / 1000,
            label: box.label,
            imageData: box.mask,
          };
        }
      );
      setHoverEntered(false);
      const sortedBoxes = formattedBoxes.sort(
        (a: any, b: any) => b.width * b.height - a.width * a.height
      );
      setBoundingBoxMasks(sortedBoxes);
    } else {
      const formattedBoxes = parsedResponse.map(
        (box: {
          box_3d: [
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number
          ];
          label: string;
        }) => {
          const center = box.box_3d.slice(0, 3);
          const size = box.box_3d.slice(3, 6);
          const rpy = box.box_3d
            .slice(6)
            .map((x: number) => (x * Math.PI) / 180);
          return {
            center,
            size,
            rpy,
            label: box.label,
          };
        }
      );
      setBoundingBoxes3D(formattedBoxes);
    }
  }

  return (
    <div className="flex grow flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="uppercase">
          Enhanced Prompt with RAG:{" "}
          {detectType === "Segmentation masks"
            ? "Gemini 2.5 Flash (no thinking)"
            : "Gemini 2.0 Flash"}
          {useRAG && isKnowledgeBaseReady && (
            <span className="ml-2 text-green-600 text-sm">
              ✓ Knowledge Base Active
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex gap-2 select-none text-sm">
            <input
              type="checkbox"
              checked={useRAG}
              onChange={() => setUseRAG(!useRAG)}
              disabled={!isKnowledgeBaseReady}
            />
            <div>Use RAG Context</div>
          </label>
          <label className="flex gap-2 select-none text-sm">
            <input
              type="checkbox"
              checked={showRawPrompt}
              onChange={() => setShowRawPrompt(!showRawPrompt)}
            />
            <div>show raw prompt</div>
          </label>
          <button
            className="text-sm px-2 py-1 bg-gray-200 rounded"
            onClick={() => setShowKnowledgeManager(!showKnowledgeManager)}
          >
            Manage Knowledge
          </button>
        </div>
      </div>

      {/* Knowledge Management Panel */}
      {showKnowledgeManager && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h3 className="font-semibold">Knowledge Base Management</h3>

          {/* Add New Document */}
          <div className="space-y-2">
            <h4 className="font-medium">Add Knowledge Document</h4>
            <input
              type="text"
              placeholder="Document title"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <select
              value={newDocCategory}
              onChange={(e) => setNewDocCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="custom">Custom</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="assessment">Assessment</option>
              <option value="reporting">Reporting</option>
              <option value="diagnosis">Diagnosis</option>
            </select>
            <textarea
              placeholder="Document content"
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              className="w-full p-2 border rounded h-20"
            />
            <button
              onClick={handleAddKnowledgeDocument}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={!newDocTitle || !newDocContent}
            >
              Add Document
            </button>
          </div>

          {/* Knowledge Base Stats */}
          <div className="text-sm text-gray-600">
            Knowledge Base: {knowledgeBase.getAllDocuments().length} documents
            loaded
          </div>
        </div>
      )}

      {/* RAG Query Interface */}
      {useRAG && isKnowledgeBaseReady && (
        <div className="border rounded-lg p-3 bg-blue-50 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question about infrastructure (optional - for additional context)"
              value={contextualQuery}
              onChange={(e) => setContextualQuery(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleRAGQuery}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={!contextualQuery}
            >
              Get Context
            </button>
          </div>

          {ragResponse && (
            <div className="bg-white p-3 rounded border">
              <div className="font-medium mb-2">
                Contextual Insights (Confidence:{" "}
                {(ragResponse.confidence * 100).toFixed(1)}%)
              </div>
              <div className="text-sm mb-2">{ragResponse.answer}</div>
              {ragResponse.sources.length > 0 && (
                <details className="text-xs text-gray-600">
                  <summary>Sources ({ragResponse.sources.length})</summary>
                  <ul className="mt-1 space-y-1">
                    {ragResponse.sources.map((source, idx) => (
                      <li key={idx}>
                        • {source.title} ({source.category})
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <div className="w-full flex flex-col">
        {showCustomPrompt ? (
          <textarea
            className="w-full bg-[var(--input-color)] rounded-lg resize-none p-4"
            value={customPrompts[detectType]}
            onChange={(e) => {
              const value = e.target.value;
              const newPrompts = { ...customPrompts };
              newPrompts[detectType] = value;
              setCustomPrompts(newPrompts);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        ) : showRawPrompt ? (
          <div className="mb-2 text-[var(--text-color-secondary)]">
            {is2d
              ? get2dPrompt()
              : detectType === "Segmentation masks"
              ? prompts[detectType].slice(0, 2).join(" ") +
                prompts[detectType].slice(2).join("")
              : prompts[detectType].join(" ")}
            {useRAG && isKnowledgeBaseReady && (
              <div className="mt-2 text-green-600">
                + Enhanced with RAG contextual knowledge
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div>{prompts[detectType][0]}:</div>
            <textarea
              className="w-full bg-[var(--input-color)] rounded-lg resize-none p-4"
              placeholder="What kind of infrastructure issues do you want to detect?"
              rows={1}
              value={is2d ? targetPrompt : prompts[detectType][1]}
              onChange={(e) => {
                if (is2d) {
                  setTargetPrompt(e.target.value);
                } else {
                  const value = e.target.value;
                  const newPrompts = { ...prompts };
                  newPrompts[detectType][1] = value;
                  setPrompts(newPrompts);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            {is2d && (
              <>
                <div>Label each one with: (optional)</div>
                <textarea
                  className="w-full bg-[var(--input-color)] rounded-lg resize-none p-4"
                  rows={1}
                  placeholder="How do you want to label the infrastructure issues?"
                  value={labelPrompt}
                  onChange={(e) => setLabelPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <button
          className="bg-[#3B68FF] px-12 !text-white !border-none"
          onClick={handleSend}
        >
          {useRAG && isKnowledgeBaseReady ? "Send with RAG Context" : "Send"}
        </button>
        <label className="flex items-center gap-2">
          temperature:
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
          {temperature.toFixed(2)}
        </label>
      </div>
    </div>
  );
}

// Export both components for backward compatibility
export const Prompt = EnhancedPrompt;
