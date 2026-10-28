import {
  Answer,
  MistakeGuideData,
  nlpService,
  RitualData,
} from "@/services/nlp.service";
import { useCallback, useState } from "react";

export const useNLPAssistant = () => {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const askQuestion = useCallback(
    async (
      query: string,
      rituals: RitualData[],
      mistakes: MistakeGuideData[],
      language: string = "en",
    ) => {
      if (!query.trim()) {
        setAnswer(null);
        return;
      }

      setIsLoading(true);
      try {
        // Simulate processing time for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        const result = nlpService.generateAnswer(
          query,
          rituals,
          mistakes,
          language,
        );
        setAnswer(result);
        setQuestion(query);
      } catch (error) {
        console.error("[NLP] Error:", error);
        setAnswer({
          type: "general",
          title: "Error",
          content: ["Sorry, something went wrong. Please try again."],
          confidence: 0,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearAnswer = useCallback(() => {
    setAnswer(null);
    setQuestion("");
  }, []);

  return {
    answer,
    isLoading,
    question,
    askQuestion,
    clearAnswer,
  };
};
