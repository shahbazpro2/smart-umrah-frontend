import { useElderlyMode } from './useElderlyMode';

/**
 * Hook for getting adaptive text sizes based on elderly mode
 * Use this in all Text components for consistent sizing
 *
 * Example:
 * const { h1, body, caption } = useAdaptiveText();
 * <Text style={{ fontSize: body }}>Text content</Text>
 */
export const useAdaptiveText = () => {
  const { isElderly } = useElderlyMode();
  const adjustment = isElderly ? 3 : 0;

  return {
    // Display sizes
    display: 72 + adjustment,
    headline: 60 + adjustment,

    // Section sizes
    h1: 32 + adjustment,      // Page titles
    h2: 24 + adjustment,      // Section titles
    h3: 20 + adjustment,      // Subsection titles
    h4: 18 + adjustment,      // Card titles
    h5: 16 + adjustment,      // Subtitle

    // Body sizes
    body: 15 + adjustment,    // Main body text
    bodyMedium: 15 + adjustment,
    bodySmall: 14 + adjustment,

    // Small sizes
    label: 13 + adjustment,   // Labels, descriptions
    small: 13 + adjustment,
    caption: 12 + adjustment, // Captions, helper text
    tiny: 11 + adjustment,    // Mini labels

    // Utilities
    buttonText: 16 + adjustment,
    tabLabel: 12 + adjustment,
    badge: 11 + adjustment,
  };
};
