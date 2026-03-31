"use client";

import { useState, useEffect, useRef } from "react";
import { PROVIDERS, DEFAULT_MODEL } from "@/lib/api";
import { useChatContext } from "@/contexts/ChatContext";

export default function ModelSelector() {
  const { activeSession, setModel } = useChatContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentProviderId = activeSession?.provider || PROVIDERS[0].id;
  const currentModel = activeSession?.model || DEFAULT_MODEL;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="model-selector">
      <button
        onClick={() => setOpen(!open)}
        className="model-selector-btn"
        title="Select model"
      >
        <span className="model-label">Model</span>
        <span className="model-name">{currentModel}</span>
        <i
          className={`bi bi-chevron-down chevron ${open ? "open" : ""}`}
          style={{ fontSize: 12 }}
        ></i>
      </button>

      {open && (
        <div className="model-dropdown">
          <div className="model-dropdown-scroll">
            {PROVIDERS.map((provider) => (
              <div key={provider.id}>
                <div className="provider-header">{provider.name}</div>

                {provider.availableModels.map((modelOption) => {
                  const modelId: string = modelOption.id;
                  const selected =
                    modelId === currentModel && provider.id === currentProviderId;

                  return (
                    <button
                      key={modelId}
                      onClick={() => {
                        setModel(modelId, provider.id);
                        setOpen(false);
                      }}
                      className={`model-option ${selected ? "selected" : ""}`}
                    >
                      {selected && <i className="bi bi-check-lg flex-shrink-0"></i>}
                      <span className="model-option-text">{modelOption.name || modelId}</span>
                      {modelOption.supportsImageInput ? (
                        <i
                          className="bi bi-image model-option-capability"
                          title="Supports image input"
                        ></i>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
