import { ExtractorConfig } from "@/types/dataExtraction";

// Utility functions for conversions
const convertToMetric = (heightStr: string): number => {
  // Convert various height formats to centimeters
  const ftInMatch = heightStr.match(
    /(\d+)\s*(?:ft|feet|foot)\s*(?:(\d+)\s*(?:in|inches?|")?)?/i
  );
  if (ftInMatch) {
    const feet = parseInt(ftInMatch[1]);
    const inches = ftInMatch[2] ? parseInt(ftInMatch[2]) : 0;
    return (feet * 12 + inches) * 2.54; // Convert to cm
  }

  const cmMatch = heightStr.match(/(\d+)\s*(?:cm|centimetres?|centimeters?)/i);
  if (cmMatch) {
    return parseInt(cmMatch[1]);
  }

  const mMatch = heightStr.match(
    /(\d+)\s*(?:\.|\,)\s*(\d+)\s*(?:m|metres?|meters?)/i
  );
  if (mMatch) {
    return parseInt(mMatch[1]) * 100 + parseInt(mMatch[2]);
  }

  return 0;
};

const convertWeightToKg = (weightStr: string): number => {
  // Convert various weight formats to kilograms
  const stLbMatch = weightStr.match(
    /(\d+)\s*(?:st|stone)\s*(?:(\d+)\s*(?:lb|lbs|pounds?)?)?/i
  );
  if (stLbMatch) {
    const stone = parseInt(stLbMatch[1]);
    const pounds = stLbMatch[2] ? parseInt(stLbMatch[2]) : 0;
    return stone * 6.35029 + pounds * 0.453592; // Convert to kg
  }

  const kgMatch = weightStr.match(
    /(\d+)(?:\s*(?:\.|\,)\s*(\d+))?\s*(?:kg|kilograms?|kilos?)/i
  );
  if (kgMatch) {
    const kg = parseInt(kgMatch[1]);
    const decimal = kgMatch[2] ? parseInt(kgMatch[2]) / 10 : 0;
    return kg + decimal;
  }

  const lbMatch = weightStr.match(/(\d+)\s*(?:lb|lbs|pounds?)/i);
  if (lbMatch) {
    return parseInt(lbMatch[1]) * 0.453592;
  }

  return 0;
};

export const ukInsuranceExtractors: ExtractorConfig = {
  // UK Residency and Tax Status
  ukResident: {
    pattern:
      /\b(yes|yeah|yep|y|true|correct|indeed|absolutely|definitely|of course)\b/i,
    alternatePatterns: [
      /\b(no|nope|n|false|incorrect|not really|negative)\b/i,
      /\b(uk|united kingdom|britain|british|england|scotland|wales|northern ireland)\b/i,
    ],
    validate: (value: string) => value.length > 0,
    format: (value: string, fullMatch?: string) => {
      const positivePattern =
        /\b(yes|yeah|yep|y|true|correct|indeed|absolutely|definitely|of course|uk|united kingdom|britain|british|england|scotland|wales|northern ireland)\b/i;
      return positivePattern.test(fullMatch || value);
    },
    confidence: (match: string) => {
      if (/\b(yes|absolutely|definitely|of course)\b/i.test(match)) return 0.95;
      if (/\b(uk|united kingdom|britain|british)\b/i.test(match)) return 0.9;
      if (/\b(yeah|yep|y|true)\b/i.test(match)) return 0.8;
      return 0.6;
    },
  },

  // Marital Status
  maritalStatus: {
    pattern:
      /\b(single|married|divorced|widowed|separated|civil partnership|partner|relationship)\b/i,
    alternatePatterns: [
      /\b(not married|unmarried|never married)\b/i,
      /\b(in a relationship|with someone|have a partner)\b/i,
      /\b(civil union|domestic partnership)\b/i,
    ],
    validate: (value: string) => value.length > 0,
    format: (value: string, fullMatch?: string) => {
      const text = (fullMatch || value).toLowerCase();
      if (/\b(single|not married|unmarried|never married)\b/.test(text))
        return "Single";
      if (/\b(married|marriage)\b/.test(text)) return "Married";
      if (/\b(divorced|divorce)\b/.test(text)) return "Divorced";
      if (/\b(widowed|widow|widower)\b/.test(text)) return "Widowed";
      if (/\b(separated|separation)\b/.test(text)) return "Separated";
      if (/\b(civil partnership|civil union|domestic partnership)\b/.test(text))
        return "Civil Partnership";
      if (/\b(partner|relationship|with someone|have a partner)\b/.test(text))
        return "In a relationship";
      return value;
    },
    confidence: (match: string) => {
      const exactMatches =
        /\b(single|married|divorced|widowed|separated|civil partnership)\b/i;
      return exactMatches.test(match) ? 0.95 : 0.7;
    },
  },

  // Boolean responses (for yes/no questions)
  booleanResponse: {
    pattern:
      /\b(yes|yeah|yep|y|true|correct|indeed|absolutely|definitely|of course|sure)\b/i,
    alternatePatterns: [
      /\b(no|nope|n|false|incorrect|not really|negative|nah|never)\b/i,
      /\b(i do have|i have children|i have kids|i have dependents)\b/i,
      /\b(i don't have|i haven't got|no children|no kids|no dependents|none|zero|don't have any|haven't got any|childless|no family)\b/i,
      /\b(single|i am single|i'm single)\b/i,
    ],
    validate: (value: string) => value.length > 0,
    format: (value: string, fullMatch?: string) => {
      const text = (fullMatch || value).toLowerCase();
      const positivePattern =
        /\b(yes|yeah|yep|y|true|correct|indeed|absolutely|definitely|of course|sure|i do have|i have children|i have kids|i have dependents)\b/i;

      // Special case: if someone says "I am single" in response to dependents question,
      // we infer they likely don't have dependents (but with lower confidence)
      if (/\b(single|i am single|i'm single)\b/i.test(text)) {
        return false; // Infer no dependents for single people
      }

      return positivePattern.test(text);
    },
    confidence: (match: string) => {
      // Higher confidence for explicit responses
      if (/\b(yes|absolutely|definitely|of course)\b/i.test(match)) return 0.95;
      if (/\b(no|never|none)\b/i.test(match)) return 0.95;
      if (/\b(i have children|i have kids|i have dependents)\b/i.test(match))
        return 0.9;
      if (
        /\b(no children|no kids|no dependents|don't have any|haven't got any|childless)\b/i.test(
          match
        )
      )
        return 0.9;
      // Lower confidence for contextual inference from marital status
      if (/\b(single|i am single|i'm single)\b/i.test(match)) return 0.75;
      if (/\b(yeah|yep|sure)\b/i.test(match)) return 0.8;
      // Lower confidence for ambiguous matches
      return 0.6;
    },
  },

  // Numbers (for dependents, age, etc.)
  number: {
    pattern: /\b(\d+)\b/,
    alternatePatterns: [
      /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i,
      /\b(none|no|not any|don't have any)\b/i,
    ],
    validate: (value: string) =>
      !isNaN(parseInt(value)) || /\b(zero|none|no|not any)\b/i.test(value),
    format: (value: string, fullMatch?: string) => {
      const text = (fullMatch || value).toLowerCase();

      // Handle word numbers
      const wordNumbers: Record<string, number> = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,
        twenty: 20,
      };

      // Handle negative responses
      if (/\b(none|no|not any|don't have any|zero)\b/i.test(text)) return 0;

      // Check for word numbers
      for (const [word, num] of Object.entries(wordNumbers)) {
        if (text.includes(word)) return num;
      }

      // Parse numeric value
      const numMatch = text.match(/\d+/);
      return numMatch ? parseInt(numMatch[0]) : 0;
    },
    confidence: (match: string) => {
      if (/\d+/.test(match)) return 0.9;
      if (/\b(zero|one|two|three|four|five)\b/i.test(match)) return 0.85;
      if (/\b(none|no|not any)\b/i.test(match)) return 0.8;
      return 0.7;
    },
  },

  // Age ranges or specific ages
  age: {
    pattern: /\b(\d{1,2})\s*(?:years?\s*old|yrs?\s*old|y\.?o\.?)?\b/i,
    alternatePatterns: [
      /\b(under|over|about|around|approximately|roughly)\s*(\d{1,2})\b/i,
      /\b(\d{1,2})\s*(?:to|\-)\s*(\d{1,2})\s*(?:years?\s*old)?\b/i,
      /\b(teen|teenager|adult|child|baby|infant|toddler|young|old)\b/i,
    ],
    validate: (value: string) => {
      const age = parseInt(value);
      return !isNaN(age) && age >= 0 && age <= 120;
    },
    format: (value: string, fullMatch?: string) => {
      const text = fullMatch || value;

      // Handle age ranges
      const rangeMatch = text.match(/(\d{1,2})\s*(?:to|\-)\s*(\d{1,2})/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        return `${min}-${max}`;
      }

      // Handle approximate ages
      const approxMatch = text.match(
        /(?:under|over|about|around|approximately|roughly)\s*(\d{1,2})/i
      );
      if (approxMatch) {
        return `~${approxMatch[1]}`;
      }

      // Handle descriptive ages
      if (/\b(baby|infant)\b/i.test(text)) return "0-1";
      if (/\b(toddler)\b/i.test(text)) return "1-3";
      if (/\b(child)\b/i.test(text)) return "4-12";
      if (/\b(teen|teenager)\b/i.test(text)) return "13-19";

      // Extract numeric age
      const ageMatch = text.match(/\d{1,2}/);
      return ageMatch ? parseInt(ageMatch[0]) : null;
    },
    confidence: (match: string) => {
      if (
        /\d{1,2}/.test(match) &&
        !/\b(about|around|approximately|roughly)\b/i.test(match)
      )
        return 0.9;
      if (/\b(about|around|approximately|roughly)\b/i.test(match)) return 0.7;
      if (/\b(teen|child|baby)\b/i.test(match)) return 0.6;
      return 0.5;
    },
  },

  // Employment status
  employmentStatus: {
    pattern:
      /\b(employed|unemployed|self[- ]?employed|retired|student|homemaker|disabled|part[- ]?time|full[- ]?time)\b/i,
    alternatePatterns: [
      /\b(work|working|job|career|business|company|freelance|contractor)\b/i,
      /\b(not working|out of work|between jobs|looking for work|job hunting)\b/i,
      /\b(own business|run a business|entrepreneur|freelancer)\b/i,
    ],
    validate: (value: string) => value.length > 0,
    format: (value: string, fullMatch?: string) => {
      const text = (fullMatch || value).toLowerCase();

      if (
        /\b(employed|work|working|job|career|company|full[- ]?time)\b/.test(
          text
        ) &&
        !/\b(not working|unemployed|out of work)\b/.test(text)
      )
        return "Employed";
      if (
        /\b(unemployed|not working|out of work|between jobs|looking for work|job hunting)\b/.test(
          text
        )
      )
        return "Unemployed";
      if (
        /\b(self[- ]?employed|own business|run a business|entrepreneur|freelance|contractor|freelancer)\b/.test(
          text
        )
      )
        return "Self-employed";
      if (/\b(retired|retirement)\b/.test(text)) return "Retired";
      if (/\b(student|studying|university|college|school)\b/.test(text))
        return "Student";
      if (
        /\b(homemaker|housewife|househusband|stay[- ]?at[- ]?home)\b/.test(text)
      )
        return "Homemaker";
      if (/\b(disabled|disability|unable to work)\b/.test(text))
        return "Disabled";
      if (/\b(part[- ]?time)\b/.test(text)) return "Part-time employed";

      return value;
    },
    confidence: (match: string) => {
      const exactMatches =
        /\b(employed|unemployed|self[- ]?employed|retired|student)\b/i;
      return exactMatches.test(match) ? 0.9 : 0.7;
    },
  },

  // Occupation/Job title
  occupation: {
    pattern:
      /\b(?:i am a|i'm a|i work as a?|my job is|i'm employed as a?)\s*([a-zA-Z\s]+?)(?:\.|,|$|\s+(?:at|for|in|with))/i,
    alternatePatterns: [
      /\b(teacher|nurse|doctor|engineer|manager|developer|programmer|accountant|lawyer|chef|driver|cleaner|builder|electrician|plumber|mechanic|sales|marketing|admin|secretary|consultant|analyst|designer|writer|artist|musician)\b/i,
      /\b([a-zA-Z\s]+?)\s+(?:by profession|as a career|for a living)\b/i,
    ],
    validate: (value: string) =>
      value.length > 2 &&
      !/\b(yes|no|the|and|or|but|if|when|where|what|how|why)\b/i.test(value),
    format: (value: string, fullMatch?: string) => {
      return value.trim().replace(/^(a|an|the)\s+/i, "");
    },
    confidence: (match: string) => {
      const commonJobs =
        /\b(teacher|nurse|doctor|engineer|manager|developer|programmer|accountant|lawyer|chef|driver|cleaner|builder|electrician|plumber|mechanic)\b/i;
      if (commonJobs.test(match)) return 0.9;
      if (/\b(?:i am a|i'm a|i work as)\b/i.test(match)) return 0.8;
      return 0.6;
    },
  },

  // Smoking status
  smokingStatus: {
    pattern:
      /\b(smoke|smoking|smoker|cigarettes?|tobacco|vape|vaping|e[- ]?cigarettes?)\b/i,
    alternatePatterns: [
      /\b(never smoked|non[- ]?smoker|don't smoke|quit smoking|stopped smoking|gave up smoking)\b/i,
      /\b(used to smoke|former smoker|ex[- ]?smoker|previously smoked)\b/i,
    ],
    validate: (value: string) => value.length > 0,
    format: (value: string, fullMatch?: string) => {
      const text = (fullMatch || value).toLowerCase();

      if (/\b(never smoked|non[- ]?smoker|don't smoke|no)\b/.test(text))
        return "Never smoked";
      if (
        /\b(used to smoke|former smoker|ex[- ]?smoker|previously smoked|quit smoking|stopped smoking|gave up smoking)\b/.test(
          text
        )
      )
        return "Former smoker";
      if (
        /\b(smoke|smoking|smoker|cigarettes?|tobacco|yes)\b/.test(text) &&
        !/\b(don't|never|quit|stopped|gave up|used to|former|ex)\b/.test(text)
      )
        return "Current smoker";
      if (/\b(vape|vaping|e[- ]?cigarettes?)\b/.test(text)) return "Vaper";

      return value;
    },
    confidence: (match: string) => {
      if (
        /\b(never smoked|non[- ]?smoker|current smoker|former smoker)\b/i.test(
          match
        )
      )
        return 0.9;
      if (/\b(smoke|don't smoke|quit smoking)\b/i.test(match)) return 0.8;
      return 0.6;
    },
  },

  // Height (UK formats)
  height: {
    pattern: /\b(\d+)\s*(?:ft|feet|foot)\s*(?:(\d+)\s*(?:in|inches?|")?)?\b/i,
    alternatePatterns: [
      /\b(\d+)\s*(?:cm|centimetres?|centimeters?)\b/i,
      /\b(\d+)['′]\s*(\d+)["″]?\b/,
      /\b(\d+)\s*(?:\.|\,)\s*(\d+)\s*(?:m|metres?|meters?)\b/i,
    ],
    validate: (value: string) => {
      const heightCm = convertToMetric(value);
      return heightCm >= 50 && heightCm <= 250; // Reasonable height range in cm
    },
    format: (value: string, fullMatch?: string) => {
      const text = fullMatch || value;

      // Handle feet and inches
      const ftInMatch = text.match(
        /(\d+)\s*(?:ft|feet|foot)\s*(?:(\d+)\s*(?:in|inches?|")?)?/i
      );
      if (ftInMatch) {
        const feet = parseInt(ftInMatch[1]);
        const inches = ftInMatch[2] ? parseInt(ftInMatch[2]) : 0;
        return `${feet}'${inches}"`;
      }

      // Handle feet/inches with symbols
      const symbolMatch = text.match(/(\d+)['′]\s*(\d+)["″]?/);
      if (symbolMatch) {
        return `${symbolMatch[1]}'${symbolMatch[2]}"`;
      }

      // Handle centimeters
      const cmMatch = text.match(/(\d+)\s*(?:cm|centimetres?|centimeters?)/i);
      if (cmMatch) {
        return `${cmMatch[1]}cm`;
      }

      // Handle meters
      const mMatch = text.match(
        /(\d+)\s*(?:\.|\,)\s*(\d+)\s*(?:m|metres?|meters?)/i
      );
      if (mMatch) {
        return `${mMatch[1]}.${mMatch[2]}m`;
      }

      return value;
    },
    confidence: (match: string) => {
      if (/\d+\s*(?:ft|feet|foot)\s*\d*\s*(?:in|inches?|")?/i.test(match))
        return 0.9;
      if (/\d+\s*(?:cm|centimetres?)/i.test(match)) return 0.9;
      if (/\d+['′]\s*\d*["″]?/.test(match)) return 0.85;
      return 0.7;
    },
  },

  // Weight (UK formats)
  weight: {
    pattern: /\b(\d+)\s*(?:st|stone)\s*(?:(\d+)\s*(?:lb|lbs|pounds?)?)?\b/i,
    alternatePatterns: [
      /\b(\d+)\s*(?:kg|kilograms?|kilos?)\b/i,
      /\b(\d+)\s*(?:lb|lbs|pounds?)\b/i,
      /\b(\d+)\s*(?:\.|\,)\s*(\d+)\s*(?:kg|kilograms?)\b/i,
    ],
    validate: (value: string) => {
      const weightKg = convertWeightToKg(value);
      return weightKg >= 20 && weightKg <= 300; // Reasonable weight range in kg
    },
    format: (value: string, fullMatch?: string) => {
      const text = fullMatch || value;

      // Handle stone and pounds
      const stLbMatch = text.match(
        /(\d+)\s*(?:st|stone)\s*(?:(\d+)\s*(?:lb|lbs|pounds?)?)?/i
      );
      if (stLbMatch) {
        const stone = parseInt(stLbMatch[1]);
        const pounds = stLbMatch[2] ? parseInt(stLbMatch[2]) : 0;
        return pounds > 0 ? `${stone}st ${pounds}lb` : `${stone}st`;
      }

      // Handle kilograms
      const kgMatch = text.match(
        /(\d+)(?:\s*(?:\.|\,)\s*(\d+))?\s*(?:kg|kilograms?|kilos?)/i
      );
      if (kgMatch) {
        const kg = kgMatch[1];
        const decimal = kgMatch[2] || "";
        return decimal ? `${kg}.${decimal}kg` : `${kg}kg`;
      }

      // Handle pounds only
      const lbMatch = text.match(/(\d+)\s*(?:lb|lbs|pounds?)/i);
      if (lbMatch) {
        return `${lbMatch[1]}lb`;
      }

      return value;
    },
    confidence: (match: string) => {
      if (/\d+\s*(?:st|stone)\s*\d*\s*(?:lb|lbs|pounds?)?/i.test(match))
        return 0.9;
      if (/\d+\s*(?:kg|kilograms?)/i.test(match)) return 0.9;
      if (/\d+\s*(?:lb|lbs|pounds?)/i.test(match)) return 0.8;
      return 0.7;
    },
  },
};
