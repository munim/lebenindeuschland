import { Question, TestConfig, Language } from '@/types/question';
import { fetchCompleteQuestions } from '@/lib/api';

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
  static readonly STATE_QUESTIONS_COUNT = 10;

  async generateTestQuestions(config: TestConfig): Promise<QuestionSelectionResult> {
    const { stateCode, totalQuestions, language } = config;
    
    if (stateCode) {
      return this.generateStateBasedTest(stateCode, language, totalQuestions);
    }
    
    return this.generateGeneralTest(language, totalQuestions);
  }

  private async generateStateBasedTest(
    stateCode: string, 
    language: Language, 
    totalQuestions: number
  ): Promise<QuestionSelectionResult> {
    // Fetch all questions for the state (includes general + state-specific)
    const allQuestions = await fetchCompleteQuestions(language, stateCode);
    
    // Separate state-specific vs general questions
    const stateQuestions = this.filterStateSpecific(allQuestions.questions, stateCode);
    const generalQuestions = this.filterGeneral(allQuestions.questions, stateCode);
    
    // Calculate distribution: 10 state + 23 general
    const stateQuestionsToSelect = Math.min(QuestionGenerationService.STATE_QUESTIONS_COUNT, stateQuestions.length);
    const generalQuestionsToSelect = totalQuestions - stateQuestionsToSelect;
    
    // Select questions
    const selectedStateQuestions = this.randomSample(stateQuestions, stateQuestionsToSelect);
    const selectedGeneralQuestions = this.balancedSampleByCategory(generalQuestions, generalQuestionsToSelect);
    
    // Combine and shuffle
    const finalQuestions = this.shuffleQuestions([...selectedStateQuestions, ...selectedGeneralQuestions]);
    
    return {
      questions: finalQuestions,
      metadata: {
        totalAvailable: allQuestions.questions.length,
        stateQuestions: selectedStateQuestions.length,
        generalQuestions: selectedGeneralQuestions.length,
        categoryDistribution: this.getCategoryDistribution([...selectedStateQuestions, ...selectedGeneralQuestions])
      }
    };
  }

  private async generateGeneralTest(language: Language, totalQuestions: number): Promise<QuestionSelectionResult> {
    // Fetch all general questions (no state filter)
    const allQuestions = await fetchCompleteQuestions(language);
    
    // Select balanced questions across categories
    const selectedQuestions = this.balancedSampleByCategory(allQuestions.questions, totalQuestions);
    
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

  private balancedSampleByCategory(questions: Question[], count: number): Question[] {
    // Group questions by category
    const categorized = this.groupByCategory(questions);
    
    // Calculate proportional distribution
    const distribution = this.calculateCategoryDistribution(categorized, count);
    
    // Sample from each category
    const selected: Question[] = [];
    Object.entries(distribution).forEach(([category, categoryCount]) => {
      const categoryQuestions = categorized[category] || [];
      const sampled = this.randomSample(categoryQuestions, categoryCount);
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
    
    return this.shuffleQuestions(selected.slice(0, count));
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

  private randomSample<T>(array: T[], count: number): T[] {
    if (count >= array.length) return [...array];
    
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }

  private shuffleQuestions(questions: Question[]): Question[] {
    return this.randomSample(questions, questions.length);
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
}