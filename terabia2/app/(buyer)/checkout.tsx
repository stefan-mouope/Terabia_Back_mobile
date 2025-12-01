import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  Smartphone,
  Wallet,
  MapPin,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { orderService } from '@/services/orderService';

type PaymentMethod = 'mobile_money' | 'cash_on_delivery' | 'card';

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function checkout() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('mobile_money');
  const [isLoading, setIsLoading] = useState(false);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'mobile_money',
      title: 'Mobile Money',
      description: 'Orange Money, MTN Mobile Money',
      icon: <Smartphone size={24} color={colors.primary.green} />,
    },
    {
      id: 'cash_on_delivery',
      title: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: <Wallet size={24} color={colors.primary.green} />,
    },
    {
      id: 'card',
      title: 'Credit/Debit Card',
      description: 'Visa, Mastercard',
      icon: <CreditCard size={24} color={colors.primary.green} />,
    },
  ];

  const deliveryFee = 1000; // Frais de livraison fixes
  const totalWithDelivery = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to place an order');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      // Grouper les articles par vendeur
      const ordersBySeller = items.reduce((acc, item) => {
        if (!acc[item.sellerId]) {
          acc[item.sellerId] = [];
        }
        acc[item.sellerId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Créer une commande pour chaque vendeur
      const orderPromises = Object.entries(ordersBySeller).map(
        async ([sellerId, sellerItems]) => {
          const orderTotal = sellerItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const orderData = {
            buyer_id: user.id,
            seller_id: sellerId,
            subtotal: orderTotal,
            delivery_fee: deliveryFee / Object.keys(ordersBySeller).length,
            total:orderTotal + deliveryFee / Object.keys(ordersBySeller).length,
            status: 'pending' as const,
            payment_method: selectedPayment,
            payment_status: 'pending' as const,
            delivery_address: user.address || 'No address provided',
            delivery_city: user.city || 'No city provided',
            items: sellerItems.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
              price: item.price,
              unit: item.unit,
            })),
          };

          return await orderService.createOrder(orderData);
        }
      );

      await Promise.all(orderPromises);

      // Vider le panier
      clearCart();

      // Afficher le succès
      Alert.alert(
        'Order Placed Successfully! 🎉',
        'Your order has been received and is being processed.',
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/(buyer)/(tabs)/orders'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.replace('/(buyer)/(tabs)/catalog'),
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Order Failed',
        'There was an error placing your order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.neutral[700]} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>
              {user?.address || 'No address provided'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={20} color={colors.neutral[700]} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryCard}>
            {items.map((item) => (
              <View key={item.productId} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  {item.quantity} × {item.price} XAF
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{total.toLocaleString()} XAF</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} XAF</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {totalWithDelivery.toLocaleString()} XAF
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.neutral[700]} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.paymentOption,
                selectedPayment === option.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentIconContainer}>{option.icon}</View>
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>{option.title}</Text>
                <Text style={styles.paymentDescription}>{option.description}</Text>
              </View>
              {selectedPayment === option.id && (
                <CheckCircle size={24} color={colors.primary.green} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Info */}
        {selectedPayment === 'mobile_money' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 You will receive payment instructions via SMS after placing your order.
            </Text>
          </View>
        )}
        {selectedPayment === 'cash_on_delivery' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Please have the exact amount ready when the delivery arrives.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerTotal}>
            {totalWithDelivery.toLocaleString()} XAF
          </Text>
        </View>
        <Button
          title={isLoading ? 'Processing...' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={isLoading}
          icon={
            isLoading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : undefined
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginLeft: spacing.sm,
  },
  addressCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  addressText: {
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
  },
  changeButton: {
    fontSize: typography.sizes.sm,
    color: colors.primary.green,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryItemName: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
    marginRight: spacing.md,
  },
  summaryItemPrice: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary.green,
  },
  paymentOption: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.primary.green,
    backgroundColor: colors.accent.sand + '20',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  paymentDescription: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
  },
  infoBox: {
    backgroundColor: colors.primary.green + '10',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.green,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  footer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    ...shadows.lg,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  footerLabel: {
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
  },
  footerTotal: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary.green,
  },
});