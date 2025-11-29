import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Placeholder for a global cart state or context
const useCart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]); // Replace with actual cart state management
  const [loading, setLoading] = useState(false);

  // Simulate fetching cart items
  useEffect(() => {
    setLoading(true);
    // In a real app, this would fetch from a backend cart API or global state
    setTimeout(() => {
      setCartItems([
        { productId: 1, title: 'Fresh Tomatoes', price: 1500, currency: 'XAF', qty: 2, imageUrl: 'https://via.placeholder.com/60' },
        { productId: 2, title: 'Organic Lettuce', price: 1000, currency: 'XAF', qty: 1, imageUrl: 'https://via.placeholder.com/60' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const updateQuantity = (productId: number, newQty: number) => {
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId ? { ...item, qty: newQty > 0 ? newQty : 1 } : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setCartItems(currentItems => currentItems.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  return { cartItems, updateQuantity, removeItem, calculateTotal, loading };
};

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, updateQuantity, removeItem, calculateTotal, loading } = useCart();

  const estimatedDeliveryFees = 500; // Placeholder
  const subtotal = calculateTotal();
  const total = subtotal + estimatedDeliveryFees;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Add some products before proceeding to checkout.');
      return;
    }
    // In a real app, you'd create an order first on the backend, then navigate to payment
    const orderId = 123; // Placeholder order ID
    navigation.navigate('PaymentPage', { orderId: orderId, totalAmount: total });
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center bg-white p-3 mb-3 rounded-lg shadow-sm">
      <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-md mr-3" />
      <View className="flex-1">
        <Text className="font-semibold text-neutral900 text-base">{item.title}</Text>
        <Text className="text-primaryGreen text-md font-bold">{item.price} {item.currency}</Text>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => updateQuantity(item.productId, item.qty - 1)} className="bg-neutral100 p-2 rounded-md">
            <Text className="font-bold">-</Text>
          </TouchableOpacity>
          <Text className="mx-3 text-neutral700">{item.qty}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.productId, item.qty + 1)} className="bg-neutral100 p-2 rounded-md">
            <Text className="font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.productId)} className="ml-3 p-2">
        <Text className="text-red-500">Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text className="mt-2 text-neutral700">Loading Cart...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Text className="text-3xl font-bold p-4 text-neutral900">My Cart</Text>

      {cartItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-neutral500 text-lg">Your cart is empty.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} className="mt-4 bg-primaryGreen p-3 rounded-lg">
            <Text className="text-white font-semibold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.productId.toString()}
          className="p-4"
        />
      )}

      {cartItems.length > 0 && (
        <View className="border-t border-neutral300 p-4 bg-white shadow-lg">
          <View className="flex-row justify-between mb-2">
            <Text className="text-neutral700">Subtotal:</Text>
            <Text className="font-semibold text-neutral900">{subtotal} XAF</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-neutral700">Estimated Delivery:</Text>
            <Text className="font-semibold text-neutral900">{estimatedDeliveryFees} XAF</Text>
          </View>
          <View className="flex-row justify-between mb-4 border-t border-neutral300 pt-2">
            <Text className="text-xl font-bold text-neutral900">Total:</Text>
            <Text className="text-xl font-bold text-primaryGreen">{total} XAF</Text>
          </View>
          <Button title="Proceed to Checkout" onPress={handleProceedToCheckout} />
        </View>
      )}
    </View>
  );
};

export default CartScreen;
