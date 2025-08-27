// lib/questions.ts
import fs from 'fs/promises';
import path from 'path';

// Question type definition
export interface Question {
  id: string;
  num: string;
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  solution: string;
  category: string;
  context: string;
  image?: string;
  translation?: {
    [key: string]: {
      question?: string;
      a?: string;
      b?: string;
      c?: string;
      d?: string;
      context?: string;
    };
  };
}

/**
 * Get all questions for a given state
 * @param state The state code (e.g. 'BW', 'BY') or 'base' for federal questions
 * @returns Array of questions
 */
export async function getAllQuestions(state: string = 'base'): Promise<Question[]> {
  try {
    // Construct the path to the full.json file for the selected state
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      'de',
      state,
      'all',
      'full.json'
    );
    
    // Read the file
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Return the questions array
    return data.questions || [];
  } catch (error) {
    console.error(`Error fetching questions for state ${state}:`, error);
    return [];
  }
}

/**
 * Get questions with pagination
 * @param state The state code (e.g. 'BW', 'BY') or 'base' for federal questions
 * @param page Page number (1-indexed)
 * @param limit Number of questions per page
 * @returns Paginated questions
 */
export async function getPaginatedQuestions(
  state: string = 'base',
  page: number = 1,
  limit: number = 20
): Promise<{ questions: Question[]; total: number; page: number; totalPages: number }> {
  try {
    const allQuestions = await getAllQuestions(state);
    const total = allQuestions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const questions = allQuestions.slice(startIndex, endIndex);
    
    return {
      questions,
      total,
      page,
      totalPages
    };
  } catch (error) {
    console.error(`Error fetching paginated questions for state ${state}:`, error);
    return {
      questions: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
}