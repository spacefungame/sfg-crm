import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/crm';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  registerUser: (username: string, role?: string, email?: string, password?: string, autoLogin?: boolean) => User;
  updateUser: (user: User) => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_USER_KEY = 'space_fun_crm_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(storageService.getUsers());

  useEffect(() => {
    const savedUserId = sessionStorage.getItem(SESSION_USER_KEY) || localStorage.getItem(SESSION_USER_KEY);
    const allUsers = storageService.getUsers();
    setUsers(allUsers);

    if (savedUserId) {
      const found = allUsers.find(u => u.id === savedUserId || u.username.toLowerCase() === savedUserId.toLowerCase());
      if (found) {
        setCurrentUser(found);
      }
    }

    const handleStorageUpdate = () => {
      const updatedUsers = storageService.getUsers();
      setUsers(updatedUsers);
    };

    window.addEventListener('crm_data_updated', handleStorageUpdate);
    return () => window.removeEventListener('crm_data_updated', handleStorageUpdate);
  }, []);

  const login = (username: string, password?: string): boolean => {
    const allUsers = storageService.getUsers();
    let found = allUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase() || u.id === username);
    
    if (found && found.password && found.password.trim() !== '') {
      if (password !== found.password) {
        return false;
      }
    }

    if (!found) {
      found = storageService.addUser(username);
      setUsers(storageService.getUsers());
    }

    setCurrentUser(found);
    sessionStorage.setItem(SESSION_USER_KEY, found.id);
    localStorage.setItem(SESSION_USER_KEY, found.id);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  };

  const registerUser = (username: string, role: string = 'user', email?: string, password?: string, autoLogin: boolean = true): User => {
    const newUser = storageService.addUser(username, role, email, password);
    setUsers(storageService.getUsers());
    if (autoLogin) {
      login(newUser.username, password);
    }
    return newUser;
  };

  const updateUser = (user: User) => {
    storageService.saveUser(user);
    setUsers(storageService.getUsers());
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, registerUser, updateUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
