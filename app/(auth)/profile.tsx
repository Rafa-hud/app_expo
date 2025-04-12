import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { users, loading, error, loadUsers, deleteUser, updateUser, createUser, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: 0,
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleEdit = (user: any) => {
    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: ''
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setCurrentUser({
      id: 0,
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!currentUser.name || !currentUser.email) {
      Alert.alert('Error', 'Nombre y email son requeridos');
      return;
    }

    if (!isEditing && !currentUser.password) {
      Alert.alert('Error', 'La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      if (isEditing) {
        await updateUser(currentUser);
      } else {
        await createUser({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          password: currentUser.password
        });
      }
      setIsModalVisible(false);
      await loadUsers();
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al guardar el usuario');
    }
  };

  const handleDelete = (userId: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteUser(userId);
              await loadUsers();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2e7d32']}
        />
      }
    >
      {/* Encabezado con botón de agregar */}
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Usuarios</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de usuarios */}
      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={styles.loader} />
      ) : users?.length > 0 ? (
        users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEdit(user)}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(user.id)}
              >
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noUsers}>No hay usuarios registrados</Text>
      )}

      {/* Modal para editar/agregar usuario */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre*"
              value={currentUser.name}
              onChangeText={(text) => setCurrentUser({...currentUser, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Email*"
              value={currentUser.email}
              onChangeText={(text) => setCurrentUser({...currentUser, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={currentUser.phone}
              onChangeText={(text) => setCurrentUser({...currentUser, phone: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña*'}
              value={currentUser.password}
              onChangeText={(text) => setCurrentUser({...currentUser, password: text})}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.modalButtonText}>
                  {isEditing ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f9f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  addButton: {
    backgroundColor: '#2e7d32',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1b5e20',
  },
  userEmail: {
    fontSize: 14,
    color: '#2e7d32',
    marginTop: 5,
  },
  userPhone: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noUsers: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loader: {
    marginVertical: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1b5e20',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});