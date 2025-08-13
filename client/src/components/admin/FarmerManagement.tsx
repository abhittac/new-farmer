import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertFarmerSchema, type Farmer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import placeholderImage from "../../../../public/uploads/products/no-profile.jpg";
import MainLoader from "@/utils/MainLoader";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
// Create a comprehensive validation schema for the farmer form
const farmerFormSchema = insertFarmerSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialty: z.string().min(2, "Specialty must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  story: z.string().min(10, "Story must be at least 10 characters"),
  farmName: z.string().optional(),
  certificationStatus: z
    .enum(["none", "organic", "certified", "pending"])
    .default("none"),
  certificationDetails: z.string().optional(),
  farmSize: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  website: z.string().url().optional().or(z.literal("")),
  socialMedia: z.string().optional(),
  bankAccount: z.string().optional(),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL"),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  active: z.boolean().default(true),
});

// Type definition for our form
type FarmerFormValues = z.infer<typeof farmerFormSchema>;

export default function FarmerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Fetch farmers data
  const {
    data: farmers = [],
    isLoading,
    refetch,
  } = useQuery<Farmer[]>({
    queryKey: ["/api/admin/farmers"],
  });

  // Image handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        // Set the image URL for both forms
        addForm.setValue("imageUrl", result);
        editForm.setValue("imageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview("");
    addForm.setValue("imageUrl", "");
    editForm.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add farmer mutation
  const addFarmerMutation = useMutation({
    mutationFn: async (data: FarmerFormValues) => {
      return apiRequest("/api/admin/farmers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Farmer added successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farmers"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add farmer",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update farmer mutation
  const updateFarmerMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FarmerFormValues;
    }) => {
      return apiRequest(`/api/admin/farmers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Farmer updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farmers"] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update farmer",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete farmer mutation
  const deleteFarmerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/farmers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Farmer deleted successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farmers"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete farmer",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Set up add form
  const addForm = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      location: "",
      story: "",
      farmName: "",
      certificationStatus: "none",
      certificationDetails: "",
      farmSize: "",
      experienceYears: undefined,
      website: "",
      socialMedia: "",
      bankAccount: "",
      panNumber: "",
      aadharNumber: "",
      imageUrl: "",
      featured: false,
      verified: false,
      active: true,
    },
  });

  // Set up edit form
  const editForm = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      location: "",
      story: "",
      farmName: "",
      certificationStatus: "none",
      certificationDetails: "",
      farmSize: "",
      experienceYears: undefined,
      website: "",
      socialMedia: "",
      bankAccount: "",
      panNumber: "",
      aadharNumber: "",
      imageUrl: "",
      featured: false,
      verified: false,
      active: true,
    },
  });
  const { handleSubmit } = editForm;

  // Handle add form submission
  const onAddSubmit = (data: FarmerFormValues) => {
    addFarmerMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: FarmerFormValues) => {
    console.log("debugger", data);
    if (currentFarmer) {
      updateFarmerMutation.mutate({ id: currentFarmer.id, data });
    }
  };

  const handleEditSubmit = handleSubmit(onEditSubmit);
  // Open edit dialog and set form values
  const handleEditClick = (farmer: Farmer) => {
    setCurrentFarmer(farmer);
    editForm.reset({
      name: farmer.name,
      email: (farmer as any).email || "",
      phone: (farmer as any).phone || "",
      specialty: farmer.specialty,
      location: farmer.location,
      story: farmer.story,
      farmName: (farmer as any).farmName || "",
      certificationStatus: (farmer as any).certificationStatus || "none",
      certificationDetails: (farmer as any).certificationDetails || "",
      farmSize: (farmer as any).farmSize || "",
      experienceYears: (farmer as any).experienceYears || undefined,
      website: (farmer as any).website || "",
      socialMedia: (farmer as any).socialMedia || "",
      bankAccount: (farmer as any).bankAccount || "",
      panNumber: (farmer as any).panNumber || "",
      aadharNumber: (farmer as any).aadharNumber || "",
      imageUrl: farmer.imageUrl,
      featured: farmer.featured || false,
      verified: (farmer as any).verified || false,
      active: (farmer as any).active !== false,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (farmer: Farmer) => {
    setCurrentFarmer(farmer);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (currentFarmer) {
      deleteFarmerMutation.mutate(currentFarmer.id);
    }
  };

  // Filter farmers based on search term
  const filteredFarmers = farmers.filter(
    (farmer: Farmer) =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* <h2 className="text-2xl font-bold">Farmer Management</h2> */}

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search farmers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                refetch()
                  .then(() => {
                    toast({
                      title: "Farmer table refreshed successfully",

                      variant: "default",
                    });
                  })
                  .catch((error) => {
                    toast({
                      title: error,

                      variant: "destructive",
                    });
                  });
              }}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Farmer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Farmer</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new farmer to the platform.
                  </DialogDescription>
                </DialogHeader>

                <Form {...addForm}>
                  <form
                    onSubmit={addForm.handleSubmit(onAddSubmit)}
                    className="space-y-4 max-h-[70vh] overflow-y-auto"
                  >
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Farmer's full name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="farmer@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="specialty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialty *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Coffee, Spices, Vegetables"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={addForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Farm location (City, State)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Farm Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Farm Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="farmName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Name of the farm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="farmSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Size</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 5 acres, 2 hectares"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="experienceYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experience (Years)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="certificationStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certification Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select certification status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">
                                    No Certification
                                  </SelectItem>
                                  <SelectItem value="organic">
                                    Organic Certified
                                  </SelectItem>
                                  <SelectItem value="certified">
                                    Other Certification
                                  </SelectItem>
                                  <SelectItem value="pending">
                                    Certification Pending
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={addForm.control}
                        name="certificationDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certification Details</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Details about certifications, license numbers, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Contact & Social
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://farmwebsite.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="socialMedia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Social Media</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Instagram, Facebook, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Financial Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Account</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Bank account information"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="panNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PAN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="ABCDE1234F" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="aadharNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aadhar Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="1234 5678 9012"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Profile & Story */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Profile & Story
                      </h3>
                      <FormField
                        control={addForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Image URL *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="story"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Story *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell the farmer's story, their farming journey, and what makes them special..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Settings
                      </h3>
                      <div className="space-y-3">
                        <FormField
                          control={addForm.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Feature this farmer on the homepage
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="verified"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Mark as verified farmer
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Active farmer profile
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <DialogFooter
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addFarmerMutation.isPending}
                      >
                        {addFarmerMutation.isPending
                          ? "Adding..."
                          : "Add Farmer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center">
                    <MainLoader />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredFarmers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="text-muted-foreground">
                    {searchTerm
                      ? "No farmers match your search"
                      : "No farmers found"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFarmers.map((farmer: Farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {/* <div
                        className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0"
                        style={{
                          backgroundImage: `url(${farmer.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>{" "} */}
                      {/* abhi
                       */}
                      <img
                        src={farmer.imageUrl}
                        onError={(e) => {
                          e.currentTarget.onerror = null; // prevent infinite loop
                          e.currentTarget.src = placeholderImage; // fallback image
                        }}
                        alt={farmer.name}
                        className="w-10 h-10 rounded-full object-cover bg-muted flex-shrink-0"
                      />
                      <span>{farmer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{farmer.specialty}</TableCell>
                  <TableCell>{farmer.location}</TableCell>
                  <TableCell>
                    {farmer.featured ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Regular
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(farmer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(farmer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Farmer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update the farmer's information.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Feature this farmer on the homepage
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateFarmerMutation.isPending}>
                  {updateFarmerMutation.isPending
                    ? "Updating..."
                    : "Update Farmer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Farmer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentFarmer?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteFarmerMutation.isPending}
            >
              {deleteFarmerMutation.isPending ? "Deleting..." : "Delete Farmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
