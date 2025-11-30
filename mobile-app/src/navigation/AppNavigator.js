import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, ROLES } from '../utils/constants'

// Screens
import HomeScreen from '../screens/HomeScreen'
import MapScreen from '../screens/MapScreen'
import ComplaintScreen from '../screens/ComplaintScreen'
import SosScreen from '../screens/SosScreen'
import GovAlertsScreen from '../screens/GovAlertsScreen'
import SensorsScreen from '../screens/SensorsScreen'
import SensorDetailScreen from '../screens/SensorDetailScreen'
import AlertsScreen from '../screens/AlertsScreen'
import TasksScreen from '../screens/TasksScreen'
import ProfileScreen from '../screens/ProfileScreen'
import MLPredictScreen from '../screens/MLPredictScreen'
import MLDetectScreen from '../screens/MLDetectScreen'
import MLForecastScreen from '../screens/MLForecastScreen'
import AdminScreen from '../screens/AdminScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  )
}

function MLStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
      }}
    >
      <Stack.Screen name="MLMain" component={MLPredictScreen} options={{ title: 'ML Predictions' }} />
      <Stack.Screen name="MLDetect" component={MLDetectScreen} options={{ title: 'Crack Detection' }} />
      <Stack.Screen name="MLForecast" component={MLForecastScreen} options={{ title: '72-Hour Forecast' }} />
    </Stack.Navigator>
  )
}

function SensorsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
      }}
    >
      <Stack.Screen name="SensorsList" component={SensorsScreen} options={{ title: 'Sensors' }} />
      <Stack.Screen name="SensorDetail" component={SensorDetailScreen} />
    </Stack.Navigator>
  )
}

export default function AppNavigator({ user, onLogout }) {
  const isAdmin = user?.role_name === ROLES.SITE_ADMIN || user?.role_name === ROLES.SUPER_ADMIN
  const isGov = user?.role_name === ROLES.GOV_AUTHORITY || user?.role_name === ROLES.SUPER_ADMIN

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline'
          } else if (route.name === 'Report') {
            iconName = focused ? 'camera' : 'camera-outline'
          } else if (route.name === 'SOS') {
            iconName = focused ? 'warning' : 'warning-outline'
          } else if (route.name === 'Sensors') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline'
          } else if (route.name === 'ML') {
            iconName = focused ? 'analytics' : 'analytics-outline'
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline'
          } else if (route.name === 'Advisories') {
            iconName = focused ? 'notifications' : 'notifications-outline'
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Report" component={ComplaintScreen} />
      <Tab.Screen name="SOS" component={SosScreen} />

      <Tab.Screen
        name="Sensors"
        component={SensorsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ML"
        component={MLStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      {
        isGov && (
          <Tab.Screen name="Advisories" component={GovAlertsScreen} />
        )
      }
      {
        user?.role_name === ROLES.SUPER_ADMIN && (
          <Tab.Screen
            name="Admin"
            component={AdminScreen}
            options={{
              headerRight: () => (
                <Ionicons
                  name="log-out-outline"
                  color={COLORS.danger}
                  size={24}
                  style={{ marginRight: 16 }}
                  onPress={onLogout}
                />
              ),
            }}
          />
        )
      }
    </Tab.Navigator >
  )
}
