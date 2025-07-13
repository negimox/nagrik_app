# Authority RAG Chat Bot Documentation

## Overview

The Authority RAG Chat Bot is a floating chat interface that provides AI-powered analysis of infrastructure reports directly within the authority dashboard. It uses the MongoDB RAG integration to deliver contextual insights based on historical report data.

## Features

### 🤖 **AI-Powered Analysis**

- Real-time analysis of infrastructure reports using Gemini 2.0 Flash
- Context-aware responses based on historical data
- Intelligent pattern recognition and trend analysis

### 📊 **Real-Time Analytics**

- Live overview of total reports, resolved issues, and pending cases
- Quick access to key performance metrics
- Visual indicators for data health

### 💬 **Interactive Chat Interface**

- Floating chat bubble for easy access from any authority page
- Minimizable interface to reduce screen clutter
- Message history with timestamps and source attribution

### 🎯 **Quick Questions**

- Pre-configured questions for common analysis tasks
- One-click access to frequently requested insights
- Smart suggestions based on current data patterns

## Access & Availability

### **Authority Dashboard Only**

- Available exclusively to authority users
- Accessible from any page within the `/authority` section
- Automatically loads when navigating to authority pages

### **Floating Interface**

- Fixed position at bottom-right corner
- Stays accessible while browsing different authority pages
- Doesn't interfere with page content

## Usage Guide

### **Opening the Chat Bot**

1. Navigate to any authority dashboard page
2. Look for the blue chat icon in the bottom-right corner
3. Click the icon to open the chat interface

### **Basic Interaction**

1. Type your question in the input field
2. Press Enter or click the Send button
3. Wait for AI analysis and response
4. View sources and related information

### **Sample Questions**

```
• What are the most common infrastructure issues?
• Show me resolution patterns for electrical problems
• Which areas have the highest priority issues?
• Compare issue patterns by category
• What's the average resolution time for water issues?
• Show me trends for the last 30 days
```

### **Advanced Features**

- **Minimize/Maximize**: Use the minimize button to reduce the chat to header only
- **Clear Chat**: Remove all messages to start fresh
- **Source Attribution**: Click on source badges to see related reports
- **Analytics Overview**: View real-time statistics in the chat header

## Technical Integration

### **MongoDB Integration**

- Connects to your MongoDB reports collection
- Processes historical data for context building
- Provides real-time analytics and insights

### **RAG Architecture**

- Retrieval-Augmented Generation for accurate responses
- Vector search through knowledge base
- Context-aware prompt engineering

### **Performance Optimization**

- Lazy loading of chat interface
- Efficient message handling
- Minimal resource usage when minimized

## Chat Bot States

### **Closed State**

- Shows as floating blue chat icon
- Minimal screen space usage
- Always accessible for quick activation

### **Open State**

- Full chat interface with message history
- Input field for new questions
- Analytics overview in header

### **Minimized State**

- Shows only the header with analytics
- Quick access to maximize button
- Preserves chat history

### **Loading State**

- Shows typing indicator during AI processing
- Prevents duplicate requests
- Clear feedback on processing status

## Data Sources

### **Historical Reports**

- Infrastructure issue reports from MongoDB
- Maintenance records and resolution data
- Location-based incident patterns

### **Real-Time Analytics**

- Current system status and metrics
- Performance indicators and trends
- User activity and engagement data

### **Knowledge Base**

- Infrastructure best practices
- Common issue resolution patterns
- Technical guidelines and procedures

## Security & Privacy

### **Access Control**

- Restricted to authenticated authority users only
- Session-based authentication required
- No public access to chat functionality

### **Data Protection**

- All conversations are session-based (not stored)
- Report data access follows existing permissions
- Secure API communication

## Customization Options

### **Quick Questions**

You can customize the default quick questions by modifying the `quickQuestions` array in the component:

```typescript
const quickQuestions = [
  "What are the most common infrastructure issues?",
  "Show me recent resolution trends",
  "Which areas have the highest priority issues?",
  "Compare issue patterns by category",
];
```

### **Analytics Display**

Customize the analytics overview by modifying the analytics section in the header.

### **Styling**

The chat bot uses your existing design system and can be customized through CSS classes.

## Troubleshooting

### **Chat Bot Not Appearing**

- Ensure you're logged in as an authority user
- Check that you're on an authority dashboard page
- Verify MongoDB connection is working

### **No Response from AI**

- Check your Gemini API key configuration
- Verify MongoDB contains report data
- Check browser console for error messages

### **Analytics Not Loading**

- Verify MongoDB connection string
- Check that reports collection exists
- Ensure proper database permissions

## API Dependencies

- **MongoDB RAG API**: `/api/rag` for chat responses
- **Analytics API**: `/api/rag/analytics` for metrics
- **Gemini API**: For AI-powered analysis
- **MongoDB**: For historical report data

## Future Enhancements

### **Planned Features**

- Voice input/output capabilities
- Report generation from chat
- Integration with notification system
- Multi-language support

### **Potential Integrations**

- Export chat conversations
- Schedule automated reports
- Connect with external systems
- Mobile app compatibility

## Support

For technical support or feature requests regarding the Authority RAG Chat Bot, please contact the development team or check the main project documentation.
