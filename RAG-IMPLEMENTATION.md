# RAG-Enhanced Gemini AI Implementation

This document describes the implementation of Retrieval-Augmented Generation (RAG) with Google Gemini AI for enhanced infrastructure analysis and contextual responses.

## Overview

The RAG system enhances the existing Gemini AI capabilities by combining real-time AI responses with a knowledge base of curated infrastructure information. This provides more accurate, contextual, and actionable insights for infrastructure reporting and analysis.

## Architecture

### Core Components

1. **Knowledge Base Management** (`lib/rag-utils.ts`)

   - In-memory document storage with vector embeddings
   - Semantic search using cosine similarity
   - Document categorization and metadata management

2. **Vector Database Integration** (`lib/vector-db.ts`)

   - Abstract interface for vector databases
   - ChromaDB and Supabase implementations
   - Production-ready scaling options

3. **API Layer** (`app/api/rag/route.ts`)

   - RESTful endpoints for RAG operations
   - Server-side knowledge base management
   - Secure API key handling

4. **React Hooks** (`hooks/use-rag.tsx`)

   - Easy integration with React components
   - State management for async operations
   - Error handling and loading states

5. **Enhanced Components**
   - `RAGImageDetector`: Advanced image analysis with contextual insights
   - `EnhancedPrompt`: Drop-in replacement for the original Gemini prompt component

## Features

### 🧠 Enhanced AI Analysis

- **Contextual Prompting**: AI responses include relevant knowledge base context
- **Multi-modal Analysis**: Combines image analysis with text-based knowledge
- **Confidence Scoring**: Provides confidence levels based on knowledge relevance

### 📚 Knowledge Base Management

- **Default Infrastructure Knowledge**: Pre-loaded with expert infrastructure information
- **Custom Documents**: Add domain-specific knowledge documents
- **Categorization**: Organize knowledge by infrastructure types, assessment guidelines, etc.
- **Vector Search**: Semantic similarity search for relevant context retrieval

### 🔍 Advanced Image Analysis

- **RAG-Enhanced Detection**: Object detection with contextual explanations
- **Severity Assessment**: AI-driven priority classification using knowledge base
- **Detailed Insights**: Comprehensive analysis with actionable recommendations

### 🛠️ Production-Ready Features

- **Vector Database Support**: ChromaDB, Supabase, and custom implementations
- **Scalable Architecture**: Designed for production workloads
- **Error Handling**: Robust error management and fallback mechanisms
- **Performance Optimization**: Efficient embedding generation and search

## Usage

### Basic RAG Query

```typescript
import { useRAGQuery } from "@/hooks/use-rag";

function MyComponent() {
  const { query, isLoading, response, error } = useRAGQuery();

  const handleAsk = async () => {
    const result = await query(
      "What are the best practices for reporting potholes?",
      "You are an infrastructure expert.",
      0.3 // temperature
    );
  };

  return (
    <div>
      {response && (
        <div>
          <p>{response.answer}</p>
          <p>Confidence: {(response.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

### Enhanced Image Analysis

```typescript
import { useRAGImageAnalysis } from "@/hooks/use-rag";

function ImageAnalyzer() {
  const { analyzeImage, isLoading, analysis, contextualInsights } =
    useRAGImageAnalysis();

  const handleAnalyze = async (file: File) => {
    const result = await analyzeImage(file, "Focus on safety hazards", 0.2);

    if (result) {
      console.log("Detected objects:", result.analysis.detected_objects);
      console.log("Contextual insights:", result.contextualInsights);
    }
  };

  return <div>{/* Image upload and analysis UI */}</div>;
}
```

### Knowledge Management

```typescript
import { useKnowledgeBase } from "@/hooks/use-rag";

function KnowledgeManager() {
  const { documents, addDocument, fetchDocuments } = useKnowledgeBase();

  const handleAddDocument = async () => {
    await addDocument(
      "Custom Safety Guidelines",
      "Detailed safety procedures for infrastructure inspection...",
      "safety",
      { author: "Expert", priority: "high" }
    );
  };

  return (
    <div>
      <p>{documents.length} documents in knowledge base</p>
      {/* Document management UI */}
    </div>
  );
}
```

## API Endpoints

### POST /api/rag

Query the RAG system with a question

```json
{
  "query": "How should I assess the severity of a pothole?",
  "systemContext": "You are an infrastructure expert.",
  "temperature": 0.3
}
```

Response:

```json
{
  "answer": "To assess pothole severity, consider size, depth, location...",
  "sources": [
    {
      "id": "severity-assessment",
      "title": "Infrastructure Issue Severity Guidelines",
      "category": "assessment"
    }
  ],
  "confidence": 0.87
}
```

### GET /api/rag

Get knowledge base statistics

Response:

```json
{
  "documents": [
    {
      "id": "infrastructure-types",
      "title": "Common Infrastructure Types",
      "category": "infrastructure",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 5
}
```

### PUT /api/rag

Add a new knowledge document

```json
{
  "title": "Custom Procedures",
  "content": "Detailed procedures for...",
  "category": "procedures",
  "metadata": { "author": "Expert" }
}
```

## Knowledge Base

### Default Categories

1. **Infrastructure** - Types of infrastructure elements
2. **Assessment** - Severity guidelines and evaluation criteria
3. **Reporting** - Best practices for documentation
4. **Diagnosis** - Common problems and their causes
5. **AI Detection** - Guidelines for AI-assisted analysis

### Adding Custom Knowledge

You can extend the knowledge base with domain-specific information:

```typescript
import { addKnowledgeDocument } from "@/lib/rag-utils";

await addKnowledgeDocument(
  "Local Compliance Requirements",
  "Specific regulations and requirements for your jurisdiction...",
  "compliance",
  {
    jurisdiction: "Local City",
    effectiveDate: "2024-01-01",
    priority: "high",
  }
);
```

## Production Deployment

### Vector Database Setup

For production deployments, use a dedicated vector database:

#### ChromaDB

```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

#### Supabase

```sql
-- Enable vector extension
CREATE EXTENSION vector;

-- Create knowledge documents table
CREATE TABLE knowledge_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  metadata JSONB,
  embedding vector(384),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create vector similarity function
CREATE OR REPLACE FUNCTION search_knowledge_documents(
  query_embedding vector(384),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id text,
  title text,
  content text,
  category text,
  metadata jsonb,
  created_at timestamp,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.title,
    kd.content,
    kd.category,
    kd.metadata,
    kd.created_at,
    1 - (kd.embedding <=> query_embedding) as similarity
  FROM knowledge_documents kd
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Environment Variables

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# For ChromaDB
CHROMADB_URL=http://localhost:8000

# For Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Vector database provider
VECTOR_DB_PROVIDER=chromadb
```

### Configuration

```typescript
// lib/config.ts
export const ragConfig = {
  vectorDB: {
    provider: process.env.VECTOR_DB_PROVIDER as "chromadb" | "supabase",
    endpoint: process.env.CHROMADB_URL || process.env.SUPABASE_URL,
    apiKey: process.env.SUPABASE_ANON_KEY,
    collection: "infrastructure_knowledge",
  },
  embeddingModel: "text-embedding-004",
  maxContextLength: 4000,
  chunkSize: 1000,
  chunkOverlap: 200,
};
```

## Performance Considerations

### Embedding Generation

- Cache embeddings to avoid regeneration
- Use batch processing for multiple documents
- Consider using smaller embedding models for faster processing

### Vector Search

- Index your vector database appropriately
- Use approximate nearest neighbor search for large datasets
- Implement pagination for large result sets

### Memory Management

- Clear unused embeddings from memory
- Implement LRU cache for frequently accessed documents
- Monitor memory usage in production

## Testing

### Unit Tests

```typescript
import { knowledgeBase, generateRAGResponse } from "@/lib/rag-utils";

describe("RAG System", () => {
  it("should retrieve relevant documents", async () => {
    const docs = await knowledgeBase.search("pothole assessment");
    expect(docs.length).toBeGreaterThan(0);
  });

  it("should generate contextual responses", async () => {
    const response = await generateRAGResponse(
      "How do I report a pothole?",
      "You are a helpful assistant."
    );
    expect(response.answer).toContain("pothole");
    expect(response.confidence).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe("RAG API", () => {
  it("should handle RAG queries", async () => {
    const response = await fetch("/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "What are common infrastructure problems?",
      }),
    });

    const data = await response.json();
    expect(data.answer).toBeDefined();
    expect(data.sources).toBeInstanceOf(Array);
  });
});
```

## Troubleshooting

### Common Issues

1. **Empty RAG Responses**

   - Check if knowledge base is initialized
   - Verify embedding generation is working
   - Ensure similarity threshold is appropriate

2. **Poor Retrieval Quality**

   - Review document chunking strategy
   - Adjust similarity thresholds
   - Improve document quality and relevance

3. **Performance Issues**
   - Monitor embedding generation time
   - Optimize vector search parameters
   - Consider caching strategies

### Debug Mode

Enable debug logging:

```typescript
// Set in environment or config
process.env.RAG_DEBUG = "true";

// This will log:
// - Retrieved documents for each query
// - Similarity scores
// - Generated prompts
// - API response times
```

## Future Enhancements

### Planned Features

- **Multi-language Support**: Knowledge base in multiple languages
- **Advanced Chunking**: Semantic document splitting
- **Graph RAG**: Knowledge graphs for better context understanding
- **Real-time Learning**: Dynamic knowledge base updates
- **Custom Models**: Fine-tuned models for infrastructure domain

### Integration Opportunities

- **External APIs**: Connect to municipal databases
- **IoT Sensors**: Real-time infrastructure monitoring data
- **GIS Systems**: Geographic context for location-based insights
- **Maintenance Systems**: Integration with work order management

## Contributing

When adding new knowledge or features:

1. Follow the established document structure
2. Include metadata for better categorization
3. Test RAG responses with new knowledge
4. Update relevant documentation
5. Consider performance impact

## License

This RAG implementation is part of the infrastructure reporting system and follows the same licensing terms as the main project.
