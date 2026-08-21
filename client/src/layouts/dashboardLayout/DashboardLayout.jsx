import { Outlet, useNavigate } from "react-router-dom";
import "./dashboardLayout.css";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import ChatList from "../../components/chatList/ChatList";

const DashboardLayout = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <button
        className="collapseToggleBtn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? "▶" : "◀"}
      </button>

      <div className={`menu ${isCollapsed ? "collapsed" : ""}`}>
        <ChatList />
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
