import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      console.log("Attempting login with:", { email, password: "***" });

      // Use direct fetch instead of apiRequest to better handle the response
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login response:", data);

      // Save auth data to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update state
      setToken(data.token);
      setUser(data.user);

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      return true;
    } catch (error) {
      let message = "Login failed";
      if (error instanceof Error) {
        message = error.message;
      }

      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Use direct fetch instead of apiRequest for consistency with login
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });

      // Automatically log the user in
      return await login(email, password);
    } catch (error) {
      let message = "Registration failed";
      if (error instanceof Error) {
        message = error.message;
      }

      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update state
    setToken(null);
    setUser(null);

    // Invalidate all queries
    // queryClient.invalidateQueries();

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!token || !user) {
        throw new Error("You must be logged in to update your profile");
      }

      const response = await apiRequest("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || "Profile update failed");
      // }

      // Update user in localStorage and state
      const updatedUser = { ...user, name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error) {
      let message = "Profile update failed";
      if (error instanceof Error) {
        message = error.message;
      }

      toast({
        title: "Profile update failed",
        description: message,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };
  window.addEventListener("beforeunload", logout);
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
