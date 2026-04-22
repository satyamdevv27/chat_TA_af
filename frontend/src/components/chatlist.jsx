import { useEffect, useState, useRef } from "react";
import { supabase } from "../superbase.js";

export default function ChatScreen({ user, conversationId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // ✅ fetch messages (NO warning)
  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  useEffect(() => {
    if (!conversationId) return;

    loadMessages();

    const channel = supabase
      .channel("chat-" + conversationId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // ✅ auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
      },
    ]);

    // 🔥 important: update conversation time
    await supabase
      .from("conversations")
      .update({ created_at: new Date() })
      .eq("id", conversationId);

    setText("");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border rounded-lg shadow bg-white">
      
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-gray-100">
        <button onClick={onBack} className="text-lg">←</button>
        <span className="font-semibold">Chat #{conversationId}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs text-sm shadow ${
                  msg.sender_id === user.id
                    ? "bg-green-200"
                    : "bg-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-4 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}