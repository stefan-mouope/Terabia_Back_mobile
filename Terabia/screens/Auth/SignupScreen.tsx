import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const signupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phone: Joi.string().pattern(/^\+?\d{9,15}$/).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  city: Joi.string().required(),
  gender: Joi.string().optional().allow(''),
  cni: Joi.string().when('role', {
    is: Joi.valid('seller', 'delivery'),
    then: Joi.string().min(10).required(),
    otherwise: Joi.string().optional().allow('')
  }),
});

const SignupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = route.params as { role: string };

  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: joiResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      city: '',
      gender: '',
      cni: '',
    },
  });

  React.useEffect(() => {
    // Dynamically set the role in the form
    setValue('role', role);
  }, [role, setValue]);

  const handleSignup = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', { ...data, role }); // Replace with your backend URL
      const { accessToken, refreshToken, user } = response.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      Alert.alert('Registration Success', `Welcome, ${user.name}!`);

      if (user.role === 'buyer') {
        navigation.replace('App', { screen: 'Home' });
      } else if (user.role === 'seller') {
        navigation.replace('App', { screen: 'Dashboard' });
      } else if (user.role === 'delivery') {
        navigation.replace('App', { screen: 'Deliveries' });
      } else if (user.role === 'admin') {
        navigation.replace('App', { screen: 'Admin' });
      }

    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-3xl font-bold mb-8 text-neutral900">Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="Full Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && <Text className="text-red-500 mb-2">{errors.name.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="Email"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text className="text-red-500 mb-2">{errors.email.message}</Text>}

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="Phone Number (e.g., +2376XXXXXXXX)"
            keyboardType="phone-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.phone && <Text className="text-red-500 mb-2">{errors.phone.message}</Text>}

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

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="City"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.city && <Text className="text-red-500 mb-2">{errors.city.message}</Text>}

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border p-3 mb-4 rounded w-full"
            placeholder="Gender (Optional)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.gender && <Text className="text-red-500 mb-2">{errors.gender.message}</Text>}

      {(role === 'seller' || role === 'delivery') && (
        <Controller
          control={control}
          name="cni"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border p-3 mb-4 rounded w-full"
              placeholder="National ID (CNI)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      )}
      {errors.cni && <Text className="text-red-500 mb-2">{errors.cni.message}</Text>}

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleSubmit(handleSignup)}
        disabled={loading}
      />

      <Text className="mt-6 text-neutral700">Already have an account?</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} color="#757575" />
    </ScrollView>
  );
};

export default SignupScreen;
