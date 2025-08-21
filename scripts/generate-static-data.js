const fs = require('fs').promises;
const path = require('path');
const {
  QUESTIONS_PER_PAGE,
  OUTPUT_DIR,
  QUESTIONS_FILE,
  GERMAN_STATES,
  createSlug,
  filterQuestionForLanguage
} = require('./lib/utils');
const {
  generateCategoriesFile,
  generateBaseQuestions,
  generateStateQuestions,
  generateCategoryQuestions,
  generateMetadataFile
} = require('./lib/generators');

async function generateStaticData() {
  try {
    console.log('🚀 Generating optimized static data files...');
    
    // Read questions
    const questionsData = await fs.readFile(QUESTIONS_FILE, 'utf8');
    const allQuestions = JSON.parse(questionsData);
    
    // Get unique categories
    const categories = [...new Set(allQuestions.map(q => q.category))].sort();
    
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
      const categoryMeta = categories.map(cat => ({
        id: createSlug(cat),
        name: cat,
        count: allQuestions.filter(q => q.category === cat).length
      }));
      
      await generateCategoriesFile(langDir, categoryMeta, baseQuestions, lang);
      
      // Generate base questions (/all/)
      const baseTotalPages = await generateBaseQuestions(langDir, baseQuestions, lang);
      
      // Generate state files
      await generateStateQuestions(langDir, baseQuestions, stateQuestions, categories, lang);
      
      // Generate category-specific files
      await generateCategoryQuestions(langDir, baseQuestions, categories, lang);
      
      console.log(`✅ Generated ${lang} files:`);
      console.log(`   📖 Base questions: ${baseTotalPages} pages (${baseQuestions.length} questions)`);
      console.log(`   🏛️  States: ${Object.keys(GERMAN_STATES).length} states`);
      console.log(`   📚 Categories: ${categories.length} categories`);
    }
    
    // Generate metadata file
    await generateMetadataFile(allQuestions, categories, languages);
    
    console.log('🎉 Optimized static data generation completed!');
    console.log(`📁 Generated files in: ${OUTPUT_DIR}`);
    console.log(`📊 Total: ${allQuestions.length} questions, ${categories.length} categories, ${Object.keys(GERMAN_STATES).length} states, ${languages.length} languages`);
    
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

generateStaticData();