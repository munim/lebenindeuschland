import { Question, TestConfig, Language } from '@/types/question';
import { fetchCompleteQuestions } from '@/lib/api';
import { shuffleArrayWithSeed } from '@/lib/randomization';

export interface QuestionSelectionResult {
  questions: Question[];
  metadata: {
    totalAvailable: number;
    stateQuestions: number;
    generalQuestions: number;
    categoryDistribution: Record<string, number>;
  };
}

export class QuestionGenerationService {
  static readonly DEFAULT_TOTAL_QUESTIONS = 33;
  static readonly MIN_STATE_QUESTIONS = 3;
  static readonly MAX_STATE_QUESTIONS = 5;

  async generateTestQuestions(config: TestConfig, randomSeed?: number): Promise<QuestionSelectionResult> {
    const { stateCode, totalQuestions, language } = config;
    
    if (stateCode) {
      return this.generateStateBasedTest(stateCode, language, totalQuestions, randomSeed);
    }
    
    return this.generateGeneralTest(language, totalQuestions, randomSeed);
  }

  private async generateStateBasedTest(
    stateCode: string, 
    language: Language, 
    totalQuestions: number,
    randomSeed?: number
  ): Promise<QuestionSelectionResult> {
    // Fetch all questions for the state (includes general + state-specific)
    const allQuestions = await fetchCompleteQuestions(language, stateCode);
    
    // Separate state-specific vs general questions
    const stateQuestions = this.filterStateSpecific(allQuestions.questions, stateCode);
    const generalQuestions = this.filterGeneral(allQuestions.questions, stateCode);
    
    // Select 3-5 random state questions (instead of all 10)
    const stateQuestionsToSelect = Math.min(
      this.getRandomNumber(
        QuestionGenerationService.MIN_STATE_QUESTIONS, 
        QuestionGenerationService.MAX_STATE_QUESTIONS + 1, 
        randomSeed
      ),
      stateQuestions.length
    );
    const selectedStateQuestions = this.randomSample(stateQuestions, stateQuestionsToSelect, randomSeed);
    
    // Combine all remaining questions (unused state questions + all general questions)
    // This ensures balanced category distribution across ALL available questions
    const remainingStateQuestions = stateQuestions.filter(q => !selectedStateQuestions.includes(q));
    const allRemainingQuestions = [...remainingStateQuestions, ...generalQuestions];
    
    // Select remaining questions with balanced category distribution
    const remainingQuestionsToSelect = totalQuestions - stateQuestionsToSelect;
    const selectedRemainingQuestions = this.balancedSampleByCategory(
      allRemainingQuestions, 
      remainingQuestionsToSelect, 
      randomSeed
    );
    
    // Combine and shuffle all questions together
    const finalQuestions = this.shuffleQuestions([...selectedStateQuestions, ...selectedRemainingQuestions], randomSeed);
    
    return {
      questions: finalQuestions,
      metadata: {
        totalAvailable: allQuestions.questions.length,
        stateQuestions: selectedStateQuestions.length,
        generalQuestions: selectedRemainingQuestions.length,
        categoryDistribution: this.getCategoryDistribution([...selectedStateQuestions, ...selectedRemainingQuestions])
      }
    };
  }

  private async generateGeneralTest(language: Language, totalQuestions: number, randomSeed?: number): Promise<QuestionSelectionResult> {
    // Fetch all general questions (no state filter)
    const allQuestions = await fetchCompleteQuestions(language);
    
    // Select balanced questions across categories
    const selectedQuestions = this.balancedSampleByCategory(allQuestions.questions, totalQuestions, randomSeed);
    
    return {
      questions: selectedQuestions,
      metadata: {
        totalAvailable: allQuestions.questions.length,
        stateQuestions: 0,
        generalQuestions: selectedQuestions.length,
        categoryDistribution: this.getCategoryDistribution(selectedQuestions)
      }
    };
  }

  private filterStateSpecific(questions: Question[], stateCode: string): Question[] {
    // State-specific questions typically have the state code in their ID or number
    // This is a heuristic - adjust based on your data structure
    return questions.filter(question => {
      // Check if question number contains state indicator (e.g., "1-BW", "2-BY")
      return question.num.includes('-') && question.num.includes(stateCode);
    });
  }

  private filterGeneral(questions: Question[], stateCode: string): Question[] {
    // General questions don't contain state-specific indicators
    return questions.filter(question => {
      return !question.num.includes('-') || !question.num.includes(stateCode);
    });
  }

  private balancedSampleByCategory(questions: Question[], count: number, randomSeed?: number): Question[] {
    // Group questions by category
    const categorized = this.groupByCategory(questions);
    
    // Calculate proportional distribution
    const distribution = this.calculateCategoryDistribution(categorized, count);
    
    // Sample from each category
    const selected: Question[] = [];
    Object.entries(distribution).forEach(([category, categoryCount]) => {
      const categoryQuestions = categorized[category] || [];
      const sampled = this.randomSample(categoryQuestions, categoryCount, randomSeed);
      selected.push(...sampled);
    });
    
    // If we're short due to rounding, fill from largest categories
    while (selected.length < count) {
      const largestCategory = Object.keys(categorized).reduce((a, b) => 
        categorized[a].length > categorized[b].length ? a : b
      );
      
      const available = categorized[largestCategory].filter(q => !selected.includes(q));
      if (available.length > 0) {
        selected.push(available[0]);
      } else {
        break; // No more questions available
      }
    }
    
    return this.shuffleQuestions(selected.slice(0, count), randomSeed);
  }

  private groupByCategory(questions: Question[]): Record<string, Question[]> {
    const groups: Record<string, Question[]> = {};
    
    questions.forEach(question => {
      const category = question.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(question);
    });
    
    return groups;
  }

  private calculateCategoryDistribution(
    categorized: Record<string, Question[]>, 
    totalCount: number
  ): Record<string, number> {
    const categories = Object.keys(categorized);
    const totalQuestions = Object.values(categorized).reduce((sum, qs) => sum + qs.length, 0);
    
    if (totalQuestions === 0) return {};
    
    const distribution: Record<string, number> = {};
    let allocated = 0;
    
    // Calculate proportional allocation
    categories.forEach((category, index) => {
      if (index === categories.length - 1) {
        // Last category gets remainder to ensure we hit exact count
        distribution[category] = totalCount - allocated;
      } else {
        const proportion = categorized[category].length / totalQuestions;
        const count = Math.max(1, Math.round(proportion * totalCount)); // At least 1 per category
        distribution[category] = count;
        allocated += count;
      }
    });
    
    return distribution;
  }

  private randomSample<T>(array: T[], count: number, randomSeed?: number): T[] {
    if (count >= array.length) return [...array];
    
    if (randomSeed !== undefined) {
      // Use seeded randomization for consistent results
      const shuffled = shuffleArrayWithSeed(array, randomSeed);
      return shuffled.slice(0, count);
    } else {
      // Fallback to regular randomization
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    }
  }

  private shuffleQuestions(questions: Question[], randomSeed?: number): Question[] {
    if (randomSeed !== undefined) {
      return shuffleArrayWithSeed(questions, randomSeed);
    } else {
      return this.randomSample(questions, questions.length);
    }
  }

  private getCategoryDistribution(questions: Question[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    questions.forEach(question => {
      const category = question.category;
      distribution[category] = (distribution[category] || 0) + 1;
    });
    
    return distribution;
  }

  // Validation and analysis methods
  validateTestConfiguration(config: TestConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.totalQuestions < 1 || config.totalQuestions > 100) {
      errors.push('Total questions must be between 1 and 100');
    }
    
    if (config.stateCode && config.stateCode.length !== 2) {
      errors.push('State code must be 2 characters');
    }
    
    if (!['de', 'en', 'tr'].includes(config.language)) {
      errors.push('Language must be de, en, or tr');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  async getAvailableQuestionCounts(language: Language, stateCode?: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    stateSpecific?: number;
  }> {
    const allQuestions = await fetchCompleteQuestions(language, stateCode);
    const byCategory = this.getCategoryDistribution(allQuestions.questions);
    
    const result = {
      total: allQuestions.questions.length,
      byCategory
    };
    
    if (stateCode) {
      const stateQuestions = this.filterStateSpecific(allQuestions.questions, stateCode);
      return {
        ...result,
        stateSpecific: stateQuestions.length
      };
    }
    
    return result;
  }

  /**
   * Generate a random number between min (inclusive) and max (exclusive)
   * Uses seeded random if randomSeed is provided, otherwise uses Math.random()
   */
  private getRandomNumber(min: number, max: number, randomSeed?: number): number {
    if (randomSeed !== undefined) {
      // Use the same seeded random approach as shuffleArrayWithSeed
      const seed = (randomSeed + min + max) % 2147483647;
      const normalizedSeed = seed <= 0 ? seed + 2147483646 : seed;
      const seedValue = (normalizedSeed * 16807) % 2147483647;
      const random = (seedValue - 1) / 2147483646;
      return Math.floor(random * (max - min)) + min;
    } else {
      return Math.floor(Math.random() * (max - min)) + min;
    }
  }
}