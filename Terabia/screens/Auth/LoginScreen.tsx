import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // For secure token storage

const loginSchema = Joi.object({
  emailOrPhone: Joi.string().required().messages({
    'string.empty': 'Email or Phone is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: joiResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  });

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', data); // Replace with your backend URL
      const { accessToken, refreshToken, user } = response.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      // Store user role and ID if needed globally, e.g., in Context API or Redux
      Alert.alert('Login Success', `Welcome back, ${user.name}!`);

      // Navigate based on role
      if (user.role === 'buyer') {
        navigation.replace('App', { screen: 'Home' }); // Navigate to Buyer's home tab
      } else if (user.role === 'seller') {
        navigation.replace('App', { screen: 'Dashboard' }); // Navigate to Seller's dashboard tab
      } else if (user.role === 'delivery') {
        navigation.replace('App', { screen: 'Deliveries' }); // Assuming a delivery tab
      } else if (user.role === 'admin') {
        navigation.replace('App', { screen: 'Admin' }); // Assuming an admin tab
      }

    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <Text className="text-3xl font-bold mb-8 text-neutral900">Login</Text>

      <Controller
        control={control}
        name="emailOrPhone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="Email or Phone Number"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.emailOrPhone && <Text className="text-red-500 mb-2">{errors.emailOrPhone.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="Password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text className="text-red-500 mb-2">{errors.password.message}</Text>}

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleSubmit(handleLogin)}
        disabled={loading}
      />

      <Text className="mt-6 text-neutral700">Don't have an account?</Text>
      <Button title="Sign Up" onPress={() => navigation.navigate('RoleSelection')} color="#757575" />
    </View>
  );
};

export default LoginScreen;
