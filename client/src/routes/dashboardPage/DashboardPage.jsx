import "./dashboardPage.css";
import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const DashboardPage = () => {
  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;

    try {
      // ✅ Get Clerk JWT token for backend
      const token = await getToken({ template: "backend" });

      const res = await fetch("http://localhost:3001/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // auth header for requireAuth()
        },
        body: JSON.stringify({ text }), // backend extracts userId from token
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      console.log("✅ Message sent:", text);
      e.target.reset(); // clear input
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
    }
  };

  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="logo" />
          <h1>LAMA AI</h1>
        </div>

        <div className="options">
          <div className="option">
            <img src="/chat.png" alt="chat" />
            <span>Create a New Chat</span>
          </div>
          <div className="option">
            <img src="/image.png" alt="image" />
            <span>Analyze Images</span>
          </div>
          <div className="option">
            <img src="/code.png" alt="code" />
            <span>Help Me With My Code</span>
          </div>
        </div>
      </div>

      <div className="formContainer">
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <form onSubmit={handleSubmit}>
            <input type="text" name="text" placeholder="Ask me anything..." />
            <button type="submit">
              <img src="/arrow.png" alt="send" />
            </button>
            <UserButton />
          </form>
        </SignedIn>
      </div>
    </div>
  );
};

export default DashboardPage;
