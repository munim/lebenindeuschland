// Simple test for randomization logic
class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

function shuffleArrayWithSeed(array, seed) {
  const shuffled = [...array];
  const rng = new SeededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Test data
const questions = [
  { id: 1, question: 'Q1' },
  { id: 2, question: 'Q2' },
  { id: 3, question: 'Q3' },
  { id: 4, question: 'Q4' },
  { id: 5, question: 'Q5' }
];

console.log('Original:', questions.map(q => q.id));

// Test with same seed
const seed1 = 12345;
const shuffled1 = shuffleArrayWithSeed(questions, seed1);
const shuffled2 = shuffleArrayWithSeed(questions, seed1);

console.log('Seed 12345 (first):', shuffled1.map(q => q.id));
console.log('Seed 12345 (second):', shuffled2.map(q => q.id));
console.log('Deterministic?', JSON.stringify(shuffled1) === JSON.stringify(shuffled2));

// Test with different seed
const seed2 = 54321;
const shuffled3 = shuffleArrayWithSeed(questions, seed2);
console.log('Seed 54321:', shuffled3.map(q => q.id));

// Test that it actually shuffles
const isShuffled = !shuffled1.every((q, i) => q.id === questions[i].id);
console.log('Actually shuffled?', isShuffled);