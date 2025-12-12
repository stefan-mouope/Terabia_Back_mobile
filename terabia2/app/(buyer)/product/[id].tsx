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
      const productData = data?.data || data;
      setProduct(productData);
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
      (product.images.length > 0 ? product.images[0].url : '');

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
    (product?.images.length > 0 ? product.images[0].url : null);

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

      {/* Contenu principal scrollable */}
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

        {/* Toutes les infos */}
        <View style={styles.content}>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>
                {Number(product.price).toLocaleString()} FCFA
              </Text>
              {product.unit && <Text style={styles.unit}>par {product.unit}</Text>}
            </View>

            <View style={[styles.stockBadge, !inStock && styles.outOfStockBadge]}>
              <Text style={styles.stockText}>
                {inStock ? `${product.stock} en stock` : 'Rupture de stock'}
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
              <Text style={styles.sellerName}>
                {product.seller?.name || 'Vendeur inconnu'}
              </Text>
              <Text style={styles.sellerLocation}>
                {product.seller?.city || 'Localisation inconnue'}
              </Text>

              {product.seller && product.seller.rating > 0 && (
                <View style={styles.ratingRow}>
                  <Star size={16} color={colors.accent.yellow} fill={colors.accent.yellow} />
                  <Text style={styles.ratingText}>
                    {product.seller.rating.toFixed(1)} ({product.seller.total_ratings || 0} avis)
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer fixe pour ajouter au panier */}
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
    zIndex: 10,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: borderRadius.full,
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
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 28,
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
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 4,
  },
  stockBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
  },
  outOfStockBadge: {
    backgroundColor: '#ef444420',
  },
  stockText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  location: {
    marginLeft: 6,
    fontSize: 16,
    color: colors.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sellerCard: {
    backgroundColor: colors.neutral[50],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  sellerLocation: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.neutral[700],
  },
  descriptionSection: {
    marginBottom: spacing.xl,
  },
  description: {
    fontSize: 16,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
  },
});