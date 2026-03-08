import nsukLogo from "@/assets/nsuk-logo.jpg";
export function ChatHeader() {
  return (
    <header className="nsuk-gradient px-6 py-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-sm">
        <GraduationCap className="w-5 h-5 text-accent-foreground" />
      </div>
      <div>
        <h2 className="font-display text-base font-bold text-primary-foreground leading-tight">
          NSUK Admission Assistant
        </h2>
        <p className="text-xs text-primary-foreground/70 font-body">AI-powered • Available 24/7</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs text-primary-foreground/70 font-body">Online</span>
      </div>
    </header>
  );
}