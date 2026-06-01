import * as Haptics from 'expo-haptics';
import { Pressable, ViewStyle } from 'react-native';

interface HapticTabProps {
  onPress?: () => void;
  onPressIn?: (ev: any) => void;
  onPressOut?: (ev: any) => void;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  [key: string]: any;
}

export function HapticTab(props: HapticTabProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
