import { toast } from "@/hooks/use-toast";
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// export async function apiRequest(
//   url: string,
//   options?: RequestInit
// ): Promise<any> {
//   // Get admin token if this is an admin request
//   const isAdminRequest = url.includes("/admin/");
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//   };

//   // Add existing headers if any
//   if (options?.headers) {
//     Object.assign(headers, options.headers);
//   }

//   if (isAdminRequest) {
//     const adminToken = localStorage.getItem("adminToken");
//     if (adminToken) {
//       headers["Authorization"] = `Bearer ${adminToken}`;
//     }
//   } else {
//     // User token for normal API requests
//     const userToken = localStorage.getItem("token"); // or 'userToken', whatever you store
//     if (userToken) {
//       headers["Authorization"] = `Bearer ${userToken}`;
//     }
//   }

//   const res = await fetch(url, {
//     ...options,
//     headers,
//     credentials: "include",
//   });

//   await throwIfResNotOk(res);
//   return res.json();
// }
// abhi
export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<any> {
  // Check if admin request
  const isAdminRequest = url.includes("/admin/");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  if (isAdminRequest) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }
  } else {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({})); // In case response has no body

  // ✅ Custom handling for email verification error
  if (res.status === 403 && data.forceLogout) {
    toast({
      title: "Payment Error",
      description: "Your email is not verified. Please contact admin.",
      variant: "destructive",
    });

    // ⛔ Clear tokens
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    throw new Error(data.message || "Access Denied");
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const isAdminRequest = url.includes("/admin/");
    const headers: Record<string, string> = {};

    if (isAdminRequest) {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
    } else {
      // For regular user API calls, use user JWT token
      const userToken = localStorage.getItem("token");
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
