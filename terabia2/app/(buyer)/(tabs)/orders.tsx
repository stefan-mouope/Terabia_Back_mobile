import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import api from '@/lib/api'; // Updated import
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Order } from '@/types/database';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadOrders(user.id);
    }
  }, [user?.id]);

  const loadOrders = async (userId: string) => {
    try {
      const { data } = await api.get(`/orders/buyer/${userId}`);

      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<Package size={64} color={colors.neutral[400]} />}
            title="No orders yet"
            description="Your order history will appear here"
            actionLabel="Browse Products"
            onAction={() => router.push('/(buyer)/(tabs)/catalog')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const items = item.items as any[];
          const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() =>
                router.push({
                  pathname: '/(buyer)/order/[id]',
                  params: { id: item.id },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>{item.order_number}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.itemCount}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
                
                <Text style={styles.orderTotal}>{item.total} XAF</Text>
              </View>

              <View style={styles.paymentBadgeContainer}>
                <StatusBadge status={item.payment_status} size="sm" />
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.base,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
  },
  listContent: {
    padding: spacing.lg,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemCount: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
  },
  orderTotal: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary.green,
  },
  paymentBadgeContainer: {
    alignItems: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: spacing['2xl'],
  },
});
