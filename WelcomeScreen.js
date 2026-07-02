import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  StatusBar,
} from 'react-native';

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('./assets/landing page.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        {/* Make the entire screen tap-to-continue for high responsiveness */}
        <TouchableOpacity 
          style={styles.touchableArea} 
          activeOpacity={0.95} 
          onPress={handleGetStarted}
        >
          {/* Action guidance at the bottom of the screen */}
          <View style={styles.footer}>
            <View style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>GET STARTED  →</Text>
            </View>
            <Text style={styles.tapPrompt}>Tap anywhere to continue</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#9E0A0A', // Fallback color matching the bottom gradient
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  touchableArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#FFE500', // Matches yellow branding accent
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#9E0A0A', // Dark red contrast matching background
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tapPrompt: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
