import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // IMPORTANTE: Cambia esta IP por la de tu computadora en la red local
  const API_URL = 'http://192.168.0.106:5000/api'; // Asegúrate que esta IP sea correcta

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Todos los campos marcados con * son obligatorios');
      return false;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Para Android Emulator usa 'http://10.0.2.2:5000/api/register'
      // Para iOS Simulator usa 'http://localhost:5000/api/register'
      // Para dispositivo físico usa tu IP local como 'http://192.168.0.106:5000/api/register'
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone || null,
          password: formData.password
        }),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error en el registro');
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);

      // Guardar datos del usuario y redirigir
      if (data.user && data.user.id) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        Alert.alert(
          'Registro exitoso', 
          'Tu cuenta ha sido creada correctamente',
          [{ text: 'OK', onPress: () => router.replace('/home') }]
        );
      } else {
        // Si el backend no devuelve el usuario, redirigir al login
        Alert.alert(
          'Registro exitoso', 
          'Por favor inicia sesión con tus nuevas credenciales',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }

    } catch (err) {
      console.error('Error en el registro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      
      // Manejo específico para errores de conexión
      if (errorMessage.includes('Failed to fetch')) {
        setError('No se pudo conectar al servidor. Verifica tu conexión y que la API esté corriendo.');
      } else {
        setError(errorMessage);
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
        <Text style={styles.title}>Crear Cuenta</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Nombre completo *"
          placeholderTextColor="#95af9e"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor="#95af9e"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#95af9e"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña * (mínimo 6 caracteres)"
          placeholderTextColor="#95af9e"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña *"
          placeholderTextColor="#95af9e"
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#1b5e20',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    height: 50,
    borderColor: '#c8e6c9',
    borderWidth: 1,
    marginBottom: 15,
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLink: {
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