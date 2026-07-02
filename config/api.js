// API Configuration
import { Platform } from 'react-native';

// API Configuration
// IMPORTANT: Update this IP address to your computer's local IP address
// Your current IP: 192.168.0.14 (detected automatically)
// To find your IP manually:
// - Windows: Open CMD and type 'ipconfig', look for IPv4 Address
// - Mac/Linux: Open Terminal and type 'ifconfig' or 'ip addr', look for inet address

// Set to true to use production URL even in development mode (useful for testing deployed backend)
const USE_PRODUCTION_URL = false; // Using local backend server for testing

const YOUR_COMPUTER_IP = '192.168.1.38'; // Your computer's IP address (updated to match actual IP)
const PRODUCTION_URL = 'https://motion-video-1.onrender.com/api';

let API_BASE_URL;

if (__DEV__ && !USE_PRODUCTION_URL) {
  // Development mode
  // For Expo with QR code (physical device), always use computer's IP
  // For emulators/simulators, use localhost with appropriate setup

  // Check if running in Expo (physical device via QR code)
  // Expo Go on physical device should use computer's IP
  const isExpo = typeof __DEV__ !== 'undefined' && (typeof Expo !== 'undefined' || typeof Constants !== 'undefined');

  // For physical devices (including Expo QR code), use computer's IP
  // For emulators/simulators, use localhost
  if (Platform.OS === 'android') {
    // Android: Use computer IP for physical devices (Expo QR), localhost for emulator
    // If you're using Expo QR code, this will use computer IP
    // If you're using Android emulator, change this to localhost and use ADB forwarding
    API_BASE_URL = `http://${YOUR_COMPUTER_IP}:5000/api`;
    console.log('Using Android URL (Computer IP for physical device/Expo):', API_BASE_URL);
    console.log('Note: For Android emulator, change to localhost and use: adb reverse tcp:5000 tcp:5000');
  } else if (Platform.OS === 'ios') {
    // iOS: Use computer IP for physical devices (Expo QR), localhost for simulator
    // If you're using Expo QR code, this will use computer IP
    // If you're using iOS simulator, change this to localhost
    API_BASE_URL = `http://${YOUR_COMPUTER_IP}:5000/api`;
    console.log('Using iOS URL (Computer IP for physical device/Expo):', API_BASE_URL);
    console.log('Note: For iOS simulator, change to: http://localhost:5000/api');
  } else {
    // Fallback: Physical device - use computer's IP address
    API_BASE_URL = `http://${YOUR_COMPUTER_IP}:5000/api`;
    console.log('Using Physical Device URL:', API_BASE_URL);
  }
} else {
  // Production mode
  API_BASE_URL = PRODUCTION_URL;
}

// Override: Use production URL in dev mode if flag is set
if (__DEV__ && USE_PRODUCTION_URL) {
  API_BASE_URL = PRODUCTION_URL;
  console.log('Using Production URL in Development Mode:', API_BASE_URL);
}

export default API_BASE_URL;

