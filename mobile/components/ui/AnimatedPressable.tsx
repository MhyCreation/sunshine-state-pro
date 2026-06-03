import { useRef } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: 'light' | 'medium' | 'selection' | 'none';
  scaleDown?: number;
}

export function AnimatedPressable({
  children, onPress, style, haptic = 'light', scaleDown = 0.96, disabled, ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: scaleDown, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  }

  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 5 }).start();
  }

  function press(e: any) {
    if (haptic !== 'none' && !disabled) {
      if (haptic === 'selection') Haptics.selectionAsync();
      else if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  }

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={press}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
