import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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
  Search,
  Eye,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MainLoader from "@/utils/MainLoader";

// User interface based on API response
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  mobileVerified?: boolean;
  codEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  orders: number;
  totalSpent: number;
}

interface UsersResponse {
  users: UserData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [codAccessFilter, setCodAccessFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;
  const { toast } = useToast();

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        sort: "createdAt",
        order: "desc",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (statusFilter && statusFilter !== "all") {
        if (statusFilter === "active") {
          params.append("status", "verified");
        } else if (statusFilter === "blocked") {
          params.append("status", "unverified");
        }
      }
      if (codAccessFilter && codAccessFilter !== "all") {
        params.append("codAccess", codAccessFilter);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, codAccessFilter]);

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const newEmailVerified = !user.emailVerified;

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailVerified: newEmailVerified,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Refresh the users list
      await fetchUsers();

      toast({
        title: `User ${newEmailVerified ? "activated" : "deactivated"}`,
        description: `${user.name} has been ${
          newEmailVerified ? "activated" : "deactivated"
        } successfully.`,
      });

      setIsBlockDialogOpen(false);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCodAccess = async (
    userId: number,
    currentCodEnabled: boolean
  ) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/admin/users/${userId}/cod-access`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codEnabled: !currentCodEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle COD access");
      }

      const data = await response.json();

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, codEnabled: !currentCodEnabled }
            : user
        )
      );

      toast({
        title: "Success",
        description: data.message,
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling COD access:", error);
      toast({
        title: "Error",
        description: "Failed to toggle COD access. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openViewDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const openBlockDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsBlockDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your registered customers
          </p>
        </div>

        <Card>
          <CardHeader className="py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>User List</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={codAccessFilter}
                  onValueChange={setCodAccessFilter}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="COD Access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All COD Status</SelectItem>
                    <SelectItem value="enabled">COD Enabled</SelectItem>
                    <SelectItem value="disabled">COD Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <MainLoader />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-red-500">{error}</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>COD Access</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              user.emailVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.emailVerified ? "Active" : "Blocked"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${
                                user.codEnabled !== false
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.codEnabled !== false
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleCodAccess(
                                  user.id,
                                  user.codEnabled !== false
                                )
                              }
                              className="h-6 px-2 text-xs"
                            >
                              {user.codEnabled !== false ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openViewDialog(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openBlockDialog(user)}
                            >
                              {user.emailVerified ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-1" />
                  {selectedUser.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        selectedUser.emailVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedUser.emailVerified ? "Active" : "Blocked"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(selectedUser.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{selectedUser.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-medium">
                    ${selectedUser.totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedUser) openBlockDialog(selectedUser);
              }}
            >
              {selectedUser?.emailVerified ? "Block User" : "Unblock User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.emailVerified ? "Block User" : "Unblock User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.emailVerified
                ? "Are you sure you want to block this user? They will not be able to login or place orders."
                : "Are you sure you want to unblock this user? They will regain full access to their account."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              variant="outline"
              onClick={() => setIsBlockDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.emailVerified ? "destructive" : "default"}
              onClick={() =>
                selectedUser && handleToggleUserStatus(selectedUser.id)
              }
            >
              {selectedUser?.emailVerified ? "Block User" : "Unblock User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
