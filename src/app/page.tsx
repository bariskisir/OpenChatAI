"use client";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="app-layout">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
