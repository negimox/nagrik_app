# MongoDB RAG Integration Documentation

## Overview

This document describes the MongoDB RAG (Retrieval-Augmented Generation) integration that enables AI-powered analysis of historical infrastructure reports stored in MongoDB.

## Architecture

### Core Components

1. **MongoDB Integration** (`lib/mongodb-rag.ts`)

   - Connects to MongoDB reports collection
   - Processes report documents into knowledge vectors
   - Provides search and retrieval capabilities

2. **RAG Utilities** (`lib/rag-utils.ts`)

   - Enhanced knowledge base with MongoDB support
   - Vector embeddings and similarity search
   - Context-aware prompt generation

3. **API Endpoints** (`app/api/rag/`)

   - `/api/rag` - Main RAG query endpoint
   - `/api/rag/analytics` - MongoDB reports analytics

4. **React Components**
   - `RAGReportsAnalyzer` - Interactive query interface (demo)
   - `AuthorityRAGChatBot` - Floating chat bot for authority users
   - `useMongoRAG` hook - React integration

## Data Structure

### MongoDB Report Document

```typescript
interface ReportDocument {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    ward?: string;
    district?: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    department: string;
  };
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags?: string[];
  votes?: number;
}
```

## Features

### 1. Contextual Queries

- Ask questions about historical reports
- Filter by location, category, or time period
- Get AI-powered insights and patterns

### 2. Analytics Integration

- Overview of total reports, resolved issues, pending cases
- Location-based statistics
- Category distribution analysis

### 3. Smart Context Building

- Automatic retrieval of relevant historical reports
- Similarity-based matching
- Context-aware prompt engineering

## Usage Examples

### Basic Query

```typescript
const { queryWithReportsContext } = useMongoRAG();

const result = await queryWithReportsContext(
  "What are the most common infrastructure issues?"
);
```

### Contextual Query

```typescript
const result = await queryWithReportsContext(
  "Show me pothole patterns",
  "Downtown", // location
  "Roads & Transportation" // category
);
```

### Analytics

```typescript
const { fetchAnalytics, analytics } = useMongoRAG();

useEffect(() => {
  fetchAnalytics();
}, []);

// Access analytics data
console.log(analytics.totalReports);
console.log(analytics.resolvedReports);
```

## API Endpoints

### POST /api/rag

Query the RAG system with MongoDB context.

**Request:**

```json
{
  "query": "What are common electrical issues?",
  "systemContext": "You are an infrastructure analyst...",
  "temperature": 0.2
}
```

**Response:**

```json
{
  "response": "Based on historical reports...",
  "context": [...],
  "metadata": {
    "sources": 5,
    "confidence": 0.85
  }
}
```

### GET /api/rag/analytics

Get MongoDB reports analytics.

**Response:**

```json
{
  "totalReports": 1234,
  "resolvedReports": 987,
  "pendingReports": 247,
  "uniqueLocations": 156,
  "categoryDistribution": {...},
  "recentTrends": {...}
}
```

## Configuration

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/report_dashboard
MONGODB_DB_NAME=report_dashboard

# Google AI
GOOGLE_AI_API_KEY=your_api_key

# Vector Database (optional)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### MongoDB Setup

1. Ensure the `reports` collection exists
2. Create indexes for better performance:
   ```javascript
   db.reports.createIndex({ "location.coordinates": "2dsphere" });
   db.reports.createIndex({ category: 1 });
   db.reports.createIndex({ status: 1 });
   db.reports.createIndex({ createdAt: -1 });
   ```

## Integration Steps

### 1. Setup MongoDB Connection

```typescript
import { MongoDBReportsKnowledgeProvider } from "@/lib/mongodb-rag";

const mongoProvider = new MongoDBReportsKnowledgeProvider();
await mongoProvider.initialize();
```

### 2. Use in Components

```tsx
import { RAGReportsAnalyzer } from "@/components/rag-reports-analyzer";

export default function AnalysisPage() {
  return <RAGReportsAnalyzer />;
}
```

### 3. Custom Queries

```typescript
import { useMongoRAG } from "@/hooks/use-rag";

const { queryWithReportsContext } = useMongoRAG();

const handleAnalysis = async () => {
  const result = await queryWithReportsContext(userQuestion);
  setResponse(result?.response);
};
```

## Advanced Features

### Custom Knowledge Processing

```typescript
// Override knowledge processing
class CustomMongoProvider extends MongoDBReportsKnowledgeProvider {
  protected processDocument(doc: ReportDocument): string {
    // Custom processing logic
    return `${doc.title}: ${doc.description} (${doc.category})`;
  }
}
```

### Context Enhancement

```typescript
// Add custom context
const enhancedQuery = `
${userQuery}

Context: Historical reports show patterns in:
- Peak reporting times: weekdays 8-10 AM
- Common locations: downtown, residential areas
- Resolution times: 3-7 days average
`;
```

## Performance Considerations

1. **Vector Embeddings**: Consider caching embeddings for frequently accessed reports
2. **MongoDB Indexes**: Ensure proper indexing for location and category queries
3. **Rate Limiting**: Implement rate limiting for AI API calls
4. **Batch Processing**: Process reports in batches for large datasets

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**

   - Check MONGODB_URI environment variable
   - Verify network connectivity
   - Ensure proper authentication

2. **AI API Errors**

   - Verify GOOGLE_AI_API_KEY
   - Check API quota limits
   - Monitor request rate limits

3. **Vector Search Performance**
   - Consider using dedicated vector database
   - Implement embedding caching
   - Optimize query complexity

### Debug Mode

Enable debug logging:

```typescript
const mongoProvider = new MongoDBReportsKnowledgeProvider({
  debug: true,
});
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live report updates
2. **Advanced Analytics**: Machine learning patterns and predictions
3. **Multi-language Support**: Internationalization for global deployments
4. **Mobile Optimization**: Enhanced mobile interface for field workers

## Examples

### Demo Page

Visit `/citizen/mongo-rag-demo` to see the MongoDB RAG integration in action.

### Sample Queries

- "What are the most frequent issues in downtown areas?"
- "Show me the average resolution time for electrical problems"
- "Which locations have the highest number of unresolved reports?"
- "Compare infrastructure issues between different districts"
- "What are the seasonal patterns in infrastructure reports?"

## Security Considerations

1. **Data Privacy**: Ensure sensitive information is properly anonymized
2. **Access Control**: Implement proper authentication and authorization
3. **API Security**: Rate limiting and input validation
4. **MongoDB Security**: Use proper connection security and user permissions

## Authority Chat Bot Integration

### Overview
The MongoDB RAG system is now integrated into a floating chat bot interface specifically designed for authority users. This provides seamless access to AI-powered infrastructure analysis from any authority dashboard page.

### Features
- **Floating Interface**: Always accessible from bottom-right corner
- **Real-Time Analytics**: Live overview of report statistics in chat header
- **Interactive Conversations**: Natural language queries with AI responses
- **Source Attribution**: View which reports contributed to each response
- **Quick Questions**: Pre-configured queries for common analysis tasks
- **Minimizable Design**: Reduces to header-only view when not actively used

### Access
- Available exclusively on authority dashboard pages (`/authority/*`)
- Automatically loads with the authority layout
- No additional configuration required

### Usage
1. Navigate to any authority page
2. Click the blue chat icon in bottom-right corner
3. Type questions about infrastructure reports
4. Get AI-powered insights based on historical data

### Sample Queries
- "What are the most common infrastructure issues?"
- "Show me resolution patterns for electrical problems"
- "Which areas have the highest priority issues?"
- "Compare issue patterns by category"

See `AUTHORITY-RAG-CHATBOT.md` for detailed chat bot documentation.
