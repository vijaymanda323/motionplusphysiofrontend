import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Existing imports
import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./login";
import SignUpScreen from "./SignUpScreen";
import ProfileSetup from "./ProfileSetup";
import HomeScreen from "./HomeScreen";
import PhysioConsult from "./PhysioConsult";

// New imports
import PainBingoScreen from "./PainBingoScreen";
import QuickReliefScreen from "./QuickReliefScreen";
import AboutYouScreen from "./AboutYouScreen";
import PainAreaScreen from "./PainArea";
import BlogScreen from "./BlogScreen";
import BlogDetailScreen from "./BlogDetailScreen";
import NearbySpecialistsScreen from "./NearbySpecialists";
import HardwareScanScreen from "./HardwareScanScreen";
import MuscleChallengeScreen from "./MuscleChallengeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />

        {/* Route for the Pain Bingo Screen (simplified route name recommended) */}
        <Stack.Screen name="PainBingo" component={PainBingoScreen} />

        {/* Route for the Quick Relief Screen */}
        <Stack.Screen name="QuickRelief" component={QuickReliefScreen} />

        <Stack.Screen name="HardwareScan" component={HardwareScanScreen} />
        <Stack.Screen
          name="MuscleChallenge"
          component={MuscleChallengeScreen}
        />

        <Stack.Screen name="AboutYou" component={AboutYouScreen} />
        <Stack.Screen name="PainArea" component={PainAreaScreen} />
        <Stack.Screen name="PhysioConsult" component={PhysioConsult} />
        <Stack.Screen name="Blog" component={BlogScreen} />
        <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
        <Stack.Screen
          name="NearbySpecialists"
          component={NearbySpecialistsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
