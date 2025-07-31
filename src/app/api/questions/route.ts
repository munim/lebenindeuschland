import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Question } from '@/types/question';
import { appConfig } from '@/config/app';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), appConfig.dataFile);
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const questions: Question[] = JSON.parse(fileContents);
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error reading questions file:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}