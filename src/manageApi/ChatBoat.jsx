import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ChatBoat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I'm Xoto. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = { from: "user", text: input };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Xoto received your message!" },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 flex items-center justify-center rounded-full shadow-lg cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #6a0dad, #9b4dff)",
        }}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      >
        <span className="text-white text-xl font-bold">X</span>
      </motion.div>

      {/* Chat Window */}
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-28 right-8 w-80 bg-white shadow-2xl rounded-2xl border border-purple-300 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-purple-600 text-white p-4 font-semibold flex justify-between items-center">
            Xoto Assistant

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="text-white text-xl font-bold hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl max-w-[80%] text-sm shadow-sm ${
                  msg.from === "user"
                    ? "ml-auto bg-purple-600 text-white"
                    : "mr-auto bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <input
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatBoat;
