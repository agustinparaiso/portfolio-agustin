import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AnswerMap = Record<string, any>;

type State = {
  sessionId?: string;
  answers: AnswerMap;
  currentStep: number;
  setSessionId: (id: string) => void;
  setAnswer: (key: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
};

export const useQuizStore = create<State>()(
  persist(
    (set) => ({
      sessionId: undefined,
      answers: {},
      currentStep: 1,
      setSessionId: (id) => set({ sessionId: id }),
      setAnswer: (key, value) => set((state) => ({ answers: { ...state.answers, [key]: value } })),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      reset: () => set({ answers: {}, currentStep: 1, sessionId: undefined })
    }),
    {
      name: "fitnutricion-quiz",
      skipHydration: true,
      partialize: (state) => ({
        sessionId: state.sessionId,
        answers: state.answers,
        currentStep: state.currentStep
      })
    }
  )
);
