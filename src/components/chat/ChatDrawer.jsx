import React, { useState, useEffect, useRef } from "react";
import { Drawer, Input, Button, Avatar, Spin, Typography } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { getSocket, registerSocket } from "../../utils/socket";
import { apiService } from "../../manageApi/utils/custom.apiservice";

const { Text } = Typography;

const ChatDrawer = ({ lead, currentUser, otherUserId, otherName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const roomId = [currentUser?._id, otherUserId].sort().join("_");

  useEffect(() => {
    if (!lead || !currentUser?._id) return;

    const token = localStorage.getItem("token") || localStorage.getItem("grid_token");
    const sock = registerSocket(token) || getSocket();

    setLoading(true);
    apiService
      .get(`/chat/messages/${roomId}`)
      .then((data) => setMessages(Array.isArray(data) ? data : data?.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (sock) {
      sock.emit("join_room", { roomId });
      sock.on("receive_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      if (sock) {
        sock.off("receive_message");
        sock.emit("leave_room", { roomId });
      }
    };
  }, [lead, currentUser?._id, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const sock = getSocket();
    const msg = {
      roomId,
      senderId: currentUser._id,
      senderName: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    if (sock) sock.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar icon={<UserOutlined />} size="small" />
          <span>{otherName}</span>
        </div>
      }
      placement="right"
      width={380}
      open={!!lead}
      onClose={onClose}
      styles={{ body: { display: "flex", flexDirection: "column", padding: 0 } }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 40 }}>
            No messages yet. Say hello!
          </Text>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.senderId === currentUser?._id;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "8px 12px",
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMine ? "#6d28d9" : "#f3f4f6",
                    color: isMine ? "#fff" : "#111",
                    fontSize: 13,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1, resize: "none" }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          disabled={!text.trim()}
          style={{ background: "#6d28d9", borderColor: "#6d28d9" }}
        />
      </div>
    </Drawer>
  );
};

export default ChatDrawer;
