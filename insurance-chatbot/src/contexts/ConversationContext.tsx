"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  ConversationState,
  ConversationAction,
  ConversationContextType,
  CollectedData,
  Message,
  Question,
  QuestionnaireSection,
} from "@/types/conversation";
import { getQuestionnaire, shouldShowQuestion } from "@/data/questionnaire";

// Initial state
const createInitialState = (): ConversationState => ({
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  messages: [],
  collectedData: {
    personal: {},
    financial: {},
    insurance: {},
    preferences: {},
  },
  currentSection: null,
  currentQuestion: null,
  completedSections: [],
  progress: 0,
  isComplete: false,
  questionnaire: getQuestionnaire(),
  startTime: new Date(),
  lastActivity: new Date(),
  userContext: undefined,
});

// Reducer function
const conversationReducer = (
  state: ConversationState,
  action: ConversationAction
): ConversationState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload as Message],
        lastActivity: new Date(),
      };

    case "UPDATE_DATA":
      const { category, field, value } = action.payload as {
        category: keyof CollectedData;
        field: string;
        value: string | number | boolean | object | string[];
      };
      return {
        ...state,
        collectedData: {
          ...state.collectedData,
          [category]: {
            ...state.collectedData[category],
            [field]: value,
          },
        },
        lastActivity: new Date(),
      };

    case "SET_CURRENT_SECTION":
      return {
        ...state,
        currentSection: action.payload as string,
        lastActivity: new Date(),
      };

    case "SET_CURRENT_QUESTION":
      return {
        ...state,
        currentQuestion: action.payload as string,
        lastActivity: new Date(),
      };

    case "COMPLETE_SECTION":
      const sectionId = action.payload as string;
      const updatedQuestionnaire = state.questionnaire.map((section) =>
        section.id === sectionId ? { ...section, isComplete: true } : section
      );

      return {
        ...state,
        completedSections: [...state.completedSections, sectionId],
        questionnaire: updatedQuestionnaire,
        lastActivity: new Date(),
      };

    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: action.payload as number,
        lastActivity: new Date(),
      };

    case "COMPLETE_CONVERSATION":
      return {
        ...state,
        isComplete: true,
        progress: 100,
        lastActivity: new Date(),
      };

    case "RESET_CONVERSATION":
      return createInitialState();

    case "LOAD_QUESTIONNAIRE":
      return {
        ...state,
        questionnaire: action.payload as QuestionnaireSection[],
        lastActivity: new Date(),
      };

    case "UPDATE_ACTIVITY":
      return {
        ...state,
        lastActivity: new Date(),
      };

    default:
      return state;
  }
};

// Create context
const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

// Provider component
interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    conversationReducer,
    createInitialState()
  );

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("conversationState");
      if (savedState) {
        const parsedState = JSON.parse(
          savedState
        ) as Partial<ConversationState>;

        // Validate the saved state structure
        if (
          parsedState.sessionId &&
          parsedState.messages &&
          parsedState.collectedData
        ) {
          // Convert date strings back to Date objects
          if (parsedState.startTime)
            parsedState.startTime = new Date(parsedState.startTime);
          if (parsedState.lastActivity)
            parsedState.lastActivity = new Date(parsedState.lastActivity);
          if (parsedState.messages) {
            parsedState.messages = parsedState.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          }

          // Restore state
          Object.entries(parsedState).forEach(([key, value]) => {
            if (key !== "questionnaire") {
              // Don't restore questionnaire from storage
              dispatch({
                type: "UPDATE_DATA",
                payload: { category: key, field: "", value },
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(
        "Error loading conversation state from localStorage:",
        error
      );
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      const stateToSave = {
        ...state,
        // Don't save the questionnaire structure to localStorage
        questionnaire: undefined,
      };
      localStorage.setItem("conversationState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving conversation state to localStorage:", error);
    }
  }, [state]);

  // Helper functions
  const addMessage = (
    role: "user" | "assistant" | "system",
    content: string
  ) => {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };
    dispatch({ type: "ADD_MESSAGE", payload: message });
  };

  const updateData = (
    category: keyof CollectedData,
    field: string,
    value: string | number | boolean | object | string[]
  ) => {
    dispatch({ type: "UPDATE_DATA", payload: { category, field, value } });

    // Calculate and update progress after data update
    setTimeout(() => {
      const newProgress = calculateProgress();
      dispatch({ type: "UPDATE_PROGRESS", payload: newProgress });

      // Check if conversation is complete
      if (newProgress >= 90) {
        dispatch({ type: "COMPLETE_CONVERSATION" });
      }
    }, 100);
  };

  const setCurrentSection = (sectionId: string) => {
    dispatch({ type: "SET_CURRENT_SECTION", payload: sectionId });
  };

  const setCurrentQuestion = (questionId: string) => {
    dispatch({ type: "SET_CURRENT_QUESTION", payload: questionId });
  };

  const completeSection = (sectionId: string) => {
    dispatch({ type: "COMPLETE_SECTION", payload: sectionId });

    // Calculate new progress
    const newProgress = calculateProgress();
    dispatch({ type: "UPDATE_PROGRESS", payload: newProgress });

    // Check if conversation is complete
    if (newProgress >= 100) {
      dispatch({ type: "COMPLETE_CONVERSATION" });
    }
  };

  const calculateProgress = (): number => {
    // Count total answered questions across all categories
    const personalAnswers = Object.keys(state.collectedData.personal).length;
    const financialAnswers = Object.keys(state.collectedData.financial).length;
    const insuranceAnswers = Object.keys(state.collectedData.insurance).length;
    const preferencesAnswers = Object.keys(
      state.collectedData.preferences
    ).length;

    const totalAnswered =
      personalAnswers +
      financialAnswers +
      insuranceAnswers +
      preferencesAnswers;

    // Estimate total questions needed (can be adjusted)
    const estimatedTotalQuestions = 10; // Basic fact-find questions

    const progress = Math.min(
      Math.round((totalAnswered / estimatedTotalQuestions) * 100),
      100
    );

    console.log(
      `Progress calculation: ${totalAnswered}/${estimatedTotalQuestions} = ${progress}%`
    );

    return progress;
  };

  const getNextQuestion = (): Question | null => {
    // Find the first incomplete section
    const incompleteSection = state.questionnaire.find(
      (section) => !section.isComplete
    );
    if (!incompleteSection) return null;

    // Find the first unanswered question in that section that should be shown
    const unansweredQuestion = incompleteSection.questions.find(
      (question) =>
        !isQuestionAnswered(question.id) &&
        shouldShowQuestion(question.id, state.collectedData)
    );

    return unansweredQuestion || null;
  };

  const getCurrentSection = (): QuestionnaireSection | null => {
    if (!state.currentSection) return null;
    return (
      state.questionnaire.find(
        (section) => section.id === state.currentSection
      ) || null
    );
  };

  const isQuestionAnswered = (questionId: string): boolean => {
    // Check if the question has been answered by looking through collected data
    const question = state.questionnaire
      .flatMap((section) => section.questions)
      .find((q) => q.id === questionId);

    if (!question) return false;

    const categoryData =
      state.collectedData[question.category as keyof CollectedData];
    return categoryData && categoryData[questionId] !== undefined;
  };

  const resetConversation = () => {
    localStorage.removeItem("conversationState");
    dispatch({ type: "RESET_CONVERSATION" });
  };

  const contextValue: ConversationContextType = {
    state,
    dispatch,
    addMessage,
    updateData,
    setCurrentSection,
    setCurrentQuestion,
    completeSection,
    calculateProgress,
    getNextQuestion,
    getCurrentSection,
    isQuestionAnswered,
    resetConversation,
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};

// Custom hook to use the conversation context
export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
};
