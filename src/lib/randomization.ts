import { Question } from '@/types/question';

export interface RandomizationSeeds {
  seeds: number[];
  generated: string;
  description: string;
}

export interface RandomizedQuestionData {
  questions: Question[];
  randomSeed: number;
  totalQuestions: number;
}

/**
 * Seeded random number generator using Linear Congruential Generator
 * This ensures deterministic shuffling based on the seed
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm with seeded random
 */
export function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const rng = new SeededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Get a random seed from session storage or generate a new one
 */
export function getSessionRandomizationSeed(): number | null {
  if (typeof window === 'undefined') return null;
  
  const storedSeed = sessionStorage.getItem('randomization-seed');
  return storedSeed ? parseInt(storedSeed, 10) : null;
}

/**
 * Set randomization seed in session storage
 */
export function setSessionRandomizationSeed(seed: number): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem('randomization-seed', seed.toString());
}

/**
 * Clear randomization seed from session storage
 */
export function clearSessionRandomizationSeed(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('randomization-seed');
}

/**
 * Fetch randomization seeds from the server
 */
export async function fetchRandomizationSeeds(): Promise<RandomizationSeeds> {
  const response = await fetch('/data/randomization-seeds.json');
  if (!response.ok) {
    throw new Error('Failed to fetch randomization seeds');
  }
  return response.json();
}

/**
 * Pick a random seed from the available seeds
 */
export function pickRandomSeed(seeds: number[]): number {
  return seeds[Math.floor(Math.random() * seeds.length)];
}

/**
 * Initialize randomization for a session
 * Either uses existing session seed or picks a new one
 */
export async function initializeRandomization(): Promise<number> {
  // Check if we already have a seed for this session
  const existingSeed = getSessionRandomizationSeed();
  if (existingSeed) {
    return existingSeed;
  }
  
  // Fetch available seeds and pick one
  const seedData = await fetchRandomizationSeeds();
  const selectedSeed = pickRandomSeed(seedData.seeds);
  
  // Store for this session
  setSessionRandomizationSeed(selectedSeed);
  
  return selectedSeed;
}

/**
 * Paginate shuffled questions
 */
export function paginateQuestions(
  questions: Question[],
  page: number,
  pageSize: number = 20
) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageQuestions = questions.slice(startIndex, endIndex);
  
  return {
    questions: pageQuestions,
    pagination: {
      page,
      totalPages: Math.ceil(questions.length / pageSize),
      totalQuestions: questions.length,
      hasNext: endIndex < questions.length,
      hasPrev: page > 1
    }
  };
}

/**
 * Check if randomization is enabled in settings
 */
export function isRandomizationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const enabled = localStorage.getItem('randomize-questions');
  return enabled === 'true';
}

/**
 * Set randomization preference in settings
 */
export function setRandomizationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('randomize-questions', enabled.toString());
  
  // Clear session seed when disabling randomization
  if (!enabled) {
    clearSessionRandomizationSeed();
  }
}