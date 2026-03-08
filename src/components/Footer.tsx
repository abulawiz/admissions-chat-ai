import { Link } from "react-router-dom";
import nsukLogo from "@/assets/nsuk-logo.jpg";

export function Footer() {
  return (
    <footer className="nsuk-gradient-dark text-primary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <span className="font-display text-sm font-bold block">Nasarawa State University</span>
                <span className="text-xs text-primary-foreground/70 font-body">Keffi, Nigeria</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 font-body">
              AI-powered admission guide helping prospective students navigate the NSUK admission process.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold mb-3">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: "Admission Guide", path: "/admission-guide" },
                { label: "Chat with AI", path: "/chat" },
                { label: "FAQs", path: "/faqs" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-primary-foreground/70 hover:text-accent transition-colors font-body"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold mb-3">Contact Info</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70 font-body">
              <p>Nasarawa State University</p>
              <p>PMB 1022, Keffi, Nasarawa State</p>
              <p>Nigeria</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-xs text-primary-foreground/50 font-body">
          © {new Date().getFullYear()} NSUK Admission Guide. All rights reserved.
        </div>
      </div>
    </footer>
  );
}