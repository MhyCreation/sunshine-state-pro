import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon(name: IoniconsName, outlineName: IoniconsName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? name : outlineName} size={size} color={color} />
  );
}

function BlurTabBar(props: any) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        {props.children}
      </BlurView>
    );
  }
  return props.children;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#0f1520',
          borderTopColor: '#1e2840',
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarBackground: Platform.OS === 'ios'
          ? () => <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          : undefined,
        tabBarActiveTintColor: '#f5c842',
        tabBarInactiveTintColor: '#3a4260',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Lobby', tabBarIcon: TabIcon('grid', 'grid-outline') }} />
      <Tabs.Screen name="games" options={{ title: 'Games', tabBarIcon: TabIcon('game-controller', 'game-controller-outline') }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: TabIcon('wallet', 'wallet-outline') }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: TabIcon('bag', 'bag-outline') }} />
    </Tabs>
  );
}
