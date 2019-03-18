# how it works
1. Given a person's words familiarity.
2. Show the person a text where words of low familiarity have explaination.
3. Observe the person's behavior of looking up for words in the text.
4. Update the person's words familiarity by
    - descrease familiarity of the words the person looks up
    - increase familiarity of the rest of the words


# words familiarity data structure
```ts code/words-familiarity-interface.ts
let wordsFamiliarity: WordsFamiliarity = {
   nausea: Familiarity.Alien,
   almond: Familiarity.Known
};

enum Familiarity = {
    Alien = 0,
    Maybe = 1,
    Known = 2
};

interface WordsFamiliarity {
    [key: string]: Familiarity;
}
```

# which words should show explaination
```ts code/words-familiarity-thresholds.ts
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
```

# how to update words familiarity
```ts code/update-words-familiarity.ts
function lookedUp(wordsFamiliarity: WordsFamiliarity, ...words: string[]): WordsFamiliarity {
    return descreaseFamiliarity(wordsFamiliarity, words);
}

function notLookedUp(wordsFamiliarity: WordsFamiliarity, ...words): WordsFamiliarity {
    return increaseFamiliarity(wordsFamiliarity, words);
}
```


# how to show inline hint
![](https://github.com/pangrr/reading-assistant/blob/master/hint.png)
```html code/demo-inlint-hint.html
<html>
<body>
  <div style="margin: auto; margin-top: 100px; width: 70%;">
    <p style="line-height: 2.3em">
    Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the <span hint="脾">spleen</span> and regulating the circulation. Whenever I find myself growing <span hint="严峻">grim</span> about the mouth; whenever it is a <span hint="潮湿">damp</span>, <span hint="蒙蒙">drizzly</span> November in my soul; whenever I find myself involuntarily pausing before <span hint="棺材">coffin</span> warehouses, and bringing up the rear of every funeral I meet; and especially whenever my <span hint="狂躁">hypos</span> <span hint="
    得到这样的优势">get such an upper hand of</span> me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for <span hint="手枪">pistol</span> and ball. With a <span hint="哲学上">philosophical</span> <span hint="繁荣">flourish</span> Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, <span hint="珍爱">cherish</span> very nearly the same feelings towards the ocean with me.
    </p>
  </div>
</body>
</html>
<style>
[hint] {
  position: relative;
  z-index: 2;
  cursor: pointer;
}
[hint]:after {
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  color: silver;
  content: attr(hint);
  text-align: center;
  font-size: 11px;
  line-height: 1;
}
</style>
```

## tooltip on selected text


# how to show explaination for user selected text
## how to get user selected text
```html code/demo-get-selected-text.html
<html>
<body>
<p onmouseup="showSelectedText()">Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. </p>
</body>
</html>
<script>
function getSelectedText() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.selection && document.selection.type !== "Control") {
    return document.selection.createRange().text;
  }
}

function showSelectedText() {
  console.log(getSelectedText());
}
</script>
```
## how to show explaination


# how to get explaination
- An API that to return simple explaination (hint below text) (Google traslation?).
- Another API to get full explaination (tooltip on selection) (Youdao?).
