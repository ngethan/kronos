interface letter {
    char: string;
    shiftDir: number;
    shiftAmount: number;
}

const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
];

const p14 = (s: string) => {
    const letterObjs: letter[] = [];

    for (let i = 0; i < parseInt(s.split("\n")[0]); i++) {
        const string: string[] = s.split("\n")[i * 3 + 1].split("");
        const data = s.split[i * 3 + 2];

        // letters.push({ char: string });
        for (let i = 0; i < string.length; i++) {
            if ([" ", ".", "!", "?"].includes(string[i])) {
                continue;
            }
            string[i] =
                data[i].shiftDir === 1
                    ? letters[letters.indexOf(string[i]) - data[i].shiftAmount]
                    : letters[letters.indexOf(string[i]) + data[i].shiftAmount];
        }
    }
};
