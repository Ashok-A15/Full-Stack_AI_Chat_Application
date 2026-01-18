import { Outlet, useNavigate } from "react-router-dom";
import "./dashboardLayout.css";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import ChatList from "../../components/chatList/ChatList"; // ✅ check this path

const DashboardLayout = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated users
  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [isLoaded, userId, navigate]);

  // Loading state while Clerk loads user info
  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboardLayout">
      <div className="menu">
        <ChatList />
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
