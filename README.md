# StudySync — Collaborative Study Room Platform

StudySync is a full-stack web application designed to help students focus together using synchronized Pomodoro sessions, shared resource boards, and real-time presence tracking.

## Features

- **🛡️ Secure Authentication**: Firebase-powered email/password login and signup.
- **📊 Collaborative Dashboard**: Create or join study rooms via 6-character codes and track your personal focus stats.
- **⏱️ Synced Pomodoro Timer**: A real-time timer synced across all room members via Firebase Realtime Database.
- **👥 Member Presence**: See who's currently focusing or idle in your room.
- **📋 Shared Resource Board**: Add links and notes for your study group to see.
- **🏆 Global Leaderboard**: Compete with students worldwide for the top focus spots.
- **📱 Fully Responsive**: Premium dark-mode UI that works on all devices.

## Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, React Router v6
- **Backend**: Firebase (Authentication, Firestore, Realtime Database)
- **State Management**: React Context API & Custom Hooks

## Local Setup Instructions

1. **Clone the repository** (or copy the files).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=your_database_url
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Firebase Security Rules

To ensure only authenticated users can access the data, use these rules:

### Firestore
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Realtime Database
```json
{
  "rules": {
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```
