import React, { useState } from "react";
import { askGemini } from "../api/api";
import { FiMessageCircle, FiX } from "react-icons/fi";

const GeminiAssistant = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;

  const handleAsk = async () => {
    if (!username) {
      alert("Please log in to use the assistant.");
      return;
    }

    setLoading(true);
    try {
      const res = await askGemini(username, prompt);
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition fixed bottom-6 right-6 z-50"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chatbox Panel - Responsive */}
      <div
        className={`transition-all duration-300 fixed z-50 ${
          open
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 pointer-events-none"
        } ${
          // Responsive positioning and sizing
          "w-[375px] h-[600px] md:bottom-6 md:right-6 md:rounded-2xl" +
          " md:w-[375px] md:h-[600px] bg-white shadow-2xl" +
          " bottom-0 right-0 w-full h-full rounded-none"
        } flex flex-col p-4`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:text-red-500"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Response Box */}
        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-md p-3 text-sm shadow-inner">
          {response ? (
            <div>
              <strong className="text-gray-700">AI:</strong>
              <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">
              Ask me something about your finances...
            </p>
          )}
        </div>

        {/* Prompt Input */}
        <div className="mt-3">
          <textarea
            className="w-full border border-gray-300 p-2 rounded-md text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            rows={2}
            placeholder="Enter your question..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !prompt}
            className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
