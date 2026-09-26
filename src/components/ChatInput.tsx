import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, Mic, MicOff, Send, X } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ file: File; url: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachment) || disabled || uploading) return;
    const message = attachment
      ? `${trimmed || "Please review this admission document."}\n\nAttached file: ${attachment.file.name}\nSecure document link: ${attachment.url}\nPlease use the secure link to inspect the document and explain the admission-relevant details.`
      : trimmed;
    onSend(message);
    setValue(""); setAttachment(null); inputRef.current?.focus();
  };

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) { toast.error("Voice input is not supported. Try Chrome or Edge on desktop/mobile."); return; }
    const recognition = new Recognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-NG";
    let finalText = "";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += `${transcript} `; else interim += transcript;
      }
      setValue((current) => `${current.replace(/\s*\[listening…\]$/, "")} ${finalText} ${interim ? `[listening…]` : ""}`.trim());
    };
    recognition.onend = () => { setListening(false); if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current); };
    recognition.onerror = (event) => { setListening(false); if (event.error !== "aborted" && event.error !== "no-speech") toast.error("Microphone access failed. Check browser permissions and try again."); };
    try { recognition.start(); setListening(true); voiceTimeoutRef.current = window.setTimeout(() => recognition.stop(), 60000); }
    catch { toast.error("Could not start the microphone."); }
    recognitionRef.current = recognition;
  };

  const uploadAttachment = async (file: File) => {
    const allowed = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (file.size > 10 * 1024 * 1024 || (!allowed.includes(file.type) && !/\.(pdf|doc|docx|txt)$/i.test(file.name))) {
      toast.error("Choose a PDF, DOC, DOCX, or TXT file under 10 MB."); return;
    }
    if (!user) { toast.error("Please sign in before uploading a document."); return; }
    setUploading(true);
    const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("admission-documents").upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (error) { toast.error("File upload failed. Please try again."); setUploading(false); return; }
    const { data, error: urlError } = await supabase.storage.from("admission-documents").createSignedUrl(path, 3600);
    setUploading(false);
    if (urlError || !data?.signedUrl) { toast.error("The file uploaded but could not be prepared for the assistant."); return; }
    setAttachment({ file, url: data.signedUrl }); toast.success("File attached and ready for review.");
  };

  return <div className="bg-card rounded-2xl border border-border p-2 flex items-end gap-2 shadow-sm">
    <label className="cursor-pointer"><input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" disabled={disabled || uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadAttachment(file); event.target.value = ""; }} /><Button type="button" variant="ghost" size="icon" aria-label="Attach file" disabled={disabled || uploading}>{uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}</Button></label>
    <div className="flex-1 min-w-0 flex flex-col gap-1">{attachment && <div className="flex items-center gap-1 text-xs text-primary bg-primary-light rounded-md px-2 py-1 w-fit max-w-full"><span className="truncate">{attachment.file.name}</span><button type="button" aria-label="Remove attachment" onClick={() => setAttachment(null)}><X className="size-3" /></button></div>}<textarea ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); handleSubmit(); } }} placeholder="Ask about admissions, courses, JAMB..." className="w-full resize-none bg-transparent border-0 outline-none p-2 text-foreground placeholder:text-muted-foreground font-body text-sm min-h-[40px] max-h-[120px]" rows={1} disabled={disabled} /></div>
    <Button type="button" variant={listening ? "default" : "ghost"} size="icon" aria-label={listening ? "Stop voice input" : "Start voice input"} onClick={toggleVoice} disabled={disabled} className={listening ? "bg-destructive hover:bg-destructive/90" : ""}>{listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}</Button>
    <Button type="button" onClick={handleSubmit} disabled={disabled || (!value.trim() && !attachment)} size="icon" aria-label="Send message" className="rounded-xl nsuk-gradient hover:opacity-90 transition-opacity size-10 flex-shrink-0"><Send className="size-4 text-primary-foreground" /></Button>
  </div>;
}
