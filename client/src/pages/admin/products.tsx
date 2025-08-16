import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/utils/imageUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ImageUpload from "@/components/admin/ImageUpload";

// Type for Product
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  sku?: string;
  category: string;
  stockQuantity: number;
  imageUrl: string;
  featured: boolean | null;
  farmerId: number;
}

// Type for paginated products response
interface PaginatedProducts {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form schema for product
const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  discountPrice: z.number().min(0, "Discount price cannot be negative").nullable().optional(),
  sku: z.string().min(1, "SKU is required").regex(/^[A-Z0-9-_]+$/i, "SKU can only contain letters, numbers, hyphens, and underscores"),
  category: z.string().min(1, "Please select a category"),
  stockQuantity: z.number().int().min(0, "Stock quantity must be 0 or greater"),
  imageUrl: z.string().min(1, "Please upload at least one image"),
  farmerId: z.number().int().positive("Please select a valid farmer"),
  featured: z.boolean().optional(),
});

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeletionErrorDialogOpen, setIsDeletionErrorDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [deletionError, setDeletionError] = useState<{
    message: string;
    orderIds: number[];
    pendingVariantSkus: string[];
  } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [farmers, setFarmers] = useState<{ id: number; name: string }[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const productsPerPage = 10;
  const { toast } = useToast();

  // Form for creating/editing products
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: null,
      sku: "",
      category: "",
      stockQuantity: 0,
      imageUrl: "",
      farmerId: 1,
      featured: false,
    },
  });

  // Fetch products from API
  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `/api/admin/products?page=${page}&limit=${productsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: PaginatedProducts = await response.json();
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/admin/product-categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  // Fetch farmers for product creation/editing
  const fetchFarmers = async () => {
    try {
      const response = await fetch("/api/farmers");

      if (!response.ok) {
        throw new Error("Failed to fetch farmers");
      }

      const data = await response.json();
      setFarmers(
        data.map((farmer: any) => ({ id: farmer.id, name: farmer.name }))
      );
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch farmers",
        variant: "destructive",
      });
    }
  };

  // Load products, categories, and farmers on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFarmers();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
  };

  // Delete a product
  const handleDeleteProduct = async (id: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Check if it's a deletion restriction error
        if (response.status === 400 && responseData.orderIds) {
          setDeletionError(responseData);
          setIsDeletionErrorDialogOpen(true);
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
          return;
        }
        throw new Error(responseData.message || "Failed to delete product");
      }

      // Refresh products list
      fetchProducts(currentPage);

      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Toggle product featured status
  const handleToggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/admin/products/${id}/featured`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      // Refresh products list
      fetchProducts(currentPage);

      toast({
        title: currentFeatured ? "Product unfeatured" : "Product featured",
        description: `The product has been ${
          currentFeatured ? "removed from" : "added to"
        } featured products.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Set up form for editing
  const setupEditForm = (product: Product) => {
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || null,
      sku: product.sku || "",
      category: product.category,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      farmerId: product.farmerId,
      featured: product.featured || false,
    });
    setProductToEdit(product);
    setIsEditDialogOpen(true);
  };

  // Set up form for creating
  const setupCreateForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      discountPrice: null,
      sku: "",
      category: "",
      stockQuantity: 0,
      imageUrl: "",
      farmerId: 1,
      featured: false,
    });
    setUploadedImages([]);
    setIsCreateDialogOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (imagePath: string, thumbnailPath: string) => {
    setUploadedImages((prev) => [...prev, imagePath]);
    form.setValue("imageUrl", imagePath);
  };

  // Handle image removal - fix infinite loop by using functional update properly
  const handleImageRemove = (imagePath: string) => {
    setUploadedImages((prevImages) => {
      const newImages = prevImages.filter((img) => img !== imagePath);
      if (newImages.length === 0) {
        form.setValue("imageUrl", "");
      } else {
        form.setValue("imageUrl", newImages[0]);
      }
      return newImages;
    });
  };

  // Handle form submission for creating/editing
  const onSubmit = async (data: z.infer<typeof productFormSchema>) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      let response;

      if (productToEdit) {
        // Update existing product
        response = await fetch(`/api/admin/products/${productToEdit.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new product
        response = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        throw new Error(
          productToEdit
            ? "Failed to update product"
            : "Failed to create product"
        );
      }

      // Refresh products list
      fetchProducts(currentPage);

      toast({
        title: productToEdit ? "Product updated" : "Product created",
        description: productToEdit
          ? "The product has been updated successfully."
          : "The product has been created successfully.",
      });

      // Close dialogs and reset state
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setProductToEdit(null);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save product",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={setupCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
              <Button type="submit" size="sm" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-500">
                {error}
              </div>
            ) : (
              <>
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-md overflow-hidden border">
                              <img
                                src={getImageUrl(product.imageUrl)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/public/uploads/products/no-profile.jpg";
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.stockQuantity === 0 ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : product.stockQuantity < 10 ? (
                              <Badge variant="outline">
                                Low Stock: {product.stockQuantity}
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                {product.stockQuantity}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.featured ? (
                              <Badge variant="secondary">Featured</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleToggleFeatured(
                                    product.id,
                                    Boolean(product.featured)
                                  )
                                }
                              >
                                {product.featured ? (
                                  <StarOff className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <Star className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setupEditForm(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setProductToDelete(product);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                productToDelete && handleDeleteProduct(productToDelete.id)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., COFFEE-ARABICA-250G"
                        style={{ textTransform: 'uppercase' }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Optional"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : parseFloat(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="farmerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a farmer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {farmers.map((farmer) => (
                            <SelectItem
                              key={farmer.id}
                              value={farmer.id.toString()}
                            >
                              {farmer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Product Images</FormLabel>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  existingImages={uploadedImages}
                  maxImages={5}
                  multiple={true}
                />
              </div>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Product</FormLabel>
                      <FormDescription>
                        Featured products will be displayed prominently on the
                        homepage
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your catalog.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., COFFEE-ARABICA-250G"
                        style={{ textTransform: 'uppercase' }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Optional"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : parseFloat(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="farmerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a farmer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {farmers.map((farmer) => (
                            <SelectItem
                              key={farmer.id}
                              value={farmer.id.toString()}
                            >
                              {farmer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Product Images</FormLabel>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  existingImages={uploadedImages}
                  maxImages={5}
                  multiple={true}
                />
              </div>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Product</FormLabel>
                      <FormDescription>
                        Featured products will be displayed prominently on the
                        homepage
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Create Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Deletion Error Dialog */}
      <Dialog open={isDeletionErrorDialogOpen} onOpenChange={setIsDeletionErrorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cannot Delete Product</DialogTitle>
            <DialogDescription>
              This product cannot be deleted because it has variants with pending orders.
            </DialogDescription>
          </DialogHeader>
          
          {deletionError && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Affected Orders ({deletionError.orderIds.length}):</h4>
                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                  <div className="grid grid-cols-5 gap-2">
                    {deletionError.orderIds.map((orderId) => (
                      <span key={orderId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        #{orderId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Pending Variant SKUs ({deletionError.pendingVariantSkus.length}):</h4>
                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                  <div className="grid grid-cols-3 gap-2">
                    {deletionError.pendingVariantSkus.map((sku) => (
                      <span key={sku} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {sku}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                <strong>Solution:</strong> Complete or cancel the pending orders first, then try deleting the product again.
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletionErrorDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
