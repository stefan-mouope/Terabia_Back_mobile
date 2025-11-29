import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-4xl font-bold text-primaryGreen">Terabia</Text>
      <ActivityIndicator size="large" color="#2E7D32" className="mt-4" />
    </View>
  );
};

export default SplashScreen;
