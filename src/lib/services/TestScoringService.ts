import { TestSession, Question, CategoryScore } from '@/types/question';

export interface TestScore {
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  passingThreshold: number;
}

export interface TestScoreDetails extends TestScore {
  categoryBreakdown: CategoryScore[];
  mistakes: Question[];
  correctQuestions: Question[];
  timePerQuestion?: number; // average time per question in seconds
}

export class TestScoringService {
  private static readonly PASSING_SCORE = 30; // 30 out of 33 questions

  static calculateScore(session: TestSession): TestScore {
    const { questions, answers } = session;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    
    questions.forEach(question => {
      const selectedAnswer = answers[question.id];
      if (!selectedAnswer) {
        unanswered++;
      } else if (selectedAnswer === question.solution) {
        correct++;
      } else {
        incorrect++;
      }
    });
    
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    
    return {
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unansweredQuestions: unanswered,
      totalQuestions,
      percentage,
      passed: correct >= this.PASSING_SCORE,
      passingThreshold: this.PASSING_SCORE
    };
  }

  static calculateScoreDetails(session: TestSession): TestScoreDetails {
    const baseScore = this.calculateScore(session);
    const { questions, answers, startTime, endTime } = session;
    
    // Categorize questions by result
    const mistakes: Question[] = [];
    const correctQuestions: Question[] = [];
    
    questions.forEach(question => {
      const selectedAnswer = answers[question.id];
      if (selectedAnswer === question.solution) {
        correctQuestions.push(question);
      } else if (selectedAnswer) {
        // Only count as mistake if answered (not unanswered)
        mistakes.push(question);
      }
    });
    
    // Calculate category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(questions, answers);
    
    // Calculate average time per question
    let timePerQuestion: number | undefined;
    if (startTime && endTime) {
      const totalTimeSeconds = Math.floor((endTime.getTime() - (startTime instanceof Date ? startTime.getTime() : new Date(startTime).getTime())) / 1000);
      timePerQuestion = Math.round(totalTimeSeconds / questions.length);
    }
    
    return {
      ...baseScore,
      categoryBreakdown,
      mistakes,
      correctQuestions,
      timePerQuestion
    };
  }

  static calculateCategoryBreakdown(
    questions: Question[], 
    answers: Record<string, string>
  ): CategoryScore[] {
    const categoryMap = new Map<string, { correct: number; total: number; attempted: number }>();
    
    questions.forEach(question => {
      const category = question.category;
      const selectedAnswer = answers[question.id];
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { correct: 0, total: 0, attempted: 0 });
      }
      
      const categoryData = categoryMap.get(category)!;
      categoryData.total++;
      
      if (selectedAnswer) {
        categoryData.attempted++;
        if (selectedAnswer === question.solution) {
          categoryData.correct++;
        }
      }
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      correct: data.correct,
      total: data.total,
      accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0
    })).sort((a, b) => a.category.localeCompare(b.category));
  }

  static identifyMistakes(session: TestSession): Question[] {
    const { questions, answers } = session;
    return questions.filter(question => {
      const selectedAnswer = answers[question.id];
      return selectedAnswer && selectedAnswer !== question.solution;
    });
  }

  static identifyCorrectAnswers(session: TestSession): Question[] {
    const { questions, answers } = session;
    return questions.filter(question => {
      const selectedAnswer = answers[question.id];
      return selectedAnswer === question.solution;
    });
  }

  static getUnansweredQuestions(session: TestSession): Question[] {
    const { questions, answers } = session;
    return questions.filter(question => !answers[question.id]);
  }

  static calculatePassingProbability(session: TestSession): {
    currentScore: number;
    questionsRemaining: number;
    minCorrectNeeded: number;
    passingPossible: boolean;
    passingProbability: number;
  } {
    const currentScore = this.calculateScore(session);
    const questionsRemaining = currentScore.unansweredQuestions;
    const minCorrectNeeded = Math.max(0, this.PASSING_SCORE - currentScore.correctAnswers);
    const passingPossible = minCorrectNeeded <= questionsRemaining;
    
    // Simple probability assuming random guessing (25% chance per question)
    const passingProbability = passingPossible 
      ? Math.pow(0.25, minCorrectNeeded) * 100 
      : 0;
    
    return {
      currentScore: currentScore.correctAnswers,
      questionsRemaining,
      minCorrectNeeded,
      passingPossible,
      passingProbability: Math.round(passingProbability)
    };
  }

  static analyzePerformancePatterns(session: TestSession): {
    strongCategories: string[];
    weakCategories: string[];
    consistencyScore: number; // 0-100, higher = more consistent performance
    difficultyPattern: 'improving' | 'declining' | 'consistent' | 'mixed';
  } {
    const categoryBreakdown = this.calculateCategoryBreakdown(session.questions, session.answers);
    
    // Sort categories by accuracy
    const sortedCategories = [...categoryBreakdown].sort((a, b) => b.accuracy - a.accuracy);
    
    const strongCategories = sortedCategories
      .filter(cat => cat.accuracy >= 80)
      .map(cat => cat.category);
      
    const weakCategories = sortedCategories
      .filter(cat => cat.accuracy < 60)
      .map(cat => cat.category);
    
    // Calculate consistency (lower variance = higher consistency)
    const accuracies = categoryBreakdown.map(cat => cat.accuracy);
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length;
    const consistencyScore = Math.max(0, Math.round(100 - variance));
    
    // Analyze difficulty pattern (simplified - would need question difficulty data for full analysis)
    let difficultyPattern: 'improving' | 'declining' | 'consistent' | 'mixed' = 'mixed';
    
    // For now, base on score distribution across question sequence
    const quarterSize = Math.ceil(session.questions.length / 4);
    const quarters = [
      session.questions.slice(0, quarterSize),
      session.questions.slice(quarterSize, quarterSize * 2),
      session.questions.slice(quarterSize * 2, quarterSize * 3),
      session.questions.slice(quarterSize * 3)
    ];
    
    const quarterScores = quarters.map(quarter => {
      const correct = quarter.filter(q => session.answers[q.id] === q.solution).length;
      return quarter.length > 0 ? correct / quarter.length : 0;
    });
    
    if (quarterScores[3] > quarterScores[0] + 0.2) {
      difficultyPattern = 'improving';
    } else if (quarterScores[0] > quarterScores[3] + 0.2) {
      difficultyPattern = 'declining';
    } else if (Math.max(...quarterScores) - Math.min(...quarterScores) < 0.1) {
      difficultyPattern = 'consistent';
    }
    
    return {
      strongCategories,
      weakCategories,
      consistencyScore,
      difficultyPattern
    };
  }

  static generateScoreSummary(session: TestSession): string {
    const score = this.calculateScore(session);
    const details = this.calculateScoreDetails(session);
    
    let summary = `Test Results: ${score.correctAnswers}/${score.totalQuestions} (${score.percentage}%)`;
    
    if (score.passed) {
      summary += ' ✅ PASSED';
    } else {
      const needed = this.PASSING_SCORE - score.correctAnswers;
      summary += ` ❌ FAILED - Need ${needed} more correct answer${needed > 1 ? 's' : ''} to pass`;
    }
    
    if (details.timePerQuestion) {
      const minutes = Math.floor(details.timePerQuestion / 60);
      const seconds = details.timePerQuestion % 60;
      summary += ` | Avg time: ${minutes}:${seconds.toString().padStart(2, '0')} per question`;
    }
    
    return summary;
  }

  static isValidScore(score: TestScore): boolean {
    return (
      score.correctAnswers >= 0 &&
      score.incorrectAnswers >= 0 &&
      score.unansweredQuestions >= 0 &&
      score.correctAnswers + score.incorrectAnswers + score.unansweredQuestions === score.totalQuestions &&
      score.percentage >= 0 &&
      score.percentage <= 100
    );
  }
}