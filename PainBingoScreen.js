import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
} from "react-native";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary: "#9E0A0A", // Deep Crimson Red
  secondary: "#C62828", // Medium Red
  accent: "#FFE500", // Gold/Yellow
  teal: "#FF7043", // Orange (replacing teal)
  light: "rgba(158, 10, 10, 0.08)", // Soft translucent red
  white: "#FFFFFF",
  dark: "#1A0202", // Soft dark red-black
  bg: "#FFF5F5", // Soft warm white
  card: "#FFFFFF",
  text: "#2E1010", // Dark warm brown-red
  muted: "#8B7575", // Warm muted grey-red
  border: "#F2E2E2", // Warm light border
  red: "#C62828",
  orange: "#FFA000",
};

const PAIN_ITEMS = [
  { emoji: "🦒", label: "Neck Stiffness" },
  { emoji: "👁", label: "Dry Eyes" },
  { emoji: "🤕", label: "Wrist Pain" },
  { emoji: "💪", label: "Shoulder Ache" },
  { emoji: "🖐", label: "Tension Headache" },
  { emoji: "🧘", label: "Lower Back Pain" },
  { emoji: "😴", label: "Slouching" },
  { emoji: "🦵", label: "Eye Strain" },
  { emoji: "😵", label: "Stiff Fingers" },
  { emoji: "😮‍💨", label: "Tight Hamstrings" },
  { emoji: "🥱", label: "Tech Neck" },
  { emoji: "🦴", label: "Fatigue" },
  { emoji: "⭐", label: "Limited Rotation" },
  { emoji: "🫁", label: "Sore Wrists" },
  { emoji: "😠", label: "Back Knots" },
  { emoji: "🧠", label: "Brain Fog" },
  { emoji: "👀", label: "Dry Eyes+" },
  { emoji: "🔥", label: "Numbness" },
  { emoji: "😰", label: "Anxiety" },
  { emoji: "💥", label: "Burning Eyes" },
  { emoji: "💤", label: "Low Energy" },
  { emoji: "🦷", label: "Jaw Tension" },
  { emoji: "❤️", label: "Racing Heart" },
  { emoji: "🧊", label: "Cold Hands" },
  { emoji: "🥵", label: "Exhaustion" },
];
const BINGO_LETTERS = ["B", "I", "N", "G", "O"];
const BINGO_LINES = {
  row0: [0, 1, 2, 3, 4],
  row1: [5, 6, 7, 8, 9],
  row2: [10, 11, 12, 13, 14],
  row3: [15, 16, 17, 18, 19],
  row4: [20, 21, 22, 23, 24],
  col0: [0, 5, 10, 15, 20],
  col1: [1, 6, 11, 16, 21],
  col2: [2, 7, 12, 17, 22],
  col3: [3, 8, 13, 18, 23],
  col4: [4, 9, 14, 19, 24],
  diag1: [0, 6, 12, 18, 24],
  diag2: [4, 8, 12, 16, 20],
};
const BINGO_LINE_KEYS = Object.keys(BINGO_LINES);
const EXERCISE_ROUTINES = {
  row0: {
    title: "Neck, Shoulders & Upper Body 🦒💪",
    exercises: [
      "🦒 Neck rolls (10 each direction)",
      "💪 Shoulder shrugs (15 reps)",
      "✋ Wrist circles (20 each direction)",
      "🖐 Head tilt stretches (hold 30s each)",
    ],
    duration: "5-7 min",
  },
  row1: {
    title: "Posture & Spine Alignment 🧍",
    exercises: [
      "🧘 Cat-cow stretch (10 reps)",
      "📐 Posture reset (1 min)",
      "🔄 Spinal twists (10 each side)",
      "🧍 Wall angels (15 reps)",
    ],
    duration: "6-8 min",
  },
  row2: {
    title: "Eyes & Mid-Back Relief 👀",
    exercises: [
      "👀 20-20-20 rule",
      "🔄 Thoracic rotation",
      "👁️ Eye palming (2 min)",
      "🦵 Seated back extension",
    ],
    duration: "5-6 min",
  },
  row3: {
    title: "Arms, Legs & Circulation 🦵",
    exercises: [
      "✋ Forearm stretch (30s)",
      "🦵 Quad stretch (30s)",
      "🦴 Calf raises (15 reps)",
      "💪 Arm circles (20 reps)",
    ],
    duration: "6-7 min",
  },
  row4: {
    title: "Hips, Energy & Full Body 🦿",
    exercises: [
      "🦿 Hamstring stretch",
      "🧍 Hip flexor stretch",
      "💤 Deep breathing (2 min)",
      "🦵 Leg swings (10 reps)",
    ],
    duration: "7-8 min",
  },
  col0: {
    title: "Upper Body Flow 🌊",
    exercises: [
      "🦒 Neck mobility",
      "🧘 Upper back release",
      "💪 Shoulder blade squeezes",
      "🧠 Mindful breathing",
    ],
    duration: "6-8 min",
  },
  col1: {
    title: "Eye & Vision Care 👁️",
    exercises: [
      "👁️ Focus shift exercises",
      "💧 Blinking routine",
      "⭐ Distance gazing (2 min)",
      "😰 Gentle eye massage",
    ],
    duration: "5-6 min",
  },
  col2: {
    title: "Wrist & Hand Health ✋",
    exercises: [
      "🤕 Wrist flexor stretch",
      "😵 Finger extensions",
      "⭐ Wrist circles",
      "🔥 Hand shake release",
    ],
    duration: "4-5 min",
  },
  col3: {
    title: "Shoulder & Back Relief 💪",
    exercises: [
      "💪 Shoulder rolls",
      "😮‍💨 Doorway stretch",
      "😠 Upper back release",
      "❤️ Shoulder blade mobility",
    ],
    duration: "6-7 min",
  },
  col4: {
    title: "Head & Neck Tension Release 🖐",
    exercises: [
      "🖐 Scalp massage (2 min)",
      "😮‍💨 Jaw release",
      "🔥 Neck side stretches",
      "💤 Relaxation breathing",
    ],
    duration: "5-6 min",
  },
  diag1: {
    title: "Full Body Energizer ⚡",
    exercises: [
      "🦒 Full neck sequence",
      "🦵 Standing leg swings",
      "⭐ Core activation",
      "💤 Energy boost breathing",
    ],
    duration: "7-9 min",
  },
  diag2: {
    title: "Complete Recovery Flow 🧘",
    exercises: [
      "🖐 Head to toe stretch",
      "🦵 Full body mobility",
      "⭐ Balance & coordination",
      "💤 Restorative breathing",
    ],
    duration: "8-10 min",
  },
};

export default function PainBingoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const insets = useSafeAreaInsets();

  const [selectedCells, setSelectedCells] = useState([]);
  const [completedLines, setCompletedLines] = useState(new Set());
  const [winningLine, setWinningLine] = useState(null);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [showPreCheck, setShowPreCheck] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [showPostCheck, setShowPostCheck] = useState(false);
  const [prePain, setPrePain] = useState(5);
  const [postPain, setPostPain] = useState(5);
  const [totalXP, setTotalXP] = useState(0);
  const [bingoCount, setBingoCount] = useState(0);

  const headerAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const isCellInWinningLine = (idx) =>
    winningLine ? BINGO_LINES[winningLine].includes(idx) : false;

  const detectBingoWins = (cells) =>
    BINGO_LINE_KEYS.filter(
      (k) =>
        !completedLines.has(k) &&
        BINGO_LINES[k].every((i) => cells.includes(i)),
    );

  const handleCellPress = (index) => {
    const updated = selectedCells.includes(index)
      ? selectedCells.filter((i) => i !== index)
      : [...selectedCells, index];
    setSelectedCells(updated);
    if (!selectedCells.includes(index)) {
      const wins = detectBingoWins(updated);
      if (wins.length > 0) {
        const first = wins[0];
        setCompletedLines((prev) => new Set([...prev, first]));
        setWinningLine(first);
        setActiveRoutine(first);
        setShowPreCheck(true);
        setBingoCount((p) => p + 1);
      }
    } else if (winningLine) {
      const still = BINGO_LINES[winningLine].every((i) => updated.includes(i));
      if (!still) setWinningLine(null);
    }
  };

  const handlePreCheckComplete = () => {
    setShowPreCheck(false);
    setShowExercise(true);
  };
  const handleExerciseComplete = () => {
    setShowExercise(false);
    setShowPostCheck(true);
  };
  const handlePostCheckComplete = () => {
    const reduction = Math.max(0, prePain - postPain);
    setTotalXP((p) => p + 20 + reduction * 10);
    setPrePain(5);
    setPostPain(5);
    setWinningLine(null);
    setShowPostCheck(false);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={s.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <Animated.View
        style={[
          s.header,
          {
            paddingTop: insets.top + 8,
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={T.white} />
        </TouchableOpacity>
        <View style={s.headerMid}>
          <Text style={s.headerTitle}>Pain Bingo Assessment</Text>
          <Text style={s.headerSub}>
            Identify symptoms · unlock relief therapy
          </Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.medCross}>
            <Text style={s.medCrossText}>+</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { val: `${totalXP} XP`, lbl: "Clinical Points" },
            { val: `${bingoCount} Wins`, lbl: "Bingo Rounds" },
            { val: `${completedLines.size}/12`, lbl: "Lines Cleared" },
          ].map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statVal}>{item.val}</Text>
              <Text style={s.statLbl}>{item.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Bingo Card */}
        <View style={s.bingoCard}>
          {/* Header row */}
          <View style={s.bingoHeaderRow}>
            {BINGO_LETTERS.map((l, i) => (
              <View key={i} style={s.bingoHeaderCell}>
                <Text style={s.bingoHeaderLetter}>{l}</Text>
              </View>
            ))}
          </View>
          {/* Grid */}
          <View style={s.bingoGrid}>
            {PAIN_ITEMS.map((item, index) => {
              const isSelected = selectedCells.includes(index);
              const isWinning = isCellInWinningLine(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    s.cell,
                    isSelected && s.cellSelected,
                    isWinning && s.cellWinning,
                    isSelected && { borderColor: T.primary },
                    isWinning && { borderColor: T.accent },
                  ]}
                  onPress={() => handleCellPress(index)}
                  activeOpacity={0.7}
                >
                  <Text style={s.cellEmoji}>{item.emoji}</Text>
                  <Text
                    style={[s.cellLabel, isSelected && s.cellLabelSel]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={[s.cellCheck, { backgroundColor: T.primary }]}>
                      <Ionicons name="checkmark" size={10} color={T.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* How to Play */}
        <View style={s.howCard}>
          <View style={s.howHeader}>
            <Text style={s.howTitle}>💡 Clinical Guide</Text>
            <View style={s.badge}>
              <Text style={s.badgeTxt}>PATIENT EDUCATION</Text>
            </View>
          </View>
          <Text style={s.howText}>
            • Tap the squares representing your physical symptoms.{"\n"}•
            Complete any horizontal, vertical, or diagonal line to get a Bingo.
            {"\n"}• Unlocks a medically approved physiotherapy stretch sequence.
            {"\n"}• Record pain reduction to receive progress metrics.
          </Text>
        </View>
      </ScrollView>

      {/* ── Pre-Check Modal ── */}
      <Modal visible={showPreCheck} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>🎉 BINGO UNLOCKED</Text>
            <Text style={s.modalSub}>
              Rate your pain intensity before starting the physiotherapy routine
            </Text>
            <Text style={s.sliderBig}>{prePain}/10</Text>
            <Slider
              style={s.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={prePain}
              onValueChange={setPrePain}
              minimumTrackTintColor={T.primary}
              maximumTrackTintColor={T.border}
              thumbTintColor={T.primary}
            />
            <View style={s.sliderRow}>
              <Text style={s.sliderEnd}>Mild (1)</Text>
              <Text style={s.sliderEnd}>Severe (10)</Text>
            </View>
            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: T.primary }]}
              onPress={handlePreCheckComplete}
            >
              <Text style={s.modalBtnTxt}>Start Routine →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Exercise Modal ── */}
      <Modal visible={showExercise} transparent animationType="slide">
        <View style={s.modalBg}>
          <ScrollView
            contentContainerStyle={s.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>🎁 BINGO REHAB ROUTINE</Text>
              <Text style={s.routineTitle}>
                {EXERCISE_ROUTINES[activeRoutine]?.title}
              </Text>
              <Text style={s.routineDur}>
                ⏱ Recommended Duration:{" "}
                {EXERCISE_ROUTINES[activeRoutine]?.duration}
              </Text>

              <Text style={s.exTitle}>Target Exercises:</Text>
              {EXERCISE_ROUTINES[activeRoutine]?.exercises.map((ex, i) => (
                <View key={i} style={s.exItem}>
                  <Text style={s.exText}>{ex}</Text>
                </View>
              ))}

              <View style={s.precautionBox}>
                <Text style={s.precTitle}>⚠️ Medical Guidelines</Text>
                <Text style={s.precText}>
                  • Stretch slowly — avoid sudden or jerky movements.{"\n"}•
                  Breathe continuously; do not hold your breath.{"\n"}• Stop
                  immediately if you experience sharp or radiating pain.
                </Text>
              </View>

              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: T.teal }]}
                onPress={handleExerciseComplete}
              >
                <Text style={[s.modalBtnTxt, { color: T.white }]}>
                  Complete Exercises ✓
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ── Post-Check Modal ── */}
      <Modal visible={showPostCheck} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>🏆 ROUTINE COMPLETED</Text>
            <Text style={s.modalSub}>
              Rate your pain intensity after the physiotherapy sequence
            </Text>
            <Text style={s.sliderBig}>{postPain}/10</Text>
            <Slider
              style={s.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={postPain}
              onValueChange={setPostPain}
              minimumTrackTintColor={T.teal}
              maximumTrackTintColor={T.border}
              thumbTintColor={T.teal}
            />
            <View style={s.sliderRow}>
              <Text style={s.sliderEnd}>Mild (1)</Text>
              <Text style={s.sliderEnd}>Severe (10)</Text>
            </View>

            <View style={s.resultsBox}>
              <View style={s.resultRow}>
                <Text style={s.resultLbl}>Pain Reduction</Text>
                <Text style={[s.resultVal, { color: T.teal }]}>
                  {Math.max(0, prePain - postPain)} pts
                </Text>
              </View>
              <View style={s.resultRow}>
                <Text style={s.resultLbl}>XP Earned</Text>
                <Text style={[s.resultVal, { color: T.primary }]}>
                  +{20 + Math.max(0, prePain - postPain) * 10} XP
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: T.primary }]}
              onPress={handlePostCheckComplete}
            >
              <Text style={s.modalBtnTxt}>Claim Progress & Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: T.primary,
    shadowColor: T.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerMid: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: T.white },
  headerSub: { fontSize: 11, color: "rgba(227,242,253,0.75)", marginTop: 2 },
  headerRight: { alignItems: "center" },
  medCross: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  medCrossText: {
    color: T.white,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },

  scroll: { paddingBottom: 40, paddingHorizontal: 16, paddingTop: 16 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    color: T.primary,
    marginBottom: 3,
  },
  statLbl: {
    fontSize: 10,
    color: T.muted,
    textAlign: "center",
    fontWeight: "600",
  },

  bingoCard: {
    backgroundColor: T.white,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  bingoHeaderRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: T.border,
    paddingBottom: 8,
  },
  bingoHeaderCell: { flex: 1, alignItems: "center" },
  bingoHeaderLetter: { fontSize: 20, fontWeight: "900", color: T.primary },

  bingoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  cell: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: T.border,
    position: "relative",
    padding: 2,
  },
  cellSelected: { backgroundColor: "rgba(158, 10, 10, 0.08)", borderWidth: 2 },
  cellWinning: {
    backgroundColor: "rgba(255, 229, 0, 0.15)",
    borderWidth: 2.5,
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  cellEmoji: { fontSize: 22, marginBottom: 2 },
  cellLabel: {
    fontSize: 8,
    textAlign: "center",
    color: T.muted,
    fontWeight: "600",
    paddingHorizontal: 1,
    lineHeight: 10,
  },
  cellLabelSel: { color: T.primary, fontWeight: "800" },
  cellCheck: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  howCard: {
    backgroundColor: T.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  howHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  howTitle: { fontSize: 14, fontWeight: "900", color: T.text },
  badge: {
    backgroundColor: T.light,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(158,10,10,0.15)",
  },
  badgeTxt: {
    fontSize: 8,
    fontWeight: "800",
    color: T.primary,
    letterSpacing: 0.5,
  },
  howText: { fontSize: 12, color: T.muted, lineHeight: 20, fontWeight: "500" },

  // Modals
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalScroll: { flexGrow: 1, justifyContent: "center", paddingVertical: 10 },
  modalCard: {
    backgroundColor: T.white,
    width: "100%",
    maxWidth: 400,
    maxHeight: "92%",
    borderRadius: 24,
    padding: 22,
    borderTopWidth: 4,
    borderTopColor: T.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: T.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: T.primary,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  modalSub: {
    fontSize: 12,
    color: T.muted,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  routineTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: T.text,
    textAlign: "center",
    marginTop: 4,
  },
  routineDur: {
    fontSize: 12,
    color: T.muted,
    textAlign: "center",
    marginBottom: 14,
    fontWeight: "500",
  },
  sliderBig: {
    fontSize: 44,
    fontWeight: "900",
    color: T.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  slider: { width: "100%", height: 40 },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 16,
  },
  sliderEnd: { fontSize: 11, color: T.muted, fontWeight: "550" },
  exTitle: {
    fontSize: 13,
    fontWeight: "850",
    color: T.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  exItem: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: T.teal,
    borderWidth: 1,
    borderColor: T.border,
  },
  exText: { fontSize: 13, fontWeight: "750", color: T.text },
  precautionBox: {
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
  },
  precTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5D4037",
    marginBottom: 6,
  },
  precText: {
    fontSize: 12,
    color: "#5D4037",
    lineHeight: 18,
    fontWeight: "500",
  },
  resultsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
    borderTopWidth: 2,
    borderTopColor: T.teal,
    borderWidth: 1,
    borderColor: T.border,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultLbl: { fontSize: 13, color: T.muted, fontWeight: "600" },
  resultVal: { fontSize: 16, fontWeight: "800" },
  modalBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  modalBtnTxt: {
    fontSize: 15,
    fontWeight: "850",
    color: T.white,
    letterSpacing: 0.5,
  },
});
