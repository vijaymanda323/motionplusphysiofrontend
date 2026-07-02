import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary:   '#9E0A0A', // Deep Crimson Red
  secondary: '#C62828', // Medium Red
  accent:    '#FFE500', // Gold/Yellow
  teal:      '#FF7043', // Orange (replacing teal)
  light:     'rgba(158, 10, 10, 0.08)', // Soft translucent red
  white:     '#FFFFFF',
  dark:      '#1A0202', // Soft dark red-black
  bg:        '#FFF5F5', // Soft warm white
  card:      '#FFFFFF',
  text:      '#2E1010', // Dark warm brown-red
  muted:     '#8B7575', // Warm muted grey-red
  border:    '#F2E2E2', // Warm light border
  red:       '#C62828',
  orange:    '#FFA000',
};

const RELIEF_ROUTINES = [
  { 
    id: 1, 
    name: "Cat Cow Pose", 
    target: "Spine Mobility", 
    duration: "45s",
    category: "Back",
    videoUrl: "https://res.cloudinary.com/dldeaeegm/video/upload/v1765388578/motion-videos/motion-videos/693507cc482f85d091f81451/1765388570447_cat-cow-pose.mp4"
  },
  { 
    id: 2, 
    name: "Giraffe Neck Stretch", 
    target: "Cervical Tension", 
    duration: "30s",
    category: "Neck",
  },
  { 
    id: 3, 
    name: "Wrist Flexor Stretch", 
    target: "Tendinopathy Relief", 
    duration: "30s",
    category: "Arms",
    videoUrl: "https://res.cloudinary.com/dldeaeegm/video/upload/v1765389188/wrist_bi6f8r.mp4"
  },
  { 
    id: 4, 
    name: "Seated Spinal Twist", 
    target: "Thoracic Rotation", 
    duration: "45s",
    category: "Back",
    videoUrl: "https://res.cloudinary.com/dldeaeegm/video/upload/v1765389452/Seated_twist_mekmhi.mp4" 
  },
  { 
    id: 5, 
    name: "Hamstring Reach", 
    target: "Posterior Chain", 
    duration: "60s",
    category: "Legs",
    videoUrl:"https://res.cloudinary.com/dldeaeegm/video/upload/v1765389309/hamstring_zfrwmq.mp4" 
  },
  { 
    id: 6, 
    name: "Cervical Shoulder Rolls", 
    target: "Scapular Mobility", 
    duration: "30s",
    category: "Shoulders",
    videoUrl:"https://res.cloudinary.com/dldeaeegm/video/upload/v1765389394/shoulder_b8tsme.mp4" 
  },
  { 
    id: 7, 
    name: "Deep Chin Tucks", 
    target: "Suboccipital Release", 
    duration: "30s",
    category: "Neck",
    videoUrl:"https://res.cloudinary.com/dldeaeegm/video/upload/v1765389270/chin_pgnkmr.mp4"
  },
  { 
    id: 8, 
    name: "Eccentric Calf Raises", 
    target: "Achilles Strengthening", 
    duration: "45s",
    category: "Legs",
    videoUrl:"https://res.cloudinary.com/dldeaeegm/video/upload/v1765390654/door_by6ffs.mp4" 
  },
  { 
    id: 9, 
    name: "Pectoral Doorway Stretch", 
    target: "Postural Correction", 
    duration: "30s",
    category: "Chest",
    videoUrl:"https://res.cloudinary.com/dldeaeegm/video/upload/v1765390562/Girafee_xyowf1.mp4" 
  },
  { 
    id: 10, 
    name: "Deep Squat Hold", 
    target: "Hip & Pelvic Mobility", 
    duration: "45s",
    category: "Legs",
    videoUrl:"https://res.cloudinary.com/dldeaeegm/video/upload/v1765389353/deep_squat_ncccb4.mp4"
  },
];

const QuickReliefScreen = () => {
  const navigation = useNavigation();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRoutinePress = (item) => {
    if (item.videoUrl) {
      setSelectedVideo({
        url: item.videoUrl,
        title: item.name,
        target: item.target,
        duration: item.duration,
      });
      setShowVideoModal(true);
    }
  };

  const getTargetColor = (cat) => {
    switch (cat) {
      case 'Neck': return T.accent;
      case 'Back': return T.primary;
      case 'Legs': return T.teal;
      case 'Chest': return T.orange;
      default: return T.secondary;
    }
  };

  const renderRoutineItem = (item) => {
    const color = getTargetColor(item.category);
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[styles.card, !item.videoUrl && styles.disabledCard]} 
        activeOpacity={0.82}
        onPress={() => handleRoutinePress(item)}
        disabled={!item.videoUrl}
      >
        {/* Category vertical bar */}
        <View style={[styles.cardAccentBar, { backgroundColor: color }]} />

        {/* Number Badge */}
        <View style={[styles.numberBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.numberText, { color: color }]}>
            {item.id < 10 ? `0${item.id}` : item.id}
          </Text>
        </View>

        {/* Text Section */}
        <View style={styles.textBox}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={[styles.categoryTag, { backgroundColor: color + '10' }]}>
              <Text style={[styles.categoryTagText, { color: color }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.sub}>{item.target} • {item.duration}</Text>
          {!item.videoUrl && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Video Guide Coming Soon</Text>
            </View>
          )}
        </View>

        {/* Play / Lock Icon */}
        <View style={[styles.actionIconWrap, { backgroundColor: item.videoUrl ? T.light : '#F1F3F5' }]}>
          <Ionicons 
            name={item.videoUrl ? "play" : "lock-closed"} 
            size={16} 
            color={item.videoUrl ? T.primary : T.muted} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={T.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quick Relief Routines</Text>
          <Text style={styles.headerSub}>Clinically-backed video guidelines</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.medCross}><Text style={styles.medCrossText}>+</Text></View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Text style={styles.infoIcon}>👨‍⚕️</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Expert Recommendations</Text>
            <Text style={styles.infoText}>
              Perform these exercises slowly. Do not push through any sharp or stabbing pain. Breathe deeply.
            </Text>
          </View>
        </View>

        {/* Titles */}
        <Text style={styles.sectionHeaderTitle}>Select Physical Therapy Routine</Text>
        <Text style={styles.subtitle}>Tap a routine to watch the instruction video guide.</Text>

        {/* List */}
        <View style={styles.list}>{RELIEF_ROUTINES.map(renderRoutineItem)}</View>
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        onRequestClose={() => {
          setShowVideoModal(false);
          setSelectedVideo(null);
        }}
      >
        <SafeAreaView style={styles.videoModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          
          <View style={styles.videoHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowVideoModal(false);
                setSelectedVideo(null);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            {selectedVideo && (
              <View style={styles.videoHeaderTitleBox}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {selectedVideo.title || "Video Guide"}
                </Text>
                <Text style={styles.videoSubTitle}>
                  {selectedVideo.target} · {selectedVideo.duration}
                </Text>
              </View>
            )}
          </View>
          
          {selectedVideo && (
            <View style={styles.videoWrapper}>
              <Video
                source={{
                  uri: selectedVideo.url,
                }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
              />
            </View>
          )}

          {/* Clinical tips in video modal */}
          <View style={styles.videoInstructions}>
            <Text style={styles.videoInstructionsTitle}>💡 Clinical Instructions</Text>
            <Text style={styles.videoInstructionsText}>
              • Keep movements controlled and steady.{"\n"}
              • Hold the peak stretch position for 2-3 seconds.{"\n"}
              • Repeat this exercise 10-12 times per session.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: T.bg,
  },

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

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: T.white,
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(227,242,253,0.75)",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "center",
  },
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

  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: T.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: T.accent,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoIcon: { fontSize: 24 },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: T.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 18,
  },

  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: T.text,
    marginTop: 6,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: T.muted,
    marginBottom: 20,
  },

  list: {
    marginTop: 5,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.white,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  disabledCard: {
    opacity: 0.7,
  },
  cardAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  numberText: {
    fontWeight: "900",
    fontSize: 16,
  },

  textBox: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: T.text,
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: "800",
  },

  sub: {
    fontSize: 12,
    color: T.muted,
  },
  comingSoonBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    color: T.muted,
    fontWeight: "600",
  },

  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal
  videoModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  videoHeaderTitleBox: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  videoSubTitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  videoWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  videoPlayer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.56,
    backgroundColor: "#000",
  },
  videoInstructions: {
    backgroundColor: "#111",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  videoInstructionsTitle: {
    color: T.accent,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  videoInstructionsText: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 20,
  },
});

export default QuickReliefScreen;
