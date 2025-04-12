import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // IMPORTANTE: Cambia esta IP por la de tu computadora en la red local
  const API_URL = 'http://192.168.0.106:5000/api'; // Asegúrate que esta IP sea correcta

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Para Android Emulator usa 'http://10.0.2.2:5000/api/login'
      // Para iOS Simulator usa 'http://localhost:5000/api/login'
      // Para dispositivo físico usa tu IP local como 'http://192.168.0.106:5000/api/login'
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password.trim()
        }),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Credenciales incorrectas');
      }

      const data = await response.json();
      console.log('Login exitoso:', data);

      // Guardar datos del usuario
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      
      // Redirigir al perfil
      router.replace('/profile');
      
    } catch (err) {
      console.error('Error en el login:', err);
      let errorMessage = 'Error de conexión';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Manejo específico para errores de conexión
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🌿 Invernadero Verde</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#95af9e"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          inputMode="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#95af9e"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Iniciar sesión"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/register')}
          accessibilityLabel="Ir a registro"
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sistema de Gestión de Invernadero</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: 'center',
    color: '#1b5e20',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#c8e6c9',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f8fbf8',
    color: '#2e7d32',
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95af9e',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#2e7d32',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 12,
  },
});