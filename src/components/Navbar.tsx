import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import nsukLogo from "@/assets/nsuk-logo.jpg";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Admission Guide", path: "/admission-guide" },
  { label: "Faculties", path: "/faculties" },
  { label: "Chat with AI", path: "/chat" },
  { label: "FAQs", path: "/faqs" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleAuth = async () => {
    if (user) {
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="nsuk-gradient-dark sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={nsukLogo} alt="NSUK Logo" className="w-10 h-10 rounded-full object-contain bg-primary-foreground" />
            <div className="hidden sm:block">
              <span className="font-display text-sm font-bold text-primary-foreground leading-tight block">NSUK</span>
              <span className="text-[10px] text-primary-foreground/70 font-body">Admission Guide</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAuth}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-2 ml-2"
            >
              {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {user ? "Sign Out" : "Sign In"}
            </Button>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); handleAuth(); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-body font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              {user ? "Sign Out" : "Sign In"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
