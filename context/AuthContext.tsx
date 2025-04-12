import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  updateUser: (userData: User & { password?: string }) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = 'http://192.168.0.106:5000/api'; // Asegúrate que esta IP sea correcta

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de login (sin cambios)
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data = await handleRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/home');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  // Función de registro (sin cambios)
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const data = await handleRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/home');
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  // Función de logout (sin cambios)
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setUsers([]);
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  // Función para cargar usuarios (mejorada)
  const loadUsers = async () => {
    try {
      const data = await handleRequest('/users');
      setUsers(data.users);
      return data.users;
    } catch (err) {
      console.error('Load users error:', err);
      throw err;
    }
  };

  // Función para crear usuario (mejorada)
  const createUser = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const data = await handleRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password
        }),
      });

      // Actualizar la lista de usuarios después de crear
      await loadUsers();
      return data.user;
    } catch (err) {
      console.error('Create user error:', err);
      throw err;
    }
  };

  // Función para actualizar usuario (mejorada)
  const updateUser = async (userData: User & { password?: string }) => {
    try {
      const updateData: any = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      };

      if (userData.password) {
        updateData.password = userData.password;
      }

      const data = await handleRequest(`/users/${userData.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      // Si estamos actualizando el usuario actual, actualizar el estado
      if (userData.id === user?.id) {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }

      // Actualizar la lista de usuarios
      await loadUsers();
      return data.user;
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  // Función para eliminar usuario (mejorada)
  const deleteUser = async (userId: number) => {
    try {
      await handleRequest(`/users/${userId}`, {
        method: 'DELETE',
      });

      // Actualizar la lista de usuarios después de eliminar
      await loadUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loadUsers,
        createUser,
        updateUser,
        deleteUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};