import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCourseData();
      fetchProgress();
    }
  }, [user]);

  const fetchCourseData = async () => {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true);

    if (coursesData && coursesData.length > 0) {
      setCourses(coursesData);

      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", coursesData[0].id)
        .order("order_index");

      if (modulesData) {
        setModules(modulesData);
        if (modulesData.length > 0) {
          setSelectedModule(modulesData[0].id);
        }
      }

      const moduleIds = modulesData?.map((m) => m.id) || [];
      if (moduleIds.length > 0) {
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("order_index");

        if (lessonsData) {
          setLessons(lessonsData);
          if (lessonsData.length > 0) {
            setSelectedLesson(lessonsData[0]);
          }
        }
      }
    }
  };

  const fetchProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id);

    if (data) {
      setProgress(data);
    }
  };

  const markComplete = async (lessonId: string) => {
    if (!user) return;

    const existing = progress.find((p) => p.lesson_id === lessonId);

    if (existing) {
      await supabase
        .from("user_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    fetchProgress();
  };

  const isLessonComplete = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const getModuleLessons = (moduleId: string) => {
    return lessons.filter((l) => l.module_id === moduleId);
  };

  const completedLessons = progress.filter((p) => p.completed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show placeholder if no courses exist
  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">ReactMaster</span>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-4">No Courses Available Yet</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            We're working on creating amazing content for you. Check back soon for new courses!
          </p>
          <Button asChild className="gradient-bg">
            <Link to="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">ReactMaster</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <div className="w-32">
                <Progress value={progressPercent} className="h-2" />
              </div>
              <span className="text-sm font-medium">
                {completedLessons}/{totalLessons}
              </span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border bg-card min-h-[calc(100vh-4rem)] hidden lg:block overflow-y-auto">
          <div className="p-6">
            <h2 className="font-semibold mb-4">{courses[0]?.title}</h2>
            
            {/* Progress Card */}
            <div className="p-4 bg-muted rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-medium">Your Progress</span>
              </div>
              <Progress value={progressPercent} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>

            {/* Modules */}
            <div className="space-y-2">
              {modules.map((module) => (
                <div key={module.id}>
                  <button
                    onClick={() =>
                      setSelectedModule(selectedModule === module.id ? null : module.id)
                    }
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                      selectedModule === module.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium text-sm">{module.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        selectedModule === module.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {selectedModule === module.id && (
                    <div className="pl-4 mt-2 space-y-1">
                      {getModuleLessons(module.id).map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                            selectedLesson?.id === lesson.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {isLessonComplete(lesson.id) ? (
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          ) : (
                            <Play className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {selectedLesson ? (
            <div className="max-w-4xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span>{courses[0]?.title}</span>
                <ChevronRight className="w-4 h-4" />
                <span>
                  {modules.find((m) => m.id === selectedLesson.module_id)?.title}
                </span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{selectedLesson.title}</span>
              </div>

              {/* Video Player Placeholder */}
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-8 border border-border">
                <div className="text-center">
                  <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground">Video content coming soon</p>
                </div>
              </div>

              {/* Lesson Info */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold font-display mb-2">
                    {selectedLesson.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedLesson.duration_minutes} min
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => markComplete(selectedLesson.id)}
                  disabled={isLessonComplete(selectedLesson.id)}
                  className={
                    isLessonComplete(selectedLesson.id)
                      ? "bg-success hover:bg-success"
                      : "gradient-bg hover:opacity-90"
                  }
                >
                  {isLessonComplete(selectedLesson.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              </div>

              {/* Lesson Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground">
                  {selectedLesson.content ||
                    "Lesson content will be displayed here. This includes detailed explanations, code examples, and practical exercises."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a lesson to start</h2>
              <p className="text-muted-foreground">
                Choose a lesson from the sidebar to begin learning
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
