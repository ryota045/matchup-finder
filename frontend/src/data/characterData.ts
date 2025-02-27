export interface CharacterIcon {
  name: string;
  jp: string;
  path: string;
}

// ひらがな⇔カタカナ変換のためのマッピング
export const hiraganaToKatakana = (str: string): string => {
  return str.replace(/[\u3041-\u3096]/g, match => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
};

export const katakanaToHiragana = (str: string): string => {
  return str.replace(/[\u30A1-\u30F6]/g, match => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
};

// 日本語検索用の正規化関数
export const normalizeJapanese = (str: string): string => {
  // ひらがなに統一して比較
  return katakanaToHiragana(str.toLowerCase());
};

// キャラクターアイコンのリスト
export const characterIcons: CharacterIcon[] = [
  { name: 'Banjo & Kazooie', jp: 'バンジョー＆カズーイ', path: '/images/chara_icon/Banjo & Kazooie 0.png' },
  { name: 'Bayonetta', jp: 'ベヨネッタ', path: '/images/chara_icon/Bayonetta 0.png' },
  { name: 'Bowser', jp: 'クッパ', path: '/images/chara_icon/Bowser 0.png' },
  { name: 'Byleth', jp: 'ベレト', path: '/images/chara_icon/Byleth 0.png' },
  { name: 'Captain Falcon', jp: 'キャプテン・ファルコン', path: '/images/chara_icon/Captain Falcon 0.png' },
  { name: 'Chrom', jp: 'クロム', path: '/images/chara_icon/Chrom 0.png' },
  { name: 'Cloud', jp: 'クラウド', path: '/images/chara_icon/Cloud 0.png' },
  { name: 'Corrin', jp: 'カムイ', path: '/images/chara_icon/Corrin 0.png' },
  { name: 'Daisy', jp: 'デイジー', path: '/images/chara_icon/Daisy 0.png' },
  { name: 'Dark Pit', jp: 'ブラックピット', path: '/images/chara_icon/Dark Pit 0.png' },
  { name: 'Dark Samus', jp: 'ダークサムス', path: '/images/chara_icon/Dark Samus 0.png' },
  { name: 'Diddy Kong', jp: 'ディディーコング', path: '/images/chara_icon/Diddy Kong 0.png' },
  { name: 'Donkey Kong', jp: 'ドンキーコング', path: '/images/chara_icon/Donkey Kong 0.png' },
  { name: 'Dr. Mario', jp: 'ドクターマリオ', path: '/images/chara_icon/Dr. Mario 0.png' },
  { name: 'Duck Hunt', jp: 'ダックハント', path: '/images/chara_icon/Duck Hunt 0.png' },
  { name: 'Falco', jp: 'ファルコ', path: '/images/chara_icon/Falco 0.png' },
  { name: 'Fox', jp: 'フォックス', path: '/images/chara_icon/Fox 0.png' },
  { name: 'Ganondorf', jp: 'ガノンドロフ', path: '/images/chara_icon/Ganondorf 0.png' },
  { name: 'Greninja', jp: 'ゲッコウガ', path: '/images/chara_icon/Greninja 0.png' },
  { name: 'Hero', jp: '勇者', path: '/images/chara_icon/Hero 0.png' },
  { name: 'Ice Climbers', jp: 'アイスクライマー', path: '/images/chara_icon/Ice Climbers 0.png' },
  { name: 'Ike', jp: 'アイク', path: '/images/chara_icon/Ike 0.png' },
  { name: 'Incineroar', jp: 'ガオガエン', path: '/images/chara_icon/Incineroar 0.png' },
  { name: 'Inkling', jp: 'インクリング', path: '/images/chara_icon/Inkling 0.png' },
  { name: 'Isabelle', jp: 'しずえ', path: '/images/chara_icon/Isabelle 0.png' },
  { name: 'Jigglypuff', jp: 'プリン', path: '/images/chara_icon/Jigglypuff 0.png' },
  { name: 'joker', jp: 'ジョーカー', path: '/images/chara_icon/Joker 0.png' },
  { name: 'Kazuya', jp: 'カズヤ', path: '/images/chara_icon/Kazuya 0.png' },
  { name: 'Ken', jp: 'ケン', path: '/images/chara_icon/Ken 0.png' },
  { name: 'King Dedede', jp: 'デデデ', path: '/images/chara_icon/King Dedede 0.png' },
  { name: 'King K. Rool', jp: 'キングクルール', path: '/images/chara_icon/King K. Rool 0.png' },
  { name: 'Kirby', jp: 'カービィ', path: '/images/chara_icon/Kirby 0.png' },
  { name: 'Koopalings', jp: 'クッパジュニア', path: '/images/chara_icon/Koopalings (Bowser Jr.).png' },
  { name: 'Link', jp: 'リンク', path: '/images/chara_icon/Link 0.png' },
  { name: 'Little Mac', jp: 'リトルマック', path: '/images/chara_icon/Little Mac 0.png' },
  { name: 'Lucario', jp: 'ルカリオ', path: '/images/chara_icon/Lucario 0.png' },
  { name: 'Lucas', jp: 'リュカ', path: '/images/chara_icon/Lucas 0.png' },
  { name: 'Lucina', jp: 'ルキナ', path: '/images/chara_icon/Lucina 0.png' },
  { name: 'Luigi', jp: 'ルイージ', path: '/images/chara_icon/Luigi 0.png' },
  { name: 'Mario', jp: 'マリオ', path: '/images/chara_icon/Mario 0.png' },
  { name: 'Marth', jp: 'マルス', path: '/images/chara_icon/Marth 0.png' },
  { name: 'Mega Man', jp: 'ロックマン', path: '/images/chara_icon/Mega Man 0.png' },
  { name: 'Meta Knight', jp: 'メタナイト', path: '/images/chara_icon/Meta Knight 0.png' },
  { name: 'Mewtwo', jp: 'ミュウツー', path: '/images/chara_icon/Mewtwo 0.png' },
  { name: 'Mii Brawler', jp: '格闘Mii', path: '/images/chara_icon/Mii Brawler.png' },
  { name: 'Mii Gunner', jp: '射撃Mii', path: '/images/chara_icon/Mii Gunner.png' },
  { name: 'Mii Swordfighter', jp: '剣術Mii', path: '/images/chara_icon/Mii Swordfighter.png' },
  { name: 'Min Min', jp: 'ミェンミェン', path: '/images/chara_icon/Min Min 0.png' },
  { name: 'Minecraft', jp: 'スティーブ', path: '/images/chara_icon/Minecraft 0.png' },
  { name: 'Mr. Game & Watch', jp: 'Mr.ゲーム&ウォッチ', path: '/images/chara_icon/Mr. Game & Watch 0.png' },
  { name: 'Mythra', jp: 'ヒカリ', path: '/images/chara_icon/Mythra 0.png' },
  { name: 'Ness', jp: 'ネス', path: '/images/chara_icon/Ness 0.png' },
  { name: 'Pac-Man', jp: 'パックマン', path: '/images/chara_icon/Pac-Man 0.png' },
  { name: 'Palutena', jp: 'パルテナ', path: '/images/chara_icon/Palutena 0.png' },
  { name: 'Peach', jp: 'ピーチ', path: '/images/chara_icon/Peach 0.png' },
  { name: 'Pichu', jp: 'ピチュー', path: '/images/chara_icon/Pichu 0.png' },
  { name: 'Pikachu', jp: 'ピカチュウ', path: '/images/chara_icon/Pikachu 0.png' },
  { name: 'Pikmin', jp: 'ピクミン＆オリマー', path: '/images/chara_icon/Pikmin 0.png' },
  { name: 'Piranha Plant', jp: 'パックンフラワー', path: '/images/chara_icon/Piranha Plant 0.png' },
  { name: 'Pit', jp: 'ピット', path: '/images/chara_icon/Pit 0.png' },
  { name: 'Pokémon Trainer', jp: 'ポケモントレーナー', path: '/images/chara_icon/Pokémon Trainer 0.png' },
  { name: 'Pyra', jp: 'ホムラ', path: '/images/chara_icon/Pyra 0.png' },
  { name: 'R.O.B.', jp: 'ロボット', path: '/images/chara_icon/R.O.B. 0.png' },
  { name: 'Richter', jp: 'リヒター', path: '/images/chara_icon/Richter 0.png' },
  { name: 'Ridley', jp: 'リドリー', path: '/images/chara_icon/Ridley 0.png' },
  { name: 'Robin', jp: 'ルフレ', path: '/images/chara_icon/Robin 0.png' },
  { name: 'Rosalina & Luma', jp: 'ロゼッタ＆チコ', path: '/images/chara_icon/Rosalina & Luma 0.png' },
  { name: 'Roy', jp: 'ロイ', path: '/images/chara_icon/Roy 0.png' },
  { name: 'Ryu', jp: 'リュウ', path: '/images/chara_icon/Ryu 0.png' },
  { name: 'Samus', jp: 'サムス', path: '/images/chara_icon/Samus 0.png' },
  { name: 'Sephiroth', jp: 'セフィロス', path: '/images/chara_icon/Sephiroth 0.png' },
  { name: 'sheik', jp: 'シーク', path: '/images/chara_icon/Sheik 0.png' },
  { name: 'Shulk', jp: 'シュルク', path: '/images/chara_icon/Shulk 0.png' },
  { name: 'Simon', jp: 'シモン', path: '/images/chara_icon/Simon 0.png' },
  { name: 'Snake', jp: 'スネーク', path: '/images/chara_icon/Snake 0.png' },
  { name: 'Sonic', jp: 'ソニック', path: '/images/chara_icon/Sonic 0.png' },
  { name: 'Sora', jp: 'ソラ', path: '/images/chara_icon/Sora 0.png' },
  { name: 'Terry', jp: 'テリー', path: '/images/chara_icon/Terry 0.png' },
  { name: 'Toon Link', jp: 'トゥーンリンク', path: '/images/chara_icon/Toon Link 0.png' },
  { name: 'Villager', jp: 'むらびと', path: '/images/chara_icon/Villager 0.png' },
  { name: 'Wario', jp: 'ワリオ', path: '/images/chara_icon/Wario 0.png' },
  { name: 'Wii Fit Trainer', jp: 'Wii Fitトレーナー', path: '/images/chara_icon/Wii Fit Trainer 0.png' },
  { name: 'Wolf', jp: 'ウルフ', path: '/images/chara_icon/Wolf 0.png' },
  { name: 'Yoshi', jp: 'ヨッシー', path: '/images/chara_icon/Yoshi 0.png' },
  { name: 'Young Link', jp: 'こどもリンク', path: '/images/chara_icon/Young Link 0.png' },
  { name: 'Zelda', jp: 'ゼルダ', path: '/images/chara_icon/Zelda 0.png' },
  { name: 'Zero Suit Samus', jp: 'ゼロスーツサムス', path: '/images/chara_icon/Zero Suit Samus 0.png' },
];

// キャラクターの日本語名を取得する関数
export const getJapaneseName = (characterName: string): string => {
  const character = characterIcons.find(c => c.name === characterName);
  return character?.jp || characterName;
};

// ソート済みのキャラクターリストを取得
export const getSortedCharacterIcons = () => {
  return [...characterIcons].sort((a, b) => a.name.localeCompare(b.name));
};

// 検索フィルタリング
export const filterCharacterIcons = (searchTerm: string) => {
  if (!searchTerm) return getSortedCharacterIcons();
  
  const normalizedSearchTerm = normalizeJapanese(searchTerm);
  
  return getSortedCharacterIcons().filter(icon => {
    // 英語名での検索
    if (icon.name.toLowerCase().includes(normalizedSearchTerm)) return true;
    
    // 日本語名での検索（ひらがな・カタカナ区別なし）
    const normalizedJp = normalizeJapanese(icon.jp);
    return normalizedJp.includes(normalizedSearchTerm);
  });
}; 