import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import { z } from "zod";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
}

const lessonSchema = z.object({
  module_id: z.string().uuid("Please select a module"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().trim().max(10000, "Content too long").optional(),
  video_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
  duration_minutes: z.number().min(0),
  order_index: z.number().min(0),
});

const AdminLessons = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    content: "",
    video_url: "",
    duration_minutes: 0,
    order_index: 0,
  });

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
    if (isAdmin) {
      fetchLessons();
      fetchModules();
    }
  }, [isAdmin]);

  const fetchLessons = async () => {
    const { data } = await supabase.from("lessons").select("*").order("order_index");
    if (data) setLessons(data);
  };

  const fetchModules = async () => {
    const { data } = await supabase.from("modules").select("id, title, course_id");
    if (data) setModules(data);
  };

  const resetForm = () => {
    setFormData({ module_id: "", title: "", content: "", video_url: "", duration_minutes: 0, order_index: 0 });
    setEditingLesson(null);
  };

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      module_id: lesson.module_id,
      title: lesson.title,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      lessonSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }

    const lessonData = {
      module_id: formData.module_id,
      title: formData.title.trim(),
      content: formData.content.trim() || null,
      video_url: formData.video_url.trim() || null,
      duration_minutes: formData.duration_minutes,
      order_index: formData.order_index,
    };

    if (editingLesson) {
      const { error } = await supabase.from("lessons").update(lessonData).eq("id", editingLesson.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update lesson", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Lesson updated successfully" });
      }
    } else {
      const { error } = await supabase.from("lessons").insert(lessonData);
      if (error) {
        toast({ title: "Error", description: "Failed to create lesson", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Lesson created successfully" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchLessons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete lesson", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Lesson deleted successfully" });
      fetchLessons();
    }
  };

  const getModuleName = (moduleId: string) => modules.find(m => m.id === moduleId)?.title || "Unknown";

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout title="Manage Lessons">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Add lessons with video content</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Module *</Label>
                <Select value={formData.module_id} onValueChange={(value) => setFormData({ ...formData, module_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="video_url" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video URL (YouTube or Vimeo)
                </Label>
                <Input 
                  id="video_url" 
                  type="url" 
                  value={formData.video_url} 
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} 
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">Supports YouTube and Vimeo URLs</p>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} placeholder="Lesson description and notes..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" min="0" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label htmlFor="order">Order Index</Label>
                  <Input id="order" type="number" min="0" value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 gradient-bg">{editingLesson ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Video</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>{getModuleName(lesson.module_id)}</TableCell>
                  <TableCell>{lesson.duration_minutes} min</TableCell>
                  <TableCell>
                    {lesson.video_url ? (
                      <span className="text-success flex items-center gap-1">
                        <Video className="w-4 h-4" /> Added
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(lesson)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {lessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No lessons yet. Create your first lesson!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminLessons;
