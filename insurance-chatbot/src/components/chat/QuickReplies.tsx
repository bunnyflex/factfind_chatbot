"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuickReply {
  text: string;
  value: string;
  icon?: string;
}

interface QuickRepliesProps {
  replies: QuickReply[];
  onReplySelect: (value: string) => void;
  disabled?: boolean;
  title?: string;
}

export default function QuickReplies({
  replies,
  onReplySelect,
  disabled = false,
  title = "Quick answers:",
}: QuickRepliesProps) {
  if (!replies || replies.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-2">
      <div className="space-y-2">
        {title && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {title}
            </Badge>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {replies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onReplySelect(reply.value)}
              disabled={disabled}
              className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {reply.icon && <span className="mr-1">{reply.icon}</span>}
              {reply.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Predefined quick replies for common insurance questions
export const QUICK_REPLIES = {
  ukResident: [
    {
      text: "Yes, I'm UK resident",
      value: "Yes, I am a UK resident and UK tax resident",
      icon: "🇬🇧",
    },
    {
      text: "No, I'm not UK resident",
      value: "No, I am not a UK resident",
      icon: "🌍",
    },
  ],

  maritalStatus: [
    { text: "Single", value: "I am single", icon: "👤" },
    { text: "Married", value: "I am married", icon: "💑" },
    { text: "Divorced", value: "I am divorced", icon: "📋" },
    { text: "Widowed", value: "I am widowed", icon: "🕊️" },
    { text: "In a relationship", value: "I am in a relationship", icon: "💕" },
  ],

  hasDependents: [
    {
      text: "Yes, I have dependents",
      value: "Yes, I have dependents",
      icon: "👨‍👩‍👧‍👦",
    },
    {
      text: "No dependents",
      value: "No, I don't have any dependents",
      icon: "👤",
    },
  ],

  numDependents: [
    { text: "1 child", value: "I have 1 child", icon: "1️⃣" },
    { text: "2 children", value: "I have 2 children", icon: "2️⃣" },
    { text: "3 children", value: "I have 3 children", icon: "3️⃣" },
    { text: "4+ children", value: "I have 4 or more children", icon: "4️⃣" },
  ],

  employmentStatus: [
    {
      text: "Employed full-time",
      value: "I am employed full-time",
      icon: "💼",
    },
    { text: "Self-employed", value: "I am self-employed", icon: "🏢" },
    { text: "Part-time", value: "I work part-time", icon: "⏰" },
    { text: "Retired", value: "I am retired", icon: "🏖️" },
    { text: "Student", value: "I am a student", icon: "🎓" },
    { text: "Unemployed", value: "I am currently unemployed", icon: "🔍" },
  ],

  smokingStatus: [
    { text: "Never smoked", value: "I have never smoked", icon: "🚭" },
    { text: "Current smoker", value: "I currently smoke", icon: "🚬" },
    { text: "Former smoker", value: "I used to smoke but quit", icon: "✅" },
    { text: "Vaper", value: "I vape but don't smoke cigarettes", icon: "💨" },
  ],

  // Simple yes/no for basic smoking questions
  smokingYesNo: [
    { text: "Yes, I smoke", value: "Yes, I smoke", icon: "🚬" },
    { text: "No, I don't smoke", value: "No, I don't smoke", icon: "🚭" },
  ],

  healthConditions: [
    {
      text: "No health issues",
      value: "I have no significant health conditions",
      icon: "💪",
    },
    {
      text: "Minor conditions",
      value: "I have some minor health conditions",
      icon: "🩺",
    },
    {
      text: "Prefer not to say",
      value: "I'd prefer to discuss health privately",
      icon: "🔒",
    },
  ],

  incomeRange: [
    {
      text: "Under £25k",
      value: "My annual income is under £25,000",
      icon: "💷",
    },
    {
      text: "£25k - £50k",
      value: "My annual income is between £25,000 and £50,000",
      icon: "💷",
    },
    {
      text: "£50k - £100k",
      value: "My annual income is between £50,000 and £100,000",
      icon: "💷",
    },
    {
      text: "Over £100k",
      value: "My annual income is over £100,000",
      icon: "💷",
    },
    {
      text: "Prefer not to say",
      value: "I'd prefer not to disclose my income",
      icon: "🔒",
    },
  ],

  insuranceTypes: [
    {
      text: "Life insurance",
      value: "I'm interested in life insurance",
      icon: "🛡️",
    },
    { text: "Health insurance", value: "I need health insurance", icon: "🏥" },
    { text: "Home insurance", value: "I want home insurance", icon: "🏠" },
    { text: "Car insurance", value: "I need car insurance", icon: "🚗" },
    {
      text: "Travel insurance",
      value: "I'm looking for travel insurance",
      icon: "✈️",
    },
    {
      text: "All types",
      value: "I want to explore all insurance options",
      icon: "📋",
    },
  ],

  budget: [
    {
      text: "Under £50/month",
      value: "My budget is under £50 per month",
      icon: "💷",
    },
    {
      text: "£50-£100/month",
      value: "I can spend £50-£100 per month",
      icon: "💷",
    },
    {
      text: "£100-£200/month",
      value: "My budget is £100-£200 per month",
      icon: "💷",
    },
    {
      text: "Over £200/month",
      value: "I can spend over £200 per month",
      icon: "💷",
    },
    {
      text: "Flexible budget",
      value: "My budget is flexible depending on coverage",
      icon: "🔄",
    },
  ],

  urgency: [
    {
      text: "Urgent - need ASAP",
      value: "I need insurance urgently",
      icon: "🚨",
    },
    {
      text: "Within a month",
      value: "I'd like coverage within a month",
      icon: "📅",
    },
    {
      text: "Just exploring",
      value: "I'm just exploring options for now",
      icon: "🔍",
    },
    {
      text: "Planning ahead",
      value: "I'm planning for the future",
      icon: "📈",
    },
  ],
};

// Helper function to get quick replies based on the last AI message
export function getQuickRepliesForMessage(message: string): QuickReply[] {
  const lowerMessage = message.toLowerCase();

  // UK resident question
  if (
    lowerMessage.includes("uk domiciled") ||
    lowerMessage.includes("uk tax resident")
  ) {
    return QUICK_REPLIES.ukResident;
  }

  // Smoking - Check this FIRST to avoid conflicts with other keywords
  if (
    lowerMessage.includes("smoke") ||
    lowerMessage.includes("smoking") ||
    lowerMessage.includes("tobacco")
  ) {
    // If it's a simple "do you smoke" question, use yes/no
    if (
      lowerMessage.includes("do you smoke") ||
      lowerMessage.includes("smoke at all") ||
      (lowerMessage.includes("smoke") && !lowerMessage.includes("status"))
    ) {
      return QUICK_REPLIES.smokingYesNo;
    }
    // For detailed smoking status questions
    return QUICK_REPLIES.smokingStatus;
  }

  // Employment - Make this more specific to avoid conflicts
  if (
    (lowerMessage.includes("employment") && !lowerMessage.includes("smoke")) ||
    (lowerMessage.includes("work") && !lowerMessage.includes("smoke")) ||
    (lowerMessage.includes("job") && !lowerMessage.includes("smoke")) ||
    (lowerMessage.includes("work situation") &&
      !lowerMessage.includes("smoke")) ||
    (lowerMessage.includes("looking for work") &&
      !lowerMessage.includes("smoke")) ||
    (lowerMessage.includes("currently employed") &&
      !lowerMessage.includes("smoke"))
  ) {
    return QUICK_REPLIES.employmentStatus;
  }

  // Dependents - Check before marital status since they're related
  if (
    lowerMessage.includes("dependents") ||
    lowerMessage.includes("children") ||
    lowerMessage.includes("kids")
  ) {
    if (lowerMessage.includes("how many") || lowerMessage.includes("number")) {
      return QUICK_REPLIES.numDependents;
    }
    return QUICK_REPLIES.hasDependents;
  }

  // Marital status - Check after employment and dependents
  if (
    lowerMessage.includes("marital status") ||
    lowerMessage.includes("relationship status") ||
    (lowerMessage.includes("married") && !lowerMessage.includes("work")) ||
    (lowerMessage.includes("single") && !lowerMessage.includes("work"))
  ) {
    return QUICK_REPLIES.maritalStatus;
  }

  // Health
  if (
    lowerMessage.includes("health") ||
    lowerMessage.includes("medical") ||
    lowerMessage.includes("condition")
  ) {
    return QUICK_REPLIES.healthConditions;
  }

  // Income
  if (
    lowerMessage.includes("income") ||
    lowerMessage.includes("salary") ||
    lowerMessage.includes("earn")
  ) {
    return QUICK_REPLIES.incomeRange;
  }

  // Insurance types
  if (
    lowerMessage.includes("type of insurance") ||
    lowerMessage.includes("what insurance") ||
    lowerMessage.includes("coverage")
  ) {
    return QUICK_REPLIES.insuranceTypes;
  }

  // Budget
  if (
    lowerMessage.includes("budget") ||
    lowerMessage.includes("afford") ||
    lowerMessage.includes("spend")
  ) {
    return QUICK_REPLIES.budget;
  }

  // Urgency
  if (
    lowerMessage.includes("when") ||
    lowerMessage.includes("urgency") ||
    lowerMessage.includes("timeline")
  ) {
    return QUICK_REPLIES.urgency;
  }

  return [];
}
