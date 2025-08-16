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
import placeholderImage from "../../../../public/uploads/products/No-Image.png";
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
  Package,
  Tag,
  Leaf,
  Shield,
  Crown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import ImageUpload from "@/components/admin/ImageUpload";
import MainLoader from "@/utils/MainLoader";

// Enhanced Product type with all fields
interface ProductVariant {
  id?: string; // optional UUID or index
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  stockQuantity: number;
  sku?: string;
}

interface EnhancedProduct {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  farmerId: number;
  featured: boolean;

  variants: ProductVariant[]; // ⬅️ New addition

  // Product Attributes
  naturallyGrown: boolean;
  chemicalFree: boolean;
  premiumQuality: boolean;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;

  // Social Sharing
  enableShareButtons: boolean;
  enableWhatsappShare: boolean;
  enableFacebookShare: boolean;
  enableInstagramShare: boolean;
}
const variantSchema = z.object({
  price: z.number().min(0.01, "Price must be greater than 0"),
  discountPrice: z.preprocess((val) => {
    if (val === "" || val === false || val === undefined || val === null || (typeof val === "string" && val.trim() === "")) return null;
    const numVal = typeof val === "string" ? Number(val) : val;
    return isNaN(numVal) ? null : numVal;
  }, z.number().min(0).nullable().optional()),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Please select a unit"),
  stockQuantity: z.number().int().min(0, "Stock quantity must be 0 or greater"),
  sku: z.string().min(1, "SKU is required"),
});
const enhancedProductFormSchema = z.object({
  // Basic Information
  name: z.string().min(3, "Name must be at least 3 characters"),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters"),
  description: z
    .string()
    .min(20, "Full description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),

  // Replaces flat price/unit/stock with multiple variants
  variants: z.array(variantSchema).min(1, "At least one variant is required"),

  // Product Attributes
  naturallyGrown: z.boolean().default(false),
  chemicalFree: z.boolean().default(false),
  premiumQuality: z.boolean().default(false),

  // Media
  imageUrl: z.string().optional(),
  imageUrls: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),

  // Farmer
  farmerId: z.number().int().positive("Please select a valid farmer"),

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),

  // Social
  enableShareButtons: z.boolean().default(true),
  enableWhatsappShare: z.boolean().default(true),
  enableFacebookShare: z.boolean().default(true),
  enableInstagramShare: z.boolean().default(true),

  featured: z.boolean().default(false),
});

export default function EnhancedAdminProducts() {
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] =
    useState<EnhancedProduct | null>(null);
  const [productToEdit, setProductToEdit] = useState<EnhancedProduct | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [mainCategories, setMainCategories] = useState<
    { id: number; name: string; slug: string }[]
  >([]);
  const [subcategories, setSubcategories] = useState<
    { id: number; name: string; slug: string; parentId: number }[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [farmers, setFarmers] = useState<
    { id: number; name: string; location: string }[]
  >([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isDeletionErrorDialogOpen, setIsDeletionErrorDialogOpen] = useState(false);
  const [deletionError, setDeletionError] = useState<any>(null);
  const productsPerPage = 5;
  const { toast } = useToast();

  // Form for creating/editing products
  const form = useForm<z.infer<typeof enhancedProductFormSchema>>({
    resolver: zodResolver(enhancedProductFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      category: "",
      subcategory: "",
      variants: [{
        price: 0,
        discountPrice: null,
        quantity: 0,
        unit: "",
        stockQuantity: 0,
        sku: "",
      }],
      imageUrl: "",
      imageUrls: "",
      videoUrl: "",
      farmerId: 0, // 0 means no farmer selected, will fail validation
      naturallyGrown: false,
      chemicalFree: false,
      premiumQuality: false,
      metaTitle: "",
      metaDescription: "",
      slug: "",
      enableShareButtons: true,
      enableWhatsappShare: true,
      enableFacebookShare: true,
      enableInstagramShare: true,
      featured: false,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
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
        `/api/admin/products?page=${page}&limit=${productsPerPage}&sort=id&order=desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(data.pagination?.page || 1);
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

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      const response = await fetch("/api/categories/main", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMainCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch main categories:", error);
    }
  };

  // Fetch subcategories for a specific parent category
  const fetchSubcategories = async (parentId: number) => {
    try {
      const response = await fetch(
        `/api/categories/${parentId}/subcategories`,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      setSubcategories([]);
    }
  };

  // Fetch categories (existing function for backward compatibility)
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await fetch("/api/admin/product-categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      // Silent error handling for categories
    }
  };

  // Fetch farmers for product creation/editing
  const fetchFarmers = async () => {
    try {
      const response = await fetch("/api/farmers");

      if (response.ok) {
        const data = await response.json();
        setFarmers(
          data.map((farmer: any) => ({
            id: farmer.id,
            name: farmer.name,
            location: farmer.location || "",
          }))
        );
      }
    } catch (err) {
      // Silent error handling for farmers
    }
  };

  // Load products, categories, and farmers on component mount
  useEffect(() => {
    fetchProducts();

    fetchCategories();
    fetchMainCategories();
    fetchFarmers();
  }, []);

  // Handle category change to load subcategories
  const handleCategoryChange = (categoryName: string) => {
    const selectedCategory = mainCategories.find(
      (cat) => cat.name === categoryName
    );
    if (selectedCategory) {
      setSelectedCategoryId(selectedCategory.id);
      fetchSubcategories(selectedCategory.id);
      // Clear subcategory when category changes
      form.setValue("subcategory", "");
    } else {
      setSelectedCategoryId(null);
      setSubcategories([]);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variants?.some((variant) =>
        variant.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
  const setupEditForm = (product: EnhancedProduct) => {
    // First, find the category to get its subcategories
    const selectedCategory = mainCategories.find(
      (cat) => cat.name === product.category
    );
    if (selectedCategory) {
      setSelectedCategoryId(selectedCategory.id);
      fetchSubcategories(selectedCategory.id);
    }

    form.reset({
      name: product.name,
      shortDescription:
        product.shortDescription || product.description.substring(0, 100),
      description: product.description,

      category: product.category,
      subcategory: product.subcategory || "",

      variants: product.variants?.length
        ? product.variants.map((v) => ({
            price: v.price,
            discountPrice: v.discountPrice ?? undefined,
            quantity: v.quantity,
            unit: v.unit,
            stockQuantity: v.stockQuantity,
            sku: v.sku ?? "",
          }))
        : [],

      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls?.join(", ") || "",
      videoUrl: product.videoUrl || "",
      farmerId: product.farmerId,
      naturallyGrown: product.naturallyGrown || false,
      chemicalFree: product.chemicalFree || false,
      premiumQuality: product.premiumQuality || false,
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      slug: product.slug || "",
      enableShareButtons: product.enableShareButtons !== false,
      enableWhatsappShare: product.enableWhatsappShare !== false,
      enableFacebookShare: product.enableFacebookShare !== false,
      enableInstagramShare: product.enableInstagramShare !== false,
      featured: product.featured || false,
    });

    // Set existing images for the upload components
    setPrimaryImage(product.imageUrl || "");
    setUploadedImages(product.imageUrls || []);

    setProductToEdit(product);
    setIsEditDialogOpen(true);
  };

  // Handle primary image upload
  const handlePrimaryImageUpload = (
    imagePath: string,
    thumbnailPath: string
  ) => {
    setPrimaryImage(imagePath);
    form.setValue("imageUrl", imagePath);
  };

  // Handle additional images upload
  const handleAdditionalImageUpload = (
    imagePath: string,
    thumbnailPath: string
  ) => {
    setUploadedImages((prev) => [...prev, imagePath]);
    const currentImages = form.getValues("imageUrls");
    const imageArray = currentImages
      ? currentImages
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img)
      : [];
    imageArray.push(imagePath);
    form.setValue("imageUrls", imageArray.join(","));
  };

  // Handle image removal
  const handleImageRemove = (imagePath: string) => {
    if (imagePath === primaryImage) {
      setPrimaryImage("");
      form.setValue("imageUrl", "");
    } else {
      setUploadedImages((prev) => prev.filter((img) => img !== imagePath));
      const currentImages = form.getValues("imageUrls");
      const imageArray = currentImages
        ? currentImages
            .split(",")
            .map((img) => img.trim())
            .filter((img) => img && img !== imagePath)
        : [];
      form.setValue("imageUrls", imageArray.join(","));
    }
  };

  // Set up form for creating
  const setupCreateForm = () => {
    form.reset({
      name: "",
      shortDescription: "",
      description: "",

      category: "",
      variants: [
        {
          price: 0,
          discountPrice: undefined,
          quantity: 1, // Default to 1 instead of 0
          unit: "kg", // Default unit
          stockQuantity: 0,
          sku: "",
        },
      ],
      imageUrl: "",
      imageUrls: "",
      videoUrl: "",
      farmerId: 0, // Force user to select a farmer
      naturallyGrown: false,
      chemicalFree: false,
      premiumQuality: false,
      metaTitle: "",
      metaDescription: "",
      slug: "",
      enableShareButtons: true,
      enableWhatsappShare: true,
      enableFacebookShare: true,
      enableInstagramShare: true,
      featured: false,
    });
    setUploadedImages([]);
    setPrimaryImage("");
    setIsCreateDialogOpen(true);
  };

  // Handle form submission for creating/editing
  const onSubmit = async (data: z.infer<typeof enhancedProductFormSchema>) => {
    try {
      console.log("Form submission started with data:", data);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Ensure we have an image URL from uploads
      if (!primaryImage) {
        toast({
          title: "Validation Error",
          description: "Please upload a primary image",
          variant: "destructive",
        });
        return;
      }

      // Use uploaded image
      const finalImageUrl = primaryImage;

      // Process image URLs if provided
      const imageUrls = data.imageUrls
        ? data.imageUrls
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url)
        : uploadedImages;

      const requestData = {
        ...data,
        imageUrl: finalImageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        videoUrl: data.videoUrl || null,
        variants: data.variants,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        slug: data.slug || null,
      };

      let response;

      if (productToEdit) {
        // Update existing product
        response = await fetch(`/api/admin/products/${productToEdit.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create new product
        response = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      }

      const responseData = await response.json();
      console.log("Response:", response.status, responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            (productToEdit
              ? "Failed to update product"
              : "Failed to create product")
        );
      }

      // Refresh to first page to show newly created product
      if (productToEdit) {
        fetchProducts(currentPage);
      } else {
        fetchProducts(1);
        setCurrentPage(1);
      }

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
      setUploadedImages([]);
      setPrimaryImage("");

      // Reset form
      form.reset();
    } catch (err) {
      console.error("Form submission error:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Enhanced Product Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive product catalog management with advanced features
          </p>
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
              placeholder="Search products, categories, SKUs..."
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
              <MainLoader />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
          ) : (
            <>
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Attributes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        {/* Product column */}
                        <TableCell className="w-[300px] align-top">
                          <div className="flex items-start gap-3">
                            <div className="relative w-24 h-20 flex-shrink-0">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = placeholderImage;
                                }}
                              />
                              {product.imageUrls && product.imageUrls.length > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  +{product.imageUrls?.length}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <p className="font-medium truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.shortDescription}
                              </p>
                              {product.variants && product.variants.length > 0 && product.variants[0].sku && (
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.variants[0].sku}
                                  {product.variants.length > 1 && ` (+${product.variants.length - 1} more)`}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="w-[150px]">
                          {product.category}
                        </TableCell>

                        {/* Subcategory */}
                        <TableCell className="w-[150px]">
                          {product.subcategory || (
                            <span className="text-muted-foreground italic">No subcategory</span>
                          )}
                        </TableCell>

                        {/* Attributes */}
                        <TableCell className="w-[160px]">
                          <div className="flex flex-col gap-1">
                            {product.naturallyGrown && (
                              <Badge variant="secondary" className="text-xs">
                                <Leaf className="h-3 w-3 mr-1" />
                                Natural
                              </Badge>
                            )}
                            {product.chemicalFree && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Preservatives-Free
                              </Badge>
                            )}
                            {product.premiumQuality && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {product.featured ? (
                            <Badge variant="default">Featured</Badge>
                          ) : (
                            <Badge variant="outline">Standard</Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
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
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setProductToEdit(product);
                                setIsImageGalleryOpen(true);
                              }}
                              title="View Images"
                            >
                              <Eye className="h-4 w-4" />
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
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * productsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * productsPerPage,
                    products.length * totalPages
                  )}{" "}
                  of {products.length * totalPages} products
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Product Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setProductToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {productToEdit ? "Edit Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              {productToEdit
                ? "Update the product information below."
                : "Fill in the details to create a new product in your catalog."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="attributes">Attributes</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="seo">SEO & Social</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Premium Tea Leaves"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleCategoryChange(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mainCategories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.name}
                                >
                                  {category.name}
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
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={subcategories.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    subcategories.length === 0
                                      ? "Select a category first"
                                      : "Select a subcategory"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subcategories.map((subcategory) => (
                                <SelectItem
                                  key={subcategory.id}
                                  value={subcategory.name}
                                >
                                  {subcategory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose a specific subcategory to help customers find
                            your product more easily
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief product description for listings"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This appears in product listings and search results
                          (max 100 chars recommended)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed product description..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description shown on product pages
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="farmerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farmer/Producer <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
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
                                {farmer.name}{" "}
                                {farmer.location && `- ${farmer.location}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border p-4 rounded-md mb-4 space-y-4"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        {/* Price */}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-8"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.valueAsNumber)
                                    }
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Discount Price */}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.discountPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discounted Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Optional"
                                    className="pl-8"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? e.target.valueAsNumber
                                          : null
                                      )
                                    }
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Quantity */}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="1"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {/* Unit Dropdown */}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="lb">lb</SelectItem>
                                  <SelectItem value="oz">oz</SelectItem>
                                  <SelectItem value="piece">piece</SelectItem>
                                  <SelectItem value="bunch">bunch</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Stock Quantity */}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stockQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* SKU */}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Enter SKU code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            Remove Variant
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        price: 0,
                        discountPrice: undefined,
                        quantity: 1,
                        unit: "kg",
                        stockQuantity: 0,
                        sku: "",
                      })
                    }
                  >
                    Add Variant
                  </Button>
                </TabsContent>

                {/* Product Attributes Tab */}
                <TabsContent value="attributes" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Product Qualities</h4>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="naturallyGrown"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Naturally Grown</FormLabel>
                              <FormDescription>
                                Product is grown using natural farming methods
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chemicalFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Preservatives-Free</FormLabel>
                              <FormDescription>
                                No preservatives or harmful additives used in production
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="premiumQuality"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Premium Quality</FormLabel>
                              <FormDescription>
                                High-quality product with superior
                                characteristics
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured Product</FormLabel>
                              <FormDescription>
                                Display this product prominently on the homepage
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-4">
                  <div>
                    <FormLabel>Primary Image</FormLabel>
                    <FormDescription className="mb-3">
                      Main product image displayed in listings
                    </FormDescription>
                    <ImageUpload
                      onImageUpload={handlePrimaryImageUpload}
                      onImageRemove={handleImageRemove}
                      existingImages={primaryImage ? [primaryImage] : []}
                      maxImages={1}
                      multiple={false}
                    />
                  </div>

                  <div>
                    <FormLabel>Additional Images</FormLabel>
                    <FormDescription className="mb-3">
                      Multiple images for product gallery (up to 5 images)
                    </FormDescription>
                    <ImageUpload
                      onImageUpload={handleAdditionalImageUpload}
                      onImageRemove={handleImageRemove}
                      existingImages={uploadedImages}
                      maxImages={5}
                      multiple={true}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://youtube.com/watch?v=..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional video showcasing the product or farm story
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* SEO & Social Tab */}
                <TabsContent value="seo" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">SEO Settings</h4>

                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO title for search engines"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty to use product name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description for search engines (150-160 chars)"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty to use short description
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="product-url-slug" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL-friendly version of product name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Social Sharing Options
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="enableShareButtons"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Enable Share Buttons</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableWhatsappShare"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>WhatsApp Share</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableFacebookShare"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Facebook Share</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableInstagramShare"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Instagram Share</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setProductToEdit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {productToEdit ? "Update Product" : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog open={isImageGalleryOpen} onOpenChange={setIsImageGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Images - {productToEdit?.name}</DialogTitle>
            <DialogDescription>
              View all images associated with this product
            </DialogDescription>
          </DialogHeader>
          {productToEdit && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Primary Image</h4>
                <img
                  src={productToEdit.imageUrl}
                  alt={`${productToEdit.name} - Primary`}
                  className="w-full max-w-md h-64 object-cover rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/images/placeholder.png";
                  }}
                />
              </div>
              {productToEdit.imageUrls &&
                productToEdit.imageUrls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Additional Images ({productToEdit.imageUrls.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productToEdit.imageUrls.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`${productToEdit.name} - Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/api/images/placeholder.png";
                            }}
                          />
                          <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-1">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {(!productToEdit.imageUrls ||
                productToEdit.imageUrls.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No additional images available
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
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
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deletion Error Dialog */}
      <Dialog open={isDeletionErrorDialogOpen} onOpenChange={setIsDeletionErrorDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cannot Delete Product</DialogTitle>
            <DialogDescription>
              This product cannot be deleted because it has active orders that haven't been delivered yet.
            </DialogDescription>
          </DialogHeader>
          
          {deletionError && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">
                  Product has {deletionError.orderIds?.length || 0} pending {deletionError.orderIds?.length === 1 ? 'order' : 'orders'}
                </h4>
                <p className="text-sm text-amber-700">
                  The following variants are linked to undelivered orders:
                </p>
              </div>
              
              {deletionError.pendingVariantSkus && deletionError.pendingVariantSkus.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Order IDs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletionError.pendingVariantSkus.map((sku: string, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{sku}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {deletionError.orderIds?.map((orderId: string, orderIndex: number) => (
                                <Badge key={orderIndex} variant="outline" className="text-xs">
                                  {orderId}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>To delete this product:</strong> Wait for all pending orders to be delivered, 
                  or manually mark the orders as delivered in the Orders section.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeletionErrorDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
