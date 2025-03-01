import { promises as fs } from 'fs';
import path from 'path';

/**
 * MATCHUP_FOLDERにあるフォルダを探索して、各フォルダ内のmatchup_list.jsonファイルを読み込む
 * @returns matchup_list.jsonの内容の配列
 */
export async function findMatchupLists() {
  // サーバーサイドでのみ実行
  if (typeof window !== 'undefined') {
    console.error('この関数はサーバーサイドでのみ実行できます。');
    return [];
  }

  try {
    // 環境変数からMATCHUP_FOLDERを取得
    const matchupFolder = process.env.MATCHUP_FOLDER;
    
    if (!matchupFolder) {
      console.error('環境変数MATCHUP_FOLDERが設定されていません。');
      return [];
    }

    // フォルダが存在するか確認
    try {
      await fs.access(matchupFolder);
    } catch (error) {
      console.error(`フォルダが存在しません: ${matchupFolder}`);
      return [];
    }

    // フォルダ内のすべてのディレクトリを取得
    const dirents = await fs.readdir(matchupFolder, { withFileTypes: true });
    const directories = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // console.log(`${directories.length}個のフォルダが見つかりました。`);

    // 各ディレクトリ内のmatchup_list.jsonを読み込む
    const matchupLists = [];
    for (const dir of directories) {
      const jsonPath = path.join(matchupFolder, dir, 'matchup_list.json');
      
      try {
        await fs.access(jsonPath);
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const parsedJson = JSON.parse(jsonContent);
        
        matchupLists.push({
          directory: dir,
          content: parsedJson
        });
        
        // console.log(`${dir}のmatchup_list.jsonを読み込みました。`);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // console.log(`${dir}にはmatchup_list.jsonが存在しません。`);
        } else {
          console.error(`${jsonPath}の読み込みに失敗しました:`, error);
        }
      }
    }

    // console.log('すべてのmatchup_list.jsonの内容:');
    // console.log(JSON.stringify(matchupLists, null, 2));
    
    return matchupLists;
  } catch (error) {
    console.error('matchup_list.jsonの探索中にエラーが発生しました:', error);
    return [];
  }
} 