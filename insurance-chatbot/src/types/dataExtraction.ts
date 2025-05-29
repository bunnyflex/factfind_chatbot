export interface ExtractionResult {
  success: boolean;
  value?: any;
  confidence?: number;
  original?: string;
  reason?: string;
  suggestions?: string[];
}

export interface DataExtractor {
  pattern: RegExp;
  alternatePatterns?: RegExp[];
  validate: (value: string) => boolean;
  format: (value: string, fullMatch?: string) => any;
  confidence?: (match: string) => number;
  followUpQuestions?: string[];
}

export interface ExtractorConfig {
  [key: string]: DataExtractor;
}

export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
}

export interface FieldMapping {
  questionId: string;
  dataCategory: "personal" | "financial" | "insurance" | "preferences";
  dataField: string;
  extractorKey: string;
  validationRules: ValidationRule;
}

export interface ExtractionContext {
  currentQuestion: string;
  previousAnswers: Record<string, any>;
  conversationHistory: string[];
  lastAssistantMessage?: string;
}

export interface SmartExtractionResult {
  extracted: Record<string, any>;
  confidence: number;
  needsClarification: boolean;
  clarificationQuestions: string[];
  validationErrors: string[];
}
