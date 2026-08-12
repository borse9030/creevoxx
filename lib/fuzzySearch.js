// lib/fuzzySearch.js

/**
 * Calculates the Damerau-Levenshtein distance between two strings.
 * Accounts for insertions, deletions, substitutions, and transpositions.
 */
export function damerauLevenshtein(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize distance matrix
  const d = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) d[i][0] = i;
  for (let j = 0; j <= len2; j++) d[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition check
      if (
        i > 1 &&
        j > 1 &&
        s1[i - 1] === s2[j - 2] &&
        s1[i - 2] === s2[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  return d[len1][len2];
}

/**
 * Normalizes text for searching (lowercased, alphanumeric and space characters only).
 */
export function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes match score for a single query token against a candidate field string.
 */
export function matchTokenInField(fieldValueNormalized, token) {
  if (!fieldValueNormalized || !token) return 0;

  // 1. Exact string match
  if (fieldValueNormalized === token) return 1.0;

  // 2. Substring match as a whole word boundary
  const tokenRegex = new RegExp(`\\b${token}\\b`);
  if (tokenRegex.test(fieldValueNormalized)) return 0.9;

  // 3. General substring match
  if (fieldValueNormalized.includes(token)) return 0.7;

  // 4. Word-by-word fuzzy matching (typo tolerance)
  const words = fieldValueNormalized.split(" ");
  let maxWordScore = 0;

  for (const word of words) {
    // Skip words with length difference greater than 2 to optimize
    if (Math.abs(word.length - token.length) > 2) continue;

    const d = damerauLevenshtein(token, word);

    // Typos threshold:
    // - length <= 2: 0 typos allowed
    // - length == 3: 1 typo allowed
    // - length <= 6: 2 typos allowed
    // - length > 6: 3 typos allowed
    let threshold = 0;
    if (token.length === 3) threshold = 1;
    else if (token.length <= 6) threshold = 2;
    else threshold = 3;

    if (d <= threshold) {
      const similarity = 1.0 - d / Math.max(token.length, word.length);
      const score = similarity * 0.7; // Cap fuzzy matching at 0.7 to prioritize exact/substring matches
      if (score > maxWordScore) {
        maxWordScore = score;
      }
    }
  }

  return maxWordScore;
}

/**
 * Searches and scores a list of resources.
 * Weights: title = 0.7, summary = 0.3, author = 0.3, description = 0.1
 */
export function fuzzySearchResources(resources, query, activeCategory = "all") {
  if (!resources || !Array.isArray(resources)) return [];

  // Filter by category first
  let list = activeCategory !== "all"
    ? resources.filter((r) => r.category === activeCategory)
    : [...resources];

  const queryNormalized = normalizeText(query);
  if (!queryNormalized) {
    return list.map((r) => ({ ...r, searchScore: 0 }));
  }

  const queryTokens = queryNormalized.split(" ");

  const scoredList = list.map((resource) => {
    const titleNorm = normalizeText(resource.title);
    const authorNorm = normalizeText(resource.author);
    
    // summary field: fallback to description
    const summaryNorm = normalizeText(resource.summary || resource.description);
    const descNorm = normalizeText(resource.description);

    let totalScore = 0;

    for (const token of queryTokens) {
      const titleScore = matchTokenInField(titleNorm, token);
      const summaryScore = matchTokenInField(summaryNorm, token);
      const authorScore = matchTokenInField(authorNorm, token);
      const descScore = matchTokenInField(descNorm, token);

      // Search weights:
      // title: 0.7
      // summary: 0.3
      // author: 0.3
      // description: 0.1
      const tokenScore =
        titleScore * 0.7 +
        summaryScore * 0.3 +
        authorScore * 0.3 +
        descScore * 0.1;

      totalScore += tokenScore;
    }

    // Average score across query tokens
    const finalScore = totalScore / queryTokens.length;

    return {
      ...resource,
      searchScore: finalScore,
    };
  });

  // Filter out items with 0 score (no match) and sort descending by searchScore
  const matched = scoredList
    .filter((item) => item.searchScore > 0.05) // Small threshold to filter out noise
    .sort((a, b) => b.searchScore - a.searchScore);

  return matched;
}
