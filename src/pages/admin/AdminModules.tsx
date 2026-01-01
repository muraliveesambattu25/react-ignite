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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

const moduleSchema = z.object({
  course_id: z.string().uuid("Please select a course"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().trim().max(1000, "Description too long").optional(),
  order_index: z.number().min(0),
});

const AdminModules = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
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
      fetchModules();
      fetchCourses();
    }
  }, [isAdmin]);

  const fetchModules = async () => {
    const { data } = await supabase.from("modules").select("*").order("order_index");
    if (data) setModules(data);
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("id, title");
    if (data) setCourses(data);
  };

  const resetForm = () => {
    setFormData({ course_id: "", title: "", description: "", order_index: 0 });
    setEditingModule(null);
  };

  const openEditDialog = (module: Module) => {
    setEditingModule(module);
    setFormData({
      course_id: module.course_id,
      title: module.title,
      description: module.description || "",
      order_index: module.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      moduleSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }

    const moduleData = {
      course_id: formData.course_id,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      order_index: formData.order_index,
    };

    if (editingModule) {
      const { error } = await supabase.from("modules").update(moduleData).eq("id", editingModule.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update module", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Module updated successfully" });
      }
    } else {
      const { error } = await supabase.from("modules").insert(moduleData);
      if (error) {
        toast({ title: "Error", description: "Failed to create module", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Module created successfully" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchModules();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all lessons in this module.")) return;
    
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete module", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Module deleted successfully" });
      fetchModules();
    }
  };

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || "Unknown";

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout title="Manage Modules">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Organize your course content into modules</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Course *</Label>
                <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label htmlFor="order">Order Index</Label>
                <Input id="order" type="number" min="0" value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 gradient-bg">{editingModule ? "Update" : "Create"}</Button>
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
                <TableHead>Course</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.title}</TableCell>
                  <TableCell>{getCourseName(module.course_id)}</TableCell>
                  <TableCell>{module.order_index}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(module)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(module.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {modules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No modules yet. Create your first module!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminModules;
