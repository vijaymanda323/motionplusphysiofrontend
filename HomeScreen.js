import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import API_BASE_URL from "./config/api";

const { width } = Dimensions.get("window");
const AVATAR_IMG = require("./assets/images/Hamza.png"); // Premium photo avatar
const BODY_MAP = require("./assets/images/body_pain_map_premium.png");

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary: "#9E0A0A", // Deep Crimson Red
  secondary: "#C62828", // Medium Red
  accent: "#FFE500", // Gold/Yellow
  white: "#FFFFFF",
  dark: "#1A0202", // Dark Crimson-Black
  bgGradient: ["#9E0A0A", "#B71C1C", "#E5CCCC", "#F9F5F5"], // Red to warm grey gradient
  cardGlass: "rgba(255, 255, 255, 0.16)", // Glassmorphic card background
  cardGlassBorder: "rgba(255, 255, 255, 0.25)",
  textDark: "#2E1010", // Dark warm brown-red
  mutedDark: "#8B7575", // Warm muted grey-red
  borderLight: "rgba(255, 255, 255, 0.25)",
  borderDark: "#F2E2E2",
};

const BLOG_PREVIEW = [
  {
    id: "1",
    title: "Stroke Recovery: Evidence-Based Rehab",
    category: "Recovery",
    time: "12 min",
    image: require("./assets/images/blog_featured.png"),
    accent: T.primary,
  },
  {
    id: "2",
    title: "Chronic Back Pain: New Treatment Methods",
    category: "Pain Care",
    time: "8 min",
    image: require("./assets/images/blog_pain.png"),
    accent: "#C62828",
  },
  {
    id: "3",
    title: "Posture Correction for Desk Workers",
    category: "Posture",
    time: "6 min",
    image: require("./assets/images/blog_posture.png"),
    accent: "#FF7043",
  },
  {
    id: "4",
    title: "Sports Injury Rehab Protocols",
    category: "Sports",
    time: "10 min",
    image: require("./assets/images/blog_sports.png"),
    accent: "#FFE500",
  },
  {
    id: "5",
    title: "Neck & Shoulder Pain: Clinical Guide",
    category: "Cervical",
    time: "7 min",
    image: require("./assets/images/blog_neck.png"),
    accent: T.secondary,
  },
];

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", route: null },
  { icon: "🎯", label: "Bingo", route: "PainBingo" },
  { icon: "📰", label: "Blog", route: "Blog" },
  { icon: "👤", label: "Profile", route: "AboutYou" },
];

const SERVICES = [
  {
    image: require("./assets/images/service_pain_map.png"),
    title: "Pain Area Map",
    sub: "Locate & track pain zones",
    route: "PainArea",
    color: T.primary,
    bg: "rgba(158, 10, 10, 0.08)",
  },
  {
    image: require("./assets/images/service_pain_bingo.png"),
    title: "Pain Bingo",
    sub: "Gamified symptom tracker",
    route: "PainBingo",
    color: "#FF7043",
    bg: "rgba(255, 112, 67, 0.08)",
  },
  {
    image: require("./assets/images/service_hardware_scan.png"),
    title: "Hardware Scan",
    sub: "Know your body in 60s",
    route: "HardwareScan",
    color: "#4CAF50",
    bg: "rgba(76, 175, 80, 0.08)",
  },
  {
    image: require("./assets/images/service_muscle_challenge.png"),
    title: "Muscle Challenge",
    sub: "Can your muscles beat it?",
    route: "MuscleChallenge",
    color: "#2196F3",
    bg: "rgba(33, 150, 243, 0.08)",
  },
  {
    image: require("./assets/images/service_quick_relief.png"),
    title: "Quick Relief",
    sub: "Guided physio routines",
    route: "QuickRelief",
    color: "#FFA000",
    bg: "rgba(255, 160, 0, 0.08)",
  },
  {
    image: require("./assets/images/service_consult.png"),
    title: "Consult Physio",
    sub: "Book expert sessions",
    route: "PhysioConsult",
    color: T.primary,
    bg: "rgba(158, 10, 10, 0.08)",
  },
];

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const safeStr = (v, fb = "") => (v == null ? fb : String(v).trim() || fb);
  const safeNum = (v, fb = 0) => {
    const n = Number(v);
    return isNaN(n) ? fb : Math.max(0, n);
  };

  const [userName, setUserName] = useState(() =>
    safeStr(route.params?.userName, "Vijay"),
  );
  const [userEmail, setUserEmail] = useState(() =>
    safeStr(route.params?.userEmail, ""),
  );
  const [streakCount, setStreakCount] = useState(0);
  const [loginDates, setLoginDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState(0);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
    Animated.stagger(120, [
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchProfile = async () => {
    const email = safeStr(route.params?.userEmail, "");
    if (!email) {
      setLoading(false);
      return;
    }
    setUserEmail(email);
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile/${email}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data?.user) {
        setUserName(safeStr(data.user.firstName || data.user.name, "Vijay"));
        setStreakCount(safeNum(data.user.streakCount, 0));
        setLoginDates(data.user.loginDates || []);
        setUserEmail(safeStr(data.user.email, email));
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const count = safeNum(streakCount, 0);
  const dayText = count === 1 ? "DAY" : "DAYS";

  const handleNav = (item, idx) => {
    setActiveNav(idx);
    if (item.route) navigation.navigate(item.route, { userEmail });
  };

  // Calendar Helper functions
  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const changeMonth = (direction) => {
    const nextDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1,
    );
    setCurrentDate(nextDate);
  };

  const selectDay = (day) => {
    const newSelected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(newSelected);
  };

  // Generate calendar days grid
  const daysInMonth = getDaysInMonth(
    currentDate.getMonth(),
    currentDate.getFullYear(),
  );
  const firstDayIndex = getFirstDayOfMonth(
    currentDate.getMonth(),
    currentDate.getFullYear(),
  );
  const calendarCells = [];

  // Add blank slots for empty days before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `blank-${i}`, dayNum: null });
  }

  // Add the actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ key: `day-${i}`, dayNum: i });
  }

  const isSelected = (dayNum) => {
    return (
      selectedDate.getDate() === dayNum &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const hasLogin = (dayNum) => {
    if (!loginDates || !loginDates.length) return false;
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(dayNum).padStart(2, "0");
    const checkDateStr = `${y}-${m}-${d}`;

    return loginDates.some((dateVal) => {
      if (!dateVal) return false;
      try {
        const dateObj = new Date(dateVal);
        const y2 = dateObj.getFullYear();
        const m2 = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d2 = String(dateObj.getDate()).padStart(2, "0");
        return `${y2}-${m2}-${d2}` === checkDateStr;
      } catch (e) {
        return false;
      }
    });
  };

  const formatDateLabel = (date) => {
    const monthsShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthsShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ─── HEADER ─── */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 8 },
          {
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
        {/* User Greeting */}
        <View style={styles.greetingRow}>
          <Text style={styles.greetingGreeting}>Hello, {userName} 👋</Text>
          <Text style={styles.greetingMotivation}>
            Ready to resume your recovery program?
          </Text>
        </View>

        {/* Date pill */}
        <View style={styles.dateRow}>
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>
              {formatDateLabel(selectedDate)}
            </Text>
          </View>
        </View>

        {/* Stats Row - High Contrast Glassmorphism */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>🔥 STREAK</Text>
            {loading ? (
              <ActivityIndicator
                color={T.white}
                size="small"
                style={{ marginTop: 2 }}
              />
            ) : (
              <Text style={styles.pillValue}>
                {count} {dayText}
              </Text>
            )}
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>✅ STATUS</Text>
            <Text style={styles.pillValue}>Active</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>⭐ RATING</Text>
            <Text style={styles.pillValue}>4.8</Text>
          </View>
        </View>
      </Animated.View>

      {/* ─── CONTENT ─── */}
      <Animated.ScrollView
        style={[
          styles.scroll,
          {
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── INTERACTIVE GLASSMORPHIC CALENDAR ── */}
        <View style={styles.calendarCard}>
          <View style={styles.calHeader}>
            <TouchableOpacity style={styles.monthPill} activeOpacity={0.8}>
              <Text style={styles.monthPillText}>
                {monthsList[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={T.white}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            <View style={styles.calArrows}>
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={styles.arrowBtn}
              >
                <Ionicons name="chevron-back" size={18} color={T.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.arrowBtn}
              >
                <Ionicons name="chevron-forward" size={18} color={T.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekLabels}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w, idx) => (
              <Text key={idx} style={styles.weekLabelText}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarCells.map((cell, idx) => {
              if (cell.dayNum === null) {
                return <View key={cell.key} style={styles.dayCellEmpty} />;
              }

              const selected = isSelected(cell.dayNum);
              const hasActivity = hasLogin(cell.dayNum);
              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[styles.dayCell, selected && styles.dayCellSelected]}
                  onPress={() => selectDay(cell.dayNum)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.dayText, selected && styles.dayTextSelected]}
                  >
                    {cell.dayNum}
                  </Text>
                  {hasActivity && <View style={styles.streakDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── PAIN AREA ASSESSMENT HERO (Matches screenshot exactly) ── */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => navigation.navigate("PainArea", { userEmail })}
          activeOpacity={0.95}
        >
          <View style={styles.heroCardContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Pain Area</Text>
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>Start →</Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              <Image
                source={BODY_MAP}
                style={styles.heroBodyImg}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── OUR SERVICES LIST ── */}
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.servicesContainer}>
          {SERVICES.map((svc, i) => (
            <TouchableOpacity
              key={i}
              style={styles.serviceCard}
              onPress={() =>
                svc.route && navigation.navigate(svc.route, { userEmail })
              }
              activeOpacity={0.85}
            >
              {/* Left Color Accent Line */}
              <View
                style={[
                  styles.serviceAccentLine,
                  { backgroundColor: svc.color },
                ]}
              />

              <Image
                source={svc.image}
                style={styles.serviceImage}
                resizeMode="cover"
              />

              <View style={styles.serviceBody}>
                <Text style={styles.serviceTitle}>{svc.title}</Text>
                <Text style={styles.serviceSub} numberOfLines={2}>
                  {svc.sub}
                </Text>
              </View>

              <View style={[styles.serviceArrow, { backgroundColor: svc.bg }]}>
                <Ionicons name="chevron-forward" size={16} color={svc.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── FIND PHYSIO SPECIALIST BANNER ── */}
        <TouchableOpacity
          style={styles.findBanner}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate("NearbySpecialists", { userEmail })
          }
        >
          <View style={styles.findLeft}>
            <Text style={styles.findTitle}>🔍 Find a Specialist Near You</Text>
            <Text style={styles.findSub}>
              200+ certified clinics · Intelligent matching · 4.9★
            </Text>
          </View>
          <View style={styles.findBtn}>
            <Text style={styles.findBtnTxt}>Find</Text>
          </View>
        </TouchableOpacity>

        {/* ── CLINICAL INSIGHTS (Filled with local assets images) ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Clinical Insights</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Blog", { userEmail })}
          >
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.blogStrip}
        >
          {BLOG_PREVIEW.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.blogCard}
              onPress={() => navigation.navigate("Blog", { userEmail })}
              activeOpacity={0.88}
            >
              {/* Blog Image from Assets */}
              <Image
                source={post.image}
                style={styles.blogCardImage}
                resizeMode="cover"
              />

              <View style={styles.blogInfo}>
                <View
                  style={[
                    styles.blogCat,
                    { backgroundColor: "rgba(158, 10, 10, 0.08)" },
                  ]}
                >
                  <Text style={[styles.blogCatTxt, { color: T.primary }]}>
                    {post.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.blogTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                <Text style={styles.blogTime}>📖 {post.time} read</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── DR QUOTE CARD ── */}
        <View style={styles.quoteCard}>
          <Image
            source={require("./assets/images/physio_doctor_avatar.png")}
            style={styles.quoteDocImg}
            resizeMode="contain"
          />
          <View style={styles.quoteContent}>
            <Text style={styles.quoteText}>
              "Movement is medicine. Consistent physiotherapy reduces chronic
              pain by up to 70%."
            </Text>
            <Text style={styles.quoteAuthor}>
              — Dr. Sarah Mitchell, MSc Physiotherapy
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ─── BOTTOM NAV ─── */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {NAV_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => handleNav(item, idx)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.navIconWrap,
                activeNav === idx && styles.navIconWrapActive,
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                activeNav === idx && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* header */
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
    marginLeft: -20,
  },

  /* Custom Logo Badge */
  logoBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadgeInner: {
    backgroundColor: "#C62828",
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFE500",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  logoBadgeM: {
    color: "#FFE500",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  logoBadgePlus: {
    color: "#FFE500",
    fontSize: 10,
    fontWeight: "900",
    position: "absolute",
    top: 2,
    right: 4,
  },
  logoBrandText: {
    justifyContent: "center",
  },
  logoTextBold: {
    color: "#FFE500",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
    lineHeight: 15,
  },
  logoTextRegular: {
    color: "#FFE500",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 13,
  },

  logoImage: {
    width: 155,
    height: 44,
  },

  dateRow: {
    marginBottom: 14,
    alignItems: "flex-start",
  },
  datePill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  datePillText: {
    color: T.white,
    fontSize: 12,
    fontWeight: "700",
  },

  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: "rgba(255, 230, 230, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pillLabel: {
    fontSize: 9,
    color: T.accent,
    fontWeight: "850",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pillValue: {
    fontSize: 13,
    color: T.white,
    fontWeight: "900",
  },

  /* scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 10, paddingHorizontal: 20 },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: T.textDark,
    letterSpacing: 0.3,
    marginTop: 14,
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: T.primary, fontWeight: "800" },

  /* Interactive Calendar Card */
  calendarCard: {
    backgroundColor: "rgba(255, 230, 230, 0.25)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.8,
    borderColor: "rgba(255, 255, 255, 0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  monthPillText: {
    color: T.white,
    fontSize: 14,
    fontWeight: "800",
  },
  calArrows: {
    flexDirection: "row",
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  weekLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekLabelText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    fontWeight: "800",
    width: 36,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: 8,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellEmpty: {
    width: 36,
    height: 36,
  },
  dayCellSelected: {
    backgroundColor: T.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  dayText: {
    color: T.white,
    fontSize: 13,
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#9E0A0A",
    fontWeight: "900",
  },
  streakDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4CAF50", // Green dot
    position: "absolute",
    bottom: 4,
  },

  /* hero card (Pain Area Assessment matching screenshot) */
  heroCard: {
    backgroundColor: "#380202", // Very dark rich maroon
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    overflow: "hidden",
  },
  heroCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 140,
  },
  heroLeft: {
    flex: 1.2,
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: T.white,
    marginBottom: 12,
  },
  heroBtn: {
    backgroundColor: T.accent, // Yellow button
    borderRadius: 24,
    alignSelf: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: "950",
    color: T.dark, // Dark text
  },
  heroRight: {
    flex: 1,
    alignItems: "flex-end",
    height: 130,
  },
  heroBodyImg: {
    width: "100%",
    height: "100%",
  },

  greetingRow: {
    marginVertical: 12,
  },
  greetingGreeting: {
    fontSize: 22,
    fontWeight: "900",
    color: T.white,
  },
  greetingMotivation: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginTop: 2,
  },

  /* services list */
  servicesContainer: {
    marginBottom: 20,
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: T.borderDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  serviceAccentLine: {
    width: 4,
    height: "60%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  serviceImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    marginLeft: 6,
  },
  serviceBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 6,
  },
  serviceTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: T.textDark,
    marginBottom: 3,
  },
  serviceSub: {
    fontSize: 11.5,
    color: T.mutedDark,
    lineHeight: 16,
  },
  serviceArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  /* find banner */
  findBanner: {
    backgroundColor: T.dark,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: T.accent,
    shadowColor: T.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  findLeft: { flex: 1 },
  findTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: T.white,
    marginBottom: 4,
  },
  findSub: { fontSize: 10.5, color: "rgba(255,255,255,0.6)" },
  findBtn: {
    backgroundColor: T.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  findBtnTxt: { fontSize: 12, fontWeight: "850", color: T.dark },

  /* blog strip */
  blogStrip: { paddingBottom: 6, gap: 14 },
  blogCard: {
    width: width * 0.52,
    backgroundColor: T.white,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: T.borderDark,
  },
  blogCardImage: { height: 95, width: "100%" },
  blogInfo: { padding: 12 },
  blogCat: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  blogCatTxt: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  blogTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: T.textDark,
    lineHeight: 17,
    marginBottom: 6,
  },
  blogTime: { fontSize: 10.5, color: T.mutedDark },

  /* quote */
  quoteCard: {
    backgroundColor: T.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: T.borderDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: T.primary,
  },
  quoteDocImg: { width: 52, height: 52, borderRadius: 26 },
  quoteContent: { flex: 1 },
  quoteText: {
    fontSize: 11.5,
    color: T.textDark,
    lineHeight: 18,
    fontStyle: "italic",
    marginBottom: 4,
  },
  quoteAuthor: { fontSize: 10.5, color: T.primary, fontWeight: "750" },

  /* bottom nav */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.white,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: T.borderDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: { alignItems: "center" },
  navIconWrap: {
    width: 44,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrapActive: { backgroundColor: "rgba(158, 10, 10, 0.08)" },
  navIcon: { fontSize: 18 },
  navLabel: {
    fontSize: 9.5,
    color: T.mutedDark,
    marginTop: 2,
    fontWeight: "600",
  },
  navLabelActive: { color: T.primary, fontWeight: "850" },
});
