const fs = require('fs').promises;
const path = require('path');
const {
  QUESTIONS_PER_PAGE,
  OUTPUT_DIR,
  QUESTIONS_FILE,
  GERMAN_STATES,
  createSlug,
  filterQuestionForLanguage
} = require('./utils');

async function generateCategoriesFile(langDir, categoryMeta, baseQuestions, lang) {
  await fs.writeFile(
    path.join(langDir, 'categories.json'),
    JSON.stringify({
      categories: categoryMeta,
      total: baseQuestions.length,
      language: lang
    }, null, 2)
  );
}

async function generateBaseQuestions(langDir, baseQuestions, lang) {
  const baseTotalPages = Math.ceil(baseQuestions.length / QUESTIONS_PER_PAGE);
  
  // Create base directory
  const baseDir = path.join(langDir, 'all');
  await fs.mkdir(baseDir, { recursive: true });
  
  // Generate paginated files
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
      path.join(baseDir, `page-${page}.json`),
      JSON.stringify(pageData, null, 2)
    );
  }
  
  // Generate full.json file with all base questions
  const fullBaseData = {
    questions: baseQuestions,
    pagination: {
      page: 1,
      totalPages: 1,
      totalQuestions: baseQuestions.length,
      hasNext: false,
      hasPrev: false
    },
    language: lang
  };
  
  await fs.writeFile(
    path.join(baseDir, 'full.json'),
    JSON.stringify(fullBaseData, null, 2)
  );
  
  return baseTotalPages;
}

async function generateStateQuestions(langDir, baseQuestions, stateQuestions, categories, lang) {
  const stateCounts = {};
  
  // Generate state files (/states/{state}/)
  for (const [stateCode, stateName] of Object.entries(GERMAN_STATES)) {
    const stateQs = stateQuestions[stateCode] || [];
    const combinedQuestions = [...baseQuestions, ...stateQs];
    const stateTotalPages = Math.ceil(combinedQuestions.length / QUESTIONS_PER_PAGE);
    stateCounts[stateCode] = {
      name: stateName,
      baseQuestions: baseQuestions.length,
      stateQuestions: stateQs.length,
      total: combinedQuestions.length
    };
    
    // Create state directory
    const stateDir = path.join(langDir, 'states', stateCode);
    await fs.mkdir(stateDir, { recursive: true });
    
    // Create state + all category directory
    const stateAllDir = path.join(langDir, stateCode, 'all');
    await fs.mkdir(stateAllDir, { recursive: true });
    
    // Collect all questions for the full.json file
    const allStateQuestions = [];
    
    // Generate state + all category pages
    for (let page = 1; page <= stateTotalPages; page++) {
      const start = (page - 1) * QUESTIONS_PER_PAGE;
      const end = start + QUESTIONS_PER_PAGE;
      const pageQuestions = combinedQuestions.slice(start, end);
      
      // Add to all questions collection
      allStateQuestions.push(...pageQuestions);
      
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
    
    // Generate full.json file with all questions for this state
    const fullStateData = {
      questions: allStateQuestions,
      state: {
        code: stateCode,
        name: stateName,
        baseQuestions: baseQuestions.length,
        stateQuestions: stateQs.length,
        total: combinedQuestions.length
      },
      pagination: {
        page: 1,
        totalPages: 1,
        totalQuestions: combinedQuestions.length,
        hasNext: false,
        hasPrev: false
      },
      language: lang
    };
    
    await fs.writeFile(
      path.join(stateAllDir, 'full.json'),
      JSON.stringify(fullStateData, null, 2)
    );
    
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
  
  return stateCounts;
}

async function generateCategoryQuestions(langDir, baseQuestions, categories, lang) {
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
    
    // Generate full.json file with all questions for this category
    const fullCategoryData = {
      questions: categoryQuestions,
      category: {
        id: categorySlug,
        name: category,
        total: categoryQuestions.length
      },
      pagination: {
        page: 1,
        totalPages: 1,
        totalQuestions: categoryQuestions.length,
        hasNext: false,
        hasPrev: false
      },
      language: lang
    };
    
    await fs.writeFile(
      path.join(categoryDir, 'full.json'),
      JSON.stringify(fullCategoryData, null, 2)
    );
  }
}

async function generateRandomizationSeeds() {
  // Generate 15 random seeds for question randomization
  const seeds = [];
  for (let i = 0; i < 15; i++) {
    // Generate a random seed using current timestamp and random number
    const seed = Date.now() + Math.floor(Math.random() * 1000000) + i;
    seeds.push(seed);
  }
  
  const seedsData = {
    seeds,
    generated: new Date().toISOString(),
    description: "Random seeds for question shuffling. Pick one randomly on client-side."
  };
  
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'randomization-seeds.json'),
    JSON.stringify(seedsData, null, 2)
  );
  
  return seeds.length;
}

async function generateMetadataFile(allQuestions, categories, languages) {
  const categoryMeta = categories.map(cat => ({
    id: createSlug(cat),
    name: cat,
    count: allQuestions.filter(q => q.category === cat).length
  }));
  
  // Group state questions by state code
  const stateQuestions = {};
  allQuestions.forEach(q => {
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
  
  // Generate metadata file
  const metadata = {
    languages,
    categories: categoryMeta,
    states: Object.entries(GERMAN_STATES).map(([code, name]) => ({
      code,
      name,
      questions: stateQuestions[code] ? stateQuestions[code].length : 0
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
}

module.exports = {
  generateCategoriesFile,
  generateBaseQuestions,
  generateStateQuestions,
  generateCategoryQuestions,
  generateMetadataFile,
  generateRandomizationSeeds
};