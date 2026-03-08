import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "What is the JAMB cut-off mark for NSUK?",
    a: "The JAMB cut-off mark for NSUK varies each year and also depends on the course applied for. Generally, the minimum is 160, but competitive courses like Law, Medicine, and Mass Communication may require higher scores. Check the NSUK portal or contact the admissions office for the current session's cut-off marks.",
  },
  {
    q: "How do I apply for admission to NSUK?",
    a: "To apply: 1) Register for JAMB UTME and select NSUK as your institution of choice. 2) Score above the cut-off mark. 3) Visit the NSUK portal to purchase and fill the Post-UTME screening form. 4) Attend the screening exercise. 5) Check the admission list on the portal and JAMB CAPS.",
  },
  {
    q: "Does NSUK accept second choice candidates?",
    a: "Yes, NSUK does consider second choice candidates, especially when there are available slots after first choice admissions. However, first choice candidates are given priority. It's advisable to make NSUK your first choice for a better chance of admission.",
  },
  {
    q: "What courses are available at NSUK?",
    a: "NSUK offers courses across multiple faculties including Administration, Arts, Education, Law, Natural & Applied Sciences, Social Sciences, and Environmental Sciences. Popular courses include Computer Science, Law, Mass Communication, Accounting, Business Administration, Economics, and more.",
  },
  {
    q: "When does the Post-UTME registration start?",
    a: "Post-UTME registration typically begins between August and October each year, after JAMB results are released. The exact dates are announced on the official NSUK website and portal. Keep checking the NSUK portal regularly for updates.",
  },
  {
    q: "What are the school fees at NSUK?",
    a: "School fees at NSUK vary by faculty, programme, and level. They are generally affordable compared to many other Nigerian universities. Fees are payable per session through the university portal. Contact the Bursary Department for the current fee schedule.",
  },
  {
    q: "Does NSUK offer Direct Entry admission?",
    a: "Yes, NSUK accepts Direct Entry candidates. You need to apply through JAMB Direct Entry with qualifications such as NCE, ND, HND, or A'Level results. You must also meet the specific entry requirements for your chosen course.",
  },
  {
    q: "Is hostel accommodation available at NSUK?",
    a: "Yes, NSUK has hostel accommodation on campus for both male and female students. Hostel spaces are allocated on a first-come, first-served basis during registration. There are also private hostels available around the university.",
  },
  {
    q: "How do I check my admission status?",
    a: "You can check your admission status through: 1) The NSUK admission portal. 2) JAMB CAPS (Central Admissions Processing System). 3) The notice boards on campus. You may also be notified via the email or phone number you provided during registration.",
  },
  {
    q: "What documents do I need for registration?",
    a: "Required documents include: JAMB admission letter, O'Level results (WAEC/NECO), birth certificate or age declaration, local government identification letter, passport photographs, JAMB result slip, Post-UTME screening result, and medical certificate of fitness.",
  },
];

const FAQs = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Quick answers to the most common admission enquiries about NSUK
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="font-body font-semibold text-foreground text-left text-sm md:text-base hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-body pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground font-body mb-4">Can't find what you're looking for?</p>
          <Button asChild className="nsuk-gradient text-primary-foreground font-body hover:opacity-90">
            <Link to="/chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask the AI Assistant
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQs;