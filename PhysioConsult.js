import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, Modal, ActivityIndicator, FlatList, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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
  orange: '#FFA000',
  red: '#C62828',
  dark: '#1A0202',
};

const DOCTORS = [
  {
    id: 1,
    name: "Dr. Jose",
    specialization: "Cardio, Neuro, Ortho/Regression Specialist",
    experience: "10 years exp.",
    availability: "09:30 AM - 04:30 PM",
    fee: "Rs. 1,200",
    rating: "4.9",
    reviews: "142 reviews",
    image: require('./assets/images/Jose.png'),
    badge: "Cardio & Neuro",
    focusArea: "Cardio, Neuro, Ortho/Regression",
  },
  {
    id: 2,
    name: "Dr. Akhila",
    specialization: "Pediatric & DMI Specialist",
    experience: "8 years exp.",
    availability: "10:00 AM - 05:00 PM",
    fee: "Rs. 1,200",
    rating: "4.8",
    reviews: "95 reviews",
    image: require('./assets/images/Akhila.png'),
    badge: "Pediatric Lead",
    focusArea: "Pediatric / DMI",
  },
  {
    id: 3,
    name: "Dr. Venkaty",
    specialization: "Ortho & Neuro Specialist",
    experience: "12 years exp.",
    availability: "09:00 AM - 04:00 PM",
    fee: "Rs. 1,200",
    rating: "5.0",
    reviews: "176 reviews",
    image: require('./assets/images/venkaty.jpeg'),
    badge: "Ortho & Neuro",
    focusArea: "Ortho, Neuro",
  },
  {
    id: 4,
    name: "Dr. Pavithran",
    specialization: "Sports Physiologist & Coach",
    experience: "9 years exp.",
    availability: "08:00 AM - 03:00 PM",
    fee: "Rs. 1,000",
    rating: "4.7",
    reviews: "110 reviews",
    image: require('./assets/images/IMG_0811.png'),
    badge: "Sports Coach",
    focusArea: "Sports / Coaching",
  },
  {
    id: 5,
    name: "Dr. Ananthi",
    specialization: "Sensory Integration Expert",
    experience: "14 years exp.",
    availability: "11:00 AM - 06:00 PM",
    fee: "Rs. 1,500",
    rating: "4.9",
    reviews: "215 reviews",
    image: require('./assets/images/Ananthi.png'),
    badge: "Special Ed",
    focusArea: "Sensory Integration, Special Education",
  },
  {
    id: 6,
    name: "Dr. Pallavi",
    specialization: "DMI, Aqua & Pediatrics Expert",
    experience: "7 years exp.",
    availability: "09:30 AM - 03:30 PM",
    fee: "Rs. 1,200",
    rating: "4.9",
    reviews: "88 reviews",
    image: require('./assets/images/Pallavi.png'),
    badge: "DMI & Aqua",
    focusArea: "DMI, Aqua, Pediatrics",
  },
  {
    id: 7,
    name: "Dr. Yaseen",
    specialization: "Ortho & Neuro Practitioner",
    experience: "11 years exp.",
    availability: "10:00 AM - 05:30 PM",
    fee: "Rs. 1,200",
    rating: "4.8",
    reviews: "134 reviews",
    image: require('./assets/images/Yaseen.png'),
    badge: "Ortho & Neuro",
    focusArea: "Ortho & Neuro",
  },
  {
    id: 8,
    name: "Dr. Jeevi",
    specialization: "Ortho, Sports, Neuro & Pediatrics Specialist",
    experience: "15 years exp.",
    availability: "09:00 AM - 05:00 PM",
    fee: "Rs. 1,200",
    rating: "5.0",
    reviews: "310 reviews",
    image: require('./assets/images/Jeeva.png'),
    badge: "Clinical Lead",
    focusArea: "Ortho, Sports, Neuro, Pediatrics",
  }
];

export default function PhysioConsult() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userName, userEmail, painLevel, comfortLevel, selectedCount } = route.params || {};

  // Interactive Matching & Booking States
  const [matchingActive, setMatchingActive] = useState(false);
  const [matchedDocId, setMatchedDocId] = useState(null);
  const [matchingStep, setMatchingStep] = useState(0);

  const [bookingDoc, setBookingDoc] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Jun 20 (Tomorrow)');
  const [selectedTime, setSelectedTime] = useState('11:30 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const datesList = [
    'Jun 19 (Today)', 'Jun 20 (Tomorrow)', 'Jun 21 (Sun)', 
    'Jun 22 (Mon)', 'Jun 23 (Tue)', 'Jun 24 (Wed)'
  ];

  const timesList = [
    '09:30 AM', '10:30 AM', '11:30 AM', 
    '01:30 PM', '02:30 PM', '03:30 PM', 
    '04:30 PM', '05:30 PM'
  ];

  const getHealthAdvisory = (pain) => {
    if (pain >= 8) return { text: "Critical advisory: Severe pain detected. Avoid heavy loading and consult immediately.", color: T.red };
    if (pain >= 5) return { text: "Moderate advisory: Rest is advised. Avoid dynamic movements until consultation.", color: T.orange };
    return { text: "Normal advisory: Gentle stretching and light routines are suitable.", color: T.teal };
  };

  const advisory = painLevel !== undefined ? getHealthAdvisory(painLevel) : null;

  // Run Intelligent Matcher simulation
  const runMatching = () => {
    setMatchingActive(true);
    setMatchingStep(0);
    
    // Simulate step updates for match progress
    const t1 = setTimeout(() => setMatchingStep(1), 500);
    const t2 = setTimeout(() => setMatchingStep(2), 1000);
    const t3 = setTimeout(() => {
      setMatchingActive(false);
      // Determine match:
      // If severe pain or high selected count, match Vijay Manda (id: 3)
      // If moderate pain, match Alice Henderson (id: 2)
      // Else, match Hamza Tariq (id: 1)
      let matchId = 1;
      if (painLevel !== undefined) {
        if (painLevel >= 8) {
          matchId = 3;
        } else if (painLevel >= 5) {
          matchId = 2;
        }
      } else {
        // Random fallback or lead
        matchId = 3;
      }
      setMatchedDocId(matchId);
    }, 1800);
  };

  const handleBookPress = (doc) => {
    setBookingDoc(doc);
    setBookingSuccess(false);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    setBookingSuccess(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingDoc(null);
    setBookingSuccess(false);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={T.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Physiotherapy Consult</Text>
          <Text style={styles.headerSub}>Find verified clinical experts</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.medCross}><Text style={styles.medCrossText}>+</Text></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Pain Level Summary Card */}
        {painLevel !== undefined && (
          <View style={styles.assessmentCard}>
            <View style={styles.assessmentHeader}>
              <View style={styles.assessmentTitleBox}>
                <Text style={styles.assessmentTitle}>Your Diagnostic Summary</Text>
                <Text style={styles.assessmentSubtitle}>Based on recent pain assessment</Text>
              </View>
              <View style={[styles.assessmentBadge, { backgroundColor: advisory?.color + '15', borderColor: advisory?.color + '30' }]}>
                <Text style={[styles.assessmentBadgeText, { color: advisory?.color }]}>
                  Pain: {painLevel}/10
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Comfort Level</Text>
                <Text style={[styles.metricValue, { color: T.teal }]}>
                  {comfortLevel !== undefined ? `${comfortLevel}/10` : 'N/A'}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Affected Zones</Text>
                <Text style={[styles.metricValue, { color: T.primary }]}>
                  {selectedCount !== undefined ? selectedCount : '0'}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Advisory Status</Text>
                <Text style={[styles.metricValue, { color: advisory?.color, fontSize: 13 }]}>
                  {painLevel >= 8 ? 'Urgent' : painLevel >= 5 ? 'Moderate' : 'Stable'}
                </Text>
              </View>
            </View>

            {advisory && (
              <View style={[styles.advisoryBox, { backgroundColor: advisory.color + '08', borderLeftColor: advisory.color }]}>
                <Text style={[styles.advisoryText, { color: advisory.color }]}>
                  {advisory.text}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── INTELLIGENT MATCHING ASSISTANT ── */}
        <TouchableOpacity 
          style={styles.matchingBanner} 
          onPress={runMatching}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#9E0A0A', '#C62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.matchingGradient}
          >
            <View style={styles.matchingIconBox}>
              <Ionicons name="sparkles" size={24} color={T.accent} />
            </View>
            <View style={styles.matchingTextContent}>
              <Text style={styles.matchingTitle}>Intelligent Matching Assistant</Text>
              <Text style={styles.matchingSubtitle}>
                Match with the best therapist based on your symptoms.
              </Text>
            </View>
            <View style={styles.matchingActionBtn}>
              <Text style={styles.matchingActionText}>Match</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionHeaderTitle}>Available Specialists</Text>
        <Text style={styles.sectionHeaderSub}>Our physical therapists are fully certified and background-verified.</Text>
        
        {/* Doctors list */}
        {DOCTORS.map((doc) => {
          const isMatched = doc.id === matchedDocId;
          return (
            <View 
              key={doc.id} 
              style={[
                styles.physioCard, 
                isMatched && styles.physioCardMatched
              ]}
            >
              {isMatched && (
                <View style={styles.matchedBadge}>
                  <Ionicons name="sparkles" size={12} color={T.primary} />
                  <Text style={styles.matchedBadgeText}>98% MATCH FOR YOU</Text>
                </View>
              )}

              {/* Header row in doctor card */}
              <View style={styles.physioCardTop}>
                <View style={styles.profileImageContainer}>
                  <Image source={doc.image} style={styles.profileImage} resizeMode="cover" />
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={T.white} />
                  </View>
                </View>

                <View style={styles.physioInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.physioName}>{doc.name}</Text>
                    {doc.badge && (
                      <View style={styles.badgeWrap}>
                        <Text style={styles.badgeText}>{doc.badge.toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.physioSpecialization}>
                    {doc.specialization} · <Text style={styles.experienceText}>{doc.experience}</Text>
                  </Text>
                  <Text style={styles.focusText}>Focus: {doc.focusArea}</Text>
                  
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.ratingText}>{doc.rating}</Text>
                    <Text style={styles.reviewsText}>({doc.reviews})</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Availability and price details */}
              <View style={styles.physioCardBottom}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>AVAILABILITY</Text>
                  <View style={styles.detailValueRow}>
                    <Ionicons name="time-outline" size={13} color={T.muted} />
                    <Text style={styles.detailValue}>{doc.availability}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>CONSULTATION FEE</Text>
                  <Text style={styles.feeValue}>{doc.fee}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  activeOpacity={0.82}
                  onPress={() => handleBookPress(doc)}
                >
                  <Text style={styles.actionButtonText}>Book</Text>
                  <Ionicons name="arrow-forward" size={14} color={T.white} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── INTELLIGENT MATCHING ASSISTANT MODAL ── */}
      <Modal visible={matchingActive} transparent animationType="fade">
        <View style={styles.matchModalOverlay}>
          <View style={styles.matchModalContent}>
            <ActivityIndicator size="large" color={T.primary} />
            <Text style={styles.matchModalTitle}>Intelligent Matching Assistant</Text>
            {matchingStep === 0 && (
              <Text style={styles.matchModalText}>Analyzing your physical intake profile...</Text>
            )}
            {matchingStep === 1 && (
              <Text style={styles.matchModalText}>Scanning MotionPlus network database...</Text>
            )}
            {matchingStep === 2 && (
              <Text style={styles.matchModalText}>Locating certified physical therapist match...</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* ── CLINICAL APPOINTMENT BOOKING MODAL ── */}
      <Modal visible={showBookingModal} transparent animationType="slide" onRequestClose={closeBookingModal}>
        <View style={styles.bookingOverlay}>
          <View style={styles.bookingCard}>
            
            {/* Modal Header */}
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingTitle}>Schedule Consultation</Text>
              <TouchableOpacity onPress={closeBookingModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={T.text} />
              </TouchableOpacity>
            </View>

            {bookingSuccess ? (
              /* Success State */
              <View style={styles.successContent}>
                <View style={styles.successIconBox}>
                  <Ionicons name="checkmark-circle" size={80} color="#26A69A" />
                </View>
                <Text style={styles.successHeading}>Appointment Booked!</Text>
                <Text style={styles.successSub}>
                  Your session with {bookingDoc?.name} has been successfully scheduled.
                </Text>
                
                <View style={styles.successDetails}>
                  <View style={styles.successDetailRow}>
                    <Text style={styles.successLabel}>Specialist</Text>
                    <Text style={styles.successVal}>{bookingDoc?.name}</Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Text style={styles.successLabel}>Date</Text>
                    <Text style={styles.successVal}>{selectedDate}</Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Text style={styles.successLabel}>Time Slot</Text>
                    <Text style={styles.successVal}>{selectedTime}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={closeBookingModal}>
                  <Text style={styles.doneBtnTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Booking Input State */
              <View style={styles.bookingInputContent}>
                
                {/* Doctor Brief Info */}
                <View style={styles.docBrief}>
                  <Image source={bookingDoc?.image} style={styles.docBriefImg} />
                  <View style={styles.docBriefText}>
                    <Text style={styles.docBriefName}>{bookingDoc?.name}</Text>
                    <Text style={styles.docBriefSub}>{bookingDoc?.specialization}</Text>
                    <Text style={styles.docBriefFee}>Fee: {bookingDoc?.fee}</Text>
                  </View>
                </View>

                {/* Date Picker */}
                <Text style={styles.inputLabel}>Select Appointment Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                  {datesList.map((d) => {
                    const active = selectedDate === d;
                    return (
                      <TouchableOpacity 
                        key={d} 
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => setSelectedDate(d)}
                      >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Time Slot Selector */}
                <Text style={styles.inputLabel}>Select Time Slot</Text>
                <View style={styles.timeGrid}>
                  {timesList.map((t) => {
                    const active = selectedTime === t;
                    return (
                      <TouchableOpacity 
                        key={t} 
                        style={[styles.timeBox, active && styles.timeBoxActive]}
                        onPress={() => setSelectedTime(t)}
                      >
                        <Text style={[styles.timeText, active && styles.timeTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Confirm Button */}
                <TouchableOpacity style={styles.confirmBtn} onPress={confirmBooking}>
                  <Text style={styles.confirmBtnTxt}>Confirm Appointment  →</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: T.white,
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(227,242,253,0.75)",
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    alignItems: 'center',
  },
  medCross: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  medCrossText: {
    color: T.white,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },

  content: {
    padding: 16,
  },

  /* Matching Banner */
  matchingBanner: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  matchingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  matchingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchingTextContent: {
    flex: 1,
  },
  matchingTitle: {
    color: T.white,
    fontSize: 15,
    fontWeight: '900',
  },
  matchingSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  matchingActionBtn: {
    backgroundColor: T.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  matchingActionText: {
    color: T.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  /* Assessment summary card */
  assessmentCard: {
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentTitleBox: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: T.text,
  },
  assessmentSubtitle: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  assessmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  assessmentBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: T.border,
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: T.muted,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  advisoryBox: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  advisoryText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: T.text,
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: T.muted,
    marginTop: 4,
    marginBottom: 16,
  },

  /* Doctor card */
  physioCard: {
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  physioCardMatched: {
    borderColor: T.accent,
    borderWidth: 2.5,
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  matchedBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: T.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.primary,
  },
  matchedBadgeText: {
    fontSize: 9,
    fontWeight: '950',
    color: T.primary,
  },
  physioCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 14,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: T.light,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF7043',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.white,
  },
  physioInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  physioName: {
    fontSize: 16,
    fontWeight: '800',
    color: T.text,
  },
  badgeWrap: {
    backgroundColor: T.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: T.primary,
  },
  physioSpecialization: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 4,
  },
  experienceText: {
    fontWeight: '600',
  },
  focusText: {
    fontSize: 11,
    color: T.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: T.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: T.muted,
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: T.border,
    marginVertical: 12,
  },
  physioCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1.2,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: T.muted,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailValue: {
    fontSize: 12,
    color: T.text,
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 14,
    color: '#FF7043',
    fontWeight: '800',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: T.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: T.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonText: {
    color: T.white,
    fontSize: 12,
    fontWeight: '800',
  },

  /* Matching Modal */
  matchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchModalContent: {
    backgroundColor: T.white,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  matchModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: T.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  matchModalText: {
    fontSize: 12,
    color: T.muted,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Booking Modal */
  bookingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bookingCard: {
    backgroundColor: T.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: T.text,
  },
  closeBtn: {
    padding: 4,
  },

  /* Booking Input Content */
  bookingInputContent: {
    gap: 16,
  },
  docBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: T.light,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  docBriefImg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.white,
  },
  docBriefText: {
    flex: 1,
  },
  docBriefName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: T.text,
  },
  docBriefSub: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  docBriefFee: {
    fontSize: 11,
    color: T.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.text,
    letterSpacing: 0.5,
  },
  pillsScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: T.border,
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  pillText: {
    fontSize: 12.5,
    color: T.text,
    fontWeight: '600',
  },
  pillTextActive: {
    color: T.white,
    fontWeight: '800',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeBox: {
    width: (width - 48 - 24) / 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: 'center',
  },
  timeBoxActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  timeText: {
    fontSize: 11.5,
    color: T.text,
    fontWeight: '600',
  },
  timeTextActive: {
    color: T.white,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnTxt: {
    color: T.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* Booking Success Content */
  successContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconBox: {
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: T.text,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 12.5,
    color: T.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  successDetails: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
    gap: 12,
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successLabel: {
    fontSize: 12,
    color: T.muted,
    fontWeight: '600',
  },
  successVal: {
    fontSize: 13,
    color: T.text,
    fontWeight: '800',
  },
  doneBtn: {
    backgroundColor: T.primary,
    width: '100%',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnTxt: {
    color: T.white,
    fontSize: 14,
    fontWeight: '800',
  },
});