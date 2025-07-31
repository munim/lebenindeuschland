import { QuestionsResponse, CategoriesResponse, CategoryResponse, Language } from '@/types/question';

// Fetch all base questions (no filters)
export async function fetchAllQuestions(
  language: Language = 'de',
  page: number = 1
): Promise<QuestionsResponse> {
  const response = await fetch(`/data/${language}/all/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch all questions: ${response.status}`);
  }
  return response.json();
}

// Fetch category questions (category filter only)
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

// Fetch state questions (state filter only - base + state questions)
export async function fetchStateQuestions(
  stateCode: string,
  language: Language = 'de',
  page: number = 1
): Promise<QuestionsResponse> {
  const response = await fetch(`/data/${language}/states/${stateCode}/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch state questions: ${response.status}`);
  }
  return response.json();
}

// Fetch state + category questions (both filters active)
export async function fetchStateCategoryQuestions(
  stateCode: string,
  categoryId: string,
  language: Language = 'de',
  page: number = 1
): Promise<QuestionsResponse> {
  // Use "all" for all categories, otherwise use the category slug directly
  const categoryPath = categoryId === 'all' ? 'all' : categoryId;
  
  // Fetch directly from the pre-filtered state+category file
  const response = await fetch(`/data/${language}/${stateCode}/${categoryPath}/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch state category questions: ${response.status}`);
  }
  
  return response.json();
}

// Fetch categories list
export async function fetchCategories(language: Language = 'de'): Promise<CategoriesResponse> {
  const response = await fetch(`/data/${language}/categories.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }
  return response.json();
}

// Fetch metadata
export async function fetchMetadata() {
  const response = await fetch(`/data/metadata.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }
  return response.json();
}