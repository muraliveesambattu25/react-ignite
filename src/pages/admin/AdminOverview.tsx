import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layers, FileText, Users, TrendingUp } from "lucide-react";

interface Stats {
  courses: number;
  modules: number;
  lessons: number;
  leads: number;
}

const AdminOverview = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ courses: 0, modules: 0, lessons: 0, leads: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!adminLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [coursesRes, modulesRes, lessonsRes, leadsRes] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("modules").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        courses: coursesRes.count || 0,
        modules: modulesRes.count || 0,
        lessons: lessonsRes.count || 0,
        leads: leadsRes.count || 0,
      });
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Courses", value: stats.courses, icon: BookOpen, color: "text-blue-500" },
    { title: "Total Modules", value: stats.modules, icon: Layers, color: "text-purple-500" },
    { title: "Total Lessons", value: stats.lessons, icon: FileText, color: "text-green-500" },
    { title: "Total Leads", value: stats.leads, icon: Users, color: "text-orange-500" },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar to manage your courses, modules, and lessons. Add video content to lessons and track leads from your curriculum downloads.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminOverview;
