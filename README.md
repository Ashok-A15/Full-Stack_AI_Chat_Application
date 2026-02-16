# LAMA AI - Full-Stack AI Chat Application

A modern, full-stack AI chat application built with the MERN stack (MongoDB, Express, React, Node.js), featuring real-time AI responses, image analysis, and user authentication.

## ✨ Features

- **Real-time AI Chat**: Powered by Google Gemini AI (1.5 Flash).
- **Multimodal Capabilities**: Analyze and chat about images using Gemini's vision features.
- **Image Hosting**: Secure image uploads and transformations via ImageKit.
- **User Authentication**: Seamless login and user management with Clerk.
- **Persistent History**: Chat history is stored in MongoDB Atlas.
- **Modern UI**: Polished, responsive design with dark mode aesthetics.

## 🚀 Tech Stack

- **Frontend**: React (Vite), React Router, TanStack Query, Clerk React, ImageKit React.
- **Backend**: Node.js, Express, Mongoose, Clerk SDK, ImageKit SDK, Google Generative AI Hub.
- **Database**: MongoDB Atlas.

## 🛠️ Setup Instructions

### 1. Prerequisite
- Node.js installed on your machine.
- Accounts for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Clerk](https://clerk.com/), [ImageKit](https://imagekit.io/), and [Google AI Studio](https://aistudio.google.com/).

### 2. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
   VITE_IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=http://localhost:3001
   ```  
4. Start the dev server:
   ```bash
   npm run dev
   ```

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your keys:
   ```env
   PORT=3001
   CLIENT_URL=http://localhost:5173
   IMAGE_KIT_ENDPOINT=your_endpoint
   IMAGE_KIT_PUBLIC_KEY=your_public_key
   IMAGE_KIT_PRIVATE_KEY=your_private_key
   CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

## 📝 Usage

- Sign in via the homepage.
- Start a new chat on the dashboard.
- Upload images to discuss them with the AI.
- Access your recent chats from the sidebar.
