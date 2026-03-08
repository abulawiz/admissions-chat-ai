import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useAuth } from "@/components/AuthProvider";
import { streamChat, type Msg } from "@/lib/streamChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, BookOpen, ClipboardList, DollarSign, FileText, Phone } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import nsukLogo from "@/assets/nsuk-logo.jpg";

const quickActions = [
  { icon: ClipboardList, text: "Admission Requirements" },
  { icon: FileText, text: "JAMB Cut Off Mark" },
  { icon: BookOpen, text: "Courses Offered" },
  { icon: GraduationCap, text: "Post UTME" },
  { icon: DollarSign, text: "School Fees" },
  { icon: Phone, text: "Contact Admission Office" },
];

const ChatPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setCurrentConvId(conversationId);
      loadMessages(conversationId);
    } else {
      setCurrentConvId(null);
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Msg[]);
    }
  };

  const persistMessage = async (convId: string, msg: Msg) => {
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: msg.role,
      content: msg.content,
    });
  };

  const createConversation = async (firstMessage: string): Promise<string | null> => {
    const title = firstMessage.length > 50 ? firstMessage.slice(0, 50) + "…" : firstMessage;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user!.id, title })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Failed to create conversation");
      return null;
    }
    return data.id;
  };

  const send = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let convId = currentConvId;

    // Create conversation on first message
    if (!convId) {
      convId = await createConversation(input);
      if (!convId) {
        setIsLoading(false);
        return;
      }
      setCurrentConvId(convId);
      navigate(`/chat/${convId}`, { replace: true });
    }

    // Persist user message
    await persistMessage(convId, userMsg);

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);

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
        onDone: async () => {
          setIsLoading(false);
          if (assistantSoFar && convId) {
            await persistMessage(convId, { role: "assistant", content: assistantSoFar });
          }
        },
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

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-[calc(100vh-4rem)] flex w-full">
        <ChatSidebar />
        <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
          <div className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-xl border border-border bg-background">
            <div className="flex items-center">
              <SidebarTrigger className="ml-2" />
              <div className="flex-1">
                <ChatHeader />
              </div>
            </div>
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
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                        <img src={nsukLogo} alt="NSUK" className="w-5 h-5 rounded-full object-contain" />
                      </div>
                      <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-tl-sm px-4 py-3 border border-border shadow-sm">
                        <div className="flex items-center gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">Typing...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <ChatInput onSend={send} disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatPage;
