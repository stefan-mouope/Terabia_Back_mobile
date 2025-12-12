import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, Star, Plus, Minus, ArrowLeft } from 'lucide-react-native';

import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Product } from '@/types/database';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);

      // Ton backend renvoie { success: true, data: { ...product + seller } }
      setProduct(data?.data || data || null);
    } catch (error: any) {
      console.error('Erreur chargement produit:', error);
      Alert.alert('Erreur', 'Impossible de charger le produit');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const mainImage =
      product.main_image ||
      (Array.isArray(product.images) && product.images[0]?.url) ||
      '';

    addItem({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      quantity,
      image: mainImage,
      sellerId: product.seller_id,
      stock: product.stock,
      unit: product.unit || 'unité',
    });

    Alert.alert('Ajouté au panier !', `"${product.title}" ×${quantity}`, [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Voir le panier', onPress: () => router.push('/(buyer)/(tabs)/cart') },
    ]);
  };

  // Image principale
  const mainImageUrl =
    product?.main_image ||
    (Array.isArray(product?.images) && product.images[0]?.url) ||
    null;

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  const inStock = product.stock > 0;
  const canIncrease = quantity < product.stock;

  return (
    <View style={styles.container}>
      {/* Bouton retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.neutral[900]} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image principale */}
        <View style={styles.imageContainer}>
          {mainImageUrl ? (
            <Image source={{ uri: mainImageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Pas d'image</Text>
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>
                {Number(product.price).toLocaleString()} FCFA
              </Text>
              {product.unit && (
                <Text style={styles.unit}>par {product.unit}</Text>
              )}
            </View>

            <View style={[styles.stockBadge, !inStock && styles.outOfStockBadge]}>
              <Text style={styles.stockText}>
                {inStock ? `${product.stock} en stock` : 'Rupture'}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={18} color={colors.neutral[600]} />
            <Text style={styles.location}>{product.location_city}</Text>
          </View>

          <View style={styles.divider} />

          {/* Infos vendeur */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Vendu par</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{product.seller?.name || 'Vendeur'}</Text>
                <Text style={styles.sellerLocation}>{product.seller?.city || 'Localisation inconnue'}</Text>

                {product.seller?.rating > 0 && (
                  <View style={styles.ratingRow}>
                    <Star size={16} color={colors.accent.yellow} fill={colors.accent.yellow} />
                    <Text style={styles.ratingText}>
                      {product.seller.rating.toFixed(1)} ({product.seller.total_ratings || 0} avis)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {product.description ? (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer : quantité + ajouter au panier */}
      {inStock && (
        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={20} color={colors.primary.green} />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              style={[styles.quantityButton, !canIncrease && styles.disabledButton]}
              onPress={() => canIncrease && setQuantity(quantity + 1)}
              disabled={!canIncrease}
            >
              <Plus
                size={20}
                color={canIncrease ? colors.primary.green : colors.neutral[400]}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Ajouter au panier"
            onPress={handleAddToCart}
            style={styles.addButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.lg,
  },
  imageContainer: {
    width: '100%',
    height: 360,
    backgroundColor: colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[200],
  },
  placeholderText: {
    fontSize: 18,
    color: colors.neutral[500],
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary.green,
  },
  unit: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: 2,
  },
  stockBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  outOfStockBadge: {
    backgroundColor: colors.error + '20',
  },
  stockText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  location: {
    marginLeft: spacing.xs,
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sellerCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sellerInfo: {},
  sellerName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  sellerLocation: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ratingText: {
    marginLeft: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
  },
  descriptionSection: {
    marginBottom: spacing.xl,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    ...shadows.xl,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    marginHorizontal: spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    marginLeft: spacing.base,
  },
});