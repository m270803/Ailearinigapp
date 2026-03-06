import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Layout with Sidebar */}
      <div style={{ display: "flex", flex: 1 }}>
        
        {/* Sidebar */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            maxWidth: "80rem",
            width: "100%",
            margin: "0 auto",
            padding: "2rem 1rem",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;