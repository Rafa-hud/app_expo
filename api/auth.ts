import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuración de la API
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL, // Corregido de 'baseline' a 'baseURL'
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // Manteniendo la configuración de la imagen
});

// Helper functions for SecureStore
const storeData = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

const getData = async (key: string) => {
  return await SecureStore.getItemAsync(key);
};

const removeData = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

// Servicios de autenticación
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  try {
    const response = await api.post('/register', userData); // Manteniendo endpoint de la imagen
    await storeData('auth_token', response.data.token);
    await storeData('user_data', JSON.stringify(response.data.user));
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || 'Error al registrar el usuario. Por favor intenta nuevamente.'; // Manteniendo mensaje de error de la imagen
  }
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/login', credentials); // Manteniendo endpoint de la imagen
    await storeData('auth_token', response.data.token);
    await storeData('user_data', JSON.stringify(response.data.user));
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || 'Credenciales incorrectas. Por favor intenta nuevamente.'; // Manteniendo mensaje de error de la imagen
  }
};

export const logoutUser = async () => {
  await removeData('auth_token');
  await removeData('user_data');
};

export const getStoredUser = async () => {
  const user = await getData('user_data');
  return user ? JSON.parse(user) : null;
};

export const fetchUsers = async () => {
  try {
    const token = await getData('auth_token');
    const response = await api.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || 'Error al obtener usuarios';
  }
};