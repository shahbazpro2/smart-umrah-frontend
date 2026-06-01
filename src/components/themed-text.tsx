import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useElderlyMode } from '@/hooks/useElderlyMode';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { isElderly } = useElderlyMode();
  const fontSizeAdjustment = isElderly ? 3 : 0;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? { ...styles.default, fontSize: styles.default.fontSize + fontSizeAdjustment } : undefined,
        type === 'title' ? { ...styles.title, fontSize: styles.title.fontSize + fontSizeAdjustment } : undefined,
        type === 'defaultSemiBold' ? { ...styles.defaultSemiBold, fontSize: styles.defaultSemiBold.fontSize + fontSizeAdjustment } : undefined,
        type === 'subtitle' ? { ...styles.subtitle, fontSize: styles.subtitle.fontSize + fontSizeAdjustment } : undefined,
        type === 'link' ? { ...styles.link, fontSize: styles.link.fontSize + fontSizeAdjustment } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
