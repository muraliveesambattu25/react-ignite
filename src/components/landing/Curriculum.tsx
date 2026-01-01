import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Play, Clock, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const modules = [
  {
    title: "Module 1: React Fundamentals",
    duration: "4 hours",
    lessons: [
      { title: "Introduction to React", duration: "15 min" },
      { title: "JSX Deep Dive", duration: "20 min" },
      { title: "Components & Props", duration: "25 min" },
      { title: "State & Lifecycle", duration: "30 min" },
      { title: "Event Handling", duration: "20 min" },
    ],
  },
  {
    title: "Module 2: React Hooks Mastery",
    duration: "5 hours",
    lessons: [
      { title: "useState & useEffect", duration: "30 min" },
      { title: "useContext & useReducer", duration: "35 min" },
      { title: "useMemo & useCallback", duration: "25 min" },
      { title: "Custom Hooks", duration: "40 min" },
      { title: "Advanced Hook Patterns", duration: "30 min" },
    ],
  },
  {
    title: "Module 3: State Management",
    duration: "6 hours",
    lessons: [
      { title: "Context API Patterns", duration: "30 min" },
      { title: "Redux Toolkit", duration: "45 min" },
      { title: "Zustand for Simple State", duration: "25 min" },
      { title: "React Query for Server State", duration: "40 min" },
      { title: "State Architecture Patterns", duration: "35 min" },
    ],
  },
  {
    title: "Module 4: Testing & Quality",
    duration: "5 hours",
    lessons: [
      { title: "Jest Fundamentals", duration: "30 min" },
      { title: "React Testing Library", duration: "40 min" },
      { title: "Integration Testing", duration: "35 min" },
      { title: "E2E with Cypress", duration: "45 min" },
      { title: "Testing Best Practices", duration: "30 min" },
    ],
  },
];

const emailSchema = z.string().email("Please enter a valid email address");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const Curriculum = () => {
  const [openModule, setOpenModule] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      nameSchema.parse(name);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    
    const { error } = await supabase
      .from("leads")
      .insert([{ email, full_name: name, source: "curriculum_download" }]);

    if (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Check your email for the curriculum PDF.",
      });
      setEmail("");
      setName("");
    }
    
    setLoading(false);
  };

  return (
    <section id="curriculum" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Complete Course Curriculum
          </h2>
          <p className="text-muted-foreground text-lg">
            50+ lessons, 20+ hours of content, and real-world projects.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Curriculum Accordion */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className="border border-border rounded-xl overflow-hidden bg-card"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenModule(openModule === index ? -1 : index)}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {module.duration}
                      </span>
                      <span>{module.lessons.length} lessons</span>
                    </div>
                  </div>
                  {openModule === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {openModule === index && (
                  <div className="px-6 pb-6 space-y-3 animate-fade-up">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.title}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Play className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Lead Capture Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-8 bg-card border border-border rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Download Full Curriculum</h3>
                <p className="text-muted-foreground text-sm">
                  Get the complete curriculum PDF with all 50+ lessons.
                </p>
              </div>

              <form onSubmit={handleDownload} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full gradient-bg hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Download Curriculum"}
                </Button>
              </form>

              <div className="mt-6 space-y-2">
                {["20+ hours of content", "Lifetime access", "Certificate included"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
