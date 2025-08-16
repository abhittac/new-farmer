import { useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Search,
  Filter,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import placeholderImage from "../../../../public/uploads/products/No-Image.png";
import { getImageUrl } from "@/utils/imageUtils";
interface Product {
  id: number; // variant.id
  name: string; // productName
  sku: string; // variant.sku
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  quantity?: number;
  unit?: string;
}

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingStock, setEditingStock] = useState<{
    [variantId: number]: number;
  }>({});
  const [restockCheck, setRestockCheck] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState("all-products");
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Fetch inventory products
  const { data: rawProductsData = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/inventory-products"],
    queryFn: async () => {
      const response = await fetch(
        "/api/admin/inventory-products?limit=50&sort=id&order=desc",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Cache-Control": "no-cache",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    select: (data: any) => {
      return (data.products || [])
        .filter((item) => item.variant)
        .map((item: any) => ({
          id: item.variant.id,
          name: item.productName,
          sku: item.variant.sku,
          category: item.category,
          price: item.variant.discountPrice ?? item.variant.price,
          stockQuantity: item.variant.stockQuantity,
          quantity: item.variant.quantity,
          unit: item.variant.unit,
        }));
    },
  });

  // Fetch low stock variants
  const { data: lowStockData = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ["/api/admin/low-stock"],
    queryFn: async () => {
      const response = await fetch("/api/admin/low-stock", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Cache-Control": "no-cache",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch low stock");
      return response.json();
    },
    select: (data: any) => data.lowStockVariants || [],
  });

  // Create a Set of low stock variant IDs for quick lookup
  const lowStockSet = useMemo(
    () => new Set(lowStockData.map((v) => v)),
    [lowStockData]
  );

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({
      variantId,
      newStock,
    }: {
      variantId: number;
      newStock: number;
    }) => {
      const response = await fetch(`/api/admin/products/${variantId}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
      if (!response.ok) throw new Error("Failed to update stock");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/inventory-products"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/low-stock"] });
      toast({ title: "Success", description: "Stock updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  // Filtering + sorting + restock toggle
  const filteredProducts = useMemo(() => {
    return rawProductsData
      .filter((product: Product) => {
        const name = product.name.toLowerCase();
        const sku = product.sku.toLowerCase();
        const category = product.category;
        const search = searchTerm.trim().toLowerCase();

        const matchesSearch = name.includes(search) || sku.includes(search);
        const matchesCategory =
          !selectedCategory || selectedCategory === category;
        const matchesRestock = !restockCheck || lowStockSet.has(product.id);

        return matchesSearch && matchesCategory && matchesRestock;
      })
      .sort((a, b) => {
        const aEditing = editingStock[a.id] !== undefined ? 1 : 0;
        const bEditing = editingStock[b.id] !== undefined ? 1 : 0;
        return bEditing - aEditing; // Editing rows come first
      });
  }, [
    rawProductsData,
    searchTerm,
    selectedCategory,
    restockCheck,
    editingStock,
    lowStockSet,
  ]);

  // Pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  // Page change handler
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Categories for filter dropdown
  const categories = useMemo(() => {
    const setCat = new Set<string>();
    rawProductsData.forEach((p) => setCat.add(p.category));
    return Array.from(setCat);
  }, [rawProductsData]);

  // Stock editing handlers
  const handleStockEdit = (variantId: number, currentStock: number) => {
    setEditingStock({ [variantId]: currentStock }); // clear other edits
    setTabValue("all-products");
    setTimeout(() => {
      inputRefs.current[variantId]?.focus();
    }, 50);
  };

  const handleStockSave = (variantId: number) => {
    const newStock = editingStock[variantId];
    if (newStock !== undefined && newStock >= 0) {
      updateStockMutation.mutate({ variantId, newStock });
      const { [variantId]: _, ...rest } = editingStock;
      setEditingStock(rest);
    }
  };

  const handleStockCancel = (variantId: number) => {
    const { [variantId]: _, ...rest } = editingStock;
    setEditingStock(rest);
  };

  // Stock badge & status helpers
  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock <= 10) return "secondary";
    return "default";
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  // Render your UI here with currentProducts, pagination, filters, editing inputs etc.

  return (
    <div className="space-y-6">
      {/* Header and overview cards */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Inventory Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage product stock levels across your inventory
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-8 w-8 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rawProductsData?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                (rawProductsData || []).filter(
                  (p) => p.stockQuantity <= 10 && p.stockQuantity !== 0
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                (rawProductsData || []).filter((p) => p.stockQuantity === 0)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-products">All Products</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="all-products" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Complete list of products with current stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Price</th>
                        <th className="text-left p-2">Per Stock</th>
                        <th className="text-left p-2">Stock</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product: Product) => (
                        <tr
                          key={product.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <div className="flex items-center gap-3">
                              {product.imageUrl && (
                                <img
                                  src={getImageUrl(product.imageUrl)}
                                  alt={product.name}
                                  onError={(e) =>
                                    (e.currentTarget.src = placeholderImage)
                                  }
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {product.sku || "-"}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="p-2">₹{product.price}</td>
                          <td className="p-2">
                            {product.quantity} {product.unit}
                          </td>
                          <td className="p-2">
                            {editingStock[product.id] !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={editingStock[product.id]}
                                  ref={(el) =>
                                    (inputRefs.current[product.id] = el)
                                  }
                                  onChange={(e) =>
                                    setEditingStock({
                                      ...editingStock,
                                      [product.id]:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleStockSave(product.id)}
                                  disabled={updateStockMutation.isPending}
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStockCancel(product.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{product.stockQuantity}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleStockEdit(
                                      product.id,
                                      product.stockQuantity
                                    )
                                  }
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={getStockBadgeVariant(
                                product.stockQuantity
                              )}
                            >
                              {getStockStatus(product.stockQuantity)}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStockEdit(
                                  product.id,
                                  product.stockQuantity
                                )
                              }
                              disabled={editingStock[product.id] !== undefined}
                            >
                              Edit Stock
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, totalProducts)} of {totalProducts}{" "}
                    products
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Products that need immediate attention due to low stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="text-center py-8">
                  Loading low stock variants...
                </div>
              ) : Array.from(lowStockSet).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No low stock variants found
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(lowStockSet).map((variant: any) => (
                    <div
                      key={variant.variantId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {variant.imageUrl && (
                          <img
                            src={getImageUrl(variant.imageUrl)}
                            onError={(e) => {
                              e.currentTarget.src = placeholderImage;
                            }}
                            alt={variant.variantName}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{variant.variantName}</h3>
                          <p className="text-sm text-muted-foreground">
                            SKU: {variant.sku}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          {variant.stockQuantity} left
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStockEdit(
                              variant.variantId,
                              variant.stockQuantity
                            )
                          }
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
