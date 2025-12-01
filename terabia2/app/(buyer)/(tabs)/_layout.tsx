import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';

/**
 * Composant Badge pour afficher le nombre d'articles dans le panier
 */
function CartBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

/**
 * Layout des tabs pour l'interface acheteur
 */
export default function BuyerTabLayout() {
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.green,
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <ShoppingCart size={size} color={color} />
              <CartBadge count={itemCount} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
});