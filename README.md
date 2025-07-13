# Infrastructure Report Dashboard with AI Integration

This application provides a comprehensive platform for citizens and authorities to report, manage, and analyze infrastructure issues such as potholes, broken streetlights, and other civic problems. It integrates advanced AI capabilities to enhance issue detection and management.

## Core Features

### 1. AI-powered Issue Detection

- Google Gemini AI integration for image analysis
- Automatic detection of infrastructure issues from photos
- Classification of issue types, condition assessment, and severity rating
- Detailed descriptions generated for detected issues

### 2. Maintenance Management System

- Schedule maintenance tasks for detected issues
- Calendar-based view of all maintenance activities
- Status tracking (scheduled, in-progress, completed, cancelled)
- Automatic priority assignment based on AI severity assessment

### 3. Notification System

- Real-time alerts for maintenance activities
- Status change notifications
- Persistent storage of notification history
- User-friendly notification management

### 4. Reporting System

- User-friendly interface for submitting infrastructure reports
- Image upload with AI analysis
- Form auto-population based on AI detection
- Detailed report tracking and management

## Technical Overview

### Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.0 Flash multimodal model
- **UI Components**: Shadcn/UI
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore

## Documentation

For more detailed information, refer to our documentation files:

- [AI Image Detection](./AI-IMAGE-DETECTION.md): Details about the AI image analysis
- [Enhanced AI Capabilities](./ENHANCED-AI-CAPABILITIES.md): Information on the AI enhancements
- [Gemini Bugfix](./GEMINI-BUGFIX.md): Information about fixing issues with Gemini integration
- [Maintenance Management](./MAINTENANCE-MANAGEMENT.md): Details about the maintenance system
- [Notifications System](./NOTIFICATIONS-SYSTEM.md): Information about the notification features

## Getting Started

First, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
