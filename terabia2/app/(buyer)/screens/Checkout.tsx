import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { CreditCard, Smartphone, Wallet, MapPin, ShoppingBag, CheckCircle } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

type PaymentMethod = 'mobile_money' | 'cash_on_delivery' | 'card';

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: JSX.Element;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('mobile_money');
  const [isLoading, setIsLoading] = useState(false);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'mobile_money',
      title: 'Mobile Money',
      description: 'MTN Mobile Money, Orange Money',
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
      const itemsBySeller = items.reduce((acc, item) => {
        if (!acc[item.sellerId]) {
          acc[item.sellerId] = [];
        }
        acc[item.sellerId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Créer une commande pour chaque vendeur
      const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, sellerItems]) => {
        const orderTotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Créer la commande
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            total_amount: orderTotal,
            status: 'pending',
            payment_method: selectedPayment,
            payment_status: selectedPayment === 'cash_on_delivery' ? 'pending' : 'pending',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Créer les items de la commande
        const orderItems = sellerItems.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        return order;
      });

      await Promise.all(orderPromises);

      // Afficher le message de succès
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order has been confirmed.\nPayment method: ${
          paymentOptions.find((p) => p.id === selectedPayment)?.title
        }\nTotal: ${total.toLocaleString()} XAF`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Vider le panier
              clearCart();
              // Rediriger vers l'accueil
              router.replace('/(buyer)/(tabs)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Order Failed',
        'There was an error processing your order. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={20} color={colors.primary.green} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({items.length})</Text>
              <Text style={styles.summaryValue}>{total.toLocaleString()} XAF</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} XAF</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.primary.green} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={styles.paymentOptions}>
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
                <View style={styles.paymentOptionContent}>
                  <View style={styles.paymentIconContainer}>{option.icon}</View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>{option.title}</Text>
                    <Text style={styles.paymentDescription}>{option.description}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedPayment === option.id && styles.radioButtonSelected,
                  ]}
                >
                  {selectedPayment === option.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary.green} />
            <Text style={styles.sectionTitle}>Delivery Information</Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressNote}>
              The seller will contact you to arrange delivery details.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer with Place Order Button */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.footerTotal}>{total.toLocaleString()} XAF</Text>
          </View>
          <Button
            title={isLoading ? 'Processing...' : 'Place Order'}
            onPress={handlePlaceOrder}
            disabled={isLoading}
            style={styles.placeOrderButton}
          />
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.neutral[900],
    marginLeft: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
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
  paymentOptions: {
    gap: spacing.md,
  },
  paymentOption: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.primary.green,
    backgroundColor: colors.accent.sand,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  paymentInfo: {
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
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary.green,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.green,
  },
  addressCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  addressNote: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    ...shadows.lg,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footerLabel: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs / 2,
  },
  footerTotal: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary.green,
  },
  placeOrderButton: {
    minWidth: 160,
  },
});