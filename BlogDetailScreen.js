import React, { useRef, useEffect } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";

const { width } = Dimensions.get("window");

const T = {
  primary: "#9E0A0A",
  secondary: "#C62828",
  accent: "#FFE500",
  teal: "#FF7043",
  light: "rgba(158, 10, 10, 0.08)",
  white: "#FFFFFF",
  dark: "#1A0202",
  bg: "#FFF5F5",
  card: "#FFFFFF",
  text: "#2E1010",
  muted: "#8B7575",
  border: "#F2E2E2",
};

export default function BlogDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { article } = route.params || {};

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  if (!article || !fontsLoaded) return null;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [280, 100],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const parseContent = (content) => {
    if (!content) return null;
    return content.map((block, index) => {
      if (block.type === "h2") {
        return (
          <Text key={index} style={styles.h2}>
            {block.text}
          </Text>
        );
      } else if (block.type === "h3") {
        return (
          <Text key={index} style={styles.h3}>
            {block.text}
          </Text>
        );
      } else if (block.type === "p") {
        return (
          <Text key={index} style={styles.p}>
            {block.text}
          </Text>
        );
      } else if (block.type === "list") {
        return (
          <View key={index} style={styles.listContainer}>
            {block.items.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        );
      }
      return null;
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, paddingTop: insets.top },
        ]}
      >
        <Animated.Image
          source={article.img}
          style={[styles.headerImage, { opacity: imageOpacity }]}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={T.white} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.titleContainer, { opacity: imageOpacity }]}
        >
          <View style={[styles.catBadge, { backgroundColor: article.accent }]}>
            <Text style={styles.catBadgeTxt}>
              {article.emoji} {article.categoryLabel.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.metaTime}>
            📖 {article.time} read · Medically Reviewed
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.excerpt}>{article.excerpt}</Text>
        <View style={styles.divider} />
        {parseContent(article.contentBlocks)}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    width: "100%",
    position: "relative",
    backgroundColor: T.primary,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  catBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  catBadgeTxt: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    color: T.white,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontFamily: "Outfit_800ExtraBold",
    color: T.white,
    lineHeight: 32,
    marginBottom: 8,
  },
  metaTime: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    color: "rgba(255,255,255,0.8)",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  excerpt: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: T.primary,
    lineHeight: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: T.border,
    marginBottom: 24,
  },
  h2: {
    fontSize: 22,
    fontFamily: "Outfit_800ExtraBold",
    color: T.text,
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    color: T.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  p: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: T.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  listContainer: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  listBullet: {
    fontSize: 15,
    fontFamily: "Outfit_700Bold",
    color: T.primary,
    marginRight: 8,
    lineHeight: 24,
  },
  listText: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: T.text,
    lineHeight: 24,
    flex: 1,
  },
});
