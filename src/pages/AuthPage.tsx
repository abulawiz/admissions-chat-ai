import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import nsukLogo from "@/assets/nsuk-logo.jpg";

type Mode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim();

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your email.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) {
          toast.error(
            error.message.toLowerCase().includes("invalid login credentials")
              ? "Email or password is incorrect. Check your details or use “Forgot your password?” to reset it."
              : error.message,
          );
          return;
        }
        navigate(searchParams.get("next") === "/admin" ? "/admin" : "/chat");
      } else {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account before signing in.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete this request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, { heading: string; sub: string }> = {
    login: { heading: "Welcome Back", sub: "Sign in to access your chat history" },
    signup: { heading: "Create Account", sub: "Sign up to save your conversations" },
    forgot: { heading: "Reset Password", sub: "Enter your email to receive a reset link" },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full nsuk-gradient flex items-center justify-center mb-4 shadow-lg">
            <img src={nsukLogo} alt="NSUK" className="w-10 h-10 rounded-full object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {titles[mode].heading}
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            {titles[mode].sub}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl border border-border p-6 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-sm">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode("forgot"); setShowPassword(false); }}
                className="text-xs text-primary hover:underline font-body"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full nsuk-gradient hover:opacity-90">
            {loading
              ? "Please wait..."
              : mode === "forgot"
              ? "Send Reset Link"
              : mode === "login"
              ? "Sign In"
              : "Sign Up"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {mode === "forgot" ? (
            <p className="text-center text-sm text-muted-foreground font-body">
              <button
                type="button"
                onClick={() => { setMode("login"); setShowPassword(false); }}
                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-muted-foreground font-body">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setShowPassword(false); }}
                className="text-primary font-medium hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
