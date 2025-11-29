import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null); // Replace with actual user context
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      // Placeholder: In a real app, you'd get the user ID from the stored token or global auth state.
      const userId = 1; // Example user ID

      const response = await axios.get(`http://localhost:3000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile. Please try again.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    Alert.alert('Logged Out', 'You have been successfully logged out.');
    navigation.replace('Auth'); // Go back to the authentication flow
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text className="mt-2 text-neutral700">Loading Profile...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-red-500 text-lg mb-4">{error || "Could not load user profile."}</Text>
        <Button title="Retry" onPress={fetchUserProfile} />
        <Button title="Logout" onPress={handleLogout} color="#FF6347" className="mt-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-3xl font-bold mb-6 text-neutral900">My Profile</Text>

      <View className="items-center mb-6">
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }} // Placeholder profile image
          className="w-24 h-24 rounded-full border-2 border-primaryGreen mb-3"
        />
        <Text className="text-2xl font-semibold text-neutral900">{user.name}</Text>
        <Text className="text-md text-neutral700">{user.email}</Text>
        <Text className="text-md text-neutral500">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-medium text-neutral700 mb-2">Contact Info</Text>
        <Text className="text-md text-neutral900">Phone: {user.phone}</Text>
        <Text className="text-md text-neutral900">City: {user.city}</Text>
        {user.gender && <Text className="text-md text-neutral900">Gender: {user.gender}</Text>}
        {user.cni && <Text className="text-md text-neutral900">CNI: {user.cni}</Text>}
      </View>

      <Button title="Edit Profile" onPress={() => { /* Navigate to Edit Profile screen */ }} />
      <View className="mt-4">
        <Button title="Logout" onPress={handleLogout} color="#FF6347" />
      </View>
    </View>
  );
};

export default ProfileScreen;
