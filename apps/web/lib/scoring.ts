import { defaultBuyerSignals, defaultNegativeSignals } from "./defaults";
import type { KeywordGroup, LeadTemperature, ScoreResult } from "./types";

const urgency = ["asap", "immediately", "this week"];
const remote = ["remote", "work from home", "wfh", "anywhere", "remotely", "fully remote"];
const freelance = ["freelance", "freelancer", "contract", "contractor", "gig", "part-time", "project-based"];
const jobSeeker = ["job seeker", "looking for work", "student looking for internship", "internship"];

export function classifyTemperature(score: number): LeadTemperature {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  if (score >= 25) return "Review";
  return "Ignore";
}

export function scoreLeadText(text: string, groups: KeywordGroup[] = []): ScoreResult {
  const source = text.toLowerCase();
  const matched = new Set<string>();
  const negative = new Set<string>();
  const breakdown: { label: string; points: number }[] = [];
  let score = 0;

  const apply = (label: string, points: number, terms: string[]) => {
    if (terms.some(term => source.includes(term.toLowerCase()))) {
      score += points;
      breakdown.push({ label, points });
      terms.filter(term => source.includes(term.toLowerCase())).forEach(term => matched.add(term));
    }
  };

  apply("Looking for / need help", 30, ["looking for", "need help"]);
  apply("Hiring", 25, ["hiring"]);
  apply("Paid / budget", 25, ["paid", "budget"]);
  apply("B2B / founder / startup", 20, ["b2b", "founder", "startup"]);
  apply("Lead generation / outbound", 20, ["lead generation", "outbound", "cold email"]);
  apply("Remote", 15, remote);
  apply("Freelance / contract", 15, freelance);
  apply("Urgency", 10, urgency);

  [...defaultBuyerSignals, ...groups.flatMap(group => group.positiveKeywords)].forEach(term => {
    if (source.includes(term.toLowerCase())) {
      score += 10;
      matched.add(term);
      breakdown.push({ label: `Signal: ${term}`, points: 10 });
    }
  });

  const negativeTerms = [...defaultNegativeSignals, ...groups.flatMap(group => group.negativeKeywords)];
  negativeTerms.forEach(term => {
    if (source.includes(term.toLowerCase())) {
      const points = term.includes("unpaid") || term.includes("volunteer") ? -30 : -25;
      score += points;
      negative.add(term);
      breakdown.push({ label: `Negative: ${term}`, points });
    }
  });

  if (jobSeeker.some(term => source.includes(term))) {
    score -= 50;
    jobSeeker.filter(term => source.includes(term)).forEach(term => negative.add(term));
    breakdown.push({ label: "Job seeker intent", points: -50 });
  }

  if (groups.some(group => group.id === "freelance-remote" && requiredComboMatch(source, group.requiredCombinations))) {
    score += 35;
    matched.add("freelance remote preset");
    breakdown.push({ label: "Freelance remote preset", points: 35 });
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    temperature: classifyTemperature(finalScore),
    matchedKeywords: Array.from(matched).slice(0, 16),
    negativeSignals: Array.from(negative).slice(0, 12),
    breakdown
  };
}

function requiredComboMatch(text: string, groups: string[][]): boolean {
  if (!groups.length) return false;
  return groups.every(group => group.some(term => text.includes(term.toLowerCase())));
}
