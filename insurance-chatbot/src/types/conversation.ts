// Conversation state management types

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isComplete: boolean;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  type: "text" | "select" | "multiselect" | "number" | "date" | "boolean";
  options?: string[];
  required: boolean;
  category: string;
  followUpQuestions?: string[];
}

export interface CollectedData {
  personal: {
    name?: string;
    age?: number;
    maritalStatus?: string;
    dependents?: number;
    occupation?: string;
    income?: number;
    location?: string;
    [key: string]: string | number | boolean | undefined;
  };
  financial: {
    assets?: {
      homeValue?: number;
      vehicleValue?: number;
      savings?: number;
      investments?: number;
    };
    liabilities?: {
      mortgage?: number;
      loans?: number;
      creditCardDebt?: number;
    };
    monthlyExpenses?: number;
    [key: string]: string | number | boolean | object | undefined;
  };
  insurance: {
    currentCoverage?: {
      auto?: boolean;
      home?: boolean;
      life?: boolean;
      health?: boolean;
      disability?: boolean;
    };
    providers?: string[];
    premiums?: {
      auto?: number;
      home?: number;
      life?: number;
      health?: number;
    };
    claimsHistory?: {
      auto?: number;
      home?: number;
      other?: number;
    };
    [key: string]: string | number | boolean | object | string[] | undefined;
  };
  preferences: {
    riskTolerance?: "low" | "medium" | "high";
    budgetRange?: {
      min: number;
      max: number;
    };
    priorities?: string[];
    communicationPreference?: "email" | "phone" | "text";
    [key: string]: string | number | boolean | object | string[] | undefined;
  };
  [key: string]: Record<
    string,
    string | number | boolean | object | string[] | undefined
  >;
}

export interface ConversationState {
  sessionId: string;
  messages: Message[];
  collectedData: CollectedData;
  currentSection: string | null;
  currentQuestion: string | null;
  completedSections: string[];
  progress: number; // 0-100
  isComplete: boolean;
  questionnaire: QuestionnaireSection[];
  startTime: Date;
  lastActivity: Date;
  userContext?: string;
}

export interface ConversationAction {
  type:
    | "ADD_MESSAGE"
    | "UPDATE_DATA"
    | "SET_CURRENT_SECTION"
    | "SET_CURRENT_QUESTION"
    | "COMPLETE_SECTION"
    | "UPDATE_PROGRESS"
    | "COMPLETE_CONVERSATION"
    | "RESET_CONVERSATION"
    | "LOAD_QUESTIONNAIRE"
    | "UPDATE_ACTIVITY";
  payload?: unknown;
}

export interface ConversationContextType {
  state: ConversationState;
  dispatch: React.Dispatch<ConversationAction>;
  addMessage: (role: "user" | "assistant" | "system", content: string) => void;
  updateData: (
    category: keyof CollectedData,
    field: string,
    value: string | number | boolean | object | string[]
  ) => void;
  setCurrentSection: (sectionId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  completeSection: (sectionId: string) => void;
  calculateProgress: () => number;
  getNextQuestion: () => Question | null;
  getCurrentSection: () => QuestionnaireSection | null;
  isQuestionAnswered: (questionId: string) => boolean;
  resetConversation: () => void;
}
