import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground,
  Dimensions, StatusBar, Animated, FlatList, Linking,
  Share, ActivityIndicator, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary:   '#9E0A0A', // Deep Crimson Red
  secondary: '#C62828', // Medium Red
  accent:    '#FFE500', // Gold/Yellow
  white:     '#FFFFFF',
  dark:      '#1A0202', // Dark Crimson-Black
  bg:        '#FFF5F5', // Soft warm white
  card:      '#FFFFFF',
  text:      '#2E1010', // Dark warm brown-red
  muted:     '#8B7575', // Warm muted grey-red
  border:    '#F2E2E2', // Warm light border
  light:     'rgba(158, 10, 10, 0.08)', // Soft translucent red
};

const CLINICS = [
  {
    id: '0',
    name: 'Motion+ Rehab',
    specialist: 'Physiotherapy Center',
    address: '4th Cross, 100 Feet Rd, opp. Freedom park, Vinoba Nagara, Shivamogga, Karnataka 577204',
    rating: '5.0',
    reviewsCount: '24',
    distance: '1.5 km',
    duration: '6 mins',
    phone: '+91 98765 43210',
    mapUrl: 'https://maps.app.goo.gl/WkogueHsDyqUqDmg8?g_st=ic',
    ward: 'Shivamogga',
    mapImage: require('./assets/images/map_shivamogga.png'),
  },
  {
    id: '1',
    name: 'Motion UniQuorns',
    specialist: 'Pediatrics & DMI Rehab',
    address: 'Puppalguda, Gachibowli, Hyderabad, Telangana 500089',
    rating: '4.8',
    reviewsCount: '95',
    distance: '2.3 km',
    duration: '9 mins',
    phone: '+91 87654 32109',
    mapUrl: 'https://maps.app.goo.gl/oH7EavUMiphe9TCR6?g_st=ic',
    ward: 'Gachibowli',
    mapImage: require('./assets/images/map_gachibowli.png'),
  },
  {
    id: '2',
    name: 'Dr. Venky | Neuro & Ortho Rehab',
    specialist: 'Ortho, Neuro & Stroke Care',
    address: '5th Floor, Star Commercial Centre, Cabin 2, opp. Gitanjali Vedika School, Puppalguda, Hyderabad 500089',
    rating: '5.0',
    reviewsCount: '176',
    distance: '3.1 km',
    duration: '12 mins',
    phone: '+91 76543 21098',
    mapUrl: 'https://maps.app.goo.gl/PrNMhh25NQ81K1Cx8?g_st=ic',
    ward: 'Manikonda',
    mapImage: require('./assets/images/map_star_centre.jpg'),
  },
  {
    id: '3',
    name: 'Pavithran | MotionPlus Physio',
    specialist: 'Sports Physio & Coaching',
    address: 'Star Commercial Centre, Puppalaguda Main Road, opp. Gitanjali Vedika School, Puppalguda, Hyderabad 500089',
    rating: '4.9',
    reviewsCount: '110',
    distance: '3.4 km',
    duration: '14 mins',
    phone: '+91 65432 10987',
    mapUrl: 'https://maps.app.goo.gl/SvAjjwWyimS8tHPBA?g_st=ic',
    ward: 'Puppalaguda',
    mapImage: require('./assets/images/map_puppalaguda_main.png'),
  }
];

const CARD_WIDTH = SCREEN_WIDTH * 0.84;
const CARD_MARGIN = SCREEN_WIDTH * 0.03;

const PulseCircle = ({ active }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        })
      ).start();
    } else {
      anim.setValue(0);
    }
  }, [active]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.5],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return active ? (
    <Animated.View style={[
      styles.pulseCircle,
      { transform: [{ scale }], opacity }
    ]} />
  ) : null;
};

const MarkerPin = ({ active, onPress, label }) => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.spring(bounce, {
        toValue: -8,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(bounce, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [active]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.pinContainer}>
      <PulseCircle active={active} />
      <Animated.View style={{ transform: [{ translateY: bounce }], alignItems: 'center' }}>
        <Ionicons
          name="location"
          size={active ? 36 : 28}
          color={active ? T.primary : '#D32F2F'}
        />
        <View style={[styles.pinBadge, active && styles.pinBadgeActive]}>
          <Text style={styles.pinBadgeText}>{label}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function NearbySpecialistsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const userEmail = route.params?.userEmail || '';

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedWard, setSelectedWard] = useState('All Wards');
  const [mapLoaded, setMapLoaded] = useState(false);

  const flatListRef = useRef(null);

  // Filter clinics based on selected Ward
  const filteredClinics = selectedWard === 'All Wards'
    ? CLINICS
    : CLINICS.filter(c => c.ward === selectedWard);

  // Get currently active clinic to render its map background
  const activeClinic = filteredClinics[selectedIndex] || filteredClinics[0] || CLINICS[0];

  const selectClinic = (index) => {
    if (index >= 0 && index < filteredClinics.length) {
      setSelectedIndex(index);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const handleWardSelect = (ward) => {
    setSelectedWard(ward);
    setSelectedIndex(0);
    setMapLoaded(false); // trigger loader for clean transitions
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN * 2));
    if (index >= 0 && index < filteredClinics.length) {
      setSelectedIndex(index);
    }
  };

  const handleDirections = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderClinicCard = ({ item, index }) => {
    const isSelected = selectedIndex === index;
    return (
      <View style={[
        styles.card,
        isSelected && styles.cardSelected,
        { marginHorizontal: CARD_MARGIN }
      ]}>
        {/* Ribbon Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: isSelected ? T.primary : T.light }]}>
            <Text style={[styles.badgeText, { color: isSelected ? T.white : T.primary }]}>
              📍 {item.distance} • {item.duration}
            </Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color={T.accent} />
            <Text style={styles.ratingText}>{item.rating} ({item.reviewsCount}+)</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <Text style={styles.clinicName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.clinicSub}>{item.specialist} • {item.ward}</Text>
          <Text style={styles.clinicAddress} numberOfLines={2}>{item.address}</Text>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.directionBtn]}
            onPress={() => handleDirections(item.mapUrl)}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={16} color={T.primary} />
            <Text style={styles.directionBtnTxt}>Get Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.bookBtn]}
            onPress={() => navigation.navigate('PhysioConsult', { userEmail })}
            activeOpacity={0.8}
          >
            <Text style={styles.bookBtnTxt}>Book Consult</Text>
            <Ionicons name="chevron-forward" size={14} color={T.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ── MAP CONTAINER (DYNAMIC MAP BASED ON ACTIVE CLINIC) ── */}
      <ImageBackground
        source={activeClinic.mapImage}
        style={styles.mapBg}
        resizeMode="cover"
        onLoadEnd={() => setMapLoaded(true)}
      >
        {!mapLoaded && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={T.primary} />
          </View>
        )}

        {/* Map Markers Overlay */}
        {mapLoaded && filteredClinics.map((clinic, index) => {
          const isSelected = selectedIndex === index;
          const displayLabel = clinic.id === '0' ? '1' : clinic.id === '1' ? '2' : clinic.id === '2' ? '3' : '4';
          
          // The active clinic's pin is always centered. 
          // Neighboring pins are rendered relative to the active map focus.
          let positionStyle = { top: '48%', left: '50%' };
          if (!isSelected) {
            if (index === 0) positionStyle = { top: '25%', left: '22%' };
            else if (index === 1) positionStyle = { top: '38%', left: '72%' };
            else if (index === 2) positionStyle = { top: '65%', left: '30%' };
            else if (index === 3) positionStyle = { top: '55%', left: '60%' };
          }

          return (
            <View
              key={clinic.id}
              style={[styles.markerPosition, positionStyle]}
            >
              <MarkerPin
                active={isSelected}
                label={displayLabel}
                onPress={() => selectClinic(index)}
              />
            </View>
          );
        })}
      </ImageBackground>

      {/* ── FLOATING BACK BUTTON ── */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.floatingBackButton, { top: insets.top + 16 }]}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={22} color={T.dark} />
      </TouchableOpacity>

      {/* ── BOTTOM SWIGGY/ZOMATO STYLE OVERLAY ── */}
      <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>Physio Specialists Near You</Text>
          <Text style={styles.listHeaderSub}>Intelligent clinic matching in Hyderabad</Text>
        </View>

        {/* Horizontal Hyderabad Wards Selection Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wardFilterStrip}
        >
          {['All Wards', 'Puppalaguda', 'Gachibowli', 'Manikonda', 'Shivamogga'].map((wardName) => {
            const isSelected = selectedWard === wardName;
            return (
              <TouchableOpacity
                key={wardName}
                style={[styles.wardChip, isSelected && styles.wardChipActive]}
                onPress={() => handleWardSelect(wardName)}
                activeOpacity={0.8}
              >
                <Text style={[styles.wardChipText, isSelected && styles.wardChipTextActive]}>
                  🏙️ {wardName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          ref={flatListRef}
          data={filteredClinics}
          renderItem={renderClinicCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{ paddingHorizontal: SCREEN_WIDTH * 0.05 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mapBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  /* Floating Back Button */
  floatingBackButton: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* Custom Markers */
  markerPosition: {
    position: 'absolute',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBadge: {
    position: 'absolute',
    top: 5,
    backgroundColor: T.white,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    elevation: 3,
  },
  pinBadgeActive: {
    backgroundColor: T.accent,
    borderColor: T.primary,
  },
  pinBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: T.dark,
  },
  pulseCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(211, 47, 47, 0.4)',
  },

  /* Bottom Cards Overlays */
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: T.dark,
  },
  listHeaderSub: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },

  /* Horizontal Hyderabad Wards Chips */
  wardFilterStrip: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 2,
  },
  wardChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wardChipActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5',
  },
  wardChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  wardChipTextActive: {
    color: T.primary,
    fontWeight: '800',
  },

  /* Swiggy/Zomato Style Cards */
  card: {
    width: CARD_WIDTH,
    backgroundColor: T.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardSelected: {
    borderColor: T.primary,
    shadowColor: T.primary,
    shadowOpacity: 0.12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#FDE047',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
  },
  cardBody: {
    marginBottom: 14,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '900',
    color: T.dark,
    marginBottom: 3,
  },
  clinicSub: {
    fontSize: 12,
    color: T.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  clinicAddress: {
    fontSize: 11,
    color: T.muted,
    lineHeight: 16,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  directionBtn: {
    backgroundColor: T.light,
    borderWidth: 1,
    borderColor: 'rgba(158, 10, 10, 0.2)',
  },
  directionBtnTxt: {
    color: T.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  bookBtn: {
    backgroundColor: T.primary,
  },
  bookBtnTxt: {
    color: T.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
