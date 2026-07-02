import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

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

const CATEGORIES = [
  { id: "all", label: "All Articles", emoji: "📚" },
  { id: "pain", label: "Pain Care", emoji: "🩺" },
  { id: "posture", label: "Posture", emoji: "🦴" },
  { id: "recovery", label: "Recovery", emoji: "💪" },
  { id: "sports", label: "Sports", emoji: "🏃" },
  { id: "breathing", label: "Breathing", emoji: "🫁" },
];

const ARTICLES = [
  {
    id: "1",
    title: "Stroke Recovery: Evidence-Based Milestones in Modern Rehab",
    category: "recovery",
    categoryLabel: "Recovery",
    time: "12 min",
    excerpt:
      "A comprehensive medical guide outlining post-stroke physical therapy protocols, neurological plasticity milestones, and home exercises.",
    img: require("./assets/images/blog_featured.png"),
    accent: T.primary,
    featured: true,
    emoji: "🧠",
    contentBlocks: [
      {
        type: "h2",
        text: "What Science Really Says About Healing After a Stroke",
      },
      {
        type: "p",
        text: '"Will my loved one recover?" This is the first question almost every family asks after a stroke. The honest answer is: No one can accurately predict exactly how much a person will recover. Every stroke is different. Some people recover quickly. Some recover slowly. Some need lifelong support.',
      },
      {
        type: "p",
        text: "But modern rehabilitation has taught us one powerful lesson: The brain is far more capable of healing and adapting than we once believed. Recovery is not about waiting for a miracle. It is about creating thousands of opportunities for the brain to learn again.",
      },
      { type: "h3", text: "Why This Matters" },
      {
        type: "p",
        text: "Many families lose hope because they believe recovery only happens during the first few weeks. That simply isn't true. Today's rehabilitation is based on science, not myths. Research shows that the brain has an amazing ability called neuroplasticity—the ability to create new pathways after an injury.",
      },
      {
        type: "p",
        text: "Think of it like Google Maps. If your usual road is closed, Google doesn't cancel your journey. It finds another route. Your brain tries to do the same thing after a stroke. The new route may take time to build, but with the right rehabilitation, repetition, and determination, those new pathways become stronger.",
      },
      { type: "h3", text: "What Does Science Tell Us?" },
      {
        type: "p",
        text: "Doctors and therapists worldwide have discovered something encouraging. People recover best when rehabilitation is:",
      },
      {
        type: "list",
        items: [
          "Started as early as medically safe.",
          "Focused on meaningful daily activities.",
          "Repeated consistently.",
          "Supported by family.",
          "Tailored to the individual—not copied from someone else's treatment plan.",
        ],
      },
      {
        type: "p",
        text: "Recovery isn't about doing one magical exercise. It's about doing the right things, consistently, over time.",
      },
      { type: "h3", text: "Understanding the Recovery Journey" },
      {
        type: "p",
        text: '🌱 The First Month – "The Body Is Waking Up": This stage is about helping the brain reconnect with the body. Small improvements can be huge victories. A finger moves. A shoulder lifts. The patient sits without support.',
      },
      {
        type: "p",
        text: '🚶 Months 2–3 – "Learning Again": The brain starts adapting faster. Patients often improve in sitting balance, standing, walking with support, hand movements, speaking, and confidence. This is why regular therapy matters. The more meaningful practice the brain receives, the better it learns.',
      },
      {
        type: "p",
        text: '💪 Months 3–6 – "Building Independence": The focus changes from exercises to real life. Instead of simply lifting a leg, the goal becomes climbing stairs. Instead of squeezing a ball, the goal becomes holding a cup.',
      },
      {
        type: "p",
        text: '🌟 Beyond 6 Months – "Recovery Doesn\'t Have an Expiry Date": One of the biggest myths is: "Nothing improves after six months." Modern research says otherwise. Many people continue improving for months and even years with consistent rehabilitation, exercise, and an active lifestyle.',
      },
      { type: "h3", text: "The Emotional Side of Recovery" },
      {
        type: "p",
        text: "Recovery isn't only physical. There will be good days. There will be frustrating days. Some mornings will feel full of hope. Some days may feel discouraging. That is completely normal. One of the strongest medicines in rehabilitation isn't found in a tablet. It's encouragement.",
      },
      { type: "h3", text: "The Most Important Message" },
      {
        type: "p",
        text: "A stroke changes life. It does not end it. Science continues to prove that the human brain has an incredible ability to adapt, learn, and recover. Every small victory is evidence that hope and rehabilitation can work together.",
      },
    ],
  },
  {
    id: "2",
    title: "Tech Neck: Reversing Cervical Spine Compression",
    category: "pain",
    categoryLabel: "Pain Care",
    time: "7 min",
    excerpt:
      "Biomechanical analysis of cellular posture strain and simple exercises to alleviate headaches and upper back pain.",
    img: require("./assets/images/blog_neck.png"),
    accent: T.secondary,
    featured: false,
    emoji: "🦒",
    contentBlocks: [
      {
        type: "h2",
        text: "Reversing Cervical Spine Compression with Smart Rehabilitation",
      },
      {
        type: "p",
        text: '"Why does my neck pain keep coming back even after taking physiotherapy, painkillers, or getting temporary relief?" This is one of the most common questions in today\'s digital world.',
      },
      {
        type: "p",
        text: "You complete a therapy session. Your pain reduces. You feel fantastic. The next morning... The pain is back. Did the treatment fail? Not necessarily.",
      },
      {
        type: "p",
        text: "The real problem often isn't what happens during the one hour you spend in the clinic. It's what happens during the other 23 hours.",
      },
      { type: "h3", text: "Why It Matters" },
      {
        type: "p",
        text: "The average person now spends 6–10 hours every day looking down at a phone, laptop, or tablet. Your head weighs about 5 kg. When your neck bends forward, the force acting on your cervical spine increases dramatically.",
      },
      {
        type: "p",
        text: "Think of holding a 5 kg grocery bag close to your body—it feels manageable. Now stretch your arm straight out while holding the same bag. The weight hasn't changed. But it suddenly feels much heavier. Your neck experiences the same principle.",
      },
      {
        type: "p",
        text: "The further your head moves forward, the harder your muscles, joints, and discs have to work. Eventually, the body starts sending warning signals. That warning signal is pain.",
      },
      { type: "h3", text: "Current Scientific Evidence" },
      {
        type: "p",
        text: "Modern research shows that persistent neck pain is rarely caused by one single factor. Instead, it is usually a combination of:",
      },
      {
        type: "list",
        items: [
          "Prolonged poor posture.",
          "Reduced movement during the day.",
          "Weak deep neck muscles.",
          "Tight chest and shoulder muscles.",
          "Stress.",
          "Poor sleep.",
          "Lack of movement variety.",
        ],
      },
      {
        type: "p",
        text: 'Most "Tech Neck" problems respond well to education, exercise, movement correction, and consistent habits. There is no magical pillow. There is no magical chair. The magic lies in changing how you move throughout the day.',
      },
      { type: "h3", text: "Clinical Pearl" },
      {
        type: "p",
        text: "Pain relief is not the finish line. It is the beginning of recovery. The real goal is changing the habits that caused the pain in the first place. A successful rehabilitation program doesn't simply reduce symptoms. It changes movement behavior.",
      },
      { type: "h3", text: "MotionPlus Protocol" },
      {
        type: "p",
        text: "At MotionPlus, we believe rehabilitation doesn't end when the patient leaves the clinic. We follow a Clinic + Lifestyle + Technology approach.",
      },
      { type: "h3", text: "AI Insight – Closing the 23-Hour Gap" },
      {
        type: "p",
        text: "Traditional rehabilitation shows us what happens inside the clinic. The future of rehabilitation tells us what happens outside the clinic. Imagine a smart rehabilitation system that can detect prolonged forward-head posture and remind you to reset your posture before pain begins.",
      },
    ],
  },
  {
    id: "3",
    title: "Thoracic Alignment: Posture Tips for Ergonomic Desk Setups",
    category: "posture",
    categoryLabel: "Posture",
    time: "6 min",
    excerpt:
      "Quick cervical spine adjustments that relieve shoulder knots and neck stiffness during extended sitting.",
    img: require("./assets/images/blog_posture.png"),
    accent: T.teal,
    featured: false,
    emoji: "🦴",
    contentBlocks: [
      {
        type: "h2",
        text: "The Missing Link to Better Posture & an Ergonomic Desk Setup",
      },
      {
        type: "p",
        text: '"I sit with good posture... so why do I still have upper back, neck, or shoulder pain?"',
      },
      {
        type: "p",
        text: "Many people believe posture means \"sit straight.\" But your spine doesn't want to be frozen. It wants to move. The healthiest posture isn't the perfect posture. It's your next posture.",
      },
      { type: "h3", text: "Why It Matters" },
      {
        type: "p",
        text: "Your thoracic spine (the middle part of your back) is like the foundation of a building. If the foundation begins to lean, everything above it is forced to compensate. Your neck bends forward. Your shoulders round. Your lower back arches. Even your breathing becomes less efficient.",
      },
      { type: "h3", text: "Current Scientific Evidence (Made Simple)" },
      {
        type: "p",
        text: "Research shows that prolonged sitting alone isn't always the problem. The real issue is prolonged sitting without movement. Remaining in one position for hours can reduce thoracic mobility, increase muscle fatigue, and place extra stress on the neck and shoulders.",
      },
      { type: "h3", text: "Ergonomic Desk Setup Checklist" },
      {
        type: "list",
        items: [
          "Monitor at eye level.",
          "Screen about an arm's length away.",
          "Shoulders relaxed—not shrugged.",
          "Elbows close to the body at roughly 90°.",
          "Feet flat on the floor or a footrest.",
          "Lower back supported.",
          "Keyboard and mouse close enough that you don't reach forward.",
          "Stand, stretch, or walk every 30–45 minutes.",
        ],
      },
      { type: "h3", text: "Take-Home Message" },
      {
        type: "p",
        text: "Your spine isn't asking for perfection. It's asking for movement. Your chair isn't your treatment. Your desk isn't your therapist. And your posture isn't something to \"hold.\" It's something to manage dynamically throughout the day.",
      },
    ],
  },
  {
    id: "4",
    title: "ACL Recovery: Sports Physiotherapy Protocols for Fast Rehab",
    category: "sports",
    categoryLabel: "Sports",
    time: "10 min",
    excerpt:
      "Phased recovery timelines showing how professional athletes combine range-of-motion routines with progressive loading.",
    img: require("./assets/images/blog_sports.png"),
    accent: T.orange,
    featured: false,
    emoji: "🏃",
    contentBlocks: [
      {
        type: "h2",
        text: "How Smart Exercise Tracking Is Revolutionizing Rehabilitation",
      },
      {
        type: "p",
        text: '"I\'ve had my ACL surgery. My pain is reducing. I can walk. Do I really need months of rehabilitation?"',
      },
      {
        type: "p",
        text: "This is one of the biggest misconceptions after an ACL injury. Many people believe that once they can walk, the knee has fully recovered. But walking is only the beginning.",
      },
      { type: "h3", text: "Why It Matters" },
      {
        type: "p",
        text: "The Anterior Cruciate Ligament (ACL) is like the seatbelt of your knee. Imagine driving a car with a broken seatbelt. The car may still move. But when you suddenly brake or turn, you're no longer protected.",
      },
      {
        type: "p",
        text: "Similarly, after an ACL injury or reconstruction, your knee may look normal and even feel better—but internally, it is still rebuilding strength, stability, confidence, and movement control. Returning too early or skipping rehabilitation significantly increases the risk of re-injury.",
      },
      { type: "h3", text: "Current Scientific Evidence" },
      {
        type: "p",
        text: "Research has shown that successful ACL recovery depends on much more than surgery. The strongest predictors of a safe return to sport include restoring quadriceps and hamstring strength, improving balance and coordination, regaining movement confidence, and passing functional performance tests.",
      },
      {
        type: "p",
        text: "One of the biggest discoveries in sports rehabilitation is this: Time alone does not heal performance. You don't recover because eight months have passed. You recover because your body has met specific physical milestones.",
      },
      { type: "h3", text: "Clinical Pearl" },
      {
        type: "p",
        text: "Pain is not the best indicator of healing. Performance is. Many people become pain-free long before they become movement-ready. Modern rehabilitation focuses on measuring what your knee can do, not simply how it feels.",
      },
      { type: "h3", text: "Take-Home Message" },
      {
        type: "p",
        text: "Your new ACL isn't just healing. It's learning to trust your body again. Every squat. Every balance exercise. Every controlled jump. Every step. Every repetition teaches your brain and your body to work together with confidence.",
      },
    ],
  },
  {
    id: "5",
    title: "Ergonomics: Traditional Advice vs Modern Smart Technology",
    category: "posture",
    categoryLabel: "Posture",
    time: "5 min",
    excerpt:
      "Traditional ergonomics gives us the foundation, modern technology builds on it providing real-time tracking.",
    img: require("./assets/images/blog_posture.png"),
    accent: T.teal,
    featured: false,
    emoji: "🏢",
    contentBlocks: [
      { type: "h2", text: "Which One Actually Works?" },
      {
        type: "p",
        text: "Two colleagues joined the same company on the same day. Prathik had a premium ergonomic setup. An expensive chair. A standing desk. An ergonomic keyboard. A vertical mouse. A posture corrector. Everything looked perfect.",
      },
      {
        type: "p",
        text: "Arjun, on the other hand, had an ordinary office chair and a basic desk. Six months later... Surprisingly, both of them developed neck and back pain. Why?",
      },
      {
        type: "p",
        text: "Prathik believed buying ergonomic equipment automatically protected him. He rarely took breaks. He sat for hours in the same position. Arjun didn't own expensive equipment, but he also ignored movement, worked on a laptop with his head bent forward, and skipped exercise.",
      },
      {
        type: "p",
        text: "Ergonomics isn't about expensive equipment or perfect posture. It's about creating a work environment where your body can keep moving efficiently.",
      },
      { type: "h3", text: "Take-Home Message" },
      {
        type: "p",
        text: "Traditional ergonomics and modern technology are not competitors. They are partners.",
      },
      {
        type: "p",
        text: "Technology can tell you what is happening. A physiotherapist understands why it is happening. Technology can detect patterns. A physiotherapist interprets those patterns in the context of your body, lifestyle, goals, pain, and medical history.",
      },
    ],
  },
  {
    id: "6",
    title: "Does Tele-Rehabilitation Really Work?",
    category: "pain",
    categoryLabel: "Pain Care",
    time: "8 min",
    excerpt:
      "The Truth About Online Physiotherapy in the Age of AI and smart telehealth platforms.",
    img: require("./assets/images/blog_pain.png"),
    accent: T.secondary,
    featured: false,
    emoji: "💻",
    contentBlocks: [
      { type: "h2", text: "Can physiotherapy really be done online?" },
      {
        type: "p",
        text: '"Can physiotherapy really be done online, or do I always need to visit a clinic?"',
      },
      {
        type: "p",
        text: "The answer is surprisingly simple. Yes—for many conditions, tele-rehabilitation can be highly effective. But... Not for every patient. The future of rehabilitation isn't choosing between online and offline care. It's knowing which patient needs which approach, at which stage of recovery.",
      },
      { type: "h3", text: "Current Scientific Evidence (Made Simple)" },
      {
        type: "p",
        text: "Over the past decade, studies have shown that tele-rehabilitation can provide outcomes comparable to in-person rehabilitation for selected conditions, particularly when the program is well designed and patients are appropriately screened.",
      },
      {
        type: "list",
        items: [
          "Chronic neck pain.",
          "Chronic low back pain.",
          "Postural disorders.",
          "Knee osteoarthritis.",
          "Shoulder rehabilitation.",
          "Post-operative exercise progression (selected patients).",
          "Stroke rehabilitation follow-up and home exercise supervision.",
        ],
      },
      { type: "h3", text: "Clinical Pearl" },
      {
        type: "p",
        text: "The best rehabilitation program is the one the patient can consistently follow. A perfect exercise plan performed once a week is often less effective than a good program followed every day. Consistency beats complexity.",
      },
      { type: "h3", text: "Take-Home Message" },
      {
        type: "p",
        text: "Tele-rehabilitation is not the future because it replaces physiotherapists. It is the future because it extends the reach of physiotherapists. Technology removes distance. Artificial Intelligence improves measurement. Smart systems increase consistency.",
      },
    ],
  },
];

function StatBubble({ value, label }) {
  return (
    <View style={styles.hStatBubble}>
      <Text style={styles.hStatVal}>{value}</Text>
      <Text style={styles.hStatLbl}>{label}</Text>
    </View>
  );
}

function CategoryChip({ item, active, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.chip, active && styles.chipActive]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeaturedCard({ article, onPress }) {
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.featuredOuter, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={article.img}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View
          style={[
            styles.featuredHeaderColor,
            { backgroundColor: article.accent },
          ]}
        />
        <View style={styles.featuredBadgeRow}>
          <View style={styles.featuredLabel}>
            <Text style={styles.featuredLabelTxt}>★ CLINICAL REPORT</Text>
          </View>
          <View style={[styles.catBadge, { backgroundColor: article.accent }]}>
            <Text style={styles.catBadgeTxt}>
              {article.emoji} {article.categoryLabel.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.featuredBody}>
          <Text style={styles.featuredTitle}>{article.title}</Text>
          <Text style={styles.featuredExcerpt} numberOfLines={3}>
            {article.excerpt}
          </Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.metaTime}>
              📖 {article.time} read · Medically Reviewed
            </Text>
            <View style={[styles.readBtn, { backgroundColor: article.accent }]}>
              <Text style={styles.readBtnTxt}>Read Full Guide →</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ArticleCard({ article, onPress, delay = 0 }) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.gridCardWrap, { opacity, transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        style={styles.gridCard}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <Image
          source={article.img}
          style={styles.gridCardImg}
          resizeMode="cover"
        />
        <View style={styles.gridBody}>
          <View style={styles.gridHeaderRow}>
            <View
              style={[
                styles.catBadgeSmall,
                { backgroundColor: article.accent + "12" },
              ]}
            >
              <Text style={[styles.catBadgeTxtSm, { color: article.accent }]}>
                {article.emoji} {article.categoryLabel.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.gridTime}>📖 {article.time}</Text>
          </View>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.gridDesc} numberOfLines={2}>
            {article.excerpt}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BlogScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeCategory);

  const featured = filtered.find((a) => a.featured) ?? filtered[0];
  const listItems = filtered.filter((a) => a.id !== featured?.id);

  // Header parallax
  const headerScale = scrollY.interpolate({
    inputRange: [-80, 0],
    outputRange: [1.08, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── HEADER ── */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, transform: [{ scale: headerScale }] },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color={T.white} />
          </TouchableOpacity>
          <View style={styles.medCross}>
            <Text style={styles.medCrossText}>+</Text>
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerEyebrow}>MOTIONPHYSIO CLINIC</Text>
            <Text style={styles.headerTitle}>Physical Therapy</Text>
            <Text style={styles.headerTitleGold}>Insights & Research</Text>
            <Text style={styles.headerSub}>
              Clinically reviewed guidelines by medical specialists
            </Text>
          </View>

          <View style={styles.headerStatsCol}>
            <StatBubble value={String(ARTICLES.length)} label={"Guides"} />
            <StatBubble value={"6"} label={"Sectors"} />
            <StatBubble value={"8m"} label={"Avg Read"} />
          </View>
        </View>
      </Animated.View>

      {/* ── CATEGORY CHIPS ── */}
      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsList}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              item={cat}
              active={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── SCROLL CONTENT ── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Article count */}
        <Text style={styles.countLine}>
          Showing {filtered.length} expert publication
          {filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "all"
            ? ` in ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`
            : ""}
        </Text>

        {/* Featured */}
        {featured && (
          <FeaturedCard
            article={featured}
            onPress={() =>
              navigation.navigate("BlogDetail", { article: featured })
            }
          />
        )}

        {/* List of articles */}
        <View style={styles.listContainer}>
          {listItems.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => navigation.navigate("BlogDetail", { article })}
              delay={index * 60}
            />
          ))}
        </View>

        {/* Coming soon */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>🔬</Text>
          <Text style={styles.comingSoonTitle}>
            New Publications Pending Review
          </Text>
          <Text style={styles.comingSoonSub}>
            Our medical board approves new clinical guides weekly.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ─────────────────── STYLES ─────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  /* header */
  header: {
    backgroundColor: T.primary,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: T.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
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

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitleBox: { flex: 1, paddingRight: 10 },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: T.accent,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: T.white,
    lineHeight: 30,
  },
  headerTitleGold: {
    fontSize: 26,
    fontWeight: "900",
    color: T.accent,
    lineHeight: 30,
    marginBottom: 6,
  },
  headerSub: { fontSize: 11, color: "rgba(227,242,253,0.75)", lineHeight: 16 },
  headerStatsCol: { gap: 8, alignItems: "flex-end" },
  hStatBubble: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 64,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  hStatVal: { fontSize: 16, fontWeight: "900", color: T.white },
  hStatLbl: {
    fontSize: 9,
    color: "rgba(227,242,253,0.8)",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* chips */
  chipsWrap: { backgroundColor: T.bg, paddingVertical: 12 },
  chipsList: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  chipActive: { backgroundColor: T.primary, borderColor: T.primary },
  chipEmoji: { fontSize: 14 },
  chipTxt: { fontSize: 12, fontWeight: "700", color: T.muted },
  chipTxtActive: { color: T.white, fontWeight: "800" },

  /* scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 4, paddingHorizontal: 16 },
  countLine: {
    fontSize: 12,
    color: T.muted,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  /* featured */
  featuredOuter: { marginBottom: 16 },
  featuredCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: T.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: T.border,
  },
  featuredImage: {
    width: "100%",
    height: 155,
  },
  featuredHeaderColor: {
    height: 4,
  },
  featuredBadgeRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredLabel: {
    backgroundColor: T.light,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(10,77,166,0.15)",
  },
  featuredLabelTxt: {
    fontSize: 10,
    fontWeight: "850",
    color: T.primary,
    letterSpacing: 1,
  },
  catBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catBadgeTxt: {
    fontSize: 9,
    fontWeight: "900",
    color: T.white,
    letterSpacing: 0.8,
  },
  featuredBody: { padding: 16 },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: T.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  featuredExcerpt: {
    fontSize: 13,
    color: T.muted,
    lineHeight: 20,
    marginBottom: 14,
  },
  featuredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  metaTime: { fontSize: 12, color: T.muted, fontWeight: "500" },
  readBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  readBtnTxt: { fontSize: 12, fontWeight: "800", color: T.white },

  /* list */
  listContainer: {
    gap: 12,
  },
  gridCardWrap: { width: "100%" },
  gridCard: {
    backgroundColor: T.white,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: T.border,
  },
  gridCardImg: {
    width: 90,
    height: "100%",
  },
  gridBody: { padding: 14, flex: 1 },
  gridHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catBadgeSmall: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catBadgeTxtSm: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  gridTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: T.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  gridDesc: { fontSize: 12, color: T.muted, lineHeight: 18, marginBottom: 8 },
  gridTime: { fontSize: 11, color: T.muted, fontWeight: "550" },

  /* coming soon */
  comingSoon: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: T.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: T.border,
    borderStyle: "dashed",
    marginTop: 20,
  },
  comingSoonIcon: { fontSize: 32, marginBottom: 8 },
  comingSoonTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: T.text,
    marginBottom: 4,
  },
  comingSoonSub: {
    fontSize: 12,
    color: T.muted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
