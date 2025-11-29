import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// Placeholder for Order Status Badge component
const OrderStatusBadge = ({ status }) => {
  let badgeColor = 'bg-neutral500';
  let textColor = 'text-white';

  switch (status) {
    case 'pending':
      badgeColor = 'bg-sunYellow';
      textColor = 'text-neutral900';
      break;
    case 'accepted':
      badgeColor = 'bg-info';
      break;
    case 'in_transit':
      badgeColor = 'bg-accentTerracotta';
      break;
    case 'delivered':
      badgeColor = 'bg-primaryGreen';
      break;
    case 'cancelled':
      badgeColor = 'bg-error';
      break;
    default:
      break;
  }

  return (
    <View className={`${badgeColor} px-3 py-1 rounded-full`}>
      <Text className={`${textColor} text-xs font-semibold`}>{status.replace(/_/g, ' ').toUpperCase()}</Text>
    </View>
  );
};

const OrderCard = ({ order, onPress }) => (
  <TouchableOpacity onPress={onPress} className="bg-white rounded-lg shadow-md m-2 p-4">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="font-bold text-lg text-neutral900">Order #{order.id}</Text>
      <OrderStatusBadge status={order.status} />
    </View>
    <Text className="text-neutral700 text-sm mb-1">Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
    <Text className="text-neutral700 text-sm mb-2">Total: {order.total} {order.items[0]?.currency || 'XAF'}</Text>
    <Text className="text-neutral500 text-xs">Items: {order.items.map(item => item.qty + 'x ' + item.productId).join(', ')}</Text>
  </TouchableOpacity>
);

const OrdersHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you would get buyerId from auth context
      const buyerId = 4; // Placeholder for authenticated buyer ID
      const response = await axios.get(`http://localhost:3000/api/orders?buyerId=${buyerId}`, {
        headers: { Authorization: `Bearer YOUR_ACCESS_TOKEN` }, // Replace with actual token
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text className="mt-2 text-neutral700">Loading Orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Text className="text-3xl font-bold p-4 text-neutral900">My Orders</Text>

      {error && <Text className="text-red-500 text-center mt-4">{error}</Text>}

      {orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-neutral500 text-lg">You haven't placed any orders yet.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} className="mt-4 bg-primaryGreen p-3 rounded-lg">
            <Text className="text-white font-semibold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => <OrderCard order={item} onPress={() => { /* Navigate to Order Details */ }} />}
          keyExtractor={(item) => item.id.toString()}
          className="p-2"
        />
      )}
    </View>
  );
};

export default OrdersHistoryScreen;
