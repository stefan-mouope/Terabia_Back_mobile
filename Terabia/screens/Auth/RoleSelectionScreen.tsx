import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RoleSelectionScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <Text className="text-3xl font-bold text-center mb-8 text-neutral900">Join Terabia as a...</Text>

      <View className="w-full mb-4">
        <Button title="Buyer" onPress={() => navigation.navigate('Signup', { role: 'buyer' })} />
      </View>
      <View className="w-full mb-4">
        <Button title="Seller" onPress={() => navigation.navigate('Signup', { role: 'seller' })} />
      </View>
      <View className="w-full mb-4">
        <Button title="Delivery Agency" onPress={() => navigation.navigate('Signup', { role: 'delivery' })} />
      </View>

      <Text className="mt-8 text-neutral700">Already have an account?</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} color="#757575" />
    </View>
  );
};

export default RoleSelectionScreen;
