import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Mail, User, Calendar, MessageSquare, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import MainLoader from "@/utils/MainLoader";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const queryClient = useQueryClient();

  // Fetch all contact messages
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/contact-messages"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation to update message status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/contact-messages"],
      });
      toast({
        title: "Status Updated",
        description: "Message status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update message status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "New";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MainLoader />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading messages</p>
          <p className="text-sm">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mb-2">
            Manage customer inquiries and support requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total Messages:{" "}
            <span className="font-medium text-gray-900">{messages.length}</span>
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600">
                When customers submit contact forms, they'll appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((message: ContactMessage) => (
            <Card
              key={message.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{message.subject}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{message.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{message.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(message.createdAt))} ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(message.status)}>
                      {getStatusLabel(message.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 line-clamp-3">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Message Details</DialogTitle>
                        </DialogHeader>
                        {selectedMessage && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">
                                  Name
                                </label>
                                <p className="text-gray-900">
                                  {selectedMessage.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">
                                  Email
                                </label>
                                <p className="text-gray-900">
                                  {selectedMessage.email}
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Subject
                              </label>
                              <p className="text-gray-900">
                                {selectedMessage.subject}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Message
                              </label>
                              <Textarea
                                value={selectedMessage.message}
                                readOnly
                                rows={6}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-gray-700">
                                  Received
                                </label>
                                <p className="text-gray-900">
                                  {new Date(
                                    selectedMessage.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Status
                                </label>
                                <Select
                                  value={selectedMessage.status}
                                  onValueChange={(status) => {
                                    updateStatusMutation.mutate({
                                      id: selectedMessage.id,
                                      status,
                                    });
                                    setSelectedMessage({
                                      ...selectedMessage,
                                      status,
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="in_progress">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                      Resolved
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Select
                      value={message.status}
                      onValueChange={(status) => {
                        updateStatusMutation.mutate({
                          id: message.id,
                          status,
                        });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminMessagesWithLayout() {
  return <AdminMessages />;
}
