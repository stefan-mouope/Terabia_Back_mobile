import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Package, Edit, Trash2 } from 'lucide-react-native';

import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Product } from '@/types/database';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

export default function SellerProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Recharge les produits à chaque fois que l'écran est focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadProducts(user.id);
      }
    }, [user?.id])
  );

  const loadProducts = async (sellerId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/seller/${sellerId}`);
      // Le backend renvoie { success: true, data: [...] }
      setProducts(data?.data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert('Erreur', 'Impossible de charger vos produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous vraiment supprimer "${product.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/products/${product.id}`);
              setProducts(prev => prev.filter(p => p.id !== product.id));
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la suppression du produit');
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<Package size={80} color={colors.neutral[400]} />}
          title="Aucun produit"
          description="Commencez par ajouter votre premier produit"
          actionLabel="Ajouter un produit"
          onAction={() => router.push('/(seller)/(tabs)/add-product')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes produits</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // Gestion sécurisée des images (tableau d'objets { url, publicId })
          const mainImageUrl =
            item.main_image ||
            (Array.isArray(item.images) && item.images[0]?.url) ||
            null;

          return (
            <View style={styles.productCard}>
              {/* Image du produit */}
              {mainImageUrl ? (
                <Image source={{ uri: mainImageUrl }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Package size={32} color={colors.neutral[400]} />
                </View>
              )}

              {/* Infos */}
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.productPrice}>
                  {Number(item.price).toLocaleString()} FCFA {item.unit ? `/ ${item.unit}` : ''}
                </Text>

                <View style={styles.stockRow}>
                  <Text style={styles.stockText}>Stock : {item.stock}</Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.is_active
                          ? colors.success
                          : colors.neutral[300],
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.is_active ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push({
                      pathname: '/(seller)/screen/UpdateScreen',
                      params: { productId: item.id },
                    })
                  }
                >
                  <Edit size={18} color={colors.primary.green} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                >
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
  },
  listContent: {
    padding: spacing.lg,
  },
  productCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
  },
  placeholderImage: {
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary.green,
    marginBottom: spacing.sm,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stockText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.background,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});