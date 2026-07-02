import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config/api';
import { testServerConnection, getConnectionInfo } from './utils/connectionTest';

const { height } = Dimensions.get('window');
const LOGO = require('./assets/images/motion+physio.png');

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary:   '#9E0A0A', // Deep Crimson
  secondary: '#C62828', // Medium Red
  accent:    '#FFE500', // Gold/Yellow
  white:     '#FFFFFF',
  dark:      '#1A0202', // Soft dark red-black
  bgGradient: ['#9E0A0A', '#B71C1C', '#1A0202'], // Deep Red-Crimson gradient
  cardGlass: 'rgba(255, 255, 255, 0.12)', // Glassmorphic translucent card
  cardBorder: 'rgba(255, 255, 255, 0.25)',
  textLight: '#FFFFFF',
  mutedLight: 'rgba(255, 255, 255, 0.65)',
};

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [focusConfirmPass, setFocusConfirmPass] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      console.log('=== SIGNUP ATTEMPT ===');
      console.log('Testing server connection...');
      let connectionTest;
      try {
        connectionTest = await testServerConnection();
        if (!connectionTest.success) {
          throw new Error(`Cannot connect to server:\n${connectionTest.message}`);
        }
      } catch (testError) {
        console.warn('⚠️ Connection test failed, but continuing with signup attempt...');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const requestBody = {
        name: fullName,
        email: email.trim().toLowerCase(),
        password: password,
      };
      
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }).catch((fetchError) => {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        throw fetchError;
      });
      
      clearTimeout(timeoutId);

      let data;
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          data = { message: responseText || 'Unknown error occurred' };
        }
      } else {
        data = { message: 'Empty response from server' };
      }

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Account created successfully!\n\nYou can now login with your credentials.', 
          [
            {
              text: 'OK',
              onPress: () => {
                setFullName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                navigation.navigate('Login', { emailPrefill: email });
              },
            },
          ]
        );
      } else {
        let errorMessage = data.message || 'Failed to create account';
        if (response.status === 409) {
          errorMessage = 'This email is already registered. Please log in instead.';
        }
        Alert.alert('Signup Failed', errorMessage);
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Connection Error', error?.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background decorations for glassmorphic depth */}
      <View style={styles.sphere1} />
      <View style={styles.sphere2} />
      <View style={styles.sphere3} />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Logo */}
            <View style={styles.logoSection}>
              <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
              <Text style={styles.appSub}>PATIENT REGISTRATION PORTAL</Text>
            </View>

            {/* Registration Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardTitle}>Create Account</Text>
                  <Text style={styles.cardSub}>Sign up to track physical symptoms</Text>
                </View>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="create-outline" size={20} color={T.accent} />
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={[styles.field, focusName && styles.fieldFocused]}>
                  <View style={styles.fieldIconWrap}>
                    <Ionicons name="person-outline" size={18} color={focusName ? T.accent : T.white} />
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255, 255, 255, 0.45)"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                    onFocus={() => setFocusName(true)}
                    onBlur={() => setFocusName(false)}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={[styles.field, focusEmail && styles.fieldFocused]}>
                  <View style={styles.fieldIconWrap}>
                    <Ionicons name="mail-outline" size={18} color={focusEmail ? T.accent : T.white} />
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.45)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusEmail(true)}
                    onBlur={() => setFocusEmail(false)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={[styles.field, focusPass && styles.fieldFocused]}>
                  <View style={styles.fieldIconWrap}>
                    <Ionicons name="key-outline" size={18} color={focusPass ? T.accent : T.white} />
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(255, 255, 255, 0.45)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusPass(true)}
                    onBlur={() => setFocusPass(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass(v => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
                <View style={[styles.field, focusConfirmPass && styles.fieldFocused]}>
                  <View style={styles.fieldIconWrap}>
                    <Ionicons name="key-outline" size={18} color={focusConfirmPass ? T.accent : T.white} />
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Re-enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.45)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusConfirmPass(true)}
                    onBlur={() => setFocusConfirmPass(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPass(v => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name={showConfirmPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                style={[styles.signUpButton, loading && { opacity: 0.7 }]} 
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color={T.primary} size="small" />
                ) : (
                  <View style={styles.btnInner}>
                    <Text style={styles.signUpButtonText}>CREATE ACCOUNT  →</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginText}>
                  Already have an account? <Text style={styles.loginLink}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verification details */}
            <View style={styles.credStrip}>
              <Text style={styles.credText}>🏅 HIPAA Compliant Data Storage</Text>
              <Text style={styles.credDot}>·</Text>
              <Text style={styles.credText}>🔒 SSL Encrypted Protection</Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  kav:  { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },

  /* Spheres for glassmorphism background effect */
  sphere1: {
    position: 'absolute',
    top: 40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 229, 0, 0.12)', // Translucent Gold
  },
  sphere2: {
    position: 'absolute',
    bottom: 60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(198, 40, 40, 0.35)', // Translucent Red
  },
  sphere3: {
    position: 'absolute',
    top: '55%',
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logoImage: {
    width: 220,
    height: 60,
    marginBottom: 8,
  },
  appSub: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  /* Card */
  card: {
    backgroundColor: T.cardGlass,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: T.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: { flex: 1, paddingRight: 8 },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: T.white,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: T.mutedLight,
    fontWeight: '600',
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.cardBorder,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 20,
  },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: T.accent, // Gold label
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    height: 50,
    paddingHorizontal: 4,
  },
  fieldFocused: {
    borderColor: T.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  fieldIconWrap: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: T.white,
    fontWeight: '600',
  },
  eyeBtn: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signUpButton: {
    backgroundColor: T.accent, // Gold button
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
    marginBottom: 16,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signUpButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: T.primary, // Red text on gold
    letterSpacing: 1.2,
  },

  backToLogin: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  backToLoginText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '550',
  },
  loginLink: {
    color: T.accent,
    fontWeight: '800',
  },

  credStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  credText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '600',
  },
  credDot: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.35)',
  },
});
