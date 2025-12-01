import { Platform } from 'react-native';

// IP de ton PC sur le réseau local
const LOCAL_IP = '10.174.162.236';

export const API_BASE_URL = __DEV__
  ? `http://${Platform.OS === 'android' ? LOCAL_IP : 'localhost'}:3000/api`
  : 'https://ton-api-prod.com/api';
