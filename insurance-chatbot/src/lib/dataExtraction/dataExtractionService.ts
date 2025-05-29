import {
  ExtractionResult,
  ExtractionContext,
  SmartExtractionResult,
  FieldMapping,
} from "@/types/dataExtraction";
import { ukInsuranceExtractors } from "./extractors";

// Field mappings for our UK insurance questionnaire
export const questionFieldMappings: FieldMapping[] = [
  {
    questionId: "uk_resident",
    dataCategory: "personal",
    dataField: "ukResident",
    extractorKey: "ukResident",
    validationRules: { required: true },
  },
  {
    questionId: "marital_status",
    dataCategory: "personal",
    dataField: "maritalStatus",
    extractorKey: "maritalStatus",
    validationRules: { required: true },
  },
  {
    questionId: "has_dependents",
    dataCategory: "personal",
    dataField: "hasDependents",
    extractorKey: "booleanResponse",
    validationRules: { required: true },
  },
  {
    questionId: "num_dependents",
    dataCategory: "personal",
    dataField: "numDependents",
    extractorKey: "number",
    validationRules: { required: false },
  },
  {
    questionId: "dependent_ages",
    dataCategory: "personal",
    dataField: "dependentAges",
    extractorKey: "age",
    validationRules: { required: false },
  },
  {
    questionId: "employment_status",
    dataCategory: "personal",
    dataField: "employmentStatus",
    extractorKey: "employmentStatus",
    validationRules: { required: true },
  },
  {
    questionId: "occupation",
    dataCategory: "personal",
    dataField: "occupation",
    extractorKey: "occupation",
    validationRules: { required: false },
  },
  {
    questionId: "smoking_status",
    dataCategory: "personal",
    dataField: "smokingStatus",
    extractorKey: "smokingStatus",
    validationRules: { required: true },
  },
  {
    questionId: "height",
    dataCategory: "personal",
    dataField: "height",
    extractorKey: "height",
    validationRules: { required: true },
  },
  {
    questionId: "weight",
    dataCategory: "personal",
    dataField: "weight",
    extractorKey: "weight",
    validationRules: { required: true },
  },
];

export class DataExtractionService {
  /**
   * Extract data from a message using a specific extractor
   */
  extractDataFromMessage(
    message: string,
    extractorKey: string
  ): ExtractionResult {
    const extractor = ukInsuranceExtractors[extractorKey];
    if (!extractor) {
      return {
        success: false,
        reason: `Unknown extractor: ${extractorKey}`,
        suggestions: ["Check available extractors"],
      };
    }

    // Clean the message
    const cleanMessage = message.trim().toLowerCase();

    // Try primary pattern
    let match = cleanMessage.match(extractor.pattern);
    let matchedText = "";

    // Try alternate patterns if available
    if (!match && extractor.alternatePatterns) {
      for (const pattern of extractor.alternatePatterns) {
        match = cleanMessage.match(pattern);
        if (match) break;
      }
    }

    if (!match) {
      return {
        success: false,
        reason: "No matching pattern found",
        suggestions: this.generateSuggestions(extractorKey),
      };
    }

    matchedText = match[0];
    const extractedValue = match[1] || match[0];

    // Validate the extracted value
    const isValid = extractor.validate(extractedValue);
    if (!isValid) {
      return {
        success: false,
        reason: "Validation failed",
        original: extractedValue,
        suggestions: this.generateSuggestions(extractorKey),
      };
    }

    // Format the value
    const formattedValue = extractor.format(extractedValue, matchedText);

    // Calculate confidence
    const confidence = extractor.confidence
      ? extractor.confidence(matchedText)
      : 0.8;

    return {
      success: true,
      value: formattedValue,
      confidence,
      original: extractedValue,
    };
  }

  /**
   * Smart extraction that tries multiple extractors and returns the best result
   */
  smartExtract(
    message: string,
    context: ExtractionContext
  ): SmartExtractionResult {
    // Filter out casual conversation that shouldn't trigger data extraction
    const casualConversationPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)$/i,
      /^(i am fine|i'm fine|fine|good|great|okay|ok)$/i,
      /^(how are you|what's up|how's it going)$/i,
      /^(thanks|thank you|cheers)$/i,
      /^(bye|goodbye|see you|talk soon)$/i,
    ];

    const cleanMessage = message.trim().toLowerCase();
    const isCasualConversation = casualConversationPatterns.some((pattern) =>
      pattern.test(cleanMessage)
    );

    // If it's casual conversation, return empty result
    if (isCasualConversation) {
      return {
        extracted: {},
        confidence: 0,
        needsClarification: true,
        clarificationQuestions: [
          "Are you UK domiciled and a UK tax resident?",
          "What is your marital status?",
          "Do you have any dependents?",
          "What is your employment status?",
          "Do you smoke?",
          "What is your height?",
          "What is your weight?",
        ],
        validationErrors: [],
      };
    }

    const results: Record<string, ExtractionResult> = {};
    const extracted: Record<string, any> = {};
    let totalConfidence = 0;
    let successfulExtractions = 0;
    const clarificationQuestions: string[] = [];
    const validationErrors: string[] = [];

    // Determine which extractors to try based on message content and context
    const relevantMappings = this.getRelevantMappings(message, context);

    // Try to extract data only for relevant field mappings
    for (const mapping of relevantMappings) {
      const result = this.extractDataFromMessage(message, mapping.extractorKey);
      results[mapping.dataField] = result;

      if (result.success && result.value !== undefined) {
        // Additional validation based on field mapping rules
        const validationResult = this.validateField(
          result.value,
          mapping.validationRules
        );

        if (validationResult.isValid) {
          extracted[mapping.dataField] = result.value;
          totalConfidence += result.confidence || 0.5;
          successfulExtractions++;
        } else {
          validationErrors.push(
            `${mapping.dataField}: ${validationResult.error}`
          );
        }
      }
    }

    // Add clarification questions for missing required fields (not based on current message)
    for (const mapping of questionFieldMappings) {
      if (mapping.validationRules.required && !extracted[mapping.dataField]) {
        // Check if we already have this data in context
        const existingData =
          context.previousAnswers?.personal?.[mapping.dataField] ||
          context.previousAnswers?.financial?.[mapping.dataField] ||
          context.previousAnswers?.insurance?.[mapping.dataField] ||
          context.previousAnswers?.preferences?.[mapping.dataField];

        if (
          existingData === undefined ||
          existingData === null ||
          existingData === ""
        ) {
          clarificationQuestions.push(
            this.generateClarificationQuestion(mapping)
          );
        }
      }
    }

    // Calculate overall confidence
    const overallConfidence =
      successfulExtractions > 0 ? totalConfidence / successfulExtractions : 0;

    // Determine if clarification is needed
    const needsClarification =
      clarificationQuestions.length > 0 ||
      validationErrors.length > 0 ||
      overallConfidence < 0.7;

    return {
      extracted,
      confidence: overallConfidence,
      needsClarification,
      clarificationQuestions,
      validationErrors,
    };
  }

  /**
   * Determine which field mappings are relevant based on message content and context
   */
  private getRelevantMappings(
    message: string,
    context: ExtractionContext
  ): FieldMapping[] {
    const cleanMessage = message.trim().toLowerCase();
    const relevantMappings: FieldMapping[] = [];

    // UK Residency keywords
    if (
      /\b(uk|united kingdom|britain|british|resident|residency|domiciled|tax resident)\b/i.test(
        cleanMessage
      )
    ) {
      const ukMapping = questionFieldMappings.find(
        (m) => m.dataField === "ukResident"
      );
      if (ukMapping) relevantMappings.push(ukMapping);
    }

    // Marital status keywords
    if (
      /\b(single|married|divorced|widowed|separated|civil partnership|partner|relationship|marital|marriage)\b/i.test(
        cleanMessage
      )
    ) {
      const maritalMapping = questionFieldMappings.find(
        (m) => m.dataField === "maritalStatus"
      );
      if (maritalMapping) relevantMappings.push(maritalMapping);
    }

    // Dependents keywords - include both positive and negative responses
    if (
      /\b(children|kids|dependents|child|kid|dependent|family|son|daughter|have children|have kids|no children|no kids|no dependents|don't have children|don't have kids|don't have dependents|haven't got children|haven't got kids|no family|childless)\b/i.test(
        cleanMessage
      )
    ) {
      const dependentsMapping = questionFieldMappings.find(
        (m) => m.dataField === "hasDependents"
      );
      const numDependentsMapping = questionFieldMappings.find(
        (m) => m.dataField === "numDependents"
      );
      const agesMapping = questionFieldMappings.find(
        (m) => m.dataField === "dependentAges"
      );
      if (dependentsMapping) relevantMappings.push(dependentsMapping);
      if (numDependentsMapping) relevantMappings.push(numDependentsMapping);
      if (agesMapping) relevantMappings.push(agesMapping);
    }

    // Employment keywords
    if (
      /\b(work|job|employed|employment|unemployed|retired|self-employed|freelance|occupation|career|profession)\b/i.test(
        cleanMessage
      )
    ) {
      const employmentMapping = questionFieldMappings.find(
        (m) => m.dataField === "employmentStatus"
      );
      const occupationMapping = questionFieldMappings.find(
        (m) => m.dataField === "occupation"
      );
      if (employmentMapping) relevantMappings.push(employmentMapping);
      if (occupationMapping) relevantMappings.push(occupationMapping);
    }

    // Smoking keywords
    if (
      /\b(smoke|smoking|smoker|cigarette|tobacco|vape|vaping|non-smoker|never smoked)\b/i.test(
        cleanMessage
      )
    ) {
      const smokingMapping = questionFieldMappings.find(
        (m) => m.dataField === "smokingStatus"
      );
      if (smokingMapping) relevantMappings.push(smokingMapping);
    }

    // Height keywords
    if (
      /\b(height|tall|feet|foot|inches|cm|centimeters|metres|meters|ft|in)\b/i.test(
        cleanMessage
      )
    ) {
      const heightMapping = questionFieldMappings.find(
        (m) => m.dataField === "height"
      );
      if (heightMapping) relevantMappings.push(heightMapping);
    }

    // Weight keywords
    if (
      /\b(weight|weigh|kg|kilograms|pounds|lbs|stone|st)\b/i.test(cleanMessage)
    ) {
      const weightMapping = questionFieldMappings.find(
        (m) => m.dataField === "weight"
      );
      if (weightMapping) relevantMappings.push(weightMapping);
    }

    // If no specific keywords found, but it's a simple yes/no response,
    // try to determine context from conversation history
    if (
      relevantMappings.length === 0 &&
      /\b(yes|no|yeah|nope|yep|nah)\b/i.test(cleanMessage)
    ) {
      // Look at the last assistant message to determine context
      const lastAssistantMessage =
        context.conversationHistory?.slice(-2, -1)[0] || "";

      if (/\b(uk|resident|domiciled|tax)\b/i.test(lastAssistantMessage)) {
        const ukMapping = questionFieldMappings.find(
          (m) => m.dataField === "ukResident"
        );
        if (ukMapping) relevantMappings.push(ukMapping);
      } else if (/\b(dependents|children|kids)\b/i.test(lastAssistantMessage)) {
        const dependentsMapping = questionFieldMappings.find(
          (m) => m.dataField === "hasDependents"
        );
        if (dependentsMapping) relevantMappings.push(dependentsMapping);
      } else if (/\b(smoke|smoking)\b/i.test(lastAssistantMessage)) {
        const smokingMapping = questionFieldMappings.find(
          (m) => m.dataField === "smokingStatus"
        );
        if (smokingMapping) relevantMappings.push(smokingMapping);
      }
    }

    // **NEW: Context-aware extraction for indirect answers**
    // If someone answers with marital status when asked about dependents,
    // we should also try to extract dependents information
    const lastAssistantMessage = context.lastAssistantMessage || "";

    console.log("Context-aware extraction debug:", {
      lastAssistantMessage,
      cleanMessage,
      isDependentsQuestion: /\b(dependents|children|kids)\b/i.test(
        lastAssistantMessage
      ),
      isMaritalAnswer: /\b(single|married|divorced|widowed|separated)\b/i.test(
        cleanMessage
      ),
    });

    // Check if the last question was about dependents but user answered with marital status
    if (
      /\b(dependents|children|kids)\b/i.test(lastAssistantMessage) &&
      /\b(single|married|divorced|widowed|separated)\b/i.test(cleanMessage)
    ) {
      console.log(
        "Detected marital status answer to dependents question - adding dependents mapping"
      );

      // Add dependents mapping since they're answering a dependents question
      const dependentsMapping = questionFieldMappings.find(
        (m) => m.dataField === "hasDependents"
      );
      if (
        dependentsMapping &&
        !relevantMappings.some((m) => m.dataField === "hasDependents")
      ) {
        relevantMappings.push(dependentsMapping);
        console.log("Added hasDependents mapping to relevant mappings");
      }

      // For single people, we can reasonably infer they likely don't have dependents
      // But we'll let the boolean extractor handle this logic
    }

    // Check if the last question was about marital status but user answered about dependents
    if (
      /\b(married|single|marital|relationship)\b/i.test(lastAssistantMessage) &&
      /\b(children|kids|dependents|no children|no kids|no dependents)\b/i.test(
        cleanMessage
      )
    ) {
      // Add marital status mapping since they might be implying marital status
      const maritalMapping = questionFieldMappings.find(
        (m) => m.dataField === "maritalStatus"
      );
      if (
        maritalMapping &&
        !relevantMappings.some((m) => m.dataField === "maritalStatus")
      ) {
        relevantMappings.push(maritalMapping);
      }
    }

    // If still no relevant mappings found, return empty array to avoid false positives
    return relevantMappings;
  }

  /**
   * Extract specific data for a known question type
   */
  extractForQuestion(message: string, questionId: string): ExtractionResult {
    const mapping = questionFieldMappings.find(
      (m) => m.questionId === questionId
    );
    if (!mapping) {
      return {
        success: false,
        reason: `Unknown question ID: ${questionId}`,
      };
    }

    return this.extractDataFromMessage(message, mapping.extractorKey);
  }

  /**
   * Validate a field value against its rules
   */
  private validateField(
    value: any,
    rules: any
  ): { isValid: boolean; error?: string } {
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      return { isValid: false, error: "This field is required" };
    }

    if (
      rules.minLength &&
      typeof value === "string" &&
      value.length < rules.minLength
    ) {
      return { isValid: false, error: `Minimum length is ${rules.minLength}` };
    }

    if (
      rules.maxLength &&
      typeof value === "string" &&
      value.length > rules.maxLength
    ) {
      return { isValid: false, error: `Maximum length is ${rules.maxLength}` };
    }

    if (
      rules.pattern &&
      typeof value === "string" &&
      !rules.pattern.test(value)
    ) {
      return { isValid: false, error: "Invalid format" };
    }

    if (rules.customValidator && !rules.customValidator(value)) {
      return { isValid: false, error: "Custom validation failed" };
    }

    return { isValid: true };
  }

  /**
   * Generate clarification questions for missing data
   */
  private generateClarificationQuestion(mapping: FieldMapping): string {
    const questionTemplates: Record<string, string> = {
      uk_resident: "Are you UK domiciled and a UK tax resident?",
      marital_status: "What is your marital status?",
      has_dependents: "Do you have any dependents?",
      num_dependents: "How many dependents do you have?",
      dependent_ages: "What are the ages of your dependents?",
      employment_status: "What is your employment status?",
      occupation: "What is your occupation?",
      smoking_status: "Do you smoke?",
      height: "What is your height?",
      weight: "What is your weight?",
    };

    return (
      questionTemplates[mapping.questionId] ||
      `Could you provide information about ${mapping.dataField}?`
    );
  }

  /**
   * Generate helpful suggestions for failed extractions
   */
  private generateSuggestions(extractorKey: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      ukResident: [
        'Try answering with "yes" or "no"',
        'You can say "I am UK resident" or "I live in the UK"',
      ],
      maritalStatus: [
        "Please specify: single, married, divorced, widowed, or separated",
        'You can say "I am married" or "I\'m single"',
      ],
      booleanResponse: [
        'Please answer with "yes" or "no"',
        'You can say "I do" or "I don\'t"',
      ],
      number: [
        "Please provide a number",
        'You can write it as digits (e.g., "2") or words (e.g., "two")',
        'Say "none" or "zero" if you don\'t have any',
      ],
      age: [
        "Please provide age in years",
        'You can say "25 years old" or just "25"',
        'For ranges, say "5 to 10" or "around 8"',
      ],
      employmentStatus: [
        "Please specify: employed, unemployed, self-employed, retired, student, etc.",
        'You can say "I work" or "I\'m retired"',
      ],
      occupation: [
        "Please specify your job title or profession",
        'You can say "I am a teacher" or "I work as an engineer"',
      ],
      smokingStatus: [
        "Please answer: do you smoke, never smoked, or used to smoke?",
        'You can say "I don\'t smoke" or "I quit smoking"',
      ],
      height: [
        'Please provide height in feet/inches (e.g., "5ft 8in") or centimeters (e.g., "175cm")',
        "You can use symbols like 5'8\" or write it out",
      ],
      weight: [
        'Please provide weight in stone/pounds (e.g., "12st 5lb") or kilograms (e.g., "80kg")',
        'You can say "12 stone" or "80 kilos"',
      ],
    };

    return (
      suggestionMap[extractorKey] || [
        "Please provide more specific information",
      ]
    );
  }

  /**
   * Get available extractors
   */
  getAvailableExtractors(): string[] {
    return Object.keys(ukInsuranceExtractors);
  }

  /**
   * Test an extractor with sample text
   */
  testExtractor(extractorKey: string, testMessage: string): ExtractionResult {
    return this.extractDataFromMessage(testMessage, extractorKey);
  }
}

// Export singleton instance
export const dataExtractionService = new DataExtractionService();
