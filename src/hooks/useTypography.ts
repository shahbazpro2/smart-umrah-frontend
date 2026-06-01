import { useAtom } from 'jotai';
import { elderlyModeAtom } from '@/store/elderlyModeAtom';
import { Typography } from '@/constants/theme';

export interface AdjustedTypography {
  display: { fontSize: number; fontWeight: '800'; letterSpacing: number };
  headline: { fontSize: number; fontWeight: '800'; letterSpacing: number };
  section: { fontSize: number; fontWeight: '700'; letterSpacing: number };
  subhead: { fontSize: number; fontWeight: '700'; letterSpacing: number };
  body: { fontSize: number; fontWeight: '400'; letterSpacing: number };
  bodyMedium: { fontSize: number; fontWeight: '500'; letterSpacing: number };
  small: { fontSize: number; fontWeight: '400'; letterSpacing: number };
  caption: { fontSize: number; fontWeight: '400'; letterSpacing: number };
  overline: { fontSize: number; fontWeight: '600'; letterSpacing: number; textTransform: 'uppercase' };
}

/**
 * Global typography hook that adjusts font sizes based on elderly mode
 * When elderly mode is on, all text sizes increase by a consistent amount
 */
export const useTypography = (): AdjustedTypography => {
  const [isElderly] = useAtom(elderlyModeAtom);

  const getSizeAdjustment = () => (isElderly ? 3 : 0);
  const adjustment = getSizeAdjustment();

  return {
    display: {
      fontSize: Typography.display.fontSize + adjustment,
      fontWeight: Typography.display.fontWeight,
      letterSpacing: Typography.display.letterSpacing,
    },
    headline: {
      fontSize: Typography.headline.fontSize + adjustment,
      fontWeight: Typography.headline.fontWeight,
      letterSpacing: Typography.headline.letterSpacing,
    },
    section: {
      fontSize: Typography.section.fontSize + adjustment,
      fontWeight: Typography.section.fontWeight,
      letterSpacing: Typography.section.letterSpacing,
    },
    subhead: {
      fontSize: Typography.subhead.fontSize + adjustment,
      fontWeight: Typography.subhead.fontWeight,
      letterSpacing: Typography.subhead.letterSpacing,
    },
    body: {
      fontSize: Typography.body.fontSize + adjustment,
      fontWeight: Typography.body.fontWeight,
      letterSpacing: Typography.body.letterSpacing,
    },
    bodyMedium: {
      fontSize: Typography.bodyMedium.fontSize + adjustment,
      fontWeight: Typography.bodyMedium.fontWeight,
      letterSpacing: Typography.bodyMedium.letterSpacing,
    },
    small: {
      fontSize: Typography.small.fontSize + adjustment,
      fontWeight: Typography.small.fontWeight,
      letterSpacing: Typography.small.letterSpacing,
    },
    caption: {
      fontSize: Typography.caption.fontSize + adjustment,
      fontWeight: Typography.caption.fontWeight,
      letterSpacing: Typography.caption.letterSpacing,
    },
    overline: {
      fontSize: Typography.overline.fontSize + adjustment,
      fontWeight: Typography.overline.fontWeight,
      letterSpacing: Typography.overline.letterSpacing,
      textTransform: 'uppercase' as const,
    },
  };
};
