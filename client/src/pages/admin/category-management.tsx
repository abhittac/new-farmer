import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import MainLoader from "@/utils/MainLoader";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  createdAt: string;
}
export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<{
    [key: number]: Category[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateSubcategoryDialog, setShowCreateSubcategoryDialog] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");

  const { toast } = useToast();

  const fetchCategories = async (
    preserveExpanded = false,
    categoryIdToPreserve?: number
  ) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await fetch("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allCategories = await response.json();

        const mainCategories = allCategories.filter(
          (cat: Category) => !cat.parentId
        );
        const subcategoriesMap: { [key: number]: Category[] } = {};

        allCategories.forEach((cat: Category) => {
          if (cat.parentId) {
            if (!subcategoriesMap[cat.parentId]) {
              subcategoriesMap[cat.parentId] = [];
            }
            subcategoriesMap[cat.parentId].push(cat);
          }
        });

        setCategories(mainCategories);
        setSubcategories(subcategoriesMap);

        // Preserve expanded state if requested
        if (preserveExpanded && categoryIdToPreserve) {
          setExpandedCategories((prev) => {
            const newExpanded = new Set(prev);
            newExpanded.add(categoryIdToPreserve);
            return newExpanded;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription || undefined,
        }),
      });
      if (res.ok) {
        await fetchCategories();
        setShowCreateDialog(false);
        setCategoryName("");
        setCategoryDescription("");
        toast({ title: "Success", description: "Category created" });
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create category",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const createSubcategory = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `/api/admin/categories/${selectedCategory?.id}/subcategories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: subcategoryName.trim(),
            description: subcategoryDescription || undefined,
          }),
        }
      );
      if (res.ok) {
        await fetchCategories();
        setShowCreateSubcategoryDialog(false);
        setSubcategoryName("");
        setSubcategoryDescription("");
        setSelectedCategory(null);
        toast({ title: "Success", description: "Subcategory created" });
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create subcategory",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        editingCategory?.parentId
          ? `/api/admin/subcategories/${editingCategory.id}`
          : `/api/admin/categories/${editingCategory?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryName.trim(),
            description: categoryDescription || undefined,
          }),
        }
      );
      if (res.ok) {
        if (editingCategory?.parentId) {
          // Preserve the parent's expanded state
          await fetchCategories(true, editingCategory.parentId);
        } else {
          // Preserve this category's expanded state
          await fetchCategories(true, editingCategory?.id);
        }
        setShowEditDialog(false);
        setEditingCategory(null);
        toast({ title: "Updated", description: "Category updated" });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (category: Category) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        category.parentId
          ? `/api/admin/subcategories/${category.id}`
          : `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        if (category.parentId) {
          // Preserve the parent's expanded state
          await fetchCategories(true, category.parentId);
        } else {
          await fetchCategories();
        }
        toast({ title: "Deleted", description: "Category deleted" });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);

        // Only fetch if we don't already have the subcategories
        if (!subcategories[categoryId]) {
          fetchSubcategories(categoryId);
        }
      }
      return newSet;
    });
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `/api/admin/categories/${categoryId}/subcategories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const subs = await res.json();
        setSubcategories((prev) => ({
          ...prev,
          [categoryId]: subs,
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subcategories",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || "");
    setShowEditDialog(true);
  };

  const openCreateSubcategoryDialog = (cat: Category) => {
    setSelectedCategory(cat);
    setShowCreateSubcategoryDialog(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <MainLoader />
      </div>
    );
  }

  return (
    <div className="container ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {categories.map((cat) => (
        <Card key={cat.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategoryExpansion(cat.id)}
                >
                  {expandedCategories.has(cat.id) ? (
                    <ChevronDown />
                  ) : (
                    <ChevronRight />
                  )}
                </Button>
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openCreateSubcategoryDialog(cat)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Subcategory
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(cat)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteCategory(cat)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Subcategories */}
            <AnimatePresence>
              {expandedCategories.has(cat.id) &&
                subcategories[cat.id]?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-4 space-y-2"
                  >
                    {subcategories[cat.id].map((sub) => (
                      <Card key={sub.id} className="bg-muted/50">
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <h4>{sub.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {sub.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(sub)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCategory(sub)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <Label>Name</Label>
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <Label>Description</Label>
          <Input
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
          />
          <Button onClick={createCategory}>Create</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Category/Subcategory Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editingCategory?.parentId ? "Subcategory" : "Category"}
            </DialogTitle>
          </DialogHeader>
          <Label>Name</Label>
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <Label>Description</Label>
          <Input
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
          />
          <Button onClick={updateCategory}>Update</Button>
        </DialogContent>
      </Dialog>

      {/* Create Subcategory Dialog */}
      <Dialog
        open={showCreateSubcategoryDialog}
        onOpenChange={setShowCreateSubcategoryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Subcategory to {selectedCategory?.name}
            </DialogTitle>
          </DialogHeader>
          <Label>Name</Label>
          <Input
            value={subcategoryName}
            onChange={(e) => setSubcategoryName(e.target.value)}
          />
          <Label>Description</Label>
          <Input
            value={subcategoryDescription}
            onChange={(e) => setSubcategoryDescription(e.target.value)}
          />
          <Button onClick={createSubcategory}>Create</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
