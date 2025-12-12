import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors, typography, spacing } from '@/constants/theme';
import { Category } from '@/types/database';

export default function AddProductScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    categoryId: '',
    locationCity: user?.city || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Accès refusé', 'Nous avons besoin de la galerie pour ajouter des photos');
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const pickImage = async () => {
    if (images.length >= 6) {
      Alert.alert("Limite atteinte', 'Vous pouvez ajouter jusqu'à 6 photos");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= 6) {
      Alert.alert('Limite atteinte', 'Maximum 6 photos');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.price) newErrors.price = 'Le prix est requis';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      newErrors.price = 'Prix invalide';
    if (!formData.stock) newErrors.stock = 'Le stock est requis';
    else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)
      newErrors.stock = 'Stock invalide';
    if (!formData.categoryId) newErrors.categoryId = 'Catégorie requise';
    if (!formData.locationCity.trim()) newErrors.locationCity = 'Ville requise';
    if (images.length === 0) newErrors.images = 'Ajoutez au moins une photo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const form = new FormData();

      form.append('seller_id', user?.id!);
      form.append('title', formData.title);
      form.append('description', formData.description || '');
      form.append('price', formData.price);
      form.append('stock', formData.stock);
      form.append('unit', formData.unit);
      form.append('category_id', formData.categoryId);
      form.append('location_city', formData.locationCity);
      form.append('is_active', 'true');

      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        form.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      await api.post('/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Succès', 'Produit ajouté avec succès !', [
        { text: 'OK', onPress: () => router.push('/(seller)/(tabs)/products') },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erreur', error.response?.data?.error || "Échec de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ajouter un produit</Text>

        <Text style={styles.label}>
          Photos du produit <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 6 && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
              <Ionicons name="add" size={40} color={colors.primary.green} />
              <Text style={styles.addPhotoText}>Ajouter photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.photoActions}>
          <Button
            title="Prendre une photo"
            onPress={takePhoto}
            // variant="outline"
            size="sm"
            style={{ flex: 1, marginRight: 8 }}
            // iconLeft={<Ionicons name="camera" size={20} color={colors.primary.green} />}
          />
          <Button
            title="Galerie"
            onPress={pickImage}
            // variant="outline"
            size="sm"
            style={{ flex: 1 }}
            // iconLeft={<Ionicons name="images" size={20} color={colors.primary.green} />}
          />
        </View>
        {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}

        <View style={styles.form}>
          <Input
            label="Titre du produit"
            value={formData.title}
            onChangeText={(t) => setFormData({ ...formData, title: t })}
            error={errors.title}
            required
            placeholder="Ex: Tomates fraîches bio"
          />

          <Input
            label="Description (facultatif)"
            value={formData.description}
            onChangeText={(t) => setFormData({ ...formData, description: t })}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Input
            label="Prix (XAF)"
            value={formData.price}
            onChangeText={(t) => setFormData({ ...formData, price: t })}
            error={errors.price}
            required
            keyboardType="numeric"
          />

          <Input
            label="Quantité en stock"
            value={formData.stock}
            onChangeText={(t) => setFormData({ ...formData, stock: t })}
            error={errors.stock}
            required
            keyboardType="numeric"
          />

          <Input
            label="Unité"
            value={formData.unit}
            onChangeText={(t) => setFormData({ ...formData, unit: t })}
            placeholder="kg, pièce, sac, botte..."
          />

          <Input
            label="Ville"
            value={formData.locationCity}
            onChangeText={(t) => setFormData({ ...formData, locationCity: t })}
            error={errors.locationCity}
            required
          />

          <Text style={styles.label}>
            Catégorie <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                title={cat.name}
                onPress={() => setFormData({ ...formData, categoryId: cat.id.toString() })}
                variant={formData.categoryId === cat.id.toString() ? 'primary' : 'secondary'}
                size="sm"
                style={styles.categoryButton}
              />
            ))}
          </ScrollView>
          {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}

          <Button
            title="Publier le produit"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 40 },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing.sm,
  },
  required: { color: colors.error },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.green,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.primary.green,
    fontWeight: '600',
  },
  photoActions: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  form: { gap: spacing.lg },
  categoryScroll: { marginBottom: spacing.sm },
  categoryButton: { marginRight: spacing.sm },
  errorText: { color: colors.error, fontSize: 13, marginTop: 4 },
  submitButton: { marginTop: spacing.xl },
});