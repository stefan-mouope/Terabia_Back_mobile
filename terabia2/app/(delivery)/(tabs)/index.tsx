import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Imports de ta structure
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api'; // Vérifie que ce chemin est bon !

export default function DeliveryDashboard() {
  const { user } = useAuth(); // On a besoin de l'ID du livreur (user.id)
  const router = useRouter();

  // États pour gérer les données et le chargement
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null); // Pour spinner sur le bouton

  // 1. Fonction pour charger les courses disponibles
  const fetchAvailableDeliveries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries/available`);
      setDeliveries(response.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Charger les données chaque fois qu'on affiche l'écran
  useFocusEffect(
    useCallback(() => {
      fetchAvailableDeliveries();
    }, [])
  );

  // 3. Fonction pour Accepter une course
  const handleAccept = async (deliveryId: number) => {
    if (!user?.id) return Alert.alert("Erreur", "Livreur non identifié");

    setProcessingId(deliveryId); // Active le petit chargement sur le bouton

    try {
      // On envoie l'ID du livreur (agency_id) au backend
      await axios.post(`${API_BASE_URL}/deliveries/${deliveryId}/accept`, {
        agency_id: user.id 
      });

      Alert.alert("Succès", "Course acceptée ! 🚀");
      
      // On retire immédiatement la course de la liste locale
      setDeliveries(prev => prev.filter((item: any) => item.id !== deliveryId));
      
      // Optionnel : Rediriger vers l'onglet "Mes Missions"
      router.push('/(delivery)/(tabs)/deliveries'); 

    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert("Trop tard", "Cette course a déjà été prise.");
      } else {
        Alert.alert("Erreur", "Impossible d'accepter la course.");
      }
      // En cas d'erreur, on rafraîchit la liste pour être à jour
      fetchAvailableDeliveries();
    } finally {
      setProcessingId(null);
    }
  };

  // 4. Design d'une carte "Course"
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* En-tête de la carte : Prix et Heure */}
      <View style={styles.cardHeader}>
        <Text style={styles.fee}>{item.estimated_fee} FCFA</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Adresses (Sans GPS pour l'instant) */}
      <View style={styles.row}>
        <Ionicons name="storefront" size={20} color={colors.primary.green} />
        <View style={styles.textBlock}>
          <Text style={styles.label}>Ramassage</Text>
          <Text style={styles.address}>{item.pickup_address}</Text>
        </View>
      </View>

      <View style={[styles.row, { marginTop: spacing.md }]}>
        <Ionicons name="location" size={20} color={colors.neutral[600]} />
        <View style={styles.textBlock}>
          <Text style={styles.label}>Livraison</Text>
          <Text style={styles.address}>{item.delivery_address}</Text>
        </View>
      </View>

      {/* Bouton d'action */}
      <TouchableOpacity 
        style={styles.acceptBtn} 
        onPress={() => handleAccept(item.id)}
        disabled={processingId === item.id}
      >
        {processingId === item.id ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>ACCEPTER LA COURSE</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête vert (Comme ton design original) */}
      <View style={styles.header}>
        <Text style={styles.title}>Offres disponibles</Text>
        <Text style={styles.subtitle}>Bonjour, {user?.name}</Text>
      </View>

      {/* Liste des courses */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.green} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={deliveries}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchAvailableDeliveries} tintColor="#fff" />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucune course disponible pour le moment.</Text>
            }
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.background,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Gris très léger pour le fond de la liste
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // Effet de chevauchement sur le header vert
    padding: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    // Ombre (Shadow)
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fee: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.primary.green,
  },
  time: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.sm,
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
    fontWeight: '600',
  },
  address: {
    fontSize: typography.sizes.base,
    color: colors.neutral[800],
    fontWeight: '500',
    marginTop: 2,
  },
  acceptBtn: {
    backgroundColor: colors.primary.green,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: typography.sizes.base,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.neutral[500],
    fontSize: typography.sizes.base,
  }
});