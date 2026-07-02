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
  ActivityIndicator,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config/api';

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

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const prefillEmail = route.params?.emailPrefill || '';

  const [email, setEmail] = useState('motionphysio123@gmail.com');
  const [password, setPassword] = useState('motionphysio123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  React.useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Demo bypass credentials
    if (normalizedEmail === 'motionphysio123@gmail.com' && trimmedPassword === 'motionphysio123') {
      console.log('Demo Login bypass successful!');
      navigation.navigate('HomeScreen', {
        userName: 'Vijay',
        userEmail: normalizedEmail,
      });
      return;
    }

    setLoading(true);

    try {
      const loginController = new AbortController();
      const loginTimeoutId = setTimeout(() => loginController.abort(), 20000);
      
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: trimmedPassword,
        }),
        signal: loginController.signal,
      });
      
      clearTimeout(loginTimeoutId);

      const responseText = await response.text();
      let data;
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error('Invalid response from server');
        }
      } else {
        data = { message: 'No response from server' };
      }

      if (response.ok && response.status === 200 && data.token) {
        if (data.user?.firstName) {
          navigation.navigate('HomeScreen', {
            userName: data.user.firstName || data.user.name || 'User',
            userEmail: normalizedEmail,
          });
        } else {
          navigation.navigate('ProfileSetup', {
            user: {
              email: normalizedEmail,
              name: data.user?.name || data.user?.firstName || 'User',
            },
          });
        }
      } else {
        const errorMessage = data.message || data.error || 'Invalid email or password';
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoSection}>
              <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
              <Text style={styles.logoSubtitle}>FINDPHYSIO CLINICAL PORTAL</Text>
            </View>

            {/* Traditional Solid White Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardTitle}>Sign In</Text>
                  <Text style={styles.cardSub}>Enter credentials to access therapy metrics</Text>
                </View>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="lock-closed" size={20} color={T.primary} />
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Email Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={[styles.field, focusEmail && styles.fieldFocused]}>
                  <View style={styles.fieldIconWrap}>
                    <Ionicons name="mail-outline" size={18} color={focusEmail ? T.primary : "#8B7575"} />
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(46, 16, 16, 0.4)"
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

              {/* Password Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={[styles.field, focusPass && styles.fieldFocused]}>
                  <View style={styles.fieldIconWrap}>
                    <Ionicons name="key-outline" size={18} color={focusPass ? T.primary : "#8B7575"} />
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(46, 16, 16, 0.4)"
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
                    <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="#8B7575" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotTxt}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Gold Sign In Button */}
              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.75 }]}
                onPress={handleLogin}
                activeOpacity={0.88}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={T.primary} size="small" />
                ) : (
                  <View style={styles.loginBtnInner}>
                    <Text style={styles.loginBtnTxt}>SIGN IN  →</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Account Creation Section */}
            <View style={styles.signupSection}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                style={styles.signupRow}
              >
                <Text style={styles.signupTxt}>New patient? </Text>
                <View style={styles.signupLinkWrap}>
                  <Text style={styles.signupLink}>Create Account</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  kav:  { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },

  logoSection: {
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 20,
  },
  logoImage: {
    width: 220,
    height: 60,
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  /* Traditional Opaque Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#F2E2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: { flex: 1, paddingRight: 8 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2E1010',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12.5,
    color: '#8B7575',
    fontWeight: '600',
  },
  cardHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2E2E2',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F2E2E2',
    marginBottom: 20,
  },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.primary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 52,
    paddingHorizontal: 4,
  },
  fieldFocused: {
    borderColor: T.primary,
    backgroundColor: '#FFFFFF',
  },
  fieldIconWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#2E1010',
    fontWeight: '600',
  },
  eyeBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotTxt: {
    fontSize: 13,
    color: T.primary,
    fontWeight: '700',
  },

  loginBtn: {
    backgroundColor: T.accent, // Gold button matching landing page button
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 4,
    marginTop: 8,
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnTxt: {
    fontSize: 16,
    fontWeight: '900',
    color: T.primary, // Red text on gold background
    letterSpacing: 1.5,
  },

  signupSection: { alignItems: 'center' },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  signupTxt: {
    fontSize: 14,
    color: T.white,
    fontWeight: '600',
  },
  signupLinkWrap: {
    borderBottomWidth: 1.5,
    borderBottomColor: T.accent,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '800',
    color: T.accent,
  },
});
