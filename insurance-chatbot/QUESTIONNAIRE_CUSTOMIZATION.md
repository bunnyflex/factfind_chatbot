# Insurance Questionnaire Customization Guide

## 📍 Where to Add Your Questions

Your insurance questionnaire is defined in **`src/data/questionnaire.ts`**. This file contains the structure that guides the AI conversation and data collection.

## 🎯 Current AI Instructions Location

The AI instructions are dynamically generated in **`src/lib/prompts/systemPrompt.ts`** based on:

1. **Conversation progress** - What information has been collected
2. **Current section** - Which part of the questionnaire is active
3. **Unanswered questions** - What information is still needed
4. **User context** - Any additional context provided

## 🔧 How to Customize Your Questionnaire

### 1. **Edit the Default Questionnaire**

Open `src/data/questionnaire.ts` and modify the `defaultQuestionnaire` array:

```typescript
export const defaultQuestionnaire: QuestionnaireSection[] = [
  {
    id: "your_section_id",
    title: "Your Section Title",
    description: "Description of what this section covers",
    order: 1,
    isComplete: false,
    questions: [
      {
        id: "your_question_id",
        text: "Your question text?",
        type: "text", // or 'select', 'multiselect', 'number', 'date', 'boolean'
        options: ["Option 1", "Option 2"], // Only for select/multiselect
        required: true,
        category: "personal", // or 'financial', 'insurance', 'preferences'
        followUpQuestions: ["follow_up_id"], // Optional
      },
    ],
  },
];
```

### 2. **Question Types Available**

- **`text`** - Open text input
- **`select`** - Single choice from options
- **`multiselect`** - Multiple choices from options
- **`number`** - Numeric input
- **`date`** - Date input
- **`boolean`** - Yes/No questions

### 3. **Data Categories**

Questions are organized into categories that determine where the data is stored:

- **`personal`** - Name, age, location, family info
- **`financial`** - Income, assets, expenses
- **`insurance`** - Current coverage, claims history
- **`preferences`** - Risk tolerance, priorities, communication preferences

### 4. **Example: Adding Your Custom Questions**

```typescript
{
  id: 'health_assessment',
  title: 'Health Information',
  description: 'Help us understand your health situation for life insurance recommendations',
  order: 3,
  isComplete: false,
  questions: [
    {
      id: 'smoking_status',
      text: 'Do you currently smoke or have you smoked in the past 12 months?',
      type: 'boolean',
      required: true,
      category: 'personal'
    },
    {
      id: 'health_conditions',
      text: 'Do you have any chronic health conditions?',
      type: 'multiselect',
      options: ['Diabetes', 'Heart Disease', 'High Blood Pressure', 'None'],
      required: true,
      category: 'personal'
    },
    {
      id: 'life_insurance_amount',
      text: 'How much life insurance coverage are you considering?',
      type: 'select',
      options: ['$100,000-$250,000', '$250,000-$500,000', '$500,000-$1M', 'Over $1M'],
      required: true,
      category: 'preferences'
    }
  ]
}
```

## 🤖 How the AI Uses Your Questions

### **Dynamic System Prompts**

The AI automatically receives context about:

- **Current section** being discussed
- **Unanswered questions** that need to be gathered
- **Previously collected data** for personalization
- **Progress percentage** through the questionnaire

### **Natural Conversation Flow**

The AI will:

1. **Ask questions naturally** - Not like a form, but in conversation
2. **Build on responses** - Use previous answers to ask follow-ups
3. **Extract multiple data points** - From single responses when possible
4. **Show progress** - Keep users informed of completion status

## 📊 Progress Tracking

The system automatically:

- **Calculates progress** based on completed sections
- **Shows visual progress bar** to users
- **Tracks which sections** are complete
- **Persists data** in localStorage between sessions

## 🎨 UI Components Affected

When you modify the questionnaire:

- **Progress indicator** updates automatically
- **Section badges** reflect your custom sections
- **AI responses** adapt to your question structure
- **Data collection** follows your categories

## 🔄 Best Practices

### **1. Logical Section Order**

```typescript
order: 1, // Start with basic info
order: 2, // Move to specific needs
order: 3, // Financial details
order: 4, // Preferences and priorities
```

### **2. Clear Question Text**

```typescript
text: "What is your current annual household income?"; // Clear and specific
// vs
text: "Income?"; // Too vague
```

### **3. Appropriate Question Types**

```typescript
// Use select for limited options
type: 'select',
options: ['Single', 'Married', 'Divorced']

// Use text for open-ended responses
type: 'text' // For names, addresses, etc.
```

### **4. Required vs Optional**

```typescript
required: true; // For essential information
required: false; // For nice-to-have details
```

## 🚀 Testing Your Changes

After modifying the questionnaire:

1. **Restart the development server**
2. **Clear localStorage** (or use incognito mode)
3. **Test the conversation flow**
4. **Verify progress tracking**
5. **Check data collection**

## 📝 Example: Complete Custom Section

```typescript
{
  id: 'vehicle_details',
  title: 'Vehicle Information',
  description: 'Tell us about your vehicles for auto insurance quotes',
  order: 2,
  isComplete: false,
  questions: [
    {
      id: 'primary_vehicle_year',
      text: 'What year is your primary vehicle?',
      type: 'number',
      required: true,
      category: 'financial'
    },
    {
      id: 'primary_vehicle_make',
      text: 'What make and model is your primary vehicle?',
      type: 'text',
      required: true,
      category: 'financial'
    },
    {
      id: 'vehicle_usage',
      text: 'How do you primarily use your vehicle?',
      type: 'select',
      options: ['Commuting to work', 'Personal use only', 'Business use', 'Rideshare/delivery'],
      required: true,
      category: 'preferences'
    },
    {
      id: 'annual_mileage',
      text: 'Approximately how many miles do you drive per year?',
      type: 'select',
      options: ['Under 5,000', '5,000-10,000', '10,000-15,000', '15,000-20,000', 'Over 20,000'],
      required: true,
      category: 'financial'
    }
  ]
}
```

## 🎯 When to Provide Your Questions

**The best time to provide your specific questionnaire is NOW** during Task 4 implementation, because:

1. ✅ **State management** is being built to handle your structure
2. ✅ **AI prompts** are being configured to use your questions
3. ✅ **Progress tracking** will reflect your sections
4. ✅ **Data collection** will match your categories

Simply replace the questions in `src/data/questionnaire.ts` with your specific insurance data collection requirements!
