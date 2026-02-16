# 🤖 AI Chat Flow - Full-Stack Gemini AI Application

AI Chat Flow is a high-performance, full-stack AI conversation platform built with the MERN stack. It leverages the power of Google Gemini 1.5 Flash to provide real-time, multimodal AI responses, allowing users to chat with text and analyze images seamlessly.

## 🌟 Key Features

- **💬 Real-time AI Chat**: Instant, context-aware responses powered by Google Gemini 1.5 Flash.
- **🖼️ Multimodal Vision**: Upload and analyze images to have deep conversations about visual content.
- **🛡️ Secure Authentication**: User lifecycle management and social logins integrated via Clerk.
- **📁 Image Management**: Enterprise-grade image hosting and optimization through ImageKit.io.
- **⏳ Persistent History**: Reliable storage of conversation threads in MongoDB Atlas for multi-device access.
- **🎨 Premium UI/UX**: Modern dark-themed dashboard with smooth transitions and responsive design.

## 🛠️ Technology Stack

**Frontend:**
- React.js (Vite)
- TanStack Query (Data Fetching)
- Clerk SDK (Auth)
- ImageKit React (Media)
- CSS3 (Custom Modern Styling)

**Backend:**
- Node.js & Express
- Mongoose (ODB)
- Clerk & ImageKit Server SDKs
- Google Generative AI Hub

**Infrastructure:**
- Database: MongoDB Atlas
- Hosting: ImageKit.io

## 🚦 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Registered accounts for MongoDB Atlas, Clerk, ImageKit, and Google AI Studio.

### 1. Repository Installation
```bash
git clone <your-repository-url>
cd AI-Chat-Flow
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment variables section below.
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment variables section below.
4. Launch the application:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files:

### Backend (`/backend/.env`)
```env
PORT=3001
CLIENT_URL=http://localhost:5173
IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGO_URI=your_mongodb_atlas_connection_string
```

### Frontend (`/client/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
VITE_IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:3001
```

## 📜 License
This project is licensed under the MIT License.
