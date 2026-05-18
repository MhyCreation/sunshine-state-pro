import { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
  fullWidth?: boolean;
}

const GOLD: [string, string] = ['#f7d35e', '#d4900a'];
const GOLD_DIM: [string, string] = ['#3a3020', '#2a2418'];

export function GoldButton({ label, onPress, disabled, loading, variant = 'gold', size = 'md', style, fullWidth }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 5 }).start();
  }
  function press() {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  }

  const pv = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const fs = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  const inner = loading
    ? <ActivityIndicator color={variant === 'gold' ? '#0f1117' : '#f5c842'} />
    : <Text style={[s.label, variant !== 'gold' && s.labelAlt, { fontSize: fs }]}>{label}</Text>;

  return (
    <Pressable
      onPressIn={pressIn} onPressOut={pressOut} onPress={press}
      disabled={disabled || loading}
      style={[fullWidth && { width: '100%' }]}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {variant === 'gold' ? (
          <LinearGradient
            colors={disabled ? GOLD_DIM : GOLD}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[s.base, { paddingVertical: pv, opacity: disabled ? 0.5 : 1 }]}
          >
            {inner}
          </LinearGradient>
        ) : (
          <Animated.View style={[
            s.base, { paddingVertical: pv },
            variant === 'outline' && s.outline,
            variant === 'ghost' && s.ghost,
            variant === 'danger' && s.danger,
            disabled && s.dim,
          ]}>
            {inner}
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  label: { color: '#0f1117', fontWeight: '700', letterSpacing: 0.3 },
  labelAlt: { color: '#fff' },
  outline: { borderWidth: 1.5, borderColor: 'rgba(245,200,66,0.5)', backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'rgba(255,255,255,0.06)' },
  danger: { backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#ef4444' },
  dim: { opacity: 0.45 },
});
