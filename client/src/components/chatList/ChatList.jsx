import { Link, useLocation, useNavigate } from "react-router-dom";
import "./chatList.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const ChatList = () => {
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDeleteChat = async (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["userChats"] });
        if (location.pathname === `/dashboard/chats/${chatId}`) {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/userchats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user chats");
      return res.json();
    },
  });

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
        💬 Create a new Chat
      </Link>
      <Link to="/">✨ Explore Lama AI</Link>
      <Link to="/">📞 Contact</Link>

      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isLoading ? (
          <span className="loading-chats">Loading history...</span>
        ) : error ? (
          <span className="error">Unable to load chats</span>
        ) : data?.length > 0 ? (
          data.map((chat) => {
            const isActive = location.pathname === `/dashboard/chats/${chat._id}`;
            return (
              <div key={chat._id} className="chatItemWrapper">
                <Link
                  to={`/dashboard/chats/${chat._id}`}
                  className={`chatItemLink ${isActive ? "active" : ""}`}
                  title={chat.title}
                >
                  <span className="chat-icon">🗨️</span>
                  <span className="chat-title-text">{chat.title}</span>
                </Link>
                <button
                  className="deleteBtn"
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            );
          })
        ) : (
          <span className="no-chats">No previous chats</span>
        )}
      </div>

      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="Lama AI Logo" />
        <div className="texts">
          <span>Upgrade to Lama AI Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
