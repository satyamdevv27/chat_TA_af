import { useEffect, useState, useRef } from "react";
import { supabase } from "../superbase.js";

export default function ChatScreen({ user, conversationId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);



  useEffect(() => {
    let isMounted = true;

    // ✅ async wrapper (no warning)
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (isMounted) {
        setMessages(data || []);
      }
    };

    loadMessages();

    // ✅ realtime
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
          setMessages((prev) => {
            // ✅ duplicate avoid
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
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

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
      },
    ]);

    if (!error) {
      // optional sorting hack
      await supabase
        .from("conversations")
        .update({ created_at: new Date() })
        .eq("id", conversationId);
    }

    setText("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border rounded-lg shadow">
      
      {/* Header */}
      <div className="p-4 border-b bg-gray-100 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-black"
        >
          ←
        </button>

        <span className="font-semibold text-lg">
          Chat #{conversationId}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === user.id
                  ? "justify-end"
                  : "justify-start"
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
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}