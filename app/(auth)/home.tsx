import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido al Invernadero</Text>
        <Text style={styles.text}>Por favor inicia sesión para continuar</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {user?.name}!</Text>
      <Text style={styles.subtitle}>Sistema de Gestión de Invernadero</Text>

      <TouchableOpacity
        style={[styles.menuButton, styles.profileButton]}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Text style={styles.menuButtonText}>Ver Perfil y Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, styles.logoutButton]}
        onPress={logout}
      >
        <Text style={styles.menuButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f9f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1b5e20',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#2e7d32',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  button: {
    height: 50,
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  profileButton: {
    backgroundColor: '#3498db',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});