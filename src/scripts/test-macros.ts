import { DateTime } from "luxon";

const getDayStatus = (hour: number, lang: string) => {
  const isId = lang === "id";
  if (hour >= 0 && hour < 11) return isId ? "Pagi" : "Morning";
  if (hour >= 11 && hour < 15) return isId ? "Siang" : "Afternoon";
  if (hour >= 15 && hour < 18) return isId ? "Sore" : "Evening";
  return isId ? "Malam" : "Night";
};

const testCases = [
  { hour: 9, lang: "en", expected: "Morning" },
  { hour: 13, lang: "en", expected: "Afternoon" },
  { hour: 17, lang: "en", expected: "Evening" },
  { hour: 20, lang: "en", expected: "Night" },
  { hour: 9, lang: "id", expected: "Pagi" },
  { hour: 13, lang: "id", expected: "Siang" },
  { hour: 17, lang: "id", expected: "Sore" },
  { hour: 20, lang: "id", expected: "Malam" },
];

console.log("Testing Day Status Logic:");
testCases.forEach(({ hour, lang, expected }) => {
  const result = getDayStatus(hour, lang);
  console.log(
    `Hour: ${hour}, Lang: ${lang} -> Expected: ${expected}, Got: ${result} [${result === expected ? "PASS" : "FAIL"}]`,
  );
});

console.log("\nTesting Luxon Formatting (Asia/Jakarta):");
const now = DateTime.now().setZone("Asia/Jakarta");
console.log(`Current Time (WIB): ${now.toFormat("yyyy-MM-dd HH:mm:ss")}`);
console.log(`Date Macro: ${now.toFormat("dd-MM-yyyy")}`);
console.log(`Time Macro: ${now.toFormat("HH:mm")}`);
console.log(`Day Status (En): ${getDayStatus(now.hour, "en")}`);
console.log(`Day Status (Id): ${getDayStatus(now.hour, "id")}`);
