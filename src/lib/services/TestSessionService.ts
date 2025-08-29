import { TestSession, TestConfig, TestResult, Question } from '@/types/question';
import { QuestionGenerationService } from './QuestionGenerationService';
import { TestScoringService } from './TestScoringService';
import { MistakePracticeService, MistakePracticeOptions } from './MistakePracticeService';
import { getTestSessionRepository, getTestResultRepository } from '../repositories/RepositoryFactory';
import { initializeRandomization, isRandomizationEnabled, clearSessionRandomizationSeed } from '../randomization';

export type TestSessionStatus = 'setup' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface SessionProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  percentage: number;
}

export class TestSessionService {
  private questionGenerationService: QuestionGenerationService;

  constructor() {
    this.questionGenerationService = new QuestionGenerationService();
  }

  async createMistakePracticeSession(options: MistakePracticeOptions): Promise<TestSession> {
    // Check for existing active session
    const existingSession = await this.findActiveSession();
    if (existingSession) {
      throw new Error('An active test session already exists. Complete or abandon it first.');
    }

    // Generate mistake practice data
    const practiceData = await MistakePracticeService.createMistakePracticeSession(options);
    
    if (practiceData.questions.length === 0) {
      throw new Error('No mistake questions available for practice. Complete some tests first.');
    }

    // Create new session with mistake questions
    const session: TestSession = {
      id: this.generateSessionId(),
      state: practiceData.category || 'mistake-practice',
      questions: practiceData.questions,
      answers: {},
      startTime: new Date(),
      status: 'active',
      currentQuestionIndex: 0,
      mistakePracticeData: practiceData
    };

    // Save to repository
    const repository = getTestSessionRepository();
    await repository.save(session);

    return session;
  }

  async createSession(config: TestConfig): Promise<TestSession> {
    // Validate configuration
    const validation = this.questionGenerationService.validateTestConfiguration(config);
    if (!validation.valid) {
      throw new Error(`Invalid test configuration: ${validation.errors.join(', ')}`);
    }

    // Check for existing active session
    const existingSession = await this.findActiveSession();
    if (existingSession) {
      throw new Error('An active test session already exists. Complete or abandon it first.');
    }

    // Get randomization seed if randomization is enabled
    let randomSeed: number | undefined;
    if (isRandomizationEnabled()) {
      try {
        randomSeed = await initializeRandomization();
      } catch (error) {
        console.warn('Failed to initialize randomization, falling back to non-deterministic:', error);
      }
    }

    // Generate questions for the test
    const questionResult = await this.questionGenerationService.generateTestQuestions(config, randomSeed);

    // Create new session
    const session: TestSession = {
      id: this.generateSessionId(),
      state: config.stateCode || '',
      questions: questionResult.questions,
      answers: {},
      startTime: new Date(),
      status: 'active',
      currentQuestionIndex: 0
    };

    // Save to repository
    const repository = getTestSessionRepository();
    await repository.save(session);

    return session;
  }

  async findActiveSession(): Promise<TestSession | null> {
    const repository = getTestSessionRepository();
    return await repository.findActiveSession();
  }

  async findIncompleteSession(): Promise<TestSession | null> {
    const repository = getTestSessionRepository();
    return await repository.findIncompleteSession();
  }

  async resumeSession(sessionId: string): Promise<TestSession> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    if (session.status !== 'active' && session.status !== 'paused') {
      throw new Error(`Cannot resume session with status: ${session.status}`);
    }

    // Update status to active if it was paused
    if (session.status === 'paused') {
      session.status = 'active';
      await repository.save(session);
    }

    return session;
  }

  async pauseSession(sessionId: string): Promise<void> {
    const repository = getTestSessionRepository();
    await repository.update(sessionId, { 
      status: 'paused' as const 
    });
  }

  async saveProgress(sessionId: string, questionIndex: number, answer: string): Promise<void> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot save progress for session with status: ${session.status}`);
    }

    // Get the current question
    const currentQuestion = session.questions[questionIndex];
    if (!currentQuestion) {
      throw new Error(`Invalid question index: ${questionIndex}`);
    }

    // Update answers and current question index
    const updatedAnswers = { ...session.answers };
    updatedAnswers[currentQuestion.id] = answer;

    await repository.update(sessionId, {
      answers: updatedAnswers,
      currentQuestionIndex: questionIndex
    });
  }

  async submitAnswer(sessionId: string, questionId: string, answer: string): Promise<void> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    // Update answers
    const updatedAnswers = { ...session.answers };
    updatedAnswers[questionId] = answer;

    await repository.saveProgress(sessionId, updatedAnswers);
  }

  async navigateToQuestion(sessionId: string, questionIndex: number): Promise<void> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    if (questionIndex < 0 || questionIndex >= session.questions.length) {
      throw new Error(`Invalid question index: ${questionIndex}`);
    }

    await repository.update(sessionId, {
      currentQuestionIndex: questionIndex
    });
  }

  async completeSession(sessionId: string): Promise<TestResult> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    if (session.status === 'completed') {
      // Session already completed, return existing result
      const resultRepository = getTestResultRepository();
      const existingResults = await resultRepository.findBy({ sessionId: session.id } as Partial<TestResult>);
      if (existingResults.length > 0) {
        return existingResults[0];
      }
      // If no result found but session is completed, fall through to create result
    } else if (session.status !== 'active') {
      throw new Error(`Cannot complete session with status: ${session.status}`);
    }

    // Calculate score and create result
    const endTime = new Date();
    const scoreDetails = TestScoringService.calculateScoreDetails({
      ...session,
      endTime
    });

    // If this is a mistake practice session, remove correctly answered questions from mistake lists
    if (session.mistakePracticeData && scoreDetails.correctQuestions.length > 0) {
      const correctlyAnsweredQuestionIds = scoreDetails.correctQuestions.map(q => q.id);
      await MistakePracticeService.removeCorrectlyAnsweredMistakes(correctlyAnsweredQuestionIds);
    }

    const testResult: TestResult = {
      id: this.generateResultId(),
      sessionId: session.id,
      score: scoreDetails.correctAnswers,
      passed: scoreDetails.passed,
      mistakes: scoreDetails.mistakes,
      correctAnswers: scoreDetails.correctQuestions,
      completedAt: endTime,
      state: session.state,
      timeTaken: Math.floor((endTime.getTime() - (session.startTime instanceof Date ? session.startTime.getTime() : new Date(session.startTime).getTime())) / 1000),
      categoryBreakdown: scoreDetails.categoryBreakdown,
      isFullyCompleted: scoreDetails.unansweredQuestions === 0,
      unansweredQuestions: scoreDetails.unansweredQuestions,
      testType: session.mistakePracticeData ? 'mistake-practice' : 'normal',
      sourceTestIds: session.mistakePracticeData?.sourceTestIds
    };

    // Save result and update session
    const resultRepository = getTestResultRepository();
    await resultRepository.save(testResult);
    
    await repository.completeSession(sessionId);
    
    // Clear randomization seed so next test gets a different seed
    clearSessionRandomizationSeed();

    return testResult;
  }

  async abandonSession(sessionId: string): Promise<void> {
    const repository = getTestSessionRepository();
    await repository.update(sessionId, { 
      status: 'abandoned' as const,
      endTime: new Date()
    });
    
    // Clear randomization seed so next test gets a different seed
    clearSessionRandomizationSeed();
  }

  async getSessionProgress(sessionId: string): Promise<SessionProgress> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    const answeredQuestions = Object.keys(session.answers).length;
    const totalQuestions = session.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return {
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions,
      answeredQuestions,
      percentage
    };
  }

  async getCurrentQuestion(sessionId: string): Promise<Question | null> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      return null;
    }

    if (session.currentQuestionIndex >= 0 && session.currentQuestionIndex < session.questions.length) {
      return session.questions[session.currentQuestionIndex];
    }

    return null;
  }

  async canNavigateNext(sessionId: string): Promise<boolean> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      return false;
    }

    return session.currentQuestionIndex < session.questions.length - 1;
  }

  async canNavigatePrevious(sessionId: string): Promise<boolean> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      return false;
    }

    return session.currentQuestionIndex > 0;
  }

  async getUnansweredQuestions(sessionId: string): Promise<Question[]> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    if (!session) {
      return [];
    }

    return session.questions.filter(question => !session.answers[question.id]);
  }

  async hasRequiredAnswers(sessionId: string): Promise<boolean> {
    const unanswered = await this.getUnansweredQuestions(sessionId);
    return unanswered.length === 0;
  }

  async validateSessionForSubmission(sessionId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const repository = getTestSessionRepository();
    const session = await repository.findById(sessionId);
    
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!session) {
      errors.push('Session not found');
      return { valid: false, errors, warnings };
    }

    if (session.status !== 'active') {
      errors.push(`Cannot submit session with status: ${session.status}`);
    }

    const unansweredQuestions = await this.getUnansweredQuestions(sessionId);
    if (unansweredQuestions.length > 0) {
      warnings.push(`${unansweredQuestions.length} question(s) left unanswered`);
    }

    // Check if minimum time has passed (prevent instant submissions)
    const minimumTimeSeconds = 60; // At least 1 minute
    const elapsedSeconds = Math.floor((new Date().getTime() - (session.startTime instanceof Date ? session.startTime.getTime() : new Date(session.startTime).getTime())) / 1000);
    
    if (elapsedSeconds < minimumTimeSeconds) {
      warnings.push('Test completed very quickly - please review your answers');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // Session recovery and cleanup
  async cleanupAbandonedSessions(): Promise<number> {
    const repository = getTestSessionRepository();
    const allSessions = await repository.findAll();
    
    const staleTime = new Date();
    staleTime.setHours(staleTime.getHours() - 24); // 24 hours ago
    
    let cleaned = 0;
    for (const session of allSessions) {
      if (session.status === 'active' && session.startTime < staleTime) {
        await this.abandonSession(session.id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  async getSessionStatistics(): Promise<{
    active: number;
    completed: number;
    abandoned: number;
    total: number;
  }> {
    const repository = getTestSessionRepository();
    const allSessions = await repository.findAll();
    
    return {
      active: allSessions.filter(s => s.status === 'active').length,
      completed: allSessions.filter(s => s.status === 'completed').length,
      abandoned: allSessions.filter(s => s.status === 'abandoned').length,
      total: allSessions.length
    };
  }
}