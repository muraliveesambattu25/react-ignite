import { Code, Layers, Zap, Shield, Smartphone, Cloud } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Modern React Patterns",
    description: "Learn hooks, context, custom hooks, and the latest React 18+ features.",
  },
  {
    icon: Layers,
    title: "State Management",
    description: "Master Redux, Zustand, and React Query for scalable applications.",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Build lightning-fast apps with memoization, code splitting, and lazy loading.",
  },
  {
    icon: Shield,
    title: "Testing & Quality",
    description: "Write robust tests with Jest, React Testing Library, and Cypress.",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Create beautiful UIs with Tailwind CSS and modern design systems.",
  },
  {
    icon: Cloud,
    title: "Deployment & DevOps",
    description: "Deploy to Vercel, AWS, and set up CI/CD pipelines like a pro.",
  },
];

const Features = () => {
  return (
    <section id="courses" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything You Need to Become a React Expert
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive curriculum covering all aspects of modern React development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 gradient-bg rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
