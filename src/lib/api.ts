import { QuestionsResponse, CategoriesResponse, CategoryResponse, Language } from '@/types/question';

export async function fetchQuestions(
  language: Language = 'de',
  page: number = 1
): Promise<QuestionsResponse> {
  const response = await fetch(`/data/${language}/questions/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.status}`);
  }
  return response.json();
}

export async function fetchCategories(language: Language = 'de'): Promise<CategoriesResponse> {
  const response = await fetch(`/data/${language}/categories.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }
  return response.json();
}

export async function fetchCategoryQuestions(
  categoryId: string,
  language: Language = 'de',
  page: number = 1
): Promise<CategoryResponse> {
  const response = await fetch(`/data/${language}/${categoryId}/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch category questions: ${response.status}`);
  }
  return response.json();
}

export async function fetchStateQuestions(
  stateCode: string,
  language: Language = 'de',
  page: number = 1
): Promise<QuestionsResponse> {
  // For state questions, we need to filter from the main question set
  // since they're not pre-organized into separate files
  let currentPage = 1;
  let hasMore = true;
  
  // Collect all questions to filter by state
  const stateQuestions = [];
  while (hasMore) {
    try {
      const response = await fetch(`/data/${language}/questions/page-${currentPage}.json`);
      if (!response.ok) break;
      
      const data = await response.json();
      const matchingQuestions = data.questions.filter((q: { num: string }) => 
        q.num.startsWith(`${stateCode}-`)
      );
      stateQuestions.push(...matchingQuestions);
      
      hasMore = data.pagination.hasNext;
      currentPage++;
    } catch {
      break;
    }
  }
  
  // Paginate the filtered results
  const questionsPerPage = 20;
  const startIndex = (page - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const paginatedQuestions = stateQuestions.slice(startIndex, endIndex);
  
  return {
    questions: paginatedQuestions,
    pagination: {
      page,
      totalPages: Math.ceil(stateQuestions.length / questionsPerPage),
      totalQuestions: stateQuestions.length,
      hasNext: endIndex < stateQuestions.length,
      hasPrev: page > 1
    },
    language
  };
}

export async function fetchMetadata() {
  const response = await fetch(`/data/metadata.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }
  return response.json();
}