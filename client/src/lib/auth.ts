import { useState } from "react";
import { User } from "@shared/schema";

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// useAuth hook for compatibility
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  
  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: user !== null
  };
};
