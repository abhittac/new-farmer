import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, User, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import type { NewsletterSubscription } from "@shared/schema";
import MainLoader from "@/utils/MainLoader";

interface NewsletterSubscriptionsResponse {
  subscriptions: NewsletterSubscription[];
}

export default function NewsletterSubscriptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<NewsletterSubscriptionsResponse>({
    queryKey: ["/api/admin/newsletter-subscriptions"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      return apiRequest(`/api/admin/newsletter-subscriptions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/newsletter-subscriptions"],
      });
      toast({
        title: "Success",
        description: "Newsletter subscription deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete newsletter subscription",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Newsletter Subscriptions</h1>
        </div>
        <MainLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Newsletter Subscriptions</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Failed to load newsletter subscriptions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscriptions = data?.subscriptions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Newsletter Subscriptions</h1>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <span className="text-sm text-gray-600">
            {subscriptions.length} total subscriptions
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consented Users
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((sub) => sub.agreedToTerms).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                subscriptions.filter((sub) => {
                  const subDate = new Date(sub.createdAt);
                  const now = new Date();
                  return (
                    subDate.getMonth() === now.getMonth() &&
                    subDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Newsletter Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No newsletter subscriptions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Consent</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {subscription.name || "-"}
                    </TableCell>
                    <TableCell>{subscription.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscription.agreedToTerms ? "default" : "secondary"
                        }
                      >
                        {subscription.agreedToTerms ? "Agreed" : "Not Agreed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(subscription.createdAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(subscription.id)}
                        disabled={deletingId === subscription.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === subscription.id
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
