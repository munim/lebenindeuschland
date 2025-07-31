const fs = require('fs').promises;
const path = require('path');

const QUESTIONS_PER_PAGE = 20;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'question.json');

// German states mapping
const GERMAN_STATES = {
  'NW': 'Nordrhein-Westfalen',
  'BY': 'Bayern', 
  'BW': 'Baden-Württemberg',
  'NI': 'Niedersachsen',
  'HE': 'Hessen',
  'RP': 'Rheinland-Pfalz',
  'SN': 'Sachsen',
  'ST': 'Sachsen-Anhalt',
  'TH': 'Thüringen',
  'BB': 'Brandenburg',
  'MV': 'Mecklenburg-Vorpommern',
  'SL': 'Saarland',
  'HH': 'Hamburg',
  'HB': 'Bremen',
  'BE': 'Berlin',
  'SH': 'Schleswig-Holstein'
};

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
    console.log('🚀 Generating optimized static data files...');
    
    // Read questions
    const questionsData = await fs.readFile(QUESTIONS_FILE, 'utf8');
    const allQuestions = JSON.parse(questionsData);
    
    // Get unique categories
    const categories = [...new Set(allQuestions.map(q => q.category))].sort();
    const categoryMeta = categories.map(cat => ({
      id: createSlug(cat),
      name: cat,
      count: allQuestions.filter(q => q.category === cat).length
    }));
    
    // Supported languages
    const languages = ['de', 'en', 'tr'];
    
    // Create output directory structure
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    for (const lang of languages) {
      const langDir = path.join(OUTPUT_DIR, lang);
      await fs.mkdir(langDir, { recursive: true });
      await fs.mkdir(path.join(langDir, 'all'), { recursive: true });
      await fs.mkdir(path.join(langDir, 'states'), { recursive: true });
      
      // Filter questions for this language
      const langQuestions = allQuestions.map(q => filterQuestionForLanguage(q, lang));
      
      // Separate base questions (1-300) from state questions
      const baseQuestions = langQuestions.filter(q => 
        /^\d+$/.test(q.num) && parseInt(q.num) <= 300
      ).sort((a, b) => parseInt(a.num) - parseInt(b.num));
      
      // Group state questions by state code
      const stateQuestions = {};
      langQuestions.forEach(q => {
        const match = q.num.match(/^([A-Z]{2})-\d+$/);
        if (match) {
          const stateCode = match[1];
          if (GERMAN_STATES[stateCode]) {
            if (!stateQuestions[stateCode]) {
              stateQuestions[stateCode] = [];
            }
            stateQuestions[stateCode].push(q);
          }
        }
      });
      
      // Sort state questions within each state
      Object.keys(stateQuestions).forEach(stateCode => {
        stateQuestions[stateCode].sort((a, b) => {
          const aNum = parseInt(a.num.split('-')[1]);
          const bNum = parseInt(b.num.split('-')[1]);
          return aNum - bNum;
        });
      });
      
      // Generate categories.json
      await fs.writeFile(
        path.join(langDir, 'categories.json'),
        JSON.stringify({
          categories: categoryMeta,
          total: baseQuestions.length,
          language: lang
        }, null, 2)
      );
      
      // Generate base questions (/all/)
      const baseTotalPages = Math.ceil(baseQuestions.length / QUESTIONS_PER_PAGE);
      for (let page = 1; page <= baseTotalPages; page++) {
        const start = (page - 1) * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;
        const pageQuestions = baseQuestions.slice(start, end);
        
        const pageData = {
          questions: pageQuestions,
          pagination: {
            page,
            totalPages: baseTotalPages,
            totalQuestions: baseQuestions.length,
            hasNext: page < baseTotalPages,
            hasPrev: page > 1
          },
          language: lang
        };
        
        await fs.writeFile(
          path.join(langDir, 'all', `page-${page}.json`),
          JSON.stringify(pageData, null, 2)
        );
      }
      
      // Generate state files (/states/{state}/)
      for (const [stateCode, stateName] of Object.entries(GERMAN_STATES)) {
        const stateQs = stateQuestions[stateCode] || [];
        const combinedQuestions = [...baseQuestions, ...stateQs];
        const stateTotalPages = Math.ceil(combinedQuestions.length / QUESTIONS_PER_PAGE);
        
        // Create state directory
        const stateDir = path.join(langDir, 'states', stateCode);
        await fs.mkdir(stateDir, { recursive: true });
        
        // Create state + all category directory
        const stateAllDir = path.join(langDir, stateCode, 'all');
        await fs.mkdir(stateAllDir, { recursive: true });
        
        // Generate state + all category pages
        for (let page = 1; page <= stateTotalPages; page++) {
          const start = (page - 1) * QUESTIONS_PER_PAGE;
          const end = start + QUESTIONS_PER_PAGE;
          const pageQuestions = combinedQuestions.slice(start, end);
          
          const pageData = {
            questions: pageQuestions,
            state: {
              code: stateCode,
              name: stateName,
              baseQuestions: baseQuestions.length,
              stateQuestions: stateQs.length,
              total: combinedQuestions.length
            },
            pagination: {
              page,
              totalPages: stateTotalPages,
              totalQuestions: combinedQuestions.length,
              hasNext: page < stateTotalPages,
              hasPrev: page > 1
            },
            language: lang
          };
          
          // Write to both old and new locations for compatibility
          await fs.writeFile(
            path.join(stateDir, `page-${page}.json`),
            JSON.stringify(pageData, null, 2)
          );
          
          await fs.writeFile(
            path.join(stateAllDir, `page-${page}.json`),
            JSON.stringify(pageData, null, 2)
          );
        }
        
        // Generate state + category specific files
        for (const category of categories) {
          const categorySlug = createSlug(category);
          const stateCategoryDir = path.join(langDir, stateCode, categorySlug);
          await fs.mkdir(stateCategoryDir, { recursive: true });
          
          const stateCategoryQuestions = combinedQuestions.filter(q => q.category === category);
          const stateCategoryTotalPages = Math.ceil(stateCategoryQuestions.length / QUESTIONS_PER_PAGE);
          
          for (let page = 1; page <= stateCategoryTotalPages; page++) {
            const start = (page - 1) * QUESTIONS_PER_PAGE;
            const end = start + QUESTIONS_PER_PAGE;
            const pageQuestions = stateCategoryQuestions.slice(start, end);
            
            const pageData = {
              questions: pageQuestions,
              state: {
                code: stateCode,
                name: stateName,
                baseQuestions: baseQuestions.length,
                stateQuestions: stateQs.length,
                total: combinedQuestions.length
              },
              category: {
                id: categorySlug,
                name: category,
                total: stateCategoryQuestions.length
              },
              pagination: {
                page,
                totalPages: stateCategoryTotalPages,
                totalQuestions: stateCategoryQuestions.length,
                hasNext: page < stateCategoryTotalPages,
                hasPrev: page > 1
              },
              language: lang
            };
            
            await fs.writeFile(
              path.join(stateCategoryDir, `page-${page}.json`),
              JSON.stringify(pageData, null, 2)
            );
          }
        }
      }
      
      // Generate category-specific files
      for (const category of categories) {
        const categorySlug = createSlug(category);
        const categoryDir = path.join(langDir, categorySlug);
        await fs.mkdir(categoryDir, { recursive: true });
        
        const categoryQuestions = baseQuestions.filter(q => q.category === category);
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
      
      console.log(`✅ Generated ${lang} files:`);
      console.log(`   📖 Base questions: ${baseTotalPages} pages (${baseQuestions.length} questions)`);
      console.log(`   🏛️  States: ${Object.keys(GERMAN_STATES).length} states`);
      console.log(`   📚 Categories: ${categories.length} categories`);
    }
    
    // Generate metadata file
    const metadata = {
      languages,
      categories: categoryMeta,
      states: Object.entries(GERMAN_STATES).map(([code, name]) => ({
        code,
        name,
        questions: 10 // Each state has 10 questions
      })),
      questionsPerPage: QUESTIONS_PER_PAGE,
      totalBaseQuestions: allQuestions.filter(q => /^\d+$/.test(q.num) && parseInt(q.num) <= 300).length,
      totalQuestions: allQuestions.length,
      generated: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log('🎉 Optimized static data generation completed!');
    console.log(`📁 Generated files in: ${OUTPUT_DIR}`);
    console.log(`📊 Total: ${allQuestions.length} questions, ${categories.length} categories, ${Object.keys(GERMAN_STATES).length} states, ${languages.length} languages`);
    
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

generateStaticData();