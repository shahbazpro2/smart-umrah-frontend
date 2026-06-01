interface RitualData {
  _id: string;
  key: string;
  sequence: number;
  translations: {
    [lang: string]: {
      title: string;
      description: string;
      tips: string[];
      commonMistakes: string[];
    };
  };
}

interface MistakeGuideData {
  _id: string;
  ritualKey: string;
  severity: string;
  translations: {
    [lang: string]: {
      title: string;
      commonMistakes: Array<{
        mistake: string;
        impact: string;
        prevention: string;
      }>;
    };
  };
}

interface Answer {
  type: 'ritual' | 'mistake' | 'tip' | 'warning' | 'general';
  title: string;
  content: string[];
  source?: string;
  confidence: number;
}

const KEYWORDS = {
  ritual: ['step', 'ritual', 'process', 'how', 'perform', 'do', 'complete'],
  mistake: ['mistake', 'wrong', 'error', 'avoid', 'should not', 'don\'t', 'cannot'],
  safety: ['safety', 'warning', 'caution', 'health', 'risk', 'danger'],
  elderly: ['elderly', 'old', 'senior', 'age', 'difficulty', 'modification', 'alternative'],
  tawaf: ['tawaf', 'circle', 'kaaba', 'rounds', 'circumambulate'],
  safar: ['safar', 'ihram', 'travel', 'journey', 'miqat'],
  sai: ['sai', 'safa', 'marwah', 'walk', 'between hills'],
  dua: ['dua', 'prayer', 'supplication', 'ask', 'pray'],
};

export const nlpService = {
  extractKeywords: (question: string): string[] => {
    const lower = question.toLowerCase();
    const keywords: string[] = [];

    Object.entries(KEYWORDS).forEach(([category, words]) => {
      words.forEach((word) => {
        if (lower.includes(word)) {
          keywords.push(category);
        }
      });
    });

    return [...new Set(keywords)];
  },

  searchRituals: (question: string, rituals: RitualData[], language: string = 'en'): Answer | null => {
    const lower = question.toLowerCase();
    const keywords = nlpService.extractKeywords(question);

    let bestMatch: (RitualData & { relevance: number }) | null = null;
    let maxRelevance = 0;

    rituals.forEach((ritual) => {
      const ritualTitle = ritual.translations[language]?.title.toLowerCase() || '';
      const ritualDesc = ritual.translations[language]?.description.toLowerCase() || '';
      let relevance = 0;

      if (lower.includes(ritualTitle)) relevance += 3;
      if (lower.includes(ritual.key)) relevance += 2;
      if (ritualTitle.includes(lower)) relevance += 2;

      keywords.forEach((keyword) => {
        if (ritual.key.includes(keyword) || ritualTitle.includes(keyword)) {
          relevance += 1;
        }
      });

      if (relevance > maxRelevance) {
        maxRelevance = relevance;
        bestMatch = { ...ritual, relevance };
      }
    });

    if (bestMatch && maxRelevance > 0) {
      const translation = bestMatch.translations[language];
      return {
        type: 'ritual',
        title: `Step ${bestMatch.sequence}: ${translation.title}`,
        content: [
          translation.description,
          ...translation.tips.slice(0, 2),
        ],
        source: bestMatch.key,
        confidence: Math.min(maxRelevance / 3, 1),
      };
    }

    return null;
  },

  searchMistakes: (question: string, mistakes: MistakeGuideData[], language: string = 'en'): Answer | null => {
    const lower = question.toLowerCase();
    const keywords = nlpService.extractKeywords(question);

    if (!keywords.includes('mistake')) {
      return null;
    }

    let bestMatch: (MistakeGuideData & { relevance: number }) | null = null;
    let maxRelevance = 0;

    mistakes.forEach((mistake) => {
      const mistakeTitle = mistake.translations[language]?.title.toLowerCase() || '';
      let relevance = 0;

      if (lower.includes(mistakeTitle)) relevance += 3;
      if (mistakeTitle.includes(lower)) relevance += 2;

      if (lower.includes(mistake.ritualKey)) relevance += 1;

      if (relevance > maxRelevance) {
        maxRelevance = relevance;
        bestMatch = { ...mistake, relevance };
      }
    });

    if (bestMatch && maxRelevance > 0) {
      const translation = bestMatch.translations[language];
      const mistakes_list = translation.commonMistakes.slice(0, 2);
      const content = mistakes_list.map(
        (m) => `❌ ${m.mistake}\n💡 Prevention: ${m.prevention}`
      );

      return {
        type: 'mistake',
        title: translation.title,
        content,
        source: bestMatch.ritualKey,
        confidence: Math.min(maxRelevance / 3, 1),
      };
    }

    return null;
  },

  generateAnswer: (
    question: string,
    rituals: RitualData[],
    mistakes: MistakeGuideData[],
    language: string = 'en'
  ): Answer => {
    const mistakeAnswer = nlpService.searchMistakes(question, mistakes, language);
    if (mistakeAnswer && mistakeAnswer.confidence > 0.5) {
      return mistakeAnswer;
    }

    const ritualAnswer = nlpService.searchRituals(question, rituals, language);
    if (ritualAnswer && ritualAnswer.confidence > 0.5) {
      return ritualAnswer;
    }

    // Fallback response
    return {
      type: 'general',
      title: 'How can I help?',
      content: [
        'I can answer questions about:',
        '• Umrah ritual steps and procedures',
        '• Common mistakes to avoid',
        '• Elderly pilgrim modifications',
        '• Health and safety guidelines',
      ],
      confidence: 0,
    };
  },
};
