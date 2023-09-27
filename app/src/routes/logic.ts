export function getNeighbors(wordsSet: Set<string>, word: string): string[] {
	const neighbors: string[] = [];
	const wordArray = word.split('');
	for (let i = 0; i < wordArray.length; i++) {
		for (let j = 0; j < 26; j++) {
			const letter = String.fromCharCode(97 + j);
			if (letter !== wordArray[i]) {
				const newWordArray = [...wordArray];
				newWordArray[i] = letter;
				const newWord = newWordArray.join('');
				if (wordsSet.has(newWord)) {
					neighbors.push(newWord);
				}
			}
		}
	}
	return neighbors;
}

export function bfs(wordsSet: Set<string>, start: string, target: string): string[] {
	const queue: string[][] = [[start]];
	const visited = new Set([start]);
	while (queue.length > 0) {
		const path = queue.shift()!;
		const word = path[path.length - 1];
		if (word === target) {
			return path;
		}
		const neighbors = getNeighbors(wordsSet, word);
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				visited.add(neighbor);
				queue.push([...path, neighbor]);
			}
		}
	}
	return [];
}

export function scorePath(wordsSet: Set<string>, path: string[]): number {
	let score = 0;
	for (const word of path) {
		score += getNeighbors(wordsSet, word).length;
	}
	return score;
}

export function generateRandomValidStartAndTarget(wordsArray: string[]): [string, string] {
	const start = wordsArray[Math.floor(Math.random() * wordsArray.length)];
	const target = wordsArray[Math.floor(Math.random() * wordsArray.length)];
	return [start, target];
}

export function testBfs(wordsArray: string[], wordsSet: Set<string>): boolean {
	const [start, target] = generateRandomValidStartAndTarget(wordsArray);
	const path = bfs(wordsSet, start, target);
	if (path.length > 0) {
		return true;
	} else {
		return false;
	}
}
