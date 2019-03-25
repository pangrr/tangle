# how it works
1. Given a person's words familiarity.
2. Show the person a text where words of low familiarity have hint.
3. Observe the person's behavior of looking up for words in the text.
4. Update the person's words familiarity by
    - descrease familiarity of the words the person looks up
    - increase familiarity of the rest of the words


# how to store a person's words familiarity
Each word has a value of familiarity. Familiarity can be either `unfamiliar = false` or `familiar = true`. An json object is to store a person's words familiarity. Words not in the object are by default `familiar`.
```js demo.html #script
const wordsFamiliarity = {};
```

# which words should show hint
Show hint for `unfamiliar` words.
```js demo.html #script
function shouldShowHint(wordsFamiliarity, word) {
  return wordsFamilarity[words] === false;
}
```

# how to update words familiarity
Mark words been looked up as `unfamiliar`. Mark other words as `familiar`.
```js demo.html #script
function lookedUp(wordsFamiliarity, word) {
  wordsFamiliarity[word] = false;
}
function notLookedUp(wordsFamiliarity, word) {
  wordsFamiliarity[word] = true;
}
```


# how to display hint for unfamiliar words
![](https://github.com/pangrr/reading-assistant/blob/master/hint.png)
```html demo.html #sampleParagraph
<p #selectHook style="line-height: 2.3em">
Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the <span hint="脾">spleen</span> and regulating the circulation. Whenever I find myself growing <span hint="严峻">grim</span> about the mouth; whenever it is a <span hint="潮湿">damp</span>, <span hint="蒙蒙">drizzly</span> November in my soul; whenever I find myself involuntarily pausing before <span hint="棺材">coffin</span> warehouses, and bringing up the rear of every funeral I meet; and especially whenever my <span hint="狂躁">hypos</span> <span hint="
得到这样的优势">get such an upper hand of</span> me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for <span hint="手枪">pistol</span> and ball. With a <span hint="哲学上">philosophical</span> <span hint="繁荣">flourish</span> Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, <span hint="珍爱">cherish</span> very nearly the same feelings towards the ocean with me.
</p>
```

```html demo.html #style
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



# how to display translation for user selected text
## how to get user selected text
```js demo.html #script
function getSelectedText() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.selection && document.selection.type !== "Control") {
    return document.selection.createRange().text;
  }
}
function doSomethingWithSelectedText() {

}
```

``` demo.html #selectHook
onmouseup="doSomethingWithSelectedText()"
```


# how to get translation
- An API that to return simple explaination (hint below text) (Google traslation?).
- Another API to get full explaination (tooltip on selection) (Youdao?).


# biolerplate
```html demo.html
<html>
<head>
#style
<script>
#script
</script>
</head>
<body>
  <div style="margin: auto; margin-top: 100px; width: 70%;">
    #sampleParagraph
  </div>
</body>
</html>
```
