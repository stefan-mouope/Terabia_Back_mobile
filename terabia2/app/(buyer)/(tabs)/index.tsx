import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/lib/api'; // Updated import
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Category, Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function BuyerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/products', { params: { is_active: true, limit: 10 } }), // Assuming backend handles limit and active status
      ]);

      setCategories(categoriesResponse.data || []);
      setFeaturedProducts(productsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'}!</Text>
        <Text style={styles.subtitle}>What are you looking for today?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() =>
                router.push({
                  pathname: '/(buyer)/catalog',
                  params: { categoryId: category.id },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh Products</Text>
          <TouchableOpacity onPress={() => router.push('/(buyer)/(tabs)/catalog')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product as any}
            onPress={() =>
              router.push({
                pathname: '/(buyer)/product/[id]',
                params: { id: product.id },
              })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.primary.green,
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.background,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.background,
    opacity: 0.9,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary.green,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: spacing.base,
    width: 90,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[700],
    textAlign: 'center',
  },
});
