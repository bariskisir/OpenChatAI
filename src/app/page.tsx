"use client";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
