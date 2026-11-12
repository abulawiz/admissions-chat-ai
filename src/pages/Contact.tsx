import { motion } from "framer-motion";
import { FormEvent } from "react";
import { MapPin, Mail, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "P.M.B. 1022, Along Keffi–Akwanga Road, Keffi, Nasarawa State, Nigeria",
  },
  { icon: Mail, label: "General enquiries", value: "info@nsuk.edu.ng", href: "mailto:info@nsuk.edu.ng" },
  { icon: Globe, label: "University website", value: "nsuk.edu.ng", href: "https://nsuk.edu.ng/" },
  {
    icon: ExternalLink,
    label: "Undergraduate admissions",
    value: "Open the NSUK admissions portal",
    href: "https://ug.nsuk.edu.ng/application/",
  },
];

const Contact = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const subject = encodeURIComponent("NSUK admission enquiry");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:info@nsuk.edu.ng?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Get in touch with the NSUK Admissions Office for further enquiries
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {contactInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg nsuk-gradient flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-foreground text-sm">{info.label}</h3>
                  {info.href ? (
                    <a
                      href={info.href}
                      target={info.href.startsWith("http") ? "_blank" : undefined}
                      rel={info.href.startsWith("http") ? "noreferrer" : undefined}
                      className="text-sm text-primary underline underline-offset-4 break-words"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground font-body">{info.value}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-name" className="text-sm font-body font-medium text-foreground block mb-1">Full Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-sm font-body font-medium text-foreground block mb-1">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-sm font-body font-medium text-foreground block mb-1">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                  placeholder="Type your enquiry..."
                />
              </div>
              <Button type="submit" className="w-full">Prepare Email</Button>
              <p className="text-xs text-muted-foreground font-body">
                Your email app will open with your message addressed to info@nsuk.edu.ng.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;