import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faculties = [
  { faculty: "Faculty of Administration", departments: ["Public Administration", "Business Administration", "Accounting", "Banking and Finance"] },
  { faculty: "Faculty of Arts", departments: ["Arabic Studies", "English", "History", "Islamic Studies", "Linguistics", "French", "Theatre Arts"] },
  { faculty: "Faculty of Education", departments: ["Educational Foundations", "Science Education", "Arts and Social Science Education", "Guidance and Counselling", "Library and Information Science"] },
  { faculty: "Faculty of Science", departments: ["Biochemistry", "Chemistry", "Computer Science", "Mathematics", "Microbiology", "Physics", "Geology"] },
  { faculty: "Faculty of Social Sciences", departments: ["Economics", "Geography", "Mass Communication", "Political Science", "Psychology", "Sociology"] },
  { faculty: "Faculty of Law", departments: ["Private and Property Law", "Public Law", "Islamic Law"] },
  { faculty: "Faculty of Natural and Applied Sciences", departments: ["Environmental Management", "Statistics", "Industrial Chemistry"] },
  { faculty: "Faculty of Agriculture", departments: ["Agronomy", "Animal Science", "Agricultural Economics", "Soil Science"] },
];

const FacultiesDepartments = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl nsuk-gradient flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Faculties & Departments</h1>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Explore all {faculties.length} faculties and their departments at Nasarawa State University, Keffi.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Accordion type="multiple" className="space-y-3">
            {faculties.map((f, i) => (
              <AccordionItem key={i} value={`faculty-${i}`} className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                <AccordionTrigger className="font-display text-base md:text-lg font-semibold text-foreground hover:no-underline py-5">
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg nsuk-gradient flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                      {f.departments.length}
                    </span>
                    {f.faculty}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                    {f.departments.map((dept, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm font-body text-foreground/80 px-3 py-2 rounded-lg bg-muted/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {dept}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
};

export default FacultiesDepartments;
