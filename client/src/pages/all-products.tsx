import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, ArrowRight, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCategory, Product } from "@shared/schema";
import { useAnimations } from "@/hooks/use-animations";
import { cn, debounce } from "@/lib/utils";
import { useSearchParams as queryfinder } from "react-router-dom";
import { useCategory } from "@/hooks/store";
import { useAuth } from "@/context/AuthContext";
import MainLoader from "@/utils/MainLoader";

// Custom hook for URL search params with navigation
const useSearchParams = () => {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");

  const updateURL = (newParams: Record<string, string | null>) => {
    const currentParams = new URLSearchParams(location.split("?")[1] || "");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });

    const newURL = currentParams.toString()
      ? `/products?${currentParams.toString()}`
      : "/products";
    navigate(newURL);
  };

  return { params, updateURL };
};

interface PaginatedProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function AllProducts() {
  // const [searchParams] = queryfinder();
  const { params: searchParamsfromwouter, updateURL } = useSearchParams();
  const categoryParam = searchParamsfromwouter.get("category");
  const subcategoryParam = searchParamsfromwouter.get("subcategory");
  const searchParam = searchParamsfromwouter.get("search");
  const minPriceParam = searchParamsfromwouter.get("minPrice");
  const maxPriceParam = searchParamsfromwouter.get("maxPrice");
  const sortByParam = searchParamsfromwouter.get("sortBy");
  const sortOrderParam = searchParamsfromwouter.get("sortOrder");
  const pageParam = searchParamsfromwouter.get("page");
  const { category } = useCategory();
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  // Ensure page always starts at top on any navigation

  // window.scrollTo(0, 0);

  // State for filters and pagination - initialize from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParam || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam || category || null
  );

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    subcategoryParam || null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPriceParam ? parseFloat(minPriceParam) : 0,
    maxPriceParam ? parseFloat(maxPriceParam) : 1000,
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(sortByParam || "id");
  const [sortOrder, setSortOrder] = useState(sortOrderParam || "desc");
  const productsPerPage = 12;

  // State for categories and subcategories
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", productsPerPage.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    if (selectedSubcategory && selectedSubcategory !== "all") {
      params.set("subcategory", selectedSubcategory);
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    }

    if (priceRange[1] < 1000) {
      params.set("maxPrice", priceRange[1].toString());
    }

    return params.toString();
  };

  // Get products with pagination
  const {
    data: productsResponse,
    isLoading,
    error,
  } = useQuery<PaginatedProductsResponse>({
    queryKey: [
      `${import.meta.env.VITE_API_URL}/api/products`,
      currentPage,
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      priceRange,
      sortBy,
      category,
      sortOrder,
    ],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products?${queryString}`
      );
      console.log(response, "nidhi");
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      return response.json();
    },
  });

  const allProducts = productsResponse?.products || [];
  const pagination = productsResponse?.pagination;

  // Set up animations
  const { setupScrollAnimation } = useAnimations();

  useEffect(() => {
    setupScrollAnimation();
    window.scrollTo(0, 0);
  }, [isAuthenticated]);

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedCategory, priceRange]);

  // Update search input when URL search param changes
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
      const searchInput = document.getElementById(
        "product-search"
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.value = searchParam;
      }
    }
  }, [searchParam]);

  useEffect(() => {
    const effectiveCategory = categoryParam || category || null;

    if (effectiveCategory !== selectedCategory) {
      handleCategoryChange(effectiveCategory);
    }

    // Rest of your URL sync logic...
    if ((subcategoryParam || null) !== selectedSubcategory) {
      setSelectedSubcategory(subcategoryParam || null);
    }

    if ((searchParam || "") !== searchQuery) {
      setSearchQuery(searchParam || "");
      const searchInput = document.getElementById(
        "product-search"
      ) as HTMLInputElement;
      if (searchInput) searchInput.value = searchParam || "";
    }

    const newMinPrice = minPriceParam ? parseFloat(minPriceParam) : 0;
    const newMaxPrice = maxPriceParam ? parseFloat(maxPriceParam) : 1000;
    if (newMinPrice !== priceRange[0] || newMaxPrice !== priceRange[1]) {
      setPriceRange([newMinPrice, newMaxPrice]);
    }

    const newSortBy = sortByParam || "id";
    const newSortOrder = sortOrderParam || "desc";
    if (newSortBy !== sortBy || newSortOrder !== sortOrder) {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    }

    const newPage = pageParam ? parseInt(pageParam) : 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [
    categoryParam,
    category,
    subcategoryParam,
    searchParam,
    minPriceParam,
    maxPriceParam,
    sortByParam,
    sortOrderParam,
    pageParam,
    mainCategories,
  ]);

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/main`
      );
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
        `${
          import.meta.env.VITE_API_URL
        }/api/categories/${parentId}/subcategories`
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

  // Handle category change to load subcategories

  const handleCategoryChange = (categoryName: string | null) => {
    // Immediate scroll to top
    // window.scrollTo(0, 0);

    setSelectedCategory(categoryName);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    setCurrentPage(1);

    if (categoryName && categoryName !== "all") {
      const selectedCat = mainCategories.find(
        (cat) => cat.name === categoryName
      );
      if (selectedCat) {
        fetchSubcategories(selectedCat.id);
      }
    } else {
      setSubcategories([]);
    }

    // Update URL - remove subcategory when changing category
    updateURL({
      category: categoryName,
      subcategory: null,
      page: "1",
      search: searchQuery || null,
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : null,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  };
  useEffect(() => {
    handleCategoryChange(category);
  }, [category]);
  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryName: string | null) => {
    // Immediate scroll to top
    // window.scrollTo(0, 0);

    setSelectedSubcategory(subcategoryName);
    setCurrentPage(1);

    // Update URL - maintain both category and subcategory with all other filters
    updateURL({
      category: selectedCategory,
      subcategory: subcategoryName,
      page: "1",
      search: searchQuery || null,
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : null,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    // window.scrollTo(0, 0);

    setSearchQuery(query);
    setCurrentPage(1);

    // Update URL with all current filters
    updateURL({
      search: query.trim() || null,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      page: "1",
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : null,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  };

  // State for temporary values during slider interaction
  const [tempRange, setTempRange] = useState<[number, number]>(priceRange);
  const [isDragging, setIsDragging] = useState(false);

  // Sync tempRange when priceRange changes externally
  useEffect(() => {
    if (!isDragging) {
      setTempRange(priceRange);
    }
  }, [priceRange, isDragging]);

  // Handler for live changes during slider interaction
  const handleSliderChange = useCallback((newRange: [number, number]) => {
    setTempRange(newRange);
  }, []);

  // Handler for when user starts dragging
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handler for when user releases slider
  const handleDragEnd = useCallback(
    (newRange: [number, number]) => {
      // window.scrollTo(0, 0);
      setPriceRange(newRange);
      setCurrentPage(1);
      setIsDragging(false);

      updateURL({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchQuery || null,
        minPrice: newRange[0] > 0 ? newRange[0].toString() : null,
        maxPrice: newRange[1] < 1000 ? newRange[1].toString() : null,
        page: "1",
        sortBy,
        sortOrder,
      });
    },
    [
      selectedCategory,
      selectedSubcategory,
      searchQuery,
      sortBy,
      sortOrder,
      updateURL,
      setCurrentPage,
    ]
  );
  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    // window.scrollTo(0, 0);

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);

    // Update URL with all current filters
    updateURL({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      search: searchQuery || null,
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : null,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: "1",
    });
  };

  // Load categories on component mount
  useEffect(() => {
    fetchMainCategories();
    window.scrollTo(0, 0);
  }, []);

  // Handle category loading and state sync after main categories are loaded
  useEffect(() => {
    if (mainCategories.length > 0) {
      if (categoryParam) {
        // Find the category and load its subcategories
        const selectedCat = mainCategories.find(
          (cat) => cat.name === categoryParam
        );
        if (selectedCat) {
          fetchSubcategories(selectedCat.id);
        }
      } else {
        // Clear subcategories if no category selected
        setSubcategories([]);
      }
    }
  }, [categoryParam, mainCategories]);

  // Handle subcategory state sync after subcategories are loaded
  useEffect(() => {
    // This will run after subcategories are fetched
    // The state is already synced via the main URL sync effect
  }, [subcategories]);

  // Always scroll to top when URL changes (navigation from footer/anywhere)
  useEffect(() => {
    // window.scrollTo(0, 0); // Immediate scroll to top, no smooth behavior
  }, [categoryParam, subcategoryParam, searchParam]); // Trigger on any URL filter change

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Debounced search handler
  const debouncedSearchChange = debounce((value: string) => {
    handleSearchChange(value);
  }, 300);
  /**
   * A simple grid of skeleton cards to display during loading.
   * @param {Object} props
   * @prop {number} count - The number of skeleton cards to render.
   * @returns {ReactElement} The skeleton card grid.
   */
  /**
   * A simple grid of skeleton cards to display during loading.
   * @param {{ count: number }} props
   * @returns {ReactElement} The skeleton card grid.
   */
  function SkeletonGrid({ count }: { count: number }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-80 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Reset filters
  const resetFilters = () => {
    // Immediate scroll to top
    // window.scrollTo(0, 0);

    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSubcategories([]);
    setPriceRange([0, 1000]);
    setSortBy("id");
    setSortOrder("desc");
    setCurrentPage(1);

    // Update URL to clear all filters
    updateURL({
      search: null,
      category: null,
      subcategory: null,
      minPrice: null,
      maxPrice: null,
      sortBy: null,
      sortOrder: null,
      page: "1",
    });

    // Reset input field
    const searchInput = document.getElementById(
      "product-search"
    ) as HTMLInputElement;
    if (searchInput) searchInput.value = "";
  };

  return (
    <div className="bg-background pt-32 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading text-forest text-4xl font-bold mb-4">
            Our Products
          </h1>
          <p className="text-olive text-lg max-w-2xl mx-auto">
            Explore our complete collection of farm-fresh products, each grown
            with care using traditional methods. Filter by category to find
            exactly what you're looking for.
          </p>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden flex justify-between mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <X className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:block overflow-hidden"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm sticky top-32 ">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading text-forest text-xl font-semibold">
                      Filters
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-primary hover:text-white"
                    >
                      Reset All
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="mb-8">
                    <Label
                      htmlFor="product-search"
                      className="text-foreground font-medium mb-2 block"
                    >
                      Search
                    </Label>
                    <div className="relative">
                      <Input
                        id="product-search"
                        placeholder="Search products..."
                        className="pl-10"
                        onChange={(e) => debouncedSearchChange(e.target.value)}
                        defaultValue={searchQuery}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Categories */}
                  <div
                    className="mb-8"
                    key={`categories-${selectedCategory || "none"}`}
                  >
                    <h3 className="text-foreground font-medium mb-3">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start font-normal",
                          !selectedCategory || selectedCategory === "all"
                            ? "bg-primary/10 text-primary font-medium "
                            : "text-foreground hover:bg-muted"
                        )}
                        onClick={() => handleCategoryChange(null)}
                      >
                        All Products
                      </Button>
                      {mainCategories.map((category) => {
                        const isSelected = selectedCategory === category.name;
                        return (
                          <Button
                            key={category.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start font-normal",
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:text-black hover:bg-muted"
                            )}
                            onClick={() => handleCategoryChange(category.name)}
                          >
                            {category.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-foreground font-medium mb-3">
                        Subcategories
                      </h3>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal",
                            selectedSubcategory === null
                              ? "bg-secondary/10 text-secondary font-medium"
                              : "text-foreground hover:bg-muted"
                          )}
                          onClick={() => handleSubcategoryChange(null)}
                        >
                          All {selectedCategory}
                        </Button>
                        {subcategories.map((subcategory) => (
                          <Button
                            key={subcategory.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start font-normal",
                              selectedSubcategory === subcategory.name
                                ? "bg-secondary/10 text-secondary font-medium"
                                : "text-foreground hover:bg-muted hover:text-black"
                            )}
                            onClick={() =>
                              handleSubcategoryChange(subcategory.name)
                            }
                          >
                            {subcategory.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="mb-8">
                    <Label
                      className={cn(
                        "text-foreground font-medium mb-4 block transition-colors",
                        isDragging ? "text-primary" : ""
                      )}
                    >
                      Price Range: ₹{tempRange[0]} - ₹{tempRange[1]}
                      {isDragging && (
                        <span className="ml-2 text-xs text-muted-foreground animate-pulse">
                          (releasing updates results)
                        </span>
                      )}
                    </Label>

                    <Slider
                      value={tempRange}
                      onValueChange={handleSliderChange}
                      onValueCommit={handleDragEnd}
                      onPointerDown={handleDragStart}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full cursor-grab active:cursor-grabbing"
                    />

                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>₹0</span>
                      <span className="flex items-center gap-1">
                        ₹1000+
                        {priceRange[1] >= 1000 && (
                          <span className="text-xs text-primary">(max)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="mb-4">
                    <Label className="text-foreground font-medium mb-3 block">
                      Sort By
                    </Label>
                    <Select
                      value={`${sortBy}-${sortOrder}`}
                      onValueChange={(value) => {
                        const [newSortBy, newSortOrder] = value.split("-");
                        handleSortChange(newSortBy, newSortOrder);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id-desc">Newest First</SelectItem>
                        <SelectItem value="id-asc">Oldest First</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                        <SelectItem value="price-asc">
                          Price Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedCategory ? selectedCategory : "All Products"}
                  {selectedSubcategory && ` - ${selectedSubcategory}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {pagination?.total || 0} products found
                </p>
              </div>
            </div>
            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">
                  Failed to load products. Please try again.
                </p>
              </div>
            ) : isLoading ? (
              <MainLoader />
            ) : allProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Actual Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {allProducts.map((product: Product) => (
                    <div key={product.id} className="scroll-animation">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-2">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-10 h-10"
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
