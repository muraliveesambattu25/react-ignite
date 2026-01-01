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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  is_published: boolean;
}

const courseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().trim().max(2000, "Description too long").optional(),
  thumbnail_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
  price: z.number().min(0, "Price must be positive"),
  is_published: z.boolean(),
});

const AdminCourses = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    price: 0,
    is_published: false,
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
    if (isAdmin) fetchCourses();
  }, [isAdmin]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", thumbnail_url: "", price: 0, is_published: false });
    setEditingCourse(null);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      thumbnail_url: course.thumbnail_url || "",
      price: course.price,
      is_published: course.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      courseSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }

    const courseData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      thumbnail_url: formData.thumbnail_url.trim() || null,
      price: formData.price,
      is_published: formData.is_published,
    };

    if (editingCourse) {
      const { error } = await supabase.from("courses").update(courseData).eq("id", editingCourse.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Course updated successfully" });
      }
    } else {
      const { error } = await supabase.from("courses").insert(courseData);
      if (error) {
        toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Course created successfully" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This will also delete all modules and lessons.")) return;
    
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course deleted successfully" });
      fetchCourses();
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout title="Manage Courses">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Create and manage your courses</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input id="thumbnail_url" type="url" value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                <Label htmlFor="is_published">Published</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 gradient-bg">{editingCourse ? "Update" : "Create"}</Button>
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
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.is_published ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(course)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No courses yet. Create your first course!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCourses;
