import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // ou 'expo-router' selon ton setup
import { Ionicons } from '@expo/vector-icons';

// Imports de ta structure
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api';

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Récupérer les missions du livreur
  const fetchMyMissions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const response = await axios.get(`${API_BASE_URL}/deliveries/mine/${user.id}`);
      setMissions(response.data);
    } catch (error: any) {
      console.error('Erreur chargement missions:', error);
      Alert.alert('Erreur', 'Impossible de charger vos missions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recharge la liste à chaque fois que l'écran gagne le focus
  useFocusEffect(
    useCallback(() => {
      fetchMyMissions();
    }, [user?.id])
  );

  // 2. Ouvrir Google Maps / Apple Plans
  const openMap = (address: string) => {
    const query = encodeURIComponent(address);
    const scheme = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.canOpenURL(scheme!).then((supported) => {
      if (supported) {
        Linking.openURL(scheme!);
      } else {
        Linking.openURL(googleUrl);
      }
    });
  };

  // 3. Mettre à jour le statut de la livraison
  const updateStatus = async (deliveryId: number, newStatus: 'picked_up' | 'delivered') => {
    try {
      await axios.put(`${API_BASE_URL}/deliveries/${deliveryId}`, {
        status: newStatus,
      });

      // Rafraîchir la liste après succès
      await fetchMyMissions();

      Alert.alert('Succès', `Statut mis à jour : ${newStatus === 'picked_up' ? 'Colis récupéré' : 'Livré'}`);
    } catch (error: any) {
      console.error('Erreur mise à jour statut:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  // 4. Rendu d'une mission
  const renderItem = ({ item }: { item: any }) => {
    const status = (item.status || '').toLowerCase();
    const isPickedUp = status === 'picked_up';
    const isDelivered = status === 'delivered';

    return (
      <View style={[styles.card, isDelivered && styles.cardDelivered]}>
        {/* En-tête */}
        <View style={styles.cardHeader}>
          <View style={[styles.badge, isDelivered ? styles.badgeGray : styles.badgeGreen]}>
            <Text style={[styles.badgeText, isDelivered && styles.textGray]}>
              {status.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.idText}>#{item.id}</Text>
        </View>

        <View style={styles.divider} />

        {/* Adresses cliquables */}
        <TouchableOpacity onPress={() => openMap(item.pickup_address)} style={styles.row}>
          <Ionicons name="storefront" size={20} color="#f39c12" />
          <View style={styles.textBlock}>
            <Text style={styles.label}>Ramassage (Cliquer pour GPS)</Text>
            <Text style={[styles.address, styles.link]}>{item.pickup_address}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openMap(item.delivery_address)}
          style={[styles.row, { marginTop: spacing.md }]}
        >
          <Ionicons name="flag" size={20} color={colors.primary.green} />
          <View style={styles.textBlock}>
            <Text style={styles.label}>Livraison (Cliquer pour GPS)</Text>
            <Text style={[styles.address, styles.link]}>{item.delivery_address}</Text>
          </View>
        </TouchableOpacity>

        {/* Boutons d'action (sauf si déjà livré) */}
        {!isDelivered && (
          <View style={styles.actions}>
            {!isPickedUp ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnPickup]}
                onPress={() => updateStatus(item.id, 'picked_up')}
              >
                <Text style={styles.btnText}>COLIS RÉCUPÉRÉ</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.btnDeliver]}
                onPress={() => updateStatus(item.id, 'delivered')}
              >
                <Text style={styles.btnText}>CONFIRMER LA LIVRAISON</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Missions</Text>
        <Text style={styles.subtitle}>Suivi et Historique</Text>
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.green} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={missions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchMyMissions} colors={['#fff']} />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune mission en cours.</Text>}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Styles (tes styles restent inchangés – ils étaient déjà bons !)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary.green,
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  title: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.background },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: typography.sizes.sm },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardDelivered: { backgroundColor: '#f0f0f0', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 4 },
  badgeGreen: { backgroundColor: '#e8f5e9' },
  badgeGray: { backgroundColor: '#e0e0e0' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: colors.primary.green },
  textGray: { color: '#777' },
  idText: { color: colors.neutral[400], fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  textBlock: { marginLeft: spacing.sm, flex: 1 },
  label: { fontSize: 10, color: colors.neutral[500], textTransform: 'uppercase' },
  address: { fontSize: typography.sizes.base, color: colors.neutral[800], fontWeight: '500' },
  link: { color: colors.primary.green, textDecorationLine: 'underline' },
  actions: { marginTop: spacing.lg },
  btn: { padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  btnPickup: { backgroundColor: '#f39c12' },
  btnDeliver: { backgroundColor: colors.primary.green },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: typography.sizes.base },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.neutral[500] },
});