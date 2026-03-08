import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
import nsukLogo from "@/assets/nsuk-logo.jpg";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the URL token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Session is set, user can now update password
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/auth"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold text-foreground">Password Updated</h1>
          <p className="text-muted-foreground font-body text-sm">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full nsuk-gradient flex items-center justify-center mb-4 shadow-lg">
            <img src={nsukLogo} alt="NSUK" className="w-10 h-10 rounded-full object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl border border-border p-6 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-sm">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-body text-sm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full nsuk-gradient hover:opacity-90">
            {loading ? "Updating..." : "Update Password"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
