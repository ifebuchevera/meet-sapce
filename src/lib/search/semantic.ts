import type { Meeting } from "@/lib/supabase/types";

export interface SearchResult {
  id: string;
  meetingId: string;
  meetingTitle: string;
  type: "meeting_title" | "transcript" | "decision" | "action_item" | "risk" | "opportunity";
  text: string;
  highlightedText: string;
  relevanceScore: number;
  matchIndices: number[]; // Indices where query matches in the original text
}

/**
 * Calculates the Levenshtein distance between two strings for fuzzy matching
 * Lower distance = better match
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Finds all instances of a pattern in text (case-insensitive)
 * Supports fuzzy matching with typos
 */
function findMatches(text: string, query: string, maxDistance: number = 2): number[] {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const indices: number[] = [];

  // First try exact matches
  let index = 0;
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    indices.push(index);
    index += lowerQuery.length;
  }

  // If no exact matches, try fuzzy matching with character-level analysis
  if (indices.length === 0) {
    const words = lowerText.split(/\s+/);
    let charIndex = 0;

    for (const word of words) {
      const distance = levenshteinDistance(word, lowerQuery);
      if (distance <= maxDistance && word.length > 2) {
        indices.push(charIndex);
      }
      charIndex += word.length + 1;
    }
  }

  return indices;
}

/**
 * Calculates relevance score based on:
 * - Position of match (earlier = higher relevance)
 * - Number of matches (more matches = higher relevance)
 * - Match quality (exact = higher, fuzzy = lower)
 */
function calculateRelevance(
  text: string,
  query: string,
  matchIndices: number[],
  fieldType: string
): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let score = 0;

  // Field type weighting
  const typeWeights: Record<string, number> = {
    meeting_title: 10,
    decision: 8,
    action_item: 7,
    risk: 6,
    opportunity: 5,
    transcript: 3,
  };
  score += typeWeights[fieldType] || 1;

  // Match count bonus
  score += matchIndices.length * 2;

  // Position bonus (earlier matches score higher)
  if (matchIndices.length > 0) {
    const firstMatch = matchIndices[0];
    const positionFactor = Math.max(0, 1 - firstMatch / text.length);
    score += positionFactor * 5;
  }

  // Exact match bonus
  if (lowerText.includes(lowerQuery)) {
    score += 10;
  }

  // Text length factor (more context = better)
  score += Math.min(5, text.length / 100);

  return score;
}

/**
 * Highlights matched text with <mark> tags
 */
function highlightMatches(text: string, matchIndices: number[], query: string): string {
  if (matchIndices.length === 0) return text;

  // Sort indices and merge overlapping ranges
  const ranges = matchIndices
    .map((idx) => ({ start: idx, end: idx + query.length }))
    .sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    if (merged.length === 0) {
      merged.push(range);
    } else {
      const last = merged[merged.length - 1];
      if (range.start <= last.end) {
        last.end = Math.max(last.end, range.end);
      } else {
        merged.push(range);
      }
    }
  }

  // Build highlighted text
  let highlighted = "";
  let lastEnd = 0;

  for (const range of merged) {
    highlighted += text.slice(lastEnd, range.start);
    highlighted += `<mark>${text.slice(range.start, range.end)}</mark>`;
    lastEnd = range.end;
  }
  highlighted += text.slice(lastEnd);

  return highlighted;
}

/**
 * Main semantic search function
 * Searches across all meetings with multi-field support
 */
export async function semanticSearch(
  query: string,
  meetings: Meeting[]
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  for (const meeting of meetings) {
    // Search meeting title
    const titleMatches = findMatches(meeting.title, normalizedQuery, 2);
    if (titleMatches.length > 0) {
      results.push({
        id: `${meeting.id}-title`,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        type: "meeting_title",
        text: meeting.title,
        highlightedText: highlightMatches(meeting.title, titleMatches, normalizedQuery),
        relevanceScore: calculateRelevance(meeting.title, normalizedQuery, titleMatches, "meeting_title"),
        matchIndices: titleMatches,
      });
    }

    // Search decisions
    if (meeting.decisions) {
      for (const decision of meeting.decisions) {
        const matches = findMatches(decision, normalizedQuery, 2);
        if (matches.length > 0) {
          results.push({
            id: `${meeting.id}-decision-${results.length}`,
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            type: "decision",
            text: decision,
            highlightedText: highlightMatches(decision, matches, normalizedQuery),
            relevanceScore: calculateRelevance(decision, normalizedQuery, matches, "decision"),
            matchIndices: matches,
          });
        }
      }
    }

    // Search risks
    if (meeting.risks) {
      for (const risk of meeting.risks) {
        const matches = findMatches(risk, normalizedQuery, 2);
        if (matches.length > 0) {
          results.push({
            id: `${meeting.id}-risk-${results.length}`,
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            type: "risk",
            text: risk,
            highlightedText: highlightMatches(risk, matches, normalizedQuery),
            relevanceScore: calculateRelevance(risk, normalizedQuery, matches, "risk"),
            matchIndices: matches,
          });
        }
      }
    }

    // Search opportunities
    if (meeting.opportunities) {
      for (const opportunity of meeting.opportunities) {
        const matches = findMatches(opportunity, normalizedQuery, 2);
        if (matches.length > 0) {
          results.push({
            id: `${meeting.id}-opportunity-${results.length}`,
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            type: "opportunity",
            text: opportunity,
            highlightedText: highlightMatches(opportunity, matches, normalizedQuery),
            relevanceScore: calculateRelevance(opportunity, normalizedQuery, matches, "opportunity"),
            matchIndices: matches,
          });
        }
      }
    }

    // Search action items
    if (meeting.actionItems) {
      for (const item of meeting.actionItems) {
        const matches = findMatches(item.title, normalizedQuery, 2);
        if (matches.length > 0) {
          results.push({
            id: `${meeting.id}-action-${results.length}`,
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            type: "action_item",
            text: item.title,
            highlightedText: highlightMatches(item.title, matches, normalizedQuery),
            relevanceScore: calculateRelevance(item.title, normalizedQuery, matches, "action_item"),
            matchIndices: matches,
          });
        }
      }
    }

    // Search transcript
    if (meeting.transcript) {
      const transcriptText = meeting.transcript
        .map((t: any) => `${t.speaker}: ${t.text}`)
        .join(" ");
      const matches = findMatches(transcriptText, normalizedQuery, 3);
      if (matches.length > 0) {
        // Limit transcript matches to prevent too many results
        const truncated = transcriptText.substring(0, 500);
        results.push({
          id: `${meeting.id}-transcript`,
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          type: "transcript",
          text: truncated,
          highlightedText: highlightMatches(truncated, matches, normalizedQuery),
          relevanceScore: calculateRelevance(transcriptText, normalizedQuery, matches, "transcript"),
          matchIndices: matches,
        });
      }
    }
  }

  // Sort by relevance score (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}
