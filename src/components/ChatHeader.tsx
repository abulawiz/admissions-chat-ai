import { GraduationCap } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="glass-panel border-b border-border px-6 py-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-sm">
        <GraduationCap className="w-5 h-5 text-accent-foreground" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground leading-tight">
          University Admissions
        </h2>
        <p className="text-xs text-muted-foreground font-body">AI-powered enquiry assistant</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs text-muted-foreground font-body">Online</span>
      </div>
    </header>
  );
}
