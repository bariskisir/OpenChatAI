"use client";

import { useState, useEffect, useRef } from "react";
import { PROVIDERS, DEFAULT_MODEL } from "@/lib/api";
import { useChatContext } from "@/contexts/ChatContext";
  
  export default function ModelSelector() {
    const { activeSession, setModel } = useChatContext();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
  
    const currentProviderId = activeSession?.provider || PROVIDERS[0].id;
    const currentProvider =
      PROVIDERS.find((p) => p.id === currentProviderId) || PROVIDERS[0];
    const currentModel = activeSession?.model || DEFAULT_MODEL;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 py-2 px-2 text-sm font-medium text-accent transition-colors hover:opacity-80 bg-surface rounded"
        title="Select model"
      >
        <span className="max-w-[100px] truncate">
          {open
            ? `${currentProvider.name} / ${currentModel}`
            : `${currentModel}`}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 bottom-full z-50 mb-2 min-w-[280px] overflow-hidden rounded-xl border border-border bg-[#171717] shadow-2xl !opacity-100 animate-fade-in">
          <div className="max-h-[300px] overflow-y-auto bg-[#171717] custom-scrollbar">
            {PROVIDERS.map((p) => (
              <div key={p.id}>
                <div className="sticky top-0 bg-[#171717] px-4 py-2.5 text-xs font-semibold text-text-secondary border-b border-border z-10">
                  {p.name}
                </div>
                {p.availableModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      setModel(model, p.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 pl-8 pr-4 py-3 text-left text-sm transition-colors hover:bg-[#2a2a2a] ${
                      model === currentModel && p.id === currentProviderId
                        ? "bg-[#171717] text-accent"
                        : "text-text-primary bg-[#171717]"
                    }`}
                  >
                    {model === currentModel && p.id === currentProviderId && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="flex-shrink-0"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                    <span
                      className={
                        model === currentModel && p.id === currentProviderId
                          ? ""
                          : "ml-6"
                      }
                    >
                      {model}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
