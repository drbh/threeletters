import fs from "fs";
const words = fs.readFileSync("simplified.txt", "utf8");
const wordsArray = words
  .split("\n")
  .map((word: string) => word.trim())
  .map((word: string) => word.toLowerCase())
  // filter all words that have double letters or triple letters
  .filter((word: string) => !word.match(/(.)\1/) && !word.match(/(.)\1\1/));

// print length of words array
console.log("We are using a dictionary of", wordsArray.length, "words.");

const wordsSet = new Set(wordsArray);

function getNeighbors(word: string): string[] {
  const neighbors: string[] = [];
  const wordArray = word.split("");
  for (let i = 0; i < wordArray.length; i++) {
    for (let j = 0; j < 26; j++) {
      const letter = String.fromCharCode(97 + j);
      if (letter !== wordArray[i]) {
        const newWordArray = [...wordArray];
        newWordArray[i] = letter;
        const newWord = newWordArray.join("");
        if (wordsSet.has(newWord)) {
          neighbors.push(newWord);
        }
      }
    }
  }
  return neighbors;
}

function bfs(start: string, target: string): string[] {
  const queue: string[][] = [[start]];
  const visited = new Set([start]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const word = path[path.length - 1];
    if (word === target) {
      return path;
    }
    const neighbors = getNeighbors(word);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return [];
}

function generateRandomValidStartAndTarget(): [string, string] {
  const start = wordsArray[Math.floor(Math.random() * wordsArray.length)];
  const target = wordsArray[Math.floor(Math.random() * wordsArray.length)];
  return [start, target];
}

// check that bfs returns the correct path
function testBfs(): boolean {
  const [start, target] = generateRandomValidStartAndTarget();
  const path = bfs(start, target);
  if (path.length > 0) {
    return true;
  } else {
    return false;
  }
}

const validStartAndTargets = [];
const N = 100;

while (validStartAndTargets.length < N) {
  const [start, target] = generateRandomValidStartAndTarget();
  if (testBfs()) {
    validStartAndTargets.push([start, target, bfs(start, target)]);
  }
}

// print all valid start and target pairs sorted by length of path
validStartAndTargets.sort((a, b) => b[2].length - a[2].length);
validStartAndTargets.slice(0, 10).forEach(([start, target, path]) => {
  const object = { start, target, path };
//   console.log(object);
  console.log(start, target, path);
});
