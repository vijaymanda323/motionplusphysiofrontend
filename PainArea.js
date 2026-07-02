import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  PanResponder, Modal, StatusBar, Animated, Image, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary: '#9E0A0A', // Deep Crimson Red
  accent: '#FFE500', // Gold/Yellow
  teal: '#FF7043', // Orange/Teal-replacement
  white: '#FFFFFF',
  bg: '#FFF5F5', // Soft warm white
  card: '#FFFFFF',
  text: '#2E1010', // Dark warm brown-red
  muted: '#8B7575', // Warm muted grey-red
  border: '#F2E2E2', // Warm light border
  light: 'rgba(158, 10, 10, 0.08)', // Soft translucent red
};

// Dynamic pain color based on level
const painColor = (level) => {
  if (level <= 3) return '#26A69A';   // teal — mild
  if (level <= 6) return '#F57C00';   // orange — moderate
  if (level <= 8) return '#E53935';   // red — severe
  return '#B71C1C';                    // dark red — critical
};

const painLabel = (level) => {
  if (level <= 2) return 'Minimal';
  if (level <= 4) return 'Mild';
  if (level <= 6) return 'Moderate';
  if (level <= 8) return 'Severe';
  return 'Critical';
};

// ── Body Part Buttons ──────────────────────────────────────────────
const BODY_PARTS = [
  { id: 'head',       label: 'Head / Skull',    emoji: '🧠' },
  { id: 'neck',       label: 'Neck / Cervical', emoji: '🦒' },
  { id: 'shoulder_l', label: 'Left Shoulder',   emoji: '💪' },
  { id: 'shoulder_r', label: 'Right Shoulder',  emoji: '💪' },
  { id: 'chest',      label: 'Chest',           emoji: '🫀' },
  { id: 'upper_back', label: 'Upper Back',      emoji: '🦴' },
  { id: 'elbow_l',    label: 'Left Elbow',      emoji: '✋' },
  { id: 'elbow_r',    label: 'Right Elbow',     emoji: '✋' },
  { id: 'lower_back', label: 'Lower Back',      emoji: '🦴' },
  { id: 'abdomen',    label: 'Abdomen',         emoji: '🫁' },
  { id: 'hip_l',      label: 'Left Hip',        emoji: '🦿' },
  { id: 'hip_r',      label: 'Right Hip',       emoji: '🦿' },
  { id: 'knee_l',     label: 'Left Knee',       emoji: '🦵' },
  { id: 'knee_r',     label: 'Right Knee',      emoji: '🦵' },
  { id: 'ankle_l',    label: 'Left Ankle',      emoji: '🦶' },
  { id: 'ankle_r',    label: 'Right Ankle',     emoji: '🦶' },
];

// ── Custom Slider ──────────────────────────────────────────────────
const CustomSlider = ({ value, onValueChange, min = 0, max = 10, color }) => {
  const [layout, setLayout] = useState({ width: 200 });
  const [cur, setCur] = useState(value);
  const pct = ((cur - min) / (max - min)) * 100;

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      if (layout.width > 0) {
        const v = Math.max(min, Math.min(max, (e.nativeEvent.locationX / layout.width) * (max - min) + min));
        setCur(v); onValueChange(v);
      }
    },
    onPanResponderMove: (e) => {
      if (layout.width > 0) {
        const v = Math.max(min, Math.min(max, (e.nativeEvent.locationX / layout.width) * (max - min) + min));
        setCur(v); onValueChange(v);
      }
    },
  })).current;

  useEffect(() => { setCur(value); }, [value]);

  return (
    <View style={sl.wrap} onLayout={e => setLayout({ width: e.nativeEvent.layout.width })} {...pan.panHandlers}>
      <View style={sl.touch}>
        <View style={[sl.track, { backgroundColor: T.border }]}>
          <View style={[sl.active, { width: `${pct}%`, backgroundColor: color }]} />
          <View style={[sl.thumb, { left: `${pct}%`, backgroundColor: color, borderColor: T.card }]} />
        </View>
      </View>
    </View>
  );
};

const sl = StyleSheet.create({
  wrap:  { width: '100%', height: 44, justifyContent: 'center' },
  touch: { width: '100%', height: 44, justifyContent: 'center', paddingVertical: 14 },
  track: { height: 6, borderRadius: 3, position: 'relative', width: '100%' },
  active: { height: 6, borderRadius: 3, position: 'absolute', left: 0, top: 0 },
  thumb: {
    width: 24, height: 24, borderRadius: 12, position: 'absolute',
    top: -9, marginLeft: -12, borderWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
});

// ── Main Screen ────────────────────────────────────────────────────
export default function PainAreaScreen({ navigation }) {
  const route = useRoute();
  const { userName, userEmail } = route.params || {};
  const insets = useSafeAreaInsets();

  const [selected, setSelected]     = useState([]);
  const [painLevel, setPainLevel]   = useState(3);
  const [comfortLevel, setComfort]  = useState(7);
  const [showModal, setShowModal]   = useState(false);
  const [hasShown, setHasShown]     = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (Math.round(painLevel) >= 8 && !hasShown) {
      setShowModal(true); setHasShown(true);
    } else if (Math.round(painLevel) < 8) {
      setHasShown(false);
    }
  }, [painLevel]);

  const togglePart = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const pColor = painColor(Math.round(painLevel));
  const pLabel = painLabel(Math.round(painLevel));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Header ── */}
      <Animated.View style={[s.header, {
        paddingTop: insets.top + 8,
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange:[0,1], outputRange:[-20,0] }) }],
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={T.white} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Pain Assessment</Text>
          <Text style={s.headerSub}>Select your discomfort zones</Text>
        </View>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeNum}>{selected.length}</Text>
          <Text style={s.headerBadgeLbl}>zones</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Visual Pain Map Illustration ── */}
        <View style={[s.card, { alignItems: 'center', padding: 8, backgroundColor: '#FFFFFF' }]}>
          <Image
            source={require('./assets/images/body_pain_map_premium.png')}
            style={{ width: '100%', height: 180, borderRadius: 12 }}
            resizeMode="contain"
          />
        </View>

        {/* ── Pain Level Card ── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View>
              <Text style={s.cardTitle}>Pain Level</Text>
              <Text style={s.cardSub}>How intense is your pain?</Text>
            </View>
            <View style={[s.levelBadge, { backgroundColor: pColor + '18', borderColor: pColor + '40' }]}>
              <Text style={[s.levelNum, { color: pColor }]}>{Math.round(painLevel)}</Text>
              <Text style={[s.levelLabel, { color: pColor }]}>{pLabel}</Text>
            </View>
          </View>

          {/* Color-coded scale bar */}
          <View style={s.scaleBar}>
            {[...Array(10)].map((_, i) => (
              <View key={i} style={[s.scaleSeg, {
                backgroundColor: Math.round(painLevel) > i ? painColor(i + 1) : T.border,
                flex: 1, height: 8, borderRadius: 4, marginHorizontal: 1,
              }]} />
            ))}
          </View>
          <View style={s.sliderLabels}>
            <Text style={s.sliderLbl}>No Pain</Text>
            <Text style={s.sliderLbl}>Unbearable</Text>
          </View>

          <CustomSlider value={painLevel} onValueChange={setPainLevel} min={0} max={10} color={pColor} />

          <View style={s.divider} />

          {/* Comfort Level */}
          <View style={s.cardTitleRow}>
            <View>
              <Text style={s.cardTitle}>Comfort Level</Text>
              <Text style={s.cardSub}>Overall mobility & comfort</Text>
            </View>
            <View style={[s.levelBadge, { backgroundColor: T.teal + '18', borderColor: T.teal + '40' }]}>
              <Text style={[s.levelNum, { color: T.teal }]}>{Math.round(comfortLevel)}</Text>
              <Text style={[s.levelLabel, { color: T.teal }]}>
                {comfortLevel >= 7 ? 'Good' : comfortLevel >= 4 ? 'Fair' : 'Low'}
              </Text>
            </View>
          </View>
          <CustomSlider value={comfortLevel} onValueChange={setComfort} min={0} max={10} color={T.teal} />
        </View>

        {/* ── Body Part Selection ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Select Pain Locations</Text>
          <Text style={s.cardSub}>Tap all areas where you feel discomfort</Text>
          <View style={s.bodyGrid}>
            {BODY_PARTS.map(part => {
              const isSelected = selected.includes(part.id);
              return (
                <TouchableOpacity
                  key={part.id}
                  style={[s.bodyPart, isSelected && [s.bodyPartSelected, { borderColor: pColor, backgroundColor: pColor + '15' }]]}
                  onPress={() => togglePart(part.id)}
                  activeOpacity={0.75}
                >
                  <Text style={s.bodyPartEmoji}>{part.emoji}</Text>
                  <Text style={[s.bodyPartLabel, isSelected && { color: pColor, fontWeight: '700' }]}>
                    {part.label}
                  </Text>
                  {isSelected && (
                    <View style={[s.checkMark, { backgroundColor: pColor }]}>
                      <Ionicons name="checkmark" size={10} color={T.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Pain Summary ── */}
        {selected.length > 0 && (
          <View style={[s.summaryCard, { borderLeftColor: pColor }]}>
            <Text style={s.summaryTitle}>📋 Assessment Summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryKey}>Areas affected:</Text>
              <Text style={[s.summaryVal, { color: pColor }]}>{selected.length} zone{selected.length > 1 ? 's' : ''}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryKey}>Pain intensity:</Text>
              <Text style={[s.summaryVal, { color: pColor }]}>{Math.round(painLevel)}/10 — {pLabel}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryKey}>Comfort level:</Text>
              <Text style={[s.summaryVal, { color: T.teal }]}>{Math.round(comfortLevel)}/10</Text>
            </View>
            <Text style={s.summaryRec}>
              {Math.round(painLevel) >= 7
                ? '⚠️ High pain detected — professional consultation recommended.'
                : '✅ Continue monitoring and follow your exercise plan.'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, { backgroundColor: pColor }]}
          onPress={() => navigation.navigate('HomeScreen', { userName: userName || 'User', userEmail: userEmail || '' })}
          activeOpacity={0.88}
        >
          <Text style={s.submitBtnTxt}>Submit Assessment</Text>
          <Ionicons name="arrow-forward" size={18} color={T.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* ── High Pain Modal ── */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <TouchableOpacity style={s.modalClose} onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={22} color={T.muted} />
            </TouchableOpacity>
            <View style={[s.modalIconCircle, { backgroundColor: '#FEEBEA', borderColor: '#E5393540' }]}>
              <Ionicons name="medical" size={32} color="#E53935" />
            </View>
            <Text style={s.modalTitle}>High Pain Alert</Text>
            <Text style={[s.modalScore, { color: '#E53935' }]}>{Math.round(painLevel)}/10</Text>
            <View style={[s.modalSeverityBar, { backgroundColor: '#E53935' }]}>
              <Text style={s.modalSeverityTxt}>⚠️ SEVERE PAIN DETECTED</Text>
            </View>
            <Text style={s.modalMsg}>
              Your pain level indicates significant discomfort. We strongly recommend professional physiotherapy consultation.
            </Text>
            <TouchableOpacity
              style={[s.modalPrimaryBtn, { backgroundColor: T.primary }]}
              onPress={() => { setShowModal(false); navigation.navigate('PhysioConsult', { userName, userEmail, painLevel: Math.round(painLevel) }); }}
            >
              <Ionicons name="search" size={16} color={T.white} />
              <Text style={s.modalPrimaryBtnTxt}>Find a Physiotherapist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.modalSecondaryBtn}
              onPress={() => { setShowModal(false); navigation.navigate('QuickRelief'); }}
            >
              <Text style={s.modalSecondaryBtnTxt}>Try Gentle Relief Exercises</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  header: {
    backgroundColor: T.primary, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14,
    shadowColor: T.primary, shadowOffset: { width:0, height:6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: T.white },
  headerSub: { fontSize: 12, color: 'rgba(227,242,253,0.7)', marginTop: 2 },
  headerBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  headerBadgeNum: { fontSize: 20, fontWeight: '900', color: T.white },
  headerBadgeLbl: { fontSize: 9, color: 'rgba(227,242,253,0.7)', fontWeight: '600' },

  scroll: { padding: 16, paddingBottom: 110 },

  card: {
    backgroundColor: T.card, borderRadius: 20, padding: 20,
    marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width:0, height:4 }, shadowOpacity: 0.07,
    shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: T.border,
  },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: T.text, marginBottom: 3 },
  cardSub: { fontSize: 12, color: T.muted },

  levelBadge: {
    alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5,
  },
  levelNum: { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  levelLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  scaleBar: { flexDirection: 'row', marginBottom: 6, marginTop: 2 },
  scaleSeg: {},
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sliderLbl: { fontSize: 10, color: T.muted, fontWeight: '500' },
  divider: { height: 1, backgroundColor: T.border, marginVertical: 18 },

  bodyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  bodyPart: {
    width: (width - 32 - 40 - 8) / 3,
    backgroundColor: '#F7F9FC', borderRadius: 14,
    padding: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: T.border,
    position: 'relative',
  },
  bodyPartSelected: { borderWidth: 2 },
  bodyPartEmoji: { fontSize: 22, marginBottom: 5 },
  bodyPartLabel: { fontSize: 9, color: T.muted, textAlign: 'center', fontWeight: '500', lineHeight: 12 },
  checkMark: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  summaryCard: {
    backgroundColor: T.card, borderRadius: 18, padding: 18,
    borderLeftWidth: 4, borderWidth: 1, borderColor: T.border,
    marginBottom: 10,
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: T.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryKey: { fontSize: 13, color: T.muted, fontWeight: '500' },
  summaryVal: { fontSize: 13, fontWeight: '700' },
  summaryRec: { fontSize: 12, color: T.text, marginTop: 10, lineHeight: 18, fontStyle: 'italic' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: T.card, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: T.border,
    shadowColor: '#000', shadowOffset: { width:0, height:-4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 12,
  },
  submitBtn: {
    borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width:0, height:6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  submitBtnTxt: { color: T.white, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'center', alignItems:'center', padding:20 },
  modalCard: {
    backgroundColor: T.card, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width:0, height:8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 16,
  },
  modalClose: { position:'absolute', top:14, right:14, padding:4 },
  modalIconCircle: {
    width:72, height:72, borderRadius:36, justifyContent:'center', alignItems:'center',
    marginBottom:14, borderWidth:1,
  },
  modalTitle: { fontSize:20, fontWeight:'900', color:T.text, marginBottom:6 },
  modalScore: { fontSize:44, fontWeight:'900', marginBottom:10 },
  modalSeverityBar: { borderRadius:8, paddingHorizontal:16, paddingVertical:6, marginBottom:14 },
  modalSeverityTxt: { fontSize:11, fontWeight:'800', color:T.white, letterSpacing:1 },
  modalMsg: { fontSize:13, color:T.muted, textAlign:'center', lineHeight:20, marginBottom:20 },
  modalPrimaryBtn: {
    borderRadius:14, paddingVertical:14, paddingHorizontal:24, width:'100%',
    flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10,
  },
  modalPrimaryBtnTxt: { color:T.white, fontSize:15, fontWeight:'800' },
  modalSecondaryBtn: { borderRadius:14, paddingVertical:13, paddingHorizontal:24, width:'100%', alignItems:'center', borderWidth:1.5, borderColor:T.border },
  modalSecondaryBtnTxt: { color:T.primary, fontSize:14, fontWeight:'700' },
});
