function lookedUp(wordsFamiliarity: WordsFamiliarity, ...words: string[]): WordsFamiliarity {
    return descreaseFamiliarity(wordsFamiliarity, words);
}

function notLookedUp(wordsFamiliarity: WordsFamiliarity, ...words): WordsFamiliarity {
    return increaseFamiliarity(wordsFamiliarity, words);
}