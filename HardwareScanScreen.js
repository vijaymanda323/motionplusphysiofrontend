import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";

const { width, height } = Dimensions.get("window");

const T = {
  primary: "#9E0A0A",
  secondary: "#C62828",
  accent: "#FFE500",
  white: "#FFFFFF",
  dark: "#1A0202",
  bg: "#FFF5F5",
  card: "#FFFFFF",
  text: "#2E1010",
  muted: "#8B7575",
  border: "#F2E2E2",
  success: "#4CAF50",
};

const QUESTIONS = [
  {
    id: 1,
    title: "Neck Firmware Test",
    instruction:
      "Stand against a wall. Keep your heels, hips, and upper back touching the wall. Can the back of your head touch the wall without lifting your chin?",
    options: [
      { label: "Easy", emoji: "😊", score: 3 },
      { label: "Reached with slight stretch", emoji: "😐", score: 2 },
      { label: "Couldn't reach", emoji: "😣", score: 1 },
    ],
  },
  {
    id: 2,
    title: "Shoulder Freedom Test",
    instruction:
      "Place both hands behind your head. Can your elbows move comfortably backward?",
    options: [
      { label: "Easy", emoji: "😊", score: 3 },
      { label: "Slight tightness", emoji: "😐", score: 2 },
      { label: "Difficult or painful", emoji: "😣", score: 1 },
    ],
  },
  {
    id: 3,
    title: "Spine Flex Test",
    instruction: "Sit tall. Rotate your body to the left, then to the right.",
    options: [
      { label: "Both sides equal", emoji: "😊", score: 3 },
      { label: "One side feels tighter", emoji: "😐", score: 2 },
      { label: "Very limited", emoji: "😣", score: 1 },
    ],
  },
  {
    id: 4,
    title: "Chair Escape Challenge",
    instruction:
      "Stand up and sit down from your chair 5 times without using your hands.",
    options: [
      { label: "Very easy", emoji: "😊", score: 3 },
      { label: "Slight effort", emoji: "😐", score: 2 },
      { label: "Difficult", emoji: "😣", score: 1 },
    ],
  },
  {
    id: 5,
    title: "Wrist Survivor",
    instruction:
      "Stretch your arm forward. Pull your fingers back gently for 10 seconds.",
    options: [
      { label: "Comfortable", emoji: "😊", score: 3 },
      { label: "Mild stretch", emoji: "😐", score: 2 },
      { label: "Pain or numbness", emoji: "😣", score: 1 },
    ],
  },
  {
    id: 6,
    title: "Eye Reset",
    instruction:
      "Look at an object about 6 meters (20 feet) away for 20 seconds. Then look back at your phone.",
    options: [
      { label: "Eyes feel refreshed", emoji: "😊", score: 3 },
      { label: "Slight strain", emoji: "😐", score: 2 },
      { label: "Eyes still feel tired", emoji: "😣", score: 1 },
    ],
  },
];

export default function HardwareScanScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [floatingXP, setFloatingXP] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const floatOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateIn();
  }, [currentIndex]);

  useEffect(() => {
    if (showResult) {
      animateIn();
    }
  }, [showResult]);

  const animateIn = () => {
    slideAnim.setValue(50);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOptionSelect = (score) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const xpEarned = score * 15;
    
    // Trigger floating XP animation
    setFloatingXP(`+${xpEarned} XP`);
    floatAnim.setValue(0);
    floatOpacityAnim.setValue(1);
    
    Animated.parallel([
      Animated.timing(floatAnim, { toValue: -60, duration: 600, useNativeDriver: true }),
      Animated.timing(floatOpacityAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();

    // Small delay before moving to next question
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTotalScore((prev) => prev + score);
        setTotalXP((prev) => prev + xpEarned);
        setCurrentIndex((prev) => {
          if (prev < QUESTIONS.length - 1) {
            return prev + 1;
          } else {
            setShowResult(true);
            return prev;
          }
        });
        setIsAnimating(false);
      });
    }, 400);
  };

  if (!fontsLoaded) return null;

  const currentQuestion = QUESTIONS[currentIndex];

  const getResultInfo = () => {
    const maxScore = QUESTIONS.length * 3;
    const percentage = Math.round((totalScore / maxScore) * 100);

    if (percentage >= 90)
      return {
        title: "Elite Human Hardware",
        desc: "Your body is handling technology well. Keep moving and maintain your healthy habits.",
        color: T.success,
        emoji: "🟢",
      };
    if (percentage >= 70)
      return {
        title: "Needs Minor Updates",
        desc: "A few areas could benefit from simple daily movement and ergonomic improvements.",
        color: T.accent,
        emoji: "🟡",
      };
    if (percentage >= 50)
      return {
        title: "Performance Optimization Needed",
        desc: "Your body is showing early signs of strain. A personalized exercise routine may help improve comfort and performance.",
        color: "#FF9800",
        emoji: "🟠",
      };
    return {
      title: "System Maintenance Recommended",
      desc: "Your results suggest multiple areas of ergonomic stress. Consider scheduling a physiotherapy assessment for personalized guidance.",
      color: T.primary,
      emoji: "🔴",
    };
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={T.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Hardware Scan</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>⭐ {totalXP}</Text>
        </View>
      </View>

      {!showResult ? (
        <View style={styles.content}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Level {currentIndex + 1} / {QUESTIONS.length}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
            </View>
            <Text style={styles.instruction}>
              {currentQuestion.instruction}
            </Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.optionBtn}
                  onPress={() => handleOptionSelect(opt.score)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <View style={styles.optionXpBadge}>
                    <Text style={styles.optionXpTxt}>+{opt.score * 15} XP</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Floating XP Animation */}
          {floatingXP && (
            <Animated.View style={[styles.floatingXpContainer, { transform: [{ translateY: floatAnim }], opacity: floatOpacityAnim }]}>
              <Text style={styles.floatingXpText}>{floatingXP}</Text>
            </Animated.View>
          )}
        </View>
      ) : (
        <Animated.View
          style={[
            styles.resultContainer,
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
          ]}
        >
          {(() => {
            const info = getResultInfo();
            const percentage = Math.round(
              (totalScore / (QUESTIONS.length * 3)) * 100,
            );
            return (
              <View style={styles.resultCard}>
                <Text style={styles.resultEmoji}>{info.emoji}</Text>
                <View style={styles.totalXpCard}>
                  <Text style={styles.totalXpLabel}>TOTAL XP EARNED</Text>
                  <Text style={styles.totalXpVal}>⭐ {totalXP}</Text>
                </View>
                <Text style={styles.resultScore}>{percentage}%</Text>
                <Text style={styles.resultSubScore}>Hardware Status</Text>
                <Text style={[styles.resultTitle, { color: info.color }]}>
                  {info.title}
                </Text>
                <Text style={styles.resultDesc}>{info.desc}</Text>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.doneBtnTxt}>Claim Rewards & Exit</Text>
                </TouchableOpacity>
              </View>
            );
          })()}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    backgroundColor: T.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: T.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Outfit_800ExtraBold",
    color: T.white,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: T.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: T.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Outfit_700Bold",
    color: T.muted,
    textAlign: "right",
  },
  card: {
    backgroundColor: T.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: T.border,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  questionTitle: {
    fontSize: 22,
    fontFamily: "Outfit_800ExtraBold",
    color: T.text,
  },
  instruction: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
    color: T.muted,
    lineHeight: 24,
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: T.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    color: T.text,
  },
  resultContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  resultCard: {
    backgroundColor: T.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: T.border,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 64,
    fontFamily: "Outfit_900Black",
    color: T.primary,
    lineHeight: 70,
  },
  resultSubScore: {
    fontSize: 14,
    fontFamily: "Outfit_700Bold",
    color: T.muted,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Outfit_800ExtraBold",
    textAlign: "center",
    marginBottom: 12,
  },
  resultDesc: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
    color: T.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: T.primary,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  doneBtnTxt: {
    color: T.white,
    fontSize: 16,
    fontFamily: "Outfit_800ExtraBold",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  xpBadgeText: {
    color: T.white,
    fontSize: 14,
    fontFamily: "Outfit_800ExtraBold",
  },
  optionXpBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(158, 10, 10, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionXpTxt: {
    color: T.primary,
    fontSize: 12,
    fontFamily: "Outfit_800ExtraBold",
  },
  floatingXpContainer: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    right: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  floatingXpText: {
    fontSize: 48,
    fontFamily: "Outfit_900Black",
    color: T.accent,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 8,
  },
  totalXpCard: {
    backgroundColor: 'rgba(255,229,0,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: T.accent,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalXpLabel: {
    fontSize: 12,
    fontFamily: "Outfit_800ExtraBold",
    color: T.dark,
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalXpVal: {
    fontSize: 28,
    fontFamily: "Outfit_900Black",
    color: T.dark,
  }
});
