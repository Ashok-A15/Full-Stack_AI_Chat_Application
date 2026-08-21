import { useState } from "react";
import "./dashboardPage.css";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Upload from "../../components/upload/Upload";
import { IKImage } from "imagekitio-react";

const DashboardPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const createChatWithText = async (text) => {
    if (!text && !img.dbData?.filePath) return;
    setErrorMsg("");
    try {
      const token = await getToken();
      const promptText = text || "Describe this image";

      const API_URL = import.meta.env.VITE_API_URL || "https://full-stack-ai-chat-application.onrender.com";
      const res = await fetch(`${API_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: promptText }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create chat session");
      }

      const data = await res.json();
      console.log("✅ Chat created:", data.chatId);
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${data.chatId}`);
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
      setErrorMsg(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text && !img.dbData?.filePath) return;
    await createChatWithText(text);
    e.target.reset();
  };

  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="logo" />
          <h1>LAMA AI</h1>
        </div>

        <div className="options">
          <div className="option" onClick={() => createChatWithText("Hello! Let's start a new chat session.")}>
            <img src="/chat.png" alt="chat" />
            <span>Create a New Chat</span>
          </div>
          <div className="option" onClick={() => createChatWithText("How can I analyze and describe an image with vision AI?")}>
            <img src="/image.png" alt="image" />
            <span>Analyze Images</span>
          </div>
          <div className="option" onClick={() => createChatWithText("Can you help me review, optimize, and debug my code?")}>
            <img src="/code.png" alt="code" />
            <span>Help Me With My Code</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: "#ff6b6b", padding: "10px 16px", backgroundColor: "#2d1a24", borderRadius: "8px", fontSize: "13px", marginBottom: "15px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {img.isLoading && <div style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>Uploading image...</div>}

      {img.dbData?.filePath && (
        <div style={{ marginBottom: "12px" }}>
          <IKImage
            urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
            path={img.dbData.filePath}
            width={120}
            style={{ borderRadius: "8px" }}
          />
        </div>
      )}

      <div className="formContainer">
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <form onSubmit={handleSubmit} autoComplete="off">
            <Upload setImg={setImg} />
            <input type="text" name="text" placeholder="Ask me anything..." autoComplete="off" />
            <button type="submit">
              <img src="/arrow.png" alt="send" />
            </button>
          </form>
        </SignedIn>
      </div>
    </div>
  );
};

export default DashboardPage;
