import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const categories = [
  { id: '1', name: 'Vegetables', icon: '🌽' },
  { id: '2', name: 'Fruits', icon: '🍎' },
  { id: '3', name: 'Grains', icon: '🌾' },
  { id: '4', name: 'Livestock', icon: '🐄' },
  { id: '5', name: 'Dairy', icon: '🥛' },
  { id: '6', name: 'Processed', icon: '🥫' },
];

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity onPress={onPress} className="w-40 bg-white rounded-lg shadow-md m-2 p-2">
    <Image source={{ uri: product.images[0] }} className="w-full h-24 rounded-md mb-2" />
    <Text className="font-semibold text-neutral900 text-base" numberOfLines={1}>{product.title}</Text>
    <Text className="text-primaryGreen text-lg font-bold">{product.price} {product.currency}</Text>
    <Text className="text-neutral500 text-sm">{product.location.city}</Text>
  </TouchableOpacity>
);

const BuyerHomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/products?q=${searchQuery}`); // Replace with your backend URL
      setProducts(response.data.products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 pb-2 bg-white shadow-sm flex-row items-center">
        <TextInput
          className="flex-1 border border-neutral300 p-2 rounded-lg mr-2"
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} className="bg-primaryGreen p-2 rounded-lg">
          <Text className="text-white">Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#2E7D32" className="mt-4" />}
      {error && <Text className="text-red-500 text-center mt-4">{error}</Text>}

      <ScrollView className="flex-1">
        {/* Categories */}
        <Text className="text-xl font-bold p-4 text-neutral900">Categories</Text>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity className="items-center m-2">
              <View className="bg-sand p-3 rounded-full mb-1">
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <Text className="text-sm text-neutral700">{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Recommended Products */}
        <Text className="text-xl font-bold p-4 text-neutral900">Recommended Products</Text>
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
        />

        {/* Local Promotions (Placeholder) */}
        <Text className="text-xl font-bold p-4 text-neutral900">Local Promotions</Text>
        <View className="h-32 bg-accentTerracotta mx-4 rounded-lg justify-center items-center mb-4">
          <Text className="text-white text-lg font-bold">Promotions Banner Here!</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default BuyerHomeScreen;
