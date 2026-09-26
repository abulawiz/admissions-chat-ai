import { useRef, useState } from "react";
import { FileUp, Mic, MicOff, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

type SpeechRecognitionInstance = { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global { interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor } }

export function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { user } = useAuth();

  const handleSubmit = () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachment) || disabled) return;
    const message = attachment ? `${trimmed || "Please review this admission document."}\n\nAttached file: ${attachment.name}` : trimmed;
    onSend(message);
    setValue(""); setAttachment(null); inputRef.current?.focus();
  };

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) { toast.error("Voice input is not supported in this browser."); return; }
    const recognition = new Recognition();
    recognition.continuous = false; recognition.interimResults = false; recognition.lang = "en-NG";
    recognition.onresult = (event) => setValue((current) => `${current} ${event.results[0][0].transcript}`.trim());
    recognition.onend = () => setListening(false); recognition.onerror = () => { setListening(false); toast.error("Could not hear that. Please try again."); };
    recognitionRef.current = recognition; recognition.start(); setListening(true);
  };

  const uploadAttachment = async (file: File) => {
    if (!user) { setAttachment(file); return; }
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("admission-documents").upload(path, file, { contentType: file.type });
    if (error) { toast.error("File upload failed. Please try a PDF or document under 10 MB."); return; }
    setAttachment(file); toast.success("File attached to your message.");
  };

  return <div className="bg-card rounded-2xl border border-border p-2 flex items-end gap-2 shadow-sm">
    <label className="cursor-pointer"><input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" disabled={disabled} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadAttachment(file); event.target.value = ""; }} /><Button type="button" variant="ghost" size="icon" aria-label="Attach file" disabled={disabled}><FileUp className="size-4" /></Button></label>
    <div className="flex-1 min-w-0 flex flex-col gap-1">{attachment && <div className="flex items-center gap-1 text-xs text-primary bg-primary-light rounded-md px-2 py-1 w-fit max-w-full"><span className="truncate">{attachment.name}</span><button type="button" aria-label="Remove attachment" onClick={() => setAttachment(null)}><X className="size-3" /></button></div>}<textarea ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); handleSubmit(); } }} placeholder="Ask about admissions, courses, JAMB..." className="w-full resize-none bg-transparent border-0 outline-none p-2 text-foreground placeholder:text-muted-foreground font-body text-sm min-h-[40px] max-h-[120px]" rows={1} disabled={disabled} /></div>
    <Button type="button" variant={listening ? "default" : "ghost"} size="icon" aria-label={listening ? "Stop voice input" : "Start voice input"} onClick={toggleVoice} disabled={disabled} className={listening ? "bg-destructive hover:bg-destructive/90" : ""}>{listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}</Button>
    <Button type="button" onClick={handleSubmit} disabled={disabled || (!value.trim() && !attachment)} size="icon" aria-label="Send message" className="rounded-xl nsuk-gradient hover:opacity-90 transition-opacity size-10 flex-shrink-0"><Send className="size-4 text-primary-foreground" /></Button>
  </div>;
}
