import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  chatRateLimiter,
  healthCheckRateLimiter,
  getClientIdentifier,
} from "@/lib/api/rate-limit";
import { generateSystemPrompt } from "@/lib/prompts/systemPrompt";
import { dataExtractionService } from "@/lib/dataExtraction/dataExtractionService";

// Initialize OpenAI client only when API key is available
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({ apiKey });
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// Main chat endpoint
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    if (!chatRateLimiter.isAllowed(clientId)) {
      const timeUntilReset = Math.ceil(
        chatRateLimiter.getTimeUntilReset(clientId) / 1000
      );
      return NextResponse.json(
        {
          error: `Too many requests. Please wait ${timeUntilReset} seconds before trying again.`,
          retryAfter: timeUntilReset,
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": timeUntilReset.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(
              Date.now() + chatRateLimiter.getTimeUntilReset(clientId)
            ).toISOString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messages } = body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: at least one message is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get OpenAI client (this will throw if API key is not configured)
    let openai: OpenAI;
    try {
      openai = getOpenAIClient();
    } catch (error) {
      console.error("OpenAI client initialization failed:", error);
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503, headers: corsHeaders }
      );
    }

    // **NEW: Smart Data Extraction**
    let extractionResult = null;
    let extractedData = {};
    let extractionConfidence = 0;
    let needsClarification = false;
    let clarificationQuestions: string[] = [];

    try {
      // Attempt to extract data from the user's message
      extractionResult = dataExtractionService.smartExtract(
        messages[messages.length - 1].content,
        {
          currentQuestion: body.conversationState?.currentQuestion || "",
          previousAnswers: body.conversationState?.collectedData || {},
          conversationHistory:
            body.conversationState?.messages?.map(
              (m: { content: string }) => m.content
            ) || [],
        }
      );

      extractedData = extractionResult.extracted;
      extractionConfidence = extractionResult.confidence;
      needsClarification = extractionResult.needsClarification;
      clarificationQuestions = extractionResult.clarificationQuestions;

      console.log("Data extraction result:", {
        extractedData,
        confidence: extractionConfidence,
        needsClarification,
        clarificationQuestions,
      });
    } catch (extractionError) {
      console.warn("Data extraction failed:", extractionError);
      // Continue without extraction data
    }

    // Generate enhanced system prompt with extraction context
    const enhancedSystemPrompt =
      body.systemPrompt ||
      generateSystemPrompt({
        conversationState: body.conversationState || {
          messages: [],
          collectedData: {
            personal: {},
            financial: {},
            insurance: {},
            preferences: {},
          },
          currentSection: 0,
          questionnaire: [],
        },
      });

    // Add extraction context to system prompt if we have extraction results
    let finalSystemPrompt = enhancedSystemPrompt;
    if (extractionResult && Object.keys(extractedData).length > 0) {
      finalSystemPrompt += `\n\nDATA EXTRACTION RESULTS:
- Extracted data: ${JSON.stringify(extractedData, null, 2)}
- Extraction confidence: ${(extractionConfidence * 100).toFixed(1)}%
- Needs clarification: ${needsClarification}
${
  clarificationQuestions.length > 0
    ? `- Clarification needed for: ${clarificationQuestions.join(", ")}`
    : ""
}

INSTRUCTIONS FOR USING EXTRACTION DATA:
- If confidence is above 80%, acknowledge the extracted information confidently
- If confidence is 60-80%, acknowledge but ask for confirmation
- If confidence is below 60% or needsClarification is true, ask for clarification
- Use the extracted data to personalize your response and move the conversation forward
- If multiple pieces of data were extracted, acknowledge all of them naturally`;
    }

    // Prepare messages for OpenAI
    const messagesForOpenAI = [
      {
        role: "system" as const,
        content: finalSystemPrompt,
      },
      ...messages,
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the more cost-effective model
      messages: messagesForOpenAI,
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    // Extract response
    const aiMessage = completion.choices[0]?.message;

    if (!aiMessage || !aiMessage.content) {
      throw new Error("No response from OpenAI");
    }

    // Add rate limit headers to successful response
    const remainingRequests = chatRateLimiter.getRemainingRequests(clientId);
    const responseHeaders = {
      ...corsHeaders,
      "X-RateLimit-Remaining": remainingRequests.toString(),
      "X-RateLimit-Reset": new Date(
        Date.now() + chatRateLimiter.getTimeUntilReset(clientId)
      ).toISOString(),
    };

    // Return successful response with just the message content
    return NextResponse.json(
      {
        message: aiMessage.content,
        extractionData: {
          extracted: extractedData,
          confidence: extractionConfidence,
          needsClarification,
          clarificationQuestions,
          validationErrors: extractionResult?.validationErrors || [],
        },
        usage: completion.usage,
        model: completion.model,
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: responseHeaders }
    );
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    // Handle specific OpenAI errors
    if (error && typeof error === "object" && "error" in error) {
      const openaiError = error as { error: { type: string } };

      if (openaiError.error?.type === "insufficient_quota") {
        return NextResponse.json(
          { error: "Service quota exceeded. Please try again later." },
          { status: 429, headers: corsHeaders }
        );
      }

      if (openaiError.error?.type === "invalid_api_key") {
        return NextResponse.json(
          { error: "Service configuration error" },
          { status: 503, headers: corsHeaders }
        );
      }

      if (openaiError.error?.type === "rate_limit_exceeded") {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment and try again." },
          { status: 429, headers: corsHeaders }
        );
      }
    }

    // Generic error response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  // Rate limiting for health checks
  const clientId = getClientIdentifier(request);
  if (!healthCheckRateLimiter.isAllowed(clientId)) {
    return NextResponse.json(
      { error: "Too many health check requests" },
      { status: 429, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      status: "healthy",
      service: "Insurance Advisor Chat API",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    { status: 200, headers: corsHeaders }
  );
}
