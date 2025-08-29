import { Question, TestResult } from '@/types/question';
import { getTestResultRepository } from '@/lib/repositories/RepositoryFactory';

export interface MistakePracticeOptions {
  sourceTestIds?: string[];
  category?: string;
  maxQuestions?: number;
  includeUnanswered?: boolean;
}

export interface MistakePracticeData {
  questions: Question[];
  sourceTestIds: string[];
  practiceType: 'single-test' | 'all-mistakes' | 'category-focused';
  category?: string;
  totalAvailableMistakes: number;
}

export class MistakePracticeService {
  
  static async getAllMistakes(): Promise<Question[]> {
    const repository = getTestResultRepository();
    const allResults = await repository.findAll();
    
    const allMistakes: Question[] = [];
    const seenQuestionIds = new Set<string>();
    
    // Collect all unique mistakes from all test results
    allResults.forEach(result => {
      result.mistakes.forEach(question => {
        if (!seenQuestionIds.has(question.id)) {
          allMistakes.push(question);
          seenQuestionIds.add(question.id);
        }
      });
    });
    
    return allMistakes;
  }
  
  static async getMistakesFromTests(testIds: string[]): Promise<Question[]> {
    const repository = getTestResultRepository();
    const allMistakes: Question[] = [];
    const seenQuestionIds = new Set<string>();
    
    for (const testId of testIds) {
      const result = await repository.findById(testId);
      if (result) {
        result.mistakes.forEach(question => {
          if (!seenQuestionIds.has(question.id)) {
            allMistakes.push(question);
            seenQuestionIds.add(question.id);
          }
        });
      }
    }
    
    return allMistakes;
  }
  
  static async getMistakesByCategory(category: string): Promise<Question[]> {
    const allMistakes = await this.getAllMistakes();
    return allMistakes.filter(question => question.category === category);
  }
  
  static async getAvailablePracticeOptions(): Promise<{
    totalMistakes: number;
    categoriesWithMistakes: Array<{ category: string; count: number }>;
    recentTestsWithMistakes: Array<{ testId: string; state: string; completedAt: Date; mistakeCount: number }>;
  }> {
    const repository = getTestResultRepository();
    const allResults = await repository.findAll();
    
    // Ensure dates are properly converted from strings to Date objects
    const processedResults = allResults.map(result => ({
      ...result,
      completedAt: new Date(result.completedAt)
    }));
    
    // Filter results that have mistakes
    const resultsWithMistakes = processedResults.filter(result => result.mistakes.length > 0);
    
    // Count mistakes by category
    const categoryMistakes = new Map<string, Set<string>>();
    const totalMistakeQuestions = new Set<string>();
    
    resultsWithMistakes.forEach(result => {
      result.mistakes.forEach(question => {
        totalMistakeQuestions.add(question.id);
        
        if (!categoryMistakes.has(question.category)) {
          categoryMistakes.set(question.category, new Set());
        }
        categoryMistakes.get(question.category)!.add(question.id);
      });
    });
    
    const categoriesWithMistakes = Array.from(categoryMistakes.entries()).map(([category, questionIds]) => ({
      category,
      count: questionIds.size
    })).sort((a, b) => b.count - a.count);
    
    // Get recent tests with mistakes (last 10)
    const recentTestsWithMistakes = resultsWithMistakes
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 10)
      .map(result => ({
        testId: result.id,
        state: result.state,
        completedAt: result.completedAt,
        mistakeCount: result.mistakes.length
      }));
    
    return {
      totalMistakes: totalMistakeQuestions.size,
      categoriesWithMistakes,
      recentTestsWithMistakes
    };
  }
  
  static async createMistakePracticeSession(
    options: MistakePracticeOptions = {}
  ): Promise<MistakePracticeData> {
    const { sourceTestIds, category, maxQuestions = 33 } = options;
    
    let questions: Question[];
    let practiceType: 'single-test' | 'all-mistakes' | 'category-focused';
    let actualSourceTestIds: string[] = [];
    
    if (sourceTestIds && sourceTestIds.length > 0) {
      questions = await this.getMistakesFromTests(sourceTestIds);
      practiceType = sourceTestIds.length === 1 ? 'single-test' : 'all-mistakes';
      actualSourceTestIds = sourceTestIds;
    } else if (category) {
      questions = await this.getMistakesByCategory(category);
      practiceType = 'category-focused';
      // Get source test IDs for this category
      const repository = getTestResultRepository();
      const allResults = await repository.findAll();
      actualSourceTestIds = allResults
        .filter(result => result.mistakes.some(q => q.category === category))
        .map(result => result.id);
    } else {
      questions = await this.getAllMistakes();
      practiceType = 'all-mistakes';
      // Get all source test IDs
      const repository = getTestResultRepository();
      const allResults = await repository.findAll();
      actualSourceTestIds = allResults
        .filter(result => result.mistakes.length > 0)
        .map(result => result.id);
    }
    
    const totalAvailable = questions.length;
    
    // If we have more questions than requested, randomly select
    if (questions.length > maxQuestions) {
      questions = this.shuffleArray([...questions]).slice(0, maxQuestions);
    }
    
    // Add some questions from the same state if we don't have enough
    if (questions.length < maxQuestions) {
      // This would require access to the full question pool
      // For now, we'll work with what we have
    }
    
    return {
      questions,
      sourceTestIds: actualSourceTestIds,
      practiceType,
      category,
      totalAvailableMistakes: totalAvailable
    };
  }
  
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  static async updateTestResultForMistakePractice(
    testResult: TestResult,
    practiceData: MistakePracticeData
  ): Promise<TestResult> {
    return {
      ...testResult,
      testType: 'mistake-practice',
      sourceTestIds: practiceData.sourceTestIds
    };
  }
  
  static async removeCorrectlyAnsweredMistakes(questionIds: string[]): Promise<void> {
    const repository = getTestResultRepository();
    const allResults = await repository.findAll();
    
    // Update each test result to remove the correctly answered questions from mistakes
    for (const result of allResults) {
      const updatedMistakes = result.mistakes.filter(mistake => !questionIds.includes(mistake.id));
      
      // Only update if there are changes
      if (updatedMistakes.length !== result.mistakes.length) {
        await repository.update(result.id, {
          mistakes: updatedMistakes
        });
      }
    }
  }
  
  static generateMistakePracticeSummary(practiceData: MistakePracticeData): string {
    switch (practiceData.practiceType) {
      case 'single-test':
        return `Practicing mistakes from 1 previous test (${practiceData.questions.length} questions)`;
      case 'all-mistakes':
        return `Practicing all your previous mistakes (${practiceData.questions.length} questions from ${practiceData.sourceTestIds.length} tests)`;
      case 'category-focused':
        return `Practicing ${practiceData.category} mistakes (${practiceData.questions.length} questions)`;
      default:
        return `Mistake practice session (${practiceData.questions.length} questions)`;
    }
  }
}