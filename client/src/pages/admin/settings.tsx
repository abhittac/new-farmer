import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, Store, Globe } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import MainLoader from "@/utils/MainLoader";

interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  type: string;
  description: string | null;
  updatedAt: string;
}

const settingsSchema = z.object({
  // Site Information
  site_name: z.string().min(1, "Site name is required"),
  site_tagline: z.string().min(1, "Site tagline is required"),
  site_logo: z.string().optional(),

  // Store Information
  store_email: z.string().email("Valid email is required"),
  store_phone: z.string().min(1, "Phone number is required"),
  store_address: z.string().min(1, "Address is required"),
  store_city: z.string().min(1, "City is required"),
  store_state: z.string().min(1, "State is required"),
  store_zip: z.string().min(1, "ZIP code is required"),
  store_country: z.string().min(1, "Country is required"),

  // Social Media Links
  social_facebook: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
  social_instagram: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
  social_twitter: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
  social_linkedin: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
  social_youtube: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
  social_website: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/admin/site-settings"],
    queryFn: () => apiRequest("/api/admin/site-settings"),
    refetchOnMount: "always", // <— ensures fresh fetch when navigating back
    staleTime: 0, // <— never consider it fresh for long
  });

  // Transform settings array to object for form
  const settingsMap = React.useMemo(() => {
    return settings.reduce(
      (acc: Record<string, string>, setting: SiteSetting) => {
        acc[setting.key] = setting.value || "";
        return acc;
      },
      {}
    );
  }, [settings]);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settingsMap,
  });

  React.useEffect(() => {
    if (settingsMap && Object.keys(settingsMap).length > 0) {
      form.reset(settingsMap);
    }
  }, [settingsMap, form]);

  const updateSettingMutation = useMutation({
    mutationFn: (
      settings: Array<{
        key: string;
        value: string;
        type: string;
        description?: string;
      }>
    ) =>
      apiRequest("/api/admin/site-settings", {
        method: "POST",
        body: JSON.stringify(settings), // Send all at once
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: value || "",
        type: "text",
        description: getSettingDescription(key),
      }));

      await updateSettingMutation.mutateAsync(updates);

      toast({
        title: "Settings Updated",
        description: "Store settings have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      site_name: "Website name",
      site_tagline: "Website tagline",
      site_logo: "Website logo URL",
      store_email: "Store contact email",
      store_phone: "Store contact phone",
      store_address: "Store address",
      store_city: "Store city",
      store_state: "Store state",
      store_zip: "Store zip code",
      store_country: "Store country",
      social_facebook: "Facebook page URL",
      social_instagram: "Instagram profile URL",
      social_twitter: "Twitter profile URL",
      social_linkedin: "LinkedIn company page URL",
      social_youtube: "YouTube channel URL",
      social_website: "Official website URL",
    };
    return descriptions[key] || "";
  };

  if (isLoading) {
    return <MainLoader />;
  }

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your store information and social media links
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Information
            </CardTitle>
            <CardDescription>
              Basic information about your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  {...form.register("site_name")}
                  placeholder="HarvestDirect"
                />
                {form.formState.errors.site_name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.site_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="site_tagline">Site Tagline</Label>
                <Input
                  id="site_tagline"
                  {...form.register("site_tagline")}
                  placeholder="Fresh from Farm to Your Table"
                />
                {form.formState.errors.site_tagline && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.site_tagline.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="site_logo">Site Logo URL (Optional)</Label>
              <Input
                id="site_logo"
                {...form.register("site_logo")}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>
              Contact details and address information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store_email">Email</Label>
                <Input
                  id="store_email"
                  type="email"
                  {...form.register("store_email")}
                  placeholder="contact@harvestdirect.com"
                />
                {form.formState.errors.store_email && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.store_email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="store_phone">Phone</Label>
                <Input
                  id="store_phone"
                  {...form.register("store_phone")}
                  placeholder="+1 (555) 123-4567"
                />
                {form.formState.errors.store_phone && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.store_phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="store_address">Address</Label>
              <Input
                id="store_address"
                {...form.register("store_address")}
                placeholder="123 Harvest Lane"
              />
              {form.formState.errors.store_address && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.store_address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="store_city">City</Label>
                <Input
                  id="store_city"
                  {...form.register("store_city")}
                  placeholder="Farmington"
                />
                {form.formState.errors.store_city && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.store_city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="store_state">State</Label>
                <Input
                  id="store_state"
                  {...form.register("store_state")}
                  placeholder="California"
                />
                {form.formState.errors.store_state && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.store_state.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="store_zip">ZIP Code</Label>
                <Input
                  id="store_zip"
                  {...form.register("store_zip")}
                  placeholder="90210"
                />
                {form.formState.errors.store_zip && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.store_zip.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="store_country">Country</Label>
              <Input
                id="store_country"
                {...form.register("store_country")}
                placeholder="United States"
              />
              {form.formState.errors.store_country && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.store_country.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>
              Connect your social media profiles (all optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="social_facebook">Facebook</Label>
                <Input
                  id="social_facebook"
                  {...form.register("social_facebook")}
                  placeholder="https://facebook.com/harvestdirect"
                />
                {form.formState.errors.social_facebook && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.social_facebook.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="social_instagram">Instagram</Label>
                <Input
                  id="social_instagram"
                  {...form.register("social_instagram")}
                  placeholder="https://instagram.com/harvestdirect"
                />
                {form.formState.errors.social_instagram && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.social_instagram.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="social_twitter">Twitter</Label>
                <Input
                  id="social_twitter"
                  {...form.register("social_twitter")}
                  placeholder="https://twitter.com/harvestdirect"
                />
                {form.formState.errors.social_twitter && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.social_twitter.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="social_linkedin">LinkedIn</Label>
                <Input
                  id="social_linkedin"
                  {...form.register("social_linkedin")}
                  placeholder="https://linkedin.com/company/harvestdirect"
                />
                {form.formState.errors.social_linkedin && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.social_linkedin.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="social_youtube">YouTube</Label>
                <Input
                  id="social_youtube"
                  {...form.register("social_youtube")}
                  placeholder="https://youtube.com/@harvestdirect"
                />
                {form.formState.errors.social_youtube && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.social_youtube.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="social_website">Website</Label>
                <Input
                  id="social_website"
                  {...form.register("social_website")}
                  placeholder="https://harvestdirect.com"
                />
                {form.formState.errors.social_website && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.social_website.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="submit"
            disabled={updateSettingMutation.isPending}
            className="min-w-[120px]"
          >
            {updateSettingMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
