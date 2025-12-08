import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { dataService } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (username: string, passwordHash: string) => Promise<boolean>;
  logout: () => void;
  register: (user: User) => Promise<void>;
  isAdmin: boolean;
  isSeller: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, passwordHash: string): Promise<boolean> => {
    const users = dataService.getUsers();
    const foundUser = users.find(
      u => u.username === username && u.passwordHash === passwordHash
    );

    if (foundUser && foundUser.status === UserStatus.ACTIVE) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (newUser: User) => {
    const users = dataService.getUsers();
    if (users.find(u => u.username === newUser.username)) {
      throw new Error("Username already exists");
    }
    const updatedUsers = [...users, newUser];
    dataService.setUsers(updatedUsers);
    
    // Auto login after register
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      isAdmin: user?.role === UserRole.ADMIN,
      isSeller: user?.role === UserRole.SELLER,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};