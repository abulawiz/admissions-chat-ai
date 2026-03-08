import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User } from "lucide-react";
import type { Msg } from "@/lib/streamChat";
import nsukLogo from "@/assets/nsuk-logo.jpg";

export function ChatMessage({ message }: { message: Msg }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser ? "nsuk-gradient" : "gold-gradient"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
          <img src={nsukLogo} alt="NSUK" className="w-5 h-5 rounded-full object-contain" />
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-tr-sm"
            : "bg-chat-bot text-chat-bot-foreground shadow-sm border border-border rounded-tl-sm"
        }`}
      >
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:font-display prose-headings:text-foreground">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}