import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Frontend Developer at Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content: "This course transformed my career. I went from basic JavaScript to landing a job at Google in 6 months. The practical projects made all the difference.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    title: "Full Stack Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    content: "The most comprehensive React course I've taken. The state management and testing modules were exactly what I needed to level up.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    title: "Tech Lead at Stripe",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    content: "I recommend this course to everyone on my team. The instructor explains complex concepts in a way that's easy to understand and apply.",
    rating: 5,
  },
  {
    name: "David Kim",
    title: "Senior Engineer at Netflix",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    content: "The performance optimization and testing sections alone are worth the price. This course helped me write more robust, production-ready code.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    title: "Startup Founder",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    content: "As a non-technical founder, this course gave me the skills to build my own MVP. The step-by-step approach is perfect for beginners.",
    rating: 5,
  },
  {
    name: "James Wilson",
    title: "React Consultant",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    content: "Even as an experienced developer, I learned new patterns and best practices. The advanced hooks and architecture sections are gold.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Loved by Thousands of Developers
          </h2>
          <p className="text-muted-foreground text-lg">
            See what our students have to say about their learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
