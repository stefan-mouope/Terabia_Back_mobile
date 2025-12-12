import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Category, Product } from '@/types/database';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2; // 2 colonnes avec marge

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
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products', {
          params: { is_active: true, limit: 12 }, // un peu plus pour remplir 2 lignes
        }),
      ]);

      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setFeaturedProducts(productsRes.data?.data || productsRes.data || []);
    } catch (error: any) {
      console.error('Erreur chargement page d’accueil:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMainImage = (product: Product): string | null => {
    return (
      product.main_image ||
      (Array.isArray(product.images) && product.images[0]?.url) ||
      null
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bonjour, {user?.name?.split(' ')[0] || 'ami'} !
        </Text>
        <Text style={styles.subtitle}>Découvrez les meilleurs produits près de chez vous</Text>
      </View>

      {/* Catégories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <ScrollView
          horizontal
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(buyer)/catalog',
                  params: { categoryId: category.id, title: category.name },
                })
              }
            >
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{category.icon || 'Shopping'}</Text>
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Produits en grille 2 colonnes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produits frais</Text>
          <TouchableOpacity onPress={() => router.push('/(buyer)/(tabs)/catalog')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {featuredProducts.length > 0 ? (
          <View style={styles.gridContainer}>
            {featuredProducts.map((product) => {
              const imageUrl = getMainImage(product);

              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.gridItem}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: '/(buyer)/product/[id]',
                      params: { id: product.id },
                    })
                  }
                >
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.gridImage} />
                  ) : (
                    <View style={[styles.gridImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>Image</Text>
                    </View>
                  )}

                  <View style={styles.gridInfo}>
                    <Text style={styles.gridTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.gridPrice}>
                      {Number(product.price).toLocaleString()} FCFA
                      {product.unit ? `/${product.unit}` : ''}
                    </Text>
                    <Text style={styles.gridSeller}>
                      {product.seller?.name || 'Vendeur'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noDataText}>Aucun produit disponible pour le moment</Text>
        )}
      </View>

      <View style={{ height: 30 }} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },
  greeting: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '800',
    color: colors.background,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.background,
    opacity: 0.95,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary.green,
    fontWeight: '600',
  },

  // Catégories
  categoriesContainer: {
    paddingRight: spacing.xl,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 90,
  },
  categoryIcon: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  categoryEmoji: {
    fontSize: 36,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    textAlign: 'center',
    fontWeight: '500',
  },

  // Grille 2 colonnes
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: ITEM_WIDTH,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  gridImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
    color: colors.neutral[400],
  },
  gridInfo: {
    padding: spacing.md,
  },
  gridTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  gridPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary.green,
    marginBottom: 2,
  },
  gridSeller: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[600],
  },
  noDataText: {
    textAlign: 'center',
    color: colors.neutral[500],
    fontStyle: 'italic',
    paddingVertical: spacing.xl,
  },
});