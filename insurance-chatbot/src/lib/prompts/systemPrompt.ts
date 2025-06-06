import { ConversationState } from "@/types/conversation";

export function generateSystemPrompt({
  conversationState,
}: {
  conversationState: ConversationState;
}): string {
  const { collectedData, messages } = conversationState;

  // Get the last few messages for context
  const recentMessages = messages.slice(-6); // Last 6 messages for context
  const lastUserMessage = messages
    .filter((m) => m.role === "user")
    .slice(-1)[0];
  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .slice(-1)[0];

  // Calculate progress based on collected data
  const personalData = collectedData.personal || {};
  const financialData = collectedData.financial || {};
  const insuranceData = collectedData.insurance || {};
  const preferencesData = collectedData.preferences || {};

  const totalAnswered =
    Object.keys(personalData).length +
    Object.keys(financialData).length +
    Object.keys(insuranceData).length +
    Object.keys(preferencesData).length;

  const progressPercentage = Math.min(
    Math.round((totalAnswered / 10) * 100),
    100
  );

  // Build a comprehensive picture of what we know
  const knownInfo: string[] = [];
  const unknownInfo: string[] = [];

  // Check each key piece of information
  const infoChecks = [
    {
      key: "ukResident",
      label: "UK residency",
      value: personalData.ukResident,
    },
    {
      key: "maritalStatus",
      label: "marital status",
      value: personalData.maritalStatus,
    },
    {
      key: "hasDependents",
      label: "dependents",
      value: personalData.hasDependents,
    },
    {
      key: "numDependents",
      label: "number of dependents",
      value: personalData.numDependents,
      condition: personalData.hasDependents === true,
    },
    {
      key: "employmentStatus",
      label: "employment",
      value: personalData.employmentStatus,
    },
    {
      key: "occupation",
      label: "occupation",
      value: personalData.occupation,
      condition:
        personalData.employmentStatus === "Employed" ||
        personalData.employmentStatus === "Self-employed",
    },
    {
      key: "smokingStatus",
      label: "smoking status",
      value: personalData.smokingStatus,
    },
    { key: "height", label: "height", value: personalData.height },
    { key: "weight", label: "weight", value: personalData.weight },
    { key: "annualIncome", label: "income", value: financialData.annualIncome },
  ];

  infoChecks.forEach((check) => {
    // Skip if condition is explicitly false
    if (check.condition !== undefined && check.condition === false) return;

    if (
      check.value !== undefined &&
      check.value !== null &&
      check.value !== ""
    ) {
      if (check.key === "ukResident") {
        knownInfo.push(`${check.label}: ${check.value ? "Yes" : "No"}`);
      } else if (check.key === "hasDependents") {
        knownInfo.push(`${check.label}: ${check.value ? "Yes" : "No"}`);
      } else {
        knownInfo.push(`${check.label}: ${check.value}`);
      }
    } else if (check.condition === undefined || check.condition === true) {
      unknownInfo.push(check.label);
    }
  });

  // Determine what to ask next based on conversation flow
  let nextFocus = "";
  let conversationTone = "";

  if (progressPercentage >= 90) {
    return `You are Alex, a friendly UK insurance advisor AI. The user has completed their fact-find interview!

PERSONALITY: Enthusiastic, warm, knowledgeable. Use "brilliant!", "fantastic!", "perfect!" etc.

COLLECTED DATA: ${JSON.stringify(collectedData, null, 2)}

TASK: Give personalized insurance recommendations based on their information. Be specific and helpful. Keep it under 100 words and offer to answer questions.`;
  }

  // Enhanced repetition detection - check recent conversation for topics already covered
  const recentConversation = recentMessages
    .map((m) => m.content.toLowerCase())
    .join(" ");

  // Track what topics have been recently discussed
  const recentlyDiscussedTopics = new Set<string>();

  // Check for dependents discussion
  if (
    recentConversation.includes("dependents") ||
    recentConversation.includes("children") ||
    recentConversation.includes("kids")
  ) {
    recentlyDiscussedTopics.add("dependents");
  }

  // Check for employment discussion
  if (
    recentConversation.includes("employment") ||
    recentConversation.includes("work") ||
    recentConversation.includes("job") ||
    recentConversation.includes("employed")
  ) {
    recentlyDiscussedTopics.add("employment");
  }

  // Check for marital status discussion
  if (
    recentConversation.includes("married") ||
    recentConversation.includes("single") ||
    recentConversation.includes("relationship") ||
    recentConversation.includes("marital")
  ) {
    recentlyDiscussedTopics.add("marital status");
  }

  // Check for UK residency discussion
  if (
    recentConversation.includes("uk") ||
    recentConversation.includes("resident") ||
    recentConversation.includes("britain") ||
    recentConversation.includes("british")
  ) {
    recentlyDiscussedTopics.add("UK residency");
  }

  // Smart next question logic
  if (unknownInfo.length > 0) {
    // Find the next logical question that we haven't recently discussed
    let nextQuestion = unknownInfo.find(
      (item) => !recentlyDiscussedTopics.has(item)
    );

    // If all remaining questions were recently discussed, pick the first unknown
    if (!nextQuestion) {
      nextQuestion = unknownInfo[0];
    }

    switch (nextQuestion) {
      case "UK residency":
        nextFocus = "Ask about UK residency and tax status";
        conversationTone =
          "Start with a warm greeting and ask about UK residency";
        break;
      case "marital status":
        nextFocus = "Ask about marital status (married, single, etc.)";
        conversationTone =
          "React positively to their previous answer, then ask about relationship status";
        break;
      case "dependents":
        nextFocus = "Ask if they have any children or dependents";
        conversationTone = "Show interest in their family situation";
        break;
      case "number of dependents":
        nextFocus = "Ask how many dependents they have and their ages";
        conversationTone = "Since they have dependents, get specific details";
        break;
      case "employment":
        nextFocus = "Ask about their employment status";
        conversationTone = "Transition naturally to their work situation";
        break;
      case "occupation":
        nextFocus = "Ask about their specific job or profession";
        conversationTone =
          "Get details about their occupation for insurance purposes";
        break;
      case "smoking status":
        nextFocus = "Ask about smoking habits";
        conversationTone =
          "Ask about smoking in a friendly, non-judgmental way";
        break;
      case "height":
        nextFocus = "Ask for their height";
        conversationTone =
          "Explain this helps with life insurance calculations";
        break;
      case "weight":
        nextFocus = "Ask for their weight";
        conversationTone = "Mention this is for health assessment purposes";
        break;
      case "income":
        nextFocus = "Ask about their annual income";
        conversationTone = "Ask about income to determine coverage needs";
        break;
      default:
        nextFocus = "Continue gathering insurance information";
        conversationTone = "Keep the conversation flowing naturally";
    }
  }

  const contextInfo =
    knownInfo.length > 0
      ? `\n\nKNOWN INFORMATION: ${knownInfo.join(", ")}`
      : "\n\nKNOWN INFORMATION: None yet";

  const recentContext =
    recentMessages.length > 0
      ? `\n\nRECENT CONVERSATION:\n${recentMessages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n")}`
      : "";

  return `You are Alex, a friendly UK insurance advisor AI conducting a natural conversation to gather insurance information.

PERSONALITY:
- Warm, enthusiastic, and genuinely interested
- Use natural reactions: "That's great!", "Brilliant!", "I love that!"
- Be conversational, not robotic or formal
- Show you're listening by referencing what they just said
- Keep responses SHORT (30-50 words typically)
- Ask ONE question at a time

CURRENT PROGRESS: ${progressPercentage}% complete${contextInfo}

NEXT FOCUS: ${nextFocus}
CONVERSATION TONE: ${conversationTone}${recentContext}

CRITICAL ANTI-REPETITION RULES:
1. NEVER ask about topics that have been discussed in recent messages
2. If someone says "No, I don't have dependents" - NEVER ask about dependents again
3. If someone answers about employment - move to the next topic immediately
4. If someone answers about marital status - acknowledge and move on
5. Always check the KNOWN INFORMATION before asking any question
6. If a topic appears in RECENT CONVERSATION, skip it completely
7. When someone gives a clear answer, acknowledge it and move to the next unknown topic

CONVERSATION FLOW:
- Start by acknowledging what they just told you
- Make a brief positive comment about their answer
- Transition naturally to the next UNASKED question
- Keep it feeling like a friendly chat, not an interrogation
- NEVER repeat questions about information you already have

EXAMPLE RESPONSES:
❌ "Thank you for that information. Could you please tell me your marital status?"
✅ "Brilliant! So you're all sorted with UK residency. Are you married, single, or in a relationship?"

❌ Asking about dependents when they already said "No, I don't have any dependents"
✅ "Perfect! Since you don't have dependents, let's talk about your work situation..."

❌ Asking the same question multiple times
✅ Moving smoothly to the next unknown topic after getting an answer

Remember: This should feel like a natural conversation with a friendly advisor who LISTENS and REMEMBERS what you've already told them!`;
}
