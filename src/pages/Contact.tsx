import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe, Clock } from "lucide-react";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "Nasarawa State University, PMB 1022, Keffi, Nasarawa State, Nigeria" },
  { icon: Phone, label: "Phone", value: "+234 (0) XXX XXX XXXX" },
  { icon: Mail, label: "Email", value: "admissions@nsuk.edu.ng" },
  { icon: Globe, label: "Website", value: "www.nsuk.edu.ng" },
  { icon: Clock, label: "Office Hours", value: "Monday – Friday, 8:00 AM – 4:00 PM" },
];

const Contact = () => {
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
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg nsuk-gradient flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-foreground text-sm">{info.label}</h3>
                  <p className="text-sm text-muted-foreground font-body">{info.value}</p>
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
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                  placeholder="Type your enquiry..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg nsuk-gradient text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;