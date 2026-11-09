import { getOrdinalSuffix } from "@/lib/formatting";

const numberWords: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  twentyone: "21",
  twentytwo: "22",
  twentythree: "23",
  twentyfour: "24",
  twentyfive: "25",
  twentysix: "26",
  twentyseven: "27",
  twentyeight: "28",
  twentynine: "29",
  thirty: "30",
  thirtyone: "31",
  thirtytwo: "32",
  thirtythree: "33",
  thirtyfour: "34",
  thirtyfive: "35",
  thirtysix: "36",
  thirtyseven: "37",
  thirtyeight: "38",
  thirtynine: "39",
  forty: "40",
  fortyone: "41",
  fortytwo: "42",
  fortythree: "43",
  fortyfour: "44",
  fortyfive: "45",
  fortysix: "46",
  fortyseven: "47",
  fortyeight: "48",
  fortynine: "49",
  fifty: "50",
  fiftyone: "51",
  fiftytwo: "52",
  fiftythree: "53",
  fiftyfour: "54",
  fiftyfive: "55",
  fiftysix: "56",
  fiftyseven: "57",
  fiftyeight: "58",
  fiftynine: "59",
  sixty: "60",
  sixtyone: "61",
  sixtytwo: "62",
  sixtythree: "63",
  sixtyfour: "64",
  sixtyfive: "65",
  sixtysix: "66",
  sixtyseven: "67",
  sixtyeight: "68",
  sixtynine: "69",
  seventy: "70",
  seventyone: "71",
  seventytwo: "72",
  seventythree: "73",
  seventyfour: "74",
  seventyfive: "75",
  seventysix: "76",
  seventyseven: "77",
  seventyeight: "78",
  seventynine: "79",
  eighty: "80",
  eightyone: "81",
  eightytwo: "82",
  eightythree: "83",
  eightyfour: "84",
  eightyfive: "85",
  eightysix: "86",
  eightyseven: "87",
  eightyeight: "88",
  eightynine: "89",
  ninety: "90",
  ninetyone: "91",
  ninetytwo: "92",
  ninetythree: "93",
  ninetyfour: "94",
  ninetyfive: "95",
  ninetysix: "96",
  ninetyseven: "97",
  ninetyeight: "98",
  ninetynine: "99",
  onehundred: "100"
};

const ordinalWords: Record<string, string> = {
  first: "1",
  second: "2",
  third: "3",
  fourth: "4",
  fifth: "5",
  sixth: "6",
  seventh: "7",
  eighth: "8",
  ninth: "9",
  tenth: "10",
  eleventh: "11",
  twelfth: "12",
  thirteenth: "13",
  fourteenth: "14",
  fifteenth: "15",
  sixteenth: "16",
  seventeenth: "17",
  eighteenth: "18",
  nineteenth: "19",
  twentieth: "20",
  twentyfirst: "21",
  twentysecond: "22",
  twentythird: "23",
  twentyfourth: "24",
  twentyfifth: "25",
  twentysixth: "26",
  twentyseventh: "27",
  twentyeighth: "28",
  twentyninth: "29",
  thirtieth: "30",
  thirtyfirst: "31"
};

const digitToNumberWord: Record<string, string> = {};
for (const [word, digit] of Object.entries(numberWords)) {
  digitToNumberWord[digit] = word;
}

const digitToOrdinalWord: Record<string, string> = {};
for (const [word, digit] of Object.entries(ordinalWords)) {
  digitToOrdinalWord[digit] = word;
}

export function getVariants(input: string): string[] {
  input = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  const output = [input];

  if (numberWords[input]) {
    output.push(numberWords[input]);
  }

  if (ordinalWords[input]) {
    const value = ordinalWords[input];
    const suffix = getOrdinalSuffix(parseInt(value));
    output.push(`${value}${suffix}`);
  }

  const ordinalMatch = input.match(/^(\d+)(st|nd|rd|th)$/);
  if (ordinalMatch) {
    const value = ordinalMatch[1];
    const num = parseInt(value);
    if (num >= 1 && num <= 31) {
      const word = digitToOrdinalWord[value];
      if (word) {
        output.push(word);
      }
    }
  }

  const num = parseInt(input);
  if (!isNaN(num) && num >= 0 && num <= 100) {
    const word = digitToNumberWord[input];
    if (word) {
      output.push(word);
      if (num > 20 && num < 100 && num % 10 !== 0) {
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        const tensWord = digitToNumberWord[tens.toString()];
        const onesWord = digitToNumberWord[ones.toString()];
        if (tensWord && onesWord) {
          output.push(`${tensWord}-${onesWord}`);
          output.push(`${tensWord} ${onesWord}`);
        }
      }
    }
  }

  return [...new Set(output.map((variant) => variant.toLowerCase().trim()))];
}
