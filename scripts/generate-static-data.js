const fs = require('fs').promises;
const path = require('path');

const QUESTIONS_PER_PAGE = 20;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'question.json');

function createSlug(category) {
  return category
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function filterQuestionForLanguage(question, lang) {
  const filtered = {
    id: question.id,
    num: question.num,
    question: lang === 'de' ? question.question : question.translation[lang]?.question || question.question,
    a: lang === 'de' ? question.a : question.translation[lang]?.a || question.a,
    b: lang === 'de' ? question.b : question.translation[lang]?.b || question.b,
    c: lang === 'de' ? question.c : question.translation[lang]?.c || question.c,
    d: lang === 'de' ? question.d : question.translation[lang]?.d || question.d,
    solution: question.solution,
    category: question.category,
    context: lang === 'de' ? question.context : question.translation[lang]?.context || question.context
  };

  // Include all translations only in German version for inline toggle functionality
  if (lang === 'de') {
    filtered.translation = question.translation;
  }

  if (question.image && question.image !== '-') {
    filtered.image = question.image;
  }

  return filtered;
}

async function generateStaticData() {
  try {
    console.log('🚀 Generating static data files...');
    
    // Read questions
    const questionsData = await fs.readFile(QUESTIONS_FILE, 'utf8');
    const questions = JSON.parse(questionsData);
    
    // Get unique categories and clean them
    const categories = [...new Set(questions.map(q => q.category))].sort();
    const categoryMeta = categories.map(cat => ({
      id: createSlug(cat),
      name: cat,
      count: questions.filter(q => q.category === cat).length
    }));
    
    // Supported languages
    const languages = ['de', 'en', 'tr'];
    
    // Create output directory structure
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    for (const lang of languages) {
      const langDir = path.join(OUTPUT_DIR, lang);
      await fs.mkdir(langDir, { recursive: true });
      await fs.mkdir(path.join(langDir, 'questions'), { recursive: true });
      
      // Generate categories.json for each language
      await fs.writeFile(
        path.join(langDir, 'categories.json'),
        JSON.stringify({
          categories: categoryMeta,
          total: questions.length,
          language: lang
        }, null, 2)
      );
      
      // Filter questions for this language
      const langQuestions = questions.map(q => filterQuestionForLanguage(q, lang));
      
      // Generate paginated questions
      const totalPages = Math.ceil(langQuestions.length / QUESTIONS_PER_PAGE);
      
      for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;
        const pageQuestions = langQuestions.slice(start, end);
        
        const pageData = {
          questions: pageQuestions,
          pagination: {
            page,
            totalPages,
            totalQuestions: langQuestions.length,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          language: lang
        };
        
        await fs.writeFile(
          path.join(langDir, 'questions', `page-${page}.json`),
          JSON.stringify(pageData, null, 2)
        );
      }
      
      // Generate category-specific files
      for (const category of categories) {
        const categorySlug = createSlug(category);
        const categoryDir = path.join(langDir, categorySlug);
        await fs.mkdir(categoryDir, { recursive: true });
        
        const categoryQuestions = langQuestions.filter(q => q.category === category);
        const categoryTotalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
        
        for (let page = 1; page <= categoryTotalPages; page++) {
          const start = (page - 1) * QUESTIONS_PER_PAGE;
          const end = start + QUESTIONS_PER_PAGE;
          const pageQuestions = categoryQuestions.slice(start, end);
          
          const pageData = {
            questions: pageQuestions,
            category: {
              id: categorySlug,
              name: category,
              total: categoryQuestions.length
            },
            pagination: {
              page,
              totalPages: categoryTotalPages,
              totalQuestions: categoryQuestions.length,
              hasNext: page < categoryTotalPages,
              hasPrev: page > 1
            },
            language: lang
          };
          
          await fs.writeFile(
            path.join(categoryDir, `page-${page}.json`),
            JSON.stringify(pageData, null, 2)
          );
        }
      }
      
      console.log(`✅ Generated ${lang} files: ${totalPages} question pages, ${categories.length} categories`);
    }
    
    // Generate metadata file
    const metadata = {
      languages,
      categories: categoryMeta,
      questionsPerPage: QUESTIONS_PER_PAGE,
      totalQuestions: questions.length,
      generated: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log('🎉 Static data generation completed!');
    console.log(`📁 Generated files in: ${OUTPUT_DIR}`);
    console.log(`📊 Total: ${questions.length} questions, ${categories.length} categories, ${languages.length} languages`);
    
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

generateStaticData();