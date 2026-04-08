import { motion } from "framer-motion";
import { BookOpen, ClipboardCheck, FileText, Users, DollarSign, Calendar } from "lucide-react";

const sections = [
  {
    icon: ClipboardCheck,
    title: "JAMB Requirements",
    content: [
      "Purchase JAMB form and register for UTME",
      "Choose Nasarawa State University, Keffi as your preferred institution",
      "Select your desired course of study",
      "Sit for and pass the UTME examination",
      "Score above the required cut-off mark for your chosen course",
      "NSUK institution code: varies by year — check JAMB portal",
    ],
  },
  {
    icon: FileText,
    title: "Post-UTME Screening",
    content: [
      "Visit the NSUK portal to purchase the Post-UTME form",
      "Fill in your details accurately including JAMB registration number",
      "Upload required documents (O'Level results, passport photo)",
      "Pay the screening fee as specified",
      "Check the portal for your screening schedule",
      "Attend the screening exercise at the designated venue",
    ],
  },
  {
    icon: Users,
    title: "Admission Types",
    content: [
      "**UTME Admission**: For candidates who sat for JAMB and scored the required cut-off",
      "**Direct Entry**: For candidates with NCE, ND, HND, or A'Level results",
      "**Pre-Degree Programme**: Foundation year for candidates who need to meet requirements",
      "**Transfer Students**: Students transferring from other universities (subject to availability)",
    ],
  },
  {
    icon: BookOpen,
    title: "Faculties & Courses",
    content: [
      "**Faculty of Administration**: Public Administration, Business Administration, Accounting, Banking and Finance",
      "**Faculty of Arts**: Arabic Studies, English, History, Islamic Studies, Linguistics, French, Theatre Arts",
      "**Faculty of Education**: Educational Foundations, Science Education, Arts and Social Science Education, Guidance and Counselling, Library and Information Science",
      "**Faculty of Science**: Biochemistry, Chemistry, Computer Science, Mathematics, Microbiology, Physics, Geology",
      "**Faculty of Social Sciences**: Economics, Geography, Mass Communication, Political Science, Psychology, Sociology",
      "**Faculty of Law**: Private and Property Law, Public Law, Islamic Law",
      "**Faculty of Natural and Applied Sciences**: Environmental Management, Statistics, Industrial Chemistry",
      "**Faculty of Agriculture**: Agronomy, Animal Science, Agricultural Economics, Soil Science",
    ],
  },
  {
    icon: DollarSign,
    title: "School Fees & Costs",
    content: [
      "School fees vary by faculty and level of study",
      "Fees are payable per session and must be paid before registration",
      "Acceptance fee is required after receiving admission",
      "Hostel accommodation fees are separate from tuition",
      "Visit the NSUK Bursary Department for current fee schedules",
      "Payment is typically done through the university portal",
    ],
  },
  {
    icon: Calendar,
    title: "Important Dates",
    content: [
      "JAMB registration: Usually January – February each year",
      "UTME examination: Typically April – May",
      "Post-UTME screening: Usually August – October",
      "Admission list release: September – December",
      "Registration deadline: Check NSUK portal each session",
      "Always verify dates on the official NSUK website",
    ],
  },
];

const AdmissionGuide = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Admission Guide</h1>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Everything you need to know about gaining admission into Nasarawa State University, Keffi.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl nsuk-gradient flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground pt-2">{section.title}</h2>
              </div>
              <ul className="space-y-3 ml-16">
                {section.content.map((item, j) => (
                  <li key={j} className="text-sm text-foreground/80 font-body flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdmissionGuide;