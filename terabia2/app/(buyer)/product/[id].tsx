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
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  
  const loadProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const images = product.images as string[];
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity,
      image: images && images.length > 0 ? images[0] : '',
      sellerId: product.seller_id,
      stock: product.stock,
      unit: product.unit,
    });

    Alert.alert('Success', 'Added to cart', [
      { text: 'Continue Shopping', onPress: () => router.back() },
      { text: 'View Cart', onPress: () => router.push('/(buyer)/(tabs)/cart') },
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return null;
  }

  const images = product.images as string[];
  const imageUrl = images && images.length > 0 ? images[0] : null;
  const seller = product.seller; // Récupère l'objet seller (peut être null/undefined)

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.neutral[900]} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>{product.price} XAF</Text>
              <Text style={styles.unit}>per {product.unit}</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={18} color={colors.neutral[600]} />
            <Text style={styles.location}>{product.location_city}</Text>
          </View>

          <View style={styles.divider} />

          {/* 🎯 CORRECTION: Afficher la section vendeur SEULEMENT si l'objet 'seller' est présent */}
          {seller ? (
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Seller Information</Text>
              <View style={styles.sellerCard}>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  <Text style={styles.sellerLocation}>{seller.city}</Text>
                  {seller.total_ratings > 0 && (
                    <View style={styles.ratingRow}>
                      <Star size={16} color={colors.accent.yellow} fill={colors.accent.yellow} />
                      <Text style={styles.ratingText}>
                        {seller.rating?.toFixed(1) || 0} ({seller.total_ratings}{' '}
                        reviews)
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
             <View style={styles.sellerSection}>
                <Text style={styles.sectionTitle}>Seller Information</Text>
                <Text style={styles.location}>Seller information unavailable.</Text>
             </View>
          )} 

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

      {product.stock > 0 && (
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
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
            >
              <Plus
                size={20}
                color={quantity >= product.stock ? colors.neutral[400] : colors.primary.green}
              />
            </TouchableOpacity>
          </View>
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            style={styles.addButton}
          />
        </View>
      )}
    </View>
  );
}

// ... Les styles restent inchangés
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: spacing['2xl'],
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.md,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.neutral[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.neutral[500],
    fontSize: typography.sizes.base,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  price: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700',
    color: colors.primary.green,
  },
  unit: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
  },
  stockBadge: {
    backgroundColor: colors.accent.sand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  stockText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  location: {
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.lg,
  },
  sellerSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sellerCard: {
    backgroundColor: colors.accent.sand,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
  },
  sellerInfo: {},
  sellerName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  sellerLocation: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    marginLeft: spacing.xs,
  },
  descriptionSection: {},
  description: {
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  footer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.lg,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: spacing.base,
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.neutral[900],
    minWidth: 32,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
  },
});
