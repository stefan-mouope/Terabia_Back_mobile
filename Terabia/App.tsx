import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';

// Import Screens (Placeholder - will create these files later)
import SplashScreen from './screens/SplashScreen';
import OnboardingScreens from './screens/OnboardingScreens';
import RoleSelectionScreen from './screens/Auth/RoleSelectionScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import SignupScreen from './screens/Auth/SignupScreen';
import BuyerHomeScreen from './screens/Buyer/BuyerHomeScreen';
import CartScreen from './screens/Buyer/CartScreen';
import OrdersHistoryScreen from './screens/Buyer/OrdersHistoryScreen';
import ProfileScreen from './screens/Common/ProfileScreen';
import SellerDashboardScreen from './screens/Seller/SellerDashboardScreen';
// ... other screens as needed

const AuthStack = createStackNavigator();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

const BuyerTab = createBottomTabNavigator();
function BuyerTabNavigator() {
  return (
    <BuyerTab.Navigator>
      <BuyerTab.Screen name="Home" component={BuyerHomeScreen} />
      <BuyerTab.Screen name="Cart" component={CartScreen} />
      <BuyerTab.Screen name="Orders" component={OrdersHistoryScreen} />
      <BuyerTab.Screen name="Profile" component={ProfileScreen} />
      {/* "More" screen if needed */}
    </BuyerTab.Navigator>
  );
}

const SellerTab = createBottomTabNavigator();
function SellerTabNavigator() {
  return (
    <SellerTab.Navigator>
      <SellerTab.Screen name="Dashboard" component={SellerDashboardScreen} />
      <SellerTab.Screen name="Orders" component={OrdersHistoryScreen} /> {/* Seller specific orders */}
      <SellerTab.Screen name="Profile" component={ProfileScreen} />
      {/* "More" screen if needed */}
    </SellerTab.Navigator>
  );
}

const RootStack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null); // Replace with actual auth state
  const [onboarded, setOnboarded] = useState(false); // Replace with actual onboarding state

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Poppins_600SemiBold,
    // ... other fonts
  });

  if (!fontsLoaded) {
    return <Text>Loading Fonts...</Text>; // Or a custom loading component
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!onboarded ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreens} />
        ) : userToken == null ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Dynamic routing based on user role (example for buyer/seller)
          <RootStack.Screen name="App" component={userToken.role === 'buyer' ? BuyerTabNavigator : SellerTabNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
