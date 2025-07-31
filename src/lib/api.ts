import { QuestionsResponse, CategoriesResponse, CategoryResponse, Language } from '@/types/question';

const DATA_BASE_URL = '/data';

export async function fetchQuestions(
  language: Language = 'de',
  page: number = 1
): Promise<QuestionsResponse> {
  const response = await fetch(`${DATA_BASE_URL}/${language}/questions/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.status}`);
  }
  return response.json();
}

export async function fetchCategories(language: Language = 'de'): Promise<CategoriesResponse> {
  const response = await fetch(`${DATA_BASE_URL}/${language}/categories.json`);
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
  const response = await fetch(`${DATA_BASE_URL}/${language}/${categoryId}/page-${page}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch category questions: ${response.status}`);
  }
  return response.json();
}

export async function fetchMetadata() {
  const response = await fetch(`${DATA_BASE_URL}/metadata.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }
  return response.json();
}