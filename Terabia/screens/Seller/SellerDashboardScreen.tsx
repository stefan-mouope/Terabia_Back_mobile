import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const SellerDashboardScreen = () => {
  const navigation = useNavigation();
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    earnings: 0,
    popularProducts: [],
    pendingOrders: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSellerStats();
  }, []);

  const fetchSellerStats = async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      // Placeholder: In a real app, sellerId comes from auth context
      const sellerId = 2; // Example seller ID

      // Fetch seller's products to get product-specific stats and filter orders
      const productsResponse = await axios.get(`http://localhost:3000/api/products?sellerId=${sellerId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const sellerProducts = productsResponse.data.products;

      // Fetch orders and filter by seller's products
      const ordersResponse = await axios.get(`http://localhost:3000/api/orders`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const allOrders = ordersResponse.data; // This needs proper filtering logic based on sellerProducts

      let totalSales = 0;
      let earnings = 0;
      let pendingOrders = 0;
      const productSales = {}; // To calculate popular products

      // Simplified logic for in-memory model (would be more robust with DB joins)
      allOrders.forEach(order => {
        const relevantItems = order.items.filter(item =>
          sellerProducts.some(p => p.id === item.productId)
        );

        if (relevantItems.length > 0) {
          if (order.status === 'pending' || order.status === 'accepted') {
            pendingOrders++;
          }
          relevantItems.forEach(item => {
            totalSales += item.qty * item.price;
            earnings += item.qty * item.price * 0.9; // Simulate 10% commission
            productSales[item.productId] = (productSales[item.productId] || 0) + item.qty;
          });
        }
      });

      const sortedPopularProducts = Object.entries(productSales)
        .sort(([, qtyA], [, qtyB]) => (qtyB as number) - (qtyA as number))
        .slice(0, 3) // Top 3 popular products
        .map(([productId]) => sellerProducts.find(p => p.id === parseInt(productId))?.title || `Product ${productId}`);

      setStats({
        totalSales,
        earnings,
        popularProducts: sortedPopularProducts as string[],
        pendingOrders,
      });
    } catch (err) {
      console.error("Failed to fetch seller stats:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoadingStats(false);
    }
  };

  if (loadingStats) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text className="mt-2 text-neutral700">Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-3xl font-bold mb-6 text-neutral900">Seller Dashboard</Text>

      {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

      {/* Sales Summary */}
      <View className="bg-white rounded-lg shadow-md p-4 mb-4">
        <Text className="text-xl font-semibold mb-2 text-neutral900">Sales Summary</Text>
        <Text className="text-md text-neutral700">Total Sales: <Text className="font-bold text-primaryGreen">{stats.totalSales} XAF</Text></Text>
        <Text className="text-md text-neutral700">Your Earnings: <Text className="font-bold text-primaryGreen">{stats.earnings} XAF</Text></Text>
        <Text className="text-md text-neutral700">Pending Orders: <Text className="font-bold text-sunYellow">{stats.pendingOrders}</Text></Text>
      </View>

      {/* Popular Products */}
      <View className="bg-white rounded-lg shadow-md p-4 mb-4">
        <Text className="text-xl font-semibold mb-2 text-neutral900">Popular Products</Text>
        {stats.popularProducts.length > 0 ? (
          stats.popularProducts.map((productTitle, index) => (
            <Text key={index} className="text-md text-neutral700">- {productTitle}</Text>
          ))
        ) : (
          <Text className="text-md text-neutral500">No popular products yet.</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View className="mb-4">
        <Text className="text-xl font-semibold mb-2 text-neutral900">Quick Actions</Text>
        <TouchableOpacity
          className="bg-primaryGreen p-3 rounded-lg mb-2"
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text className="text-white font-semibold text-center">Add New Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-accentTerracotta p-3 rounded-lg mb-2"
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <Text className="text-white font-semibold text-center">View Received Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-neutral700 p-3 rounded-lg"
          onPress={() => navigation.navigate('ManageProducts')}
        >
          <Text className="text-white font-semibold text-center">Manage Products</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder for other seller specific content */}
    </ScrollView>
  );
};

export default SellerDashboardScreen;
