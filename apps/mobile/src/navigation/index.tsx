import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, Animated } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Shared Screens
import { MarketplaceScreen } from '../screens/shared/MarketplaceScreen';
import { TalentProfileScreen } from '../screens/shared/TalentProfileScreen';
import { CastingCallsScreen } from '../screens/shared/CastingCallsScreen';

// Talent Screens
import { TalentDashboardScreen } from '../screens/talent/TalentDashboardScreen';
import { EditProfileScreen } from '../screens/talent/EditProfileScreen';
import { UploadMediaScreen } from '../screens/talent/UploadMediaScreen';

// Casting Screens
import { CastingDashboardScreen } from '../screens/casting/CastingDashboardScreen';
import { SavedTalentsScreen } from '../screens/casting/SavedTalentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TalentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F1F5F9',
          height: 60,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', paddingBottom: 4 },
      }}
    >
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CastingCalls"
        component={CastingCallsScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={TalentDashboardScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function CastingTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F1F5F9',
          height: 60,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', paddingBottom: 4 },
      }}
    >
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Talents',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🎭</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedTalentsScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>❤️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyCalls"
        component={CastingDashboardScreen}
        options={{
          tabBarLabel: 'My Calls',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📋</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading, user, hydrate } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.brand[800],
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎬</Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: -0.5,
          }}
        >
          talentCasting
        </Text>
        <Text style={{ fontSize: 13, color: colors.brand[300], marginTop: 4 }}>
          Find your stage
        </Text>
        <ActivityIndicator
          size="large"
          color={colors.brand[300]}
          style={{ marginTop: 32 }}
        />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={user?.role === 'casting' ? CastingTabs : TalentTabs}
              />
              <Stack.Screen
                name="TalentProfile"
                component={TalentProfileScreen}
                options={{ headerShown: true, title: '' }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: true, title: 'Edit Profile' }}
              />
              <Stack.Screen
                name="UploadMedia"
                component={UploadMediaScreen}
                options={{ headerShown: true, title: 'Photos & Videos' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}
