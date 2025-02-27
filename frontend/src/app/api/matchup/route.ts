import { NextResponse } from 'next/server';
import { findMatchupLists } from '../../../utils/matchupFinder';

export async function GET() {
  try {
    const matchupLists = await findMatchupLists();
    
    return NextResponse.json({ 
      success: true, 
      data: matchupLists 
    });
  } catch (error) {
    console.error('マッチアップリスト取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'マッチアップリスト取得中にエラーが発生しました' 
      },
      { status: 500 }
    );
  }
} 