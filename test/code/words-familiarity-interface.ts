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