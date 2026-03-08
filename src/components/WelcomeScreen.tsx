import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Calendar, DollarSign, Globe } from "lucide-react";

const suggestions = [
  { icon: BookOpen, text: "What programs do you offer?" },
  { icon: Calendar, text: "When are application deadlines?" },
  { icon: DollarSign, text: "Tell me about scholarships" },
  { icon: Globe, text: "Do you accept international students?" },
];

export function WelcomeScreen({ onSelect }: { onSelect: (msg: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mb-6 shadow-lg"
      >
        <GraduationCap className="w-10 h-10 text-accent-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-2"
      >
        Admissions Assistant
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center mb-8 max-w-md font-body"
      >
        Your AI guide to university admissions. Ask me anything about programs, requirements, deadlines, and more.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            onClick={() => onSelect(s.text)}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-gold-light transition-colors">
              <s.icon className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-sm font-body text-foreground">{s.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
