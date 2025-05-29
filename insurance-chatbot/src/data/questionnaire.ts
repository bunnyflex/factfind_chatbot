import { QuestionnaireSection, CollectedData } from "@/types/conversation";

// Fact-Find questionnaire - customized for insurance data collection
export const defaultQuestionnaire: QuestionnaireSection[] = [
  {
    id: "basic_eligibility",
    title: "Basic Eligibility",
    description:
      "Let's start with some basic eligibility questions to understand your situation.",
    order: 1,
    isComplete: false,
    questions: [
      {
        id: "uk_domiciled",
        text: "Are you UK domiciled and a UK tax resident?",
        type: "boolean",
        required: true,
        category: "personal",
      },
      {
        id: "marital_status",
        text: "What is your marital status?",
        type: "select",
        options: [
          "Single",
          "Married",
          "Civil Partnership",
          "Divorced",
          "Widowed",
          "Separated",
        ],
        required: true,
        category: "personal",
      },
      {
        id: "relationship_to_applicant",
        text: "What is your relationship to the other applicant (if applicable)?",
        type: "select",
        options: [
          "Spouse",
          "Civil Partner",
          "Partner",
          "Not Applicable - Single Application",
        ],
        required: false,
        category: "personal",
      },
    ],
  },
  {
    id: "dependents_info",
    title: "Dependents Information",
    description: "Tell us about your dependents and family situation.",
    order: 2,
    isComplete: false,
    questions: [
      {
        id: "has_dependents",
        text: "Do you have any dependents? (Would you like to add any dependents to your policy?)",
        type: "boolean",
        required: true,
        category: "personal",
        followUpQuestions: ["number_of_dependents", "dependents_ages"],
      },
      {
        id: "number_of_dependents",
        text: "If yes, how many dependents do you have? (under 18)",
        type: "number",
        required: false,
        category: "personal",
      },
      {
        id: "dependents_ages",
        text: "How old are your dependents?",
        type: "text",
        required: false,
        category: "personal",
      },
    ],
  },
  {
    id: "employment_info",
    title: "Employment Information",
    description: "Help us understand your employment and occupation details.",
    order: 3,
    isComplete: false,
    questions: [
      {
        id: "occupation",
        text: "What is your occupation?",
        type: "text",
        required: true,
        category: "personal",
      },
      {
        id: "employment_status",
        text: "What is your employment status?",
        type: "select",
        options: ["Employed", "Self-Employed", "Unemployed"],
        required: true,
        category: "personal",
        followUpQuestions: ["unemployment_reason"],
      },
      {
        id: "unemployment_reason",
        text: "If unemployed, please explain why.",
        type: "text",
        required: false,
        category: "personal",
      },
    ],
  },
  {
    id: "health_lifestyle",
    title: "Health and Lifestyle",
    description:
      "We need to understand your health and lifestyle for insurance purposes.",
    order: 4,
    isComplete: false,
    questions: [
      {
        id: "smoking_status",
        text: "Do you smoke?",
        type: "boolean",
        required: true,
        category: "personal",
      },
      {
        id: "smoking_history",
        text: "If no, have you smoked in the last 12 months?",
        type: "boolean",
        required: false,
        category: "personal",
      },
      {
        id: "taking_medication",
        text: "Are you currently taking any medication?",
        type: "boolean",
        required: true,
        category: "personal",
        followUpQuestions: ["medication_details"],
      },
      {
        id: "medication_details",
        text: "If yes, please list the medication you are taking.",
        type: "text",
        required: false,
        category: "personal",
      },
      {
        id: "exercise_regularly",
        text: "Do you do any exercise?",
        type: "boolean",
        required: true,
        category: "personal",
      },
    ],
  },
  {
    id: "physical_measurements",
    title: "Physical Measurements",
    description: "We need your physical measurements for health assessment.",
    order: 5,
    isComplete: false,
    questions: [
      {
        id: "height",
        text: "What is your height?",
        type: "text",
        required: true,
        category: "personal",
      },
      {
        id: "height_unit",
        text: "Height measurement unit",
        type: "select",
        options: ["metres", "cm", "feet/inches"],
        required: true,
        category: "personal",
      },
      {
        id: "weight",
        text: "What is your weight?",
        type: "text",
        required: true,
        category: "personal",
      },
      {
        id: "weight_unit",
        text: "Weight measurement unit",
        type: "select",
        options: ["kgs", "lbs", "stone"],
        required: true,
        category: "personal",
      },
    ],
  },
];

// Helper function to get questionnaire by ID or return default
export const getQuestionnaire = (): QuestionnaireSection[] => {
  return defaultQuestionnaire;
};

// Helper function to validate questionnaire structure
export const validateQuestionnaire = (
  questionnaire: QuestionnaireSection[]
): boolean => {
  try {
    // Check if questionnaire has sections
    if (!questionnaire || questionnaire.length === 0) {
      return false;
    }

    // Check each section
    for (const section of questionnaire) {
      if (
        !section.id ||
        !section.title ||
        !section.questions ||
        section.questions.length === 0
      ) {
        return false;
      }

      // Check each question
      for (const question of section.questions) {
        if (
          !question.id ||
          !question.text ||
          !question.type ||
          !question.category
        ) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error validating questionnaire:", error);
    return false;
  }
};

// Helper function to check if a question should be shown based on previous answers
export const shouldShowQuestion = (
  questionId: string,
  collectedData: CollectedData
): boolean => {
  switch (questionId) {
    case "number_of_dependents":
    case "dependents_ages":
      return collectedData.personal?.has_dependents === true;

    case "unemployment_reason":
      return collectedData.personal?.employment_status === "Unemployed";

    case "smoking_history":
      return collectedData.personal?.smoking_status === false;

    case "medication_details":
      return collectedData.personal?.taking_medication === true;

    default:
      return true;
  }
};
