import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { MessageSquarePlus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

export function ChatSidebar() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });

    if (!error && data) setConversations(data);
  };

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete conversation");
    } else {
      if (conversationId === id) navigate("/chat");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <div className="p-2">
            <Button
              onClick={() => navigate("/chat")}
              className="w-full nsuk-gradient hover:opacity-90 gap-2"
              size={collapsed ? "icon" : "default"}
            >
              <MessageSquarePlus className="w-4 h-4" />
              {!collapsed && <span className="font-body text-sm">New Chat</span>}
            </Button>
          </div>

          <SidebarGroupLabel className="font-body text-xs">
            {!collapsed && "Chat History"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    isActive={conversationId === conv.id}
                    className="group"
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-sm font-body">{conv.title}</span>
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {conversations.length === 0 && !collapsed && (
                <p className="text-xs text-muted-foreground font-body px-4 py-2">
                  No conversations yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
