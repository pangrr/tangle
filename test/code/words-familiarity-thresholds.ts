function shouldShowExplaination(wordsFamiliarity: WordsFamiliarity, word: string): boolean {
    return isKnownWord(wordsFamiliarity, word);
}


function isKnownWord(wordsFamiliarity: WordsFamiliarity, word: string): boolean {
    if (wordsFamiliarity[word] === undefined) {
        return true;
    } else {
        return wordsFamiliarity[word] === Familiarity.Known;
    }
}