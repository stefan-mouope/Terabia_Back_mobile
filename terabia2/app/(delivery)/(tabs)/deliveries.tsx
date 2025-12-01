import React, { useCallback, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, Linking, Platform, ActivityIndicator, RefreshControl 
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Imports de ta structure
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api'; 

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Récupérer l'historique des missions
  const fetchMyMissions = async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries/mine/${user.id}`);
      setMissions(response.data);
    } catch (error) {
      console.error("Erreur chargement missions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyMissions();
    }, [])
  );

  // 2. Fonction GPS (Ouvre Google Maps ou Apple Maps)
  const openMap = (address: string) => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Linking.openURL(googleUrl);
      }
    });
  };

  // 3. Mettre à jour le statut (Logique de progression)
  const updateStatus = async (deliveryId: number, newStatus: string) => {
    try {
      await axios.put(`${API_BASE_URL}/deliveries/${deliveryId}`, { 
        status: newStatus
      });
      // On recharge la liste pour voir le changement de statut
      fetchMyMissions();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
    }
  };

  // 4. Affichage de chaque mission
  const renderItem = ({ item }: { item: any }) => {
    // Vérification des statuts (Gestion minuscules/majuscules pour sécurité)
    const status = item.status?.toLowerCase() || '';
    const isPickedUp = status === 'picked_up';
    const isDelivered = status === 'delivered';

    return (
      <View style={[styles.card, isDelivered && styles.cardDelivered]}>
        {/* En-tête : Statut et ID */}
        <View style={styles.cardHeader}>
          <View style={[styles.badge, isDelivered ? styles.badgeGray : styles.badgeGreen]}>
            <Text style={[styles.badgeText, isDelivered && styles.textGray]}>
              {status.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.idText}>#{item.id}</Text>
        </View>

        <View style={styles.divider} />

        {/* Adresses Cliquables (GPS) */}
        <TouchableOpacity onPress={() => openMap(item.pickup_address)} style={styles.row}>
          <Ionicons name="storefront" size={20} color="#f39c12" />
          <View style={styles.textBlock}>
            <Text style={styles.label}>Ramassage (Cliquer pour GPS)</Text>
            <Text style={[styles.address, styles.link]}>{item.pickup_address}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openMap(item.delivery_address)} style={[styles.row, { marginTop: spacing.md }]}>
          <Ionicons name="flag" size={20} color={colors.primary.green} />
          <View style={styles.textBlock}>
            <Text style={styles.label}>Livraison (Cliquer pour GPS)</Text>
            <Text style={[styles.address, styles.link]}>{item.delivery_address}</Text>
          </View>
        </TouchableOpacity>

        {/* Boutons d'Action (Cachés si livré) */}
        {!isDelivered && (
          <View style={styles.actions}>
            {!isPickedUp ? (
              // Étape 1 : Aller chercher le colis
              <TouchableOpacity 
                style={[styles.btn, styles.btnPickup]}
                onPress={() => updateStatus(item.id, 'picked_up')}
              >
                <Text style={styles.btnText}>COLIS RÉCUPÉRÉ</Text>
              </TouchableOpacity>
            ) : (
              // Étape 2 : Livrer au client
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
      <View style={styles.header}>
        <Text style={styles.title}>Mes Missions</Text>
        <Text style={styles.subtitle}>Suivi et Historique</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.green} style={{marginTop: 50}} />
        ) : (
          <FlatList 
            data={missions} 
            renderItem={renderItem} 
            keyExtractor={(item:any) => item.id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyMissions} tintColor="#fff"/>}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune mission en cours.</Text>}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.primary.green,
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.background,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.sizes.sm,
  },
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
  cardDelivered: {
    backgroundColor: '#f0f0f0', // Grisé si terminé
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeGreen: { backgroundColor: '#e8f5e9' },
  badgeGray: { backgroundColor: '#e0e0e0' },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary.green,
  },
  textGray: { color: '#777' },
  idText: {
    color: colors.neutral[400],
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textBlock: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: colors.neutral[500],
    textTransform: 'uppercase',
  },
  address: {
    fontSize: typography.sizes.base,
    color: colors.neutral[800],
    fontWeight: '500',
  },
  link: {
    color: colors.primary.green,
    textDecorationLine: 'underline',
  },
  actions: {
    marginTop: spacing.lg,
  },
  btn: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPickup: { backgroundColor: '#f39c12' }, // Orange
  btnDeliver: { backgroundColor: colors.primary.green }, // Vert
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: typography.sizes.base,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.neutral[500],
  }
});