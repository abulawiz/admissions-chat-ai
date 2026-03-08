import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (msg: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="glass-panel rounded-2xl p-2 flex items-end gap-2">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Ask about admissions, programs, deadlines..."
        className="flex-1 resize-none bg-transparent border-0 outline-none p-2 text-foreground placeholder:text-muted-foreground font-body text-sm min-h-[40px] max-h-[120px]"
        rows={1}
        disabled={disabled}
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="rounded-xl chat-gradient hover:opacity-90 transition-opacity h-10 w-10 flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
