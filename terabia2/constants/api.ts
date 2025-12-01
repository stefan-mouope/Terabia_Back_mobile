import { Platform } from 'react-native';

// 🎯 CORRECTION: Utiliser l'adresse IP locale réelle de votre PC (wlp3s0)
const LOCAL_IP = '192.168.0.111';

export const API_BASE_URL = __DEV__
  ? `http://${Platform.OS === 'android' ? LOCAL_IP : 'localhost'}:3000/api`
  : 'https://ton-api-prod.com/api';






  