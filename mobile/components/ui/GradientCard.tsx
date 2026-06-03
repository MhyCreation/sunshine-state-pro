import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  glow?: boolean;
  variant?: 'default' | 'gold' | 'felt' | 'elevated';
}

const GRADIENTS = {
  default:  ['#141b2d', '#0d1321'] as [string, string],
  elevated: ['#1a2340', '#0f1520'] as [string, string],
  gold:     ['#1e1a0a', '#12100a'] as [string, string],
  felt:     ['#0e2a0e', '#071407'] as [string, string],
};

export function GradientCard({ children, style, innerStyle, glow = false, variant = 'default' }: Props) {
  return (
    <View style={[s.wrapper, glow && s.glow, style]}>
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.gradient, innerStyle]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2840',
    overflow: 'hidden',
  },
  gradient: { flex: 1 },
  glow: {
    borderColor: 'rgba(245,200,66,0.35)',
    shadowColor: '#f5c842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});
