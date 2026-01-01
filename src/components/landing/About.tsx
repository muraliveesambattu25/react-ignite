import { Award, Briefcase, GraduationCap, Heart } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 gradient-bg rounded-3xl opacity-20" />
              <img
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=600&fit=crop"
                alt="Instructor"
                className="w-full h-full object-cover rounded-3xl relative z-10"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 p-4 bg-card rounded-xl shadow-lg border border-border z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">10+ Years</p>
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 p-4 bg-card rounded-xl shadow-lg border border-border z-20 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">10,000+</p>
                    <p className="text-xs text-muted-foreground">Students Taught</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Meet Your Instructor
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Hi, I'm Alex Morgan! I've been building web applications for over a decade and have worked with companies like Google, Meta, and numerous startups.
            </p>
            <p className="text-muted-foreground mb-8">
              After mentoring hundreds of developers and seeing the same patterns of struggle, I created this course to share everything I wish I knew when starting out. My teaching philosophy is simple: learn by doing, with real projects that you can add to your portfolio.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Industry Expert</h4>
                  <p className="text-sm text-muted-foreground">Worked at FAANG companies</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Passionate Teacher</h4>
                  <p className="text-sm text-muted-foreground">Loves helping developers grow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
