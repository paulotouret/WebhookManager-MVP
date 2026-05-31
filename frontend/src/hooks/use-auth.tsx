import React, { createContext, useContext, useEffect } from "react";
import { useGetMe } from "@/services/api-client-react";
import type { User } from "@/services/api";

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe();

  const logout = () => {
    localStorage.removeItem("hookflow_token");
    window.location.href = "/login";
  };

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("hookflow_token");
    }
  }, [isError]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout,
        isAuthenticated: !!user && !!localStorage.getItem("hookflow_token"),
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
