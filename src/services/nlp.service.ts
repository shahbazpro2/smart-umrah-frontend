export interface RitualData {
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

export interface MistakeGuideData {
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

export interface Answer {
  type: "ritual" | "mistake" | "tip" | "warning" | "general" | "dua" | "media";
  title: string;
  content: string[];
  source?: string;
  confidence: number;
  arabic?: string;
  transliteration?: string;
  relatedMediaId?: string;
}

// Comprehensive offline knowledge base for instant keyword queries
interface OfflineKnowledgeItem {
  keywords: string[];
  title: string;
  arabic?: string;
  transliteration?: string;
  type: Answer["type"];
  content: string[];
  source: string;
  relatedMediaId?: string;
}

const OFFLINE_KNOWLEDGE_BASE: OfflineKnowledgeItem[] = [
  {
    keywords: [
      "ihram",
      "ehram",
      "cloth",
      "sheets",
      "wear",
      "dress",
      "unstitched",
      "miqat",
    ],
    title: "Ihram: State of Purity & Sacred Dress",
    type: "ritual",
    source: "ihram",
    relatedMediaId: "video_how_to_wear_ihram",
    arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
    transliteration:
      "Labbayk Allahumma \'Umrah (Here I am, O Allah, for Umrah)",
    content: [
      "• Men wear two unstitched white towels/sheets (Izar around waist, Rida over shoulders). Women wear modest regular loose clothing with hijab (no face veil/gloves).",
      "• Must be entered before or at the Miqat boundary.",
      "• Make the Niyyah (intention) and begin reciting Talbiyah repeatedly.",
      "• Prohibitions: No perfume, no cutting hair or nails, no hunting, no marital intimacy.",
    ],
  },
  {
    keywords: [
      "talbiyah",
      "talbiah",
      "labbaik",
      "labaik",
      "recitation",
      "chant",
    ],
    title: "Talbiyah: The Sacred Call of the Pilgrim",
    type: "dua",
    source: "ihram",
    relatedMediaId: "audio_talbiyah_translation",
    arabic:
      "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لاَ شَرِيكَ لَكَ",
    transliteration:
      "Labbayk Allaahumma labbayk, labbayka laa shareeka laka labbayk...",
    content: [
      "• Sunnah to recite continuously from entering Ihram until the beginning of Tawaf.",
      "• Men raise their voices moderately; women recite quietly.",
      "• Meaning: 'Here I am, O Allah, here I am. You have no partner... All praise and grace belong to You.'",
    ],
  },
  {
    keywords: [
      "tawaf",
      "tawaaf",
      "kaaba",
      "circuits",
      "rounds",
      "circumambulate",
      "black stone",
      "hajar",
    ],
    title: "Tawaf al-Umrah: 7 Circuits around the Kaaba",
    type: "ritual",
    source: "tawaf",
    relatedMediaId: "img_tawaf_al_umrah",
    arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
    transliteration: "Bismillahi Allahu Akbar (Start of each round)",
    content: [
      "• Perform 7 complete circuits counter-clockwise around the Kaaba, keeping the Kaaba on your left.",
      "• Each round starts and ends aligned with the Black Stone (Hajar al-Aswad).",
      "• Men uncover right shoulder (Idtiba'a) during all 7 circuits and walk briskly (Raml) in the first 3 circuits.",
      "• Must remain in state of Wudu throughout Tawaf.",
      "• You must walk outside the Hateem (Hijr Ismail) as it is part of the Kaaba.",
    ],
  },
  {
    keywords: ["maqam", "ibrahim", "station", "rakat", "sunnah prayer"],
    title: "Prayer at Maqam-e-Ibrahim",
    type: "ritual",
    source: "maqam_ibrahim",
    relatedMediaId: "video_prayer_maqam_ibrahim",
    arabic: "وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى",
    transliteration: "Surah Kafirun (1st Rakat) & Surah Ikhlas (2nd Rakat)",
    content: [
      "• After completing 7 rounds of Tawaf, pray 2 Rakat Sunnah behind Maqam Ibrahim if possible.",
      "• If crowded, pray anywhere inside the Grand Mosque.",
      "• Recite Surah Al-Kafirun in the first unit and Surah Al-Ikhlas in the second unit.",
    ],
  },
  {
    keywords: ["zamzam", "water", "drink", "shifa", "cure", "well"],
    title: "Drinking Blessed Zamzam Water",
    type: "dua",
    source: "zamzam",
    relatedMediaId: "img_drinking_zamzam_dua",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ",
    transliteration:
      "Allaahumma innee as-aluka \'ilman naafi\'an, wa rizqan waasi\'an, wa shifaa-an min kulli daa\'",
    content: [
      "• After praying at Maqam Ibrahim, proceed to the Zamzam water taps.",
      "• Sunnah to drink while standing, facing the Qiblah (Kaaba).",
      "• Drink with the right hand and make heartfelt supplication for health, forgiveness, and guidance.",
      "• Pour some water gently over your head and face.",
    ],
  },
  {
    keywords: [
      "sai",
      "sa'i",
      "sayee",
      "safa",
      "marwa",
      "marwah",
      "hills",
      "walk",
      "green lights",
    ],
    title: "Sa'i: 7 Laps between Mount Safa & Mount Marwah",
    type: "ritual",
    source: "sai",
    relatedMediaId: "img_make_dua_at_safa",
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
    transliteration: "Innas-Safaa wal-Marwata min sha\'aa-irillaah",
    content: [
      "• 7 laps between the two hills. Lap 1: Safa to Marwah; Lap 2: Marwah to Safa... Lap 7 ends at Marwah.",
      "• Ascend Safa, face the Kaaba, raise hands and recite Takbeer & Dua 3 times.",
      "• Men jog/walk briskly between the two sets of green neon lights.",
      "• Wudu is recommended but not strictly mandatory for Sa'i if broken during the walk.",
    ],
  },
  {
    keywords: [
      "halq",
      "taqsir",
      "shave",
      "shaving",
      "hair",
      "haircut",
      "trim",
      "exit ihram",
    ],
    title: "Halq or Taqsir: Completing Umrah & Exiting Ihram",
    type: "ritual",
    source: "halq_taqsir",
    content: [
      "• Halq: Shaving the entire head with a razor (highly recommended for men; receives 3x Prophet's blessings).",
      "• Taqsir: Trimming hair equally from all sides (at least 1-2 cm).",
      "• Women: Cut a fingertip length (approx. 1 inch) from the ends of their hair in private.",
      "• Once hair is cut, your Umrah is complete and all Ihram restrictions are lifted!",
    ],
  },
  {
    keywords: [
      "mistake",
      "wrong",
      "error",
      "prohibited",
      "penalty",
      "dam",
      "sin",
      "invalid",
    ],
    title: "Common Umrah Mistakes to Avoid",
    type: "mistake",
    source: "mistakes",
    content: [
      "❌ Passing the Miqat without being in Ihram or without making Niyyah.",
      "❌ Applying scented soap, cologne, or perfume while in Ihram.",
      "❌ Men covering their heads with caps, towels, or umbrellas touching the head.",
      "❌ Walking inside the Hateem (semi-circle) during Tawaf (nullifies the round).",
      "❌ Counting a round from Safa to Marwa and back as 1 (Safa to Marwa is 1, Marwa to Safa is 2).",
      "❌ Cutting or trimming hair before fully completing the 7th lap of Sa'i.",
    ],
  },
  {
    keywords: [
      "elderly",
      "old",
      "senior",
      "wheelchair",
      "cart",
      "mobility",
      "tired",
      "health",
      "difficulty",
    ],
    title: "Elderly & Reduced Mobility Pilgrims Guidance",
    type: "tip",
    source: "elderly",
    content: [
      "• Authorized wheelchairs are available for Tawaf on the second floor and mezzanine.",
      "• Electric carts (golf carts) can be booked on the roof for Sa'i.",
      "• Elderly pilgrims are excused from Raml (brisk walking) and Idtiba'a if difficult.",
      "• Rest stations with air conditioning and cold Zamzam are available throughout the Haram.",
      "• A companion can push a wheelchair and both receive reward for the ritual.",
    ],
  },
  {
    keywords: [
      "dua",
      "duas",
      "supplication",
      "prayer",
      "first sight",
      "yamani",
      "entering haram",
    ],
    title: "Essential Umrah Duas Collection",
    type: "dua",
    source: "duas",
    relatedMediaId: "img_first_sight_kaaba",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbana aatina fid-dunya hasanatan wa fil-aakhirati hasanatan wa qina \'adhaaban-naar",
    content: [
      "1. Entering Haram: 'Allaahumm-aftah lee abwaaba rahmatik' (O Allah, open for me the gates of Your mercy).",
      "2. First sight of Kaaba: Stand calmly, raise hands, ask for forgiveness and whatever your heart desires.",
      "3. Between Yamani & Hajar al-Aswad: Recite 'Rabbana atina fid-dunya hasanatan...'",
      "4. On Mount Safa: Recite Ayat and Takbeer 3 times with personal Duas.",
    ],
  },
];

export const nlpService = {
  /**
   * Search offline knowledge base, rituals, and mistakes by free-form keywords
   */
  generateAnswer: (
    query: string,
    rituals: RitualData[] = [],
    mistakes: MistakeGuideData[] = [],
    language: string = "en",
  ): Answer => {
    if (!query || !query.trim()) {
      return {
        type: "general",
        title: "Umrah Assistant",
        content: ["Please enter a search keyword or question."],
        confidence: 0,
      };
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery
      .split(/[\s,?.!-]+/)
      .filter((t) => t.length > 1);

    // 1. Search the Offline Knowledge Base first
    let bestKnowledgeMatch: OfflineKnowledgeItem | null = null;
    let highestScore = 0;

    for (const item of OFFLINE_KNOWLEDGE_BASE) {
      let score = 0;
      for (const token of queryTokens) {
        for (const kw of item.keywords) {
          if (kw === token) score += 4;
          else if (kw.includes(token) || token.includes(kw)) score += 2;
        }
        if (item.title.toLowerCase().includes(token)) score += 3;
      }

      if (score > highestScore) {
        highestScore = score;
        bestKnowledgeMatch = item;
      }
    }

    // 2. Search Dynamic Rituals
    for (const ritual of rituals) {
      const ritualTitle =
        ritual.translations[language]?.title?.toLowerCase() || "";
      const ritualDesc =
        ritual.translations[language]?.description?.toLowerCase() || "";
      let rScore = 0;

      for (const token of queryTokens) {
        if (ritual.key?.toLowerCase().includes(token)) rScore += 3;
        if (ritualTitle.includes(token)) rScore += 3;
        if (ritualDesc.includes(token)) rScore += 1;
      }

      if (rScore > highestScore && rScore >= 3) {
        const tr = ritual.translations[language] || ritual.translations["en"];
        return {
          type: "ritual",
          title: `Step ${ritual.sequence}: ${tr.title}`,
          content: [tr.description, ...tr.tips.slice(0, 3)],
          source: ritual.key,
          confidence: Math.min(rScore / 4, 1),
        };
      }
    }

    // 3. Search Dynamic Mistake Guides
    if (
      cleanQuery.includes("mistake") ||
      cleanQuery.includes("avoid") ||
      cleanQuery.includes("wrong")
    ) {
      for (const mistake of mistakes) {
        const title =
          mistake.translations[language]?.title?.toLowerCase() || "";
        let mScore = 0;

        for (const token of queryTokens) {
          if (
            title.includes(token) ||
            mistake.ritualKey?.toLowerCase().includes(token)
          ) {
            mScore += 3;
          }
        }

        if (mScore > highestScore && mScore >= 3) {
          const tr =
            mistake.translations[language] || mistake.translations["en"];
          const content =
            tr.commonMistakes
              ?.slice(0, 3)
              .map(
                (m: any) => `❌ ${m.mistake}\n💡 Prevention: ${m.prevention}`,
              ) || [];
          return {
            type: "mistake",
            title: tr.title,
            content,
            source: mistake.ritualKey,
            confidence: Math.min(mScore / 4, 1),
          };
        }
      }
    }

    // Return best match from Knowledge Base if score is adequate
    if (bestKnowledgeMatch && highestScore > 0) {
      return {
        type: bestKnowledgeMatch.type,
        title: bestKnowledgeMatch.title,
        content: bestKnowledgeMatch.content,
        arabic: bestKnowledgeMatch.arabic,
        transliteration: bestKnowledgeMatch.transliteration,
        source: bestKnowledgeMatch.source,
        relatedMediaId: bestKnowledgeMatch.relatedMediaId,
        confidence: Math.min(highestScore / 4, 1),
      };
    }

    // Smart Fallback
    return {
      type: "general",
      title: "Query: " + query,
      content: [
        "We could not find an exact match for that specific term, but here are the key Umrah topics you can explore:",
        "• 'Ihram' - Rules, preparation, and entering the sacred state.",
        "• 'Talbiyah' - Recitation words, audio, and translation.",
        "• 'Tawaf' - 7 circuits, Black stone, and Wudu rules.",
        "• 'Zamzam' - Drinking etiquette and dua.",
        "• 'Sa'i' - Safa and Marwah 7 laps and supplications.",
        "• 'Halq' - Shaving and trimming hair to complete Umrah.",
        "• 'Mistakes' - Penalties, warnings, and how to avoid them.",
        "• 'Elderly' - Wheelchair and reduced mobility facilities.",
      ],
      confidence: 0.2,
    };
  },
};
