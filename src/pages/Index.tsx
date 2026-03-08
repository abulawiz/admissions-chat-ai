import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, BookOpen, ClipboardList, HelpCircle, Phone, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import nsukLogo from "@/assets/nsuk-logo.png";
import nsukCampus from "@/assets/nsuk-campus.jpg";

const features = [
  { icon: MessageCircle, title: "AI Chat Assistant", desc: "Get instant answers to your admission questions 24/7", link: "/chat" },
  { icon: BookOpen, title: "Courses & Faculties", desc: "Explore programs across all faculties and departments", link: "/admission-guide" },
  { icon: ClipboardList, title: "Application Guide", desc: "Step-by-step guide through the admission process", link: "/admission-guide" },
  { icon: HelpCircle, title: "FAQs", desc: "Find answers to the most common admission questions", link: "/faqs" },
  { icon: Phone, title: "Contact Us", desc: "Reach out to the admission office directly", link: "/contact" },
  { icon: GraduationCap, title: "JAMB & Post-UTME", desc: "Requirements, cut-off marks, and registration info", link: "/admission-guide" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative nsuk-gradient py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-primary-foreground/30" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-2 border-primary-foreground/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-primary-foreground/10" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <GraduationCap className="w-12 h-12 text-accent-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4"
          >
            NSUK Admission Guide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-primary-foreground/80 font-body max-w-2xl mx-auto mb-8"
          >
            Your AI-powered guide to admission at Nasarawa State University, Keffi.
            Get instant answers about courses, requirements, deadlines, and more.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="gold-gradient text-accent-foreground font-body font-semibold hover:opacity-90 shadow-lg text-base px-8">
              <Link to="/chat">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with AI Assistant
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-body text-base px-8">
              <Link to="/admission-guide">
                <BookOpen className="w-5 h-5 mr-2" />
                View Admission Guide
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">How Can We Help You?</h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">Everything you need to know about NSUK admission in one place</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={f.link}
                className="group block p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl nsuk-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="nsuk-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Ready to Start Your Journey?</h2>
          <p className="text-primary-foreground/80 font-body mb-8 max-w-lg mx-auto">
            Our AI assistant is available 24/7 to answer all your admission questions. Start a conversation now!
          </p>
          <Button asChild size="lg" className="gold-gradient text-accent-foreground font-body font-semibold hover:opacity-90 shadow-lg text-base px-8">
            <Link to="/chat">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chatting Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;