import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface ChatMessage {
  sender: "user" | "bot";
  message: string;
  timestamp: string;
}

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/${id}/history/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched chat history:", res.data);

        // Filter out empty messages or those without timestamps
        const filteredMessages = res.data.filter(
          (msg: ChatMessage) => msg.message.trim() !== "" && msg.timestamp
        );

        setMessages(filteredMessages);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const token = localStorage.getItem("accessToken");

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/documents/${id}/ask/`,
        { question: input.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMsg: ChatMessage = {
        sender: "bot",
        message: res.data.answer,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Failed to send question:", error);
    }

    setInput("");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 flex flex-col h-[80vh]">
      <h2 className="text-2xl font-bold mb-6">💬 Chat on Document #{id}</h2>

      <div className="flex-1 overflow-y-auto border rounded p-4 bg-white shadow space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Ask something!</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] break-words ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{msg.message}</p>
              </div>
              {/* Render timestamp only if message and timestamp are valid */}
              {msg.message.trim() !== "" && msg.timestamp && (
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about this document..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
