import { useAtom } from 'jotai';
import { elderlyModeAtom } from '@/store/elderlyModeAtom';
import { Spacing } from '@/constants/theme';

interface ElderlySpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  section: number;
}

interface ElderlyFontSizes {
  small: number;
  base: number;
  medium: number;
  large: number;
  xl: number;
  xxl: number;
  title: number;
}

export const useElderlyMode = () => {
  const [isElderly] = useAtom(elderlyModeAtom);

  const elderlySpacing: ElderlySpacing = isElderly
    ? {
        xs: Spacing.xs + 4,
        sm: Spacing.sm + 4,
        md: Spacing.md + 4,
        lg: Spacing.lg + 4,
        xl: Spacing.xl + 6,
        xxl: Spacing.xxl + 8,
        xxxl: Spacing.xxxl + 12,
        section: Spacing.section + 16,
      }
    : Spacing;

  const elderlyFontSizes: ElderlyFontSizes = isElderly
    ? {
        small: 14,
        base: 16,
        medium: 18,
        large: 20,
        xl: 24,
        xxl: 28,
        title: 32,
      }
    : {
        small: 12,
        base: 13,
        medium: 14,
        large: 15,
        xl: 16,
        xxl: 18,
        title: 24,
      };

  const getButtonHeight = () => (isElderly ? 60 : 54);
  const getIconSize = () => (isElderly ? 24 : 20);
  const getPressableMinSize = () => (isElderly ? 56 : 44);

  return {
    isElderly,
    spacing: elderlySpacing,
    fontSize: elderlyFontSizes,
    getButtonHeight,
    getIconSize,
    getPressableMinSize,
  };
};
