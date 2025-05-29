"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useConversation } from "@/contexts/ConversationContext";

interface ProgressIndicatorProps {
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  className = "",
}) => {
  const { state } = useConversation();
  const { progress, questionnaire, completedSections, isComplete } = state;

  const getProgressText = (progress: number) => {
    if (progress === 0) return "Getting started";
    if (progress < 25) return "Just beginning";
    if (progress < 50) return "Making progress";
    if (progress < 75) return "Halfway there";
    if (progress < 100) return "Almost done";
    return "Complete!";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Information Collection Progress
          </span>
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-green-100 text-green-800" : ""}
          >
            {progress}% {getProgressText(progress)}
          </Badge>
        </div>

        <Progress value={progress} className="h-2" />
      </div>

      {/* Section Progress */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">
          Sections Completed: {completedSections.length} of{" "}
          {questionnaire.length}
        </span>

        <div className="flex flex-wrap gap-1">
          {questionnaire.map((section) => {
            const isCompleted = completedSections.includes(section.id);
            return (
              <Badge
                key={section.id}
                variant={isCompleted ? "default" : "outline"}
                className={`text-xs ${
                  isCompleted
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "text-gray-500"
                }`}
              >
                {section.title}
                {isCompleted && " ✓"}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Completion Message */}
      {isComplete && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm font-medium text-green-800">
              Information collection complete! Ready for personalized
              recommendations.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
