import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";
import { User, AuthResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fName: string, lName: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            // Invalid token, clear it
            localStorage.removeItem("authToken");
          }
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: any = await authAPI.login({ email, password });
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        setUser(response.user);
        toast({ 
          title: "Welcome back!", 
          description: `Logged in as ${response.user?.fName || ''}` 
        });
      } else if (response.needOTP) {
        // Special error for OTP required
        const err: any = new Error("OTP required");
        err.payload = { requiresOTP: true, phone: response.phone };
        throw err;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      if (error.payload && error.payload.requiresOTP) {
        // Don't show toast, let page handle navigation
        throw error;
      }
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid email or password",
        variant: "destructive" 
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fName: string, 
    lName: string, 
    email: string, 
    password: string, 
    phone: string
  ) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.register({ 
        fName, 
        lName, 
        email, 
        password, 
        phone 
      });
      
      if (response.success) {
        toast({ 
          title: "Registration successful!", 
          description: "Please verify your phone number",
        });
        // Note: User will be logged in after OTP verification
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
      toast({ title: "Logged out", description: "You've been logged out successfully" });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
