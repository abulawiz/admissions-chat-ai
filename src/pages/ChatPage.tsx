import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { streamChat, type Msg } from "@/lib/streamChat";
import { toast } from "sonner";
import { GraduationCap, BookOpen, ClipboardList, DollarSign, FileText, Phone } from "lucide-react";

const quickActions = [
  { icon: ClipboardList, text: "Admission Requirements" },
  { icon: FileText, text: "JAMB Cut Off Mark" },
  { icon: BookOpen, text: "Courses Offered" },
  { icon: GraduationCap, text: "Post UTME" },
  { icon: DollarSign, text: "School Fees" },
  { icon: Phone, text: "Contact Admission Office" },
];

const ChatPage = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-xl border border-border bg-background">
        <ChatHeader />
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 h-full">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full nsuk-gradient flex items-center justify-center mb-4 shadow-lg"
              >
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center text-foreground font-body mb-6 max-w-md"
              >
                Welcome to NSUK Admission Guide! I am here to assist you with admission enquiries for Nasarawa State University Keffi. How can I help you today?
              </motion.p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    onClick={() => send(action.text)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center group-hover:nsuk-gradient transition-colors">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-body text-foreground text-center leading-tight">{action.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full nsuk-gradient flex items-center justify-center flex-shrink-0">
                    <span className="block w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                  </div>
                  <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 border border-border shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border">
          <ChatInput onSend={send} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;