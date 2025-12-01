// 




import { Platform } from 'react-native';

// Ton IP actuelle trouvée avec ifconfig (interface wlp3s0)
const SERVER_IP = '192.168.0.109'; 

export const API_BASE_URL = __DEV__ 
  ? `http://${Platform.OS === 'android' ? SERVER_IP : 'localhost'}:3000/api`
  : 'https://ton-api-prod.com/api';
