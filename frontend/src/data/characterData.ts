export interface CharacterIcon {
  eng: string;
  jp: string;
  anotation: string[];
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
  { eng: 'Banjo & Kazooie', jp: 'バンジョー＆カズーイ', anotation: ['banjo'], path: '/images/chara_icon/Banjo & Kazooie 0.png' },
  { eng: 'Bayonetta', jp: 'ベヨネッタ', anotation: ['bayo', 'bayo2'], path: '/images/chara_icon/Bayonetta 0.png' },
  { eng: 'Bowser', jp: 'クッパ', anotation: ['bowser'], path: '/images/chara_icon/Bowser 0.png' },
  { eng: 'Byleth', jp: 'ベレト', anotation: ['byleth', 'byleth_f'], path: '/images/chara_icon/Byleth 0.png' },
  { eng: 'Captain Falcon', jp: 'キャプテン・ファルコン', anotation: ['cf'], path: '/images/chara_icon/Captain Falcon 0.png' },
  { eng: 'Chrom', jp: 'クロム', anotation: ['chrom'], path: '/images/chara_icon/Chrom 0.png' },
  { eng: 'Cloud', jp: 'クラウド', anotation: ['cloud', 'cloud_yowa'], path: '/images/chara_icon/Cloud 0.png' },
  { eng: 'Corrin', jp: 'カムイ', anotation: ['corrin', 'corrin_f'], path: '/images/chara_icon/Corrin 0.png' },
  { eng: 'Daisy', jp: 'デイジー', anotation: ['daisy'], path: '/images/chara_icon/Daisy 0.png' },
  { eng: 'Dark Pit', jp: 'ブラックピット', anotation: ['darkpit'], path: '/images/chara_icon/Dark Pit 0.png' },
  { eng: 'Dark Samus', jp: 'ダークサムス', anotation: ['darksumus'], path: '/images/chara_icon/Dark Samus 0.png' },
  { eng: 'Diddy Kong', jp: 'ディディーコング', anotation: ['diddy'], path: '/images/chara_icon/Diddy Kong 0.png' },
  { eng: 'Donkey Kong', jp: 'ドンキーコング', anotation: ['donkey'], path: '/images/chara_icon/Donkey Kong 0.png' },
  { eng: 'Dr. Mario', jp: 'ドクターマリオ', anotation: ['dr.mario'], path: '/images/chara_icon/Dr. Mario 0.png' },
  { eng: 'Duck Hunt', jp: 'ダックハント', anotation: ['duck'], path: '/images/chara_icon/Duck Hunt 0.png' },
  { eng: 'Falco', jp: 'ファルコ', anotation: ['falco'], path: '/images/chara_icon/Falco 0.png' },
  { eng: 'Fox', jp: 'フォックス', anotation: ['fox'], path: '/images/chara_icon/Fox 0.png' },
  { eng: 'Ganondorf', jp: 'ガノンドロフ', anotation: ['ganon'], path: '/images/chara_icon/Ganondorf 0.png' },
  { eng: 'Greninja', jp: 'ゲッコウガ', anotation: ['greninja'], path: '/images/chara_icon/Greninja 0.png' },
  { eng: 'Hero', jp: '勇者', anotation: ['hero','hero2', 'hero3', 'hero4'], path: '/images/chara_icon/Hero 0.png' },
  { eng: 'Ice Climbers', jp: 'アイスクライマー', anotation: ['ice'], path: '/images/chara_icon/Ice Climbers 0.png' },
  { eng: 'Ike', jp: 'アイク', anotation: ['ike', 'ike_muki'], path: '/images/chara_icon/Ike 0.png' },
  { eng: 'Incineroar', jp: 'ガオガエン', anotation: ['gaen'], path: '/images/chara_icon/Incineroar 0.png' },
  { eng: 'Inkling', jp: 'インクリング', anotation: ['inkling'], path: '/images/chara_icon/Inkling 0.png' },
  { eng: 'Isabelle', jp: 'しずえ', anotation: ['isabelle'], path: '/images/chara_icon/Isabelle 0.png' },
  { eng: 'Jigglypuff', jp: 'プリン', anotation: ['puff'], path: '/images/chara_icon/Jigglypuff 0.png' },
  { eng: 'Joker', jp: 'ジョーカー', anotation: ['joker'], path: '/images/chara_icon/Joker 0.png' },
  { eng: 'Kazuya', jp: 'カズヤ', anotation: ['kazuya'], path: '/images/chara_icon/Kazuya 0.png' },
  { eng: 'Ken', jp: 'ケン', anotation: ['ken'], path: '/images/chara_icon/Ken 0.png' },
  { eng: 'King Dedede', jp: 'デデデ', anotation: ['dedede'], path: '/images/chara_icon/King Dedede 0.png' },
  { eng: 'King K. Rool', jp: 'キングクルール', anotation: ['krool'], path: '/images/chara_icon/King K. Rool 0.png' },
  { eng: 'Kirby', jp: 'カービィ', anotation: ['kirby'], path: '/images/chara_icon/Kirby 0.png' },
  { eng: 'Koopalings', jp: 'クッパジュニア', anotation: ['bowserjr'], path: '/images/chara_icon/Koopalings (Bowser Jr.).png' },
  { eng: 'Link', jp: 'リンク', anotation: ['link'], path: '/images/chara_icon/Link 0.png' },
  { eng: 'Little Mac', jp: 'リトルマック', anotation: ['mac', 'mac2', 'mac3'], path: '/images/chara_icon/Little Mac 0.png' },
  { eng: 'Lucario', jp: 'ルカリオ', anotation: ['lucario'], path: '/images/chara_icon/Lucario 0.png' },
  { eng: 'Lucas', jp: 'リュカ', anotation: ['lucas'], path: '/images/chara_icon/Lucas 0.png' },
  { eng: 'Lucina', jp: 'ルキナ', anotation: ['lucina'], path: '/images/chara_icon/Lucina 0.png' },
  { eng: 'Luigi', jp: 'ルイージ', anotation: ['luigi'], path: '/images/chara_icon/Luigi 0.png' },
  { eng: 'Mario', jp: 'マリオ', anotation: ['mario'], path: '/images/chara_icon/Mario 0.png' },
  { eng: 'Marth', jp: 'マルス', anotation: ['marth'], path: '/images/chara_icon/Marth 0.png' },
  { eng: 'Mega Man', jp: 'ロックマン', anotation: ['megaman'], path: '/images/chara_icon/Mega Man 0.png' },
  { eng: 'Meta Knight', jp: 'メタナイト', anotation: ['metaknight'], path: '/images/chara_icon/Meta Knight 0.png' },
  { eng: 'Mewtwo', jp: 'ミュウツー', anotation: ['m2'], path: '/images/chara_icon/Mewtwo 0.png' },
  { eng: 'Mii Brawler', jp: '格闘Mii', anotation: ['miibrawler'], path: '/images/chara_icon/Mii Brawler.png' },
  { eng: 'Mii Gunner', jp: '射撃Mii', anotation: ['miigunner'], path: '/images/chara_icon/Mii Gunner.png' },
  { eng: 'Mii Swordfighter', jp: '剣術Mii', anotation: ['miisword'], path: '/images/chara_icon/Mii Swordfighter.png' },
  { eng: 'Min Min', jp: 'ミェンミェン', anotation: ['minmin'], path: '/images/chara_icon/Min Min 0.png' },
  { eng: 'Minecraft', jp: 'スティーブ', anotation: ['steve'], path: '/images/chara_icon/Minecraft 0.png' },
  { eng: 'Mr. Game & Watch', jp: 'Mr.ゲーム&ウォッチ', anotation: ['gw'], path: '/images/chara_icon/Mr. Game & Watch 0.png' },
  { eng: 'Mythra', jp: 'ヒカリ', anotation: ['mythra', 'pyra'], path: '/images/chara_icon/Mythra 0.png' },
  { eng: 'Ness', jp: 'ネス', anotation: ['ness'], path: '/images/chara_icon/Ness 0.png' },
  { eng: 'Pac-Man', jp: 'パックマン', anotation: ['pacman'], path: '/images/chara_icon/Pac-Man 0.png' },
  { eng: 'Palutena', jp: 'パルテナ', anotation: ['palutena'], path: '/images/chara_icon/Palutena 0.png' },
  { eng: 'Peach', jp: 'ピーチ', anotation: ['peach'], path: '/images/chara_icon/Peach 0.png' },
  { eng: 'Pichu', jp: 'ピチュー', anotation: ['pichu'], path: '/images/chara_icon/Pichu 0.png' },
  { eng: 'Pikachu', jp: 'ピカチュウ', anotation: ['pikachu'], path: '/images/chara_icon/Pikachu 0.png' },
  { eng: 'Pikmin', jp: 'ピクミン＆オリマー', anotation: ['olimar'], path: '/images/chara_icon/Pikmin 0.png' },
  { eng: 'Piranha Plant', jp: 'パックンフラワー', anotation: ['plant'], path: '/images/chara_icon/Piranha Plant 0.png' },
  { eng: 'Pit', jp: 'ピット', anotation: ['pit'], path: '/images/chara_icon/Pit 0.png' },
  { eng: 'Pokémon Trainer', jp: 'ポケモントレーナー', anotation: ['zeni', 'fushi', 'rizard'], path: '/images/chara_icon/Pokémon Trainer 0.png' },
  { eng: 'Pyra', jp: 'ホムラ', anotation: ['pyra', 'mythra'], path: '/images/chara_icon/Pyra 0.png' },
  { eng: 'R.O.B.', jp: 'ロボット', anotation: ['robot'], path: '/images/chara_icon/R.O.B. 0.png' },
  { eng: 'Richter', jp: 'リヒター', anotation: ['richter'], path: '/images/chara_icon/Richter 0.png' },
  { eng: 'Ridley', jp: 'リドリー', anotation: ['ridley'], path: '/images/chara_icon/Ridley 0.png' },
  { eng: 'Robin', jp: 'ルフレ', anotation: ['robin', 'robin_f'], path: '/images/chara_icon/Robin 0.png' },
  { eng: 'Rosalina & Luma', jp: 'ロゼッタ＆チコ', anotation: ['roselina'], path: '/images/chara_icon/Rosalina & Luma 0.png' },
  { eng: 'Roy', jp: 'ロイ', anotation: ['roy'], path: '/images/chara_icon/Roy 0.png' },
  { eng: 'Ryu', jp: 'リュウ', anotation: ['ryu'], path: '/images/chara_icon/Ryu 0.png' },
  { eng: 'Samus', jp: 'サムス', anotation: ['sumus'], path: '/images/chara_icon/Samus 0.png' },
  { eng: 'Sephiroth', jp: 'セフィロス', anotation: ['sephiroth'], path: '/images/chara_icon/Sephiroth 0.png' },
  { eng: 'Sheik', jp: 'シーク', anotation: ['sheik'], path: '/images/chara_icon/Sheik 0.png' },
  { eng: 'Shulk', jp: 'シュルク', anotation: ['shulk'], path: '/images/chara_icon/Shulk 0.png' },
  { eng: 'Simon', jp: 'シモン', anotation: ['simon'], path: '/images/chara_icon/Simon 0.png' },
  { eng: 'Snake', jp: 'スネーク', anotation: ['snake'], path: '/images/chara_icon/Snake 0.png' },
  { eng: 'Sonic', jp: 'ソニック', anotation: ['sonic'], path: '/images/chara_icon/Sonic 0.png' },
  { eng: 'Sora', jp: 'ソラ', anotation: ['sora'], path: '/images/chara_icon/Sora 0.png' },
  { eng: 'Terry', jp: 'テリー', anotation: ['terry'], path: '/images/chara_icon/Terry 0.png' },
  { eng: 'Toon Link', jp: 'トゥーンリンク', anotation: ['toonlink'], path: '/images/chara_icon/Toon Link 0.png' },
  { eng: 'Villager', jp: 'むらびと', anotation: ['villager'], path: '/images/chara_icon/Villager 0.png' },
  { eng: 'Wario', jp: 'ワリオ', anotation: ['wario'], path: '/images/chara_icon/Wario 0.png' },
  { eng: 'Wii Fit Trainer', jp: 'Wii Fitトレーナー', anotation: ['wiifittrainer', 'wiifittrainer_f'], path: '/images/chara_icon/Wii Fit Trainer 0.png' },
  { eng: 'Wolf', jp: 'ウルフ', anotation: ['wolf'], path: '/images/chara_icon/Wolf 0.png' },
  { eng: 'Yoshi', jp: 'ヨッシー', anotation: ['yoshi'], path: '/images/chara_icon/Yoshi 0.png' },
  { eng: 'Young Link', jp: 'こどもリンク', anotation: ['younglink'], path: '/images/chara_icon/Young Link 0.png' },
  { eng: 'Zelda', jp: 'ゼルダ', anotation: ['zelda'], path: '/images/chara_icon/Zelda 0.png' },
  { eng: 'Zero Suit Samus', jp: 'ゼロスーツサムス', anotation: ['zss'], path: '/images/chara_icon/Zero Suit Samus 0.png' },
];

// キャラクターの日本語名を取得する関数
export const getJapaneseName = (characterName: string): string => {
  const character = characterIcons.find(c => c.eng === characterName);
  return character?.jp || characterName;
};

// ソート済みのキャラクターリストを取得
export const getSortedCharacterIcons = () => {
  return [...characterIcons].sort((a, b) => a.eng.localeCompare(b.eng));
};

// 検索フィルタリング
export const filterCharacterIcons = (searchTerm: string) => {
  if (!searchTerm) return getSortedCharacterIcons();
  
  const normalizedSearchTerm = normalizeJapanese(searchTerm);
  
  return getSortedCharacterIcons().filter(icon => {
    // 英語名での検索
    if (icon.eng.toLowerCase().includes(normalizedSearchTerm)) return true;
    
    // 日本語名での検索（ひらがな・カタカナ区別なし）
    const normalizedJp = normalizeJapanese(icon.jp);
    return normalizedJp.includes(normalizedSearchTerm);
  });
}; 