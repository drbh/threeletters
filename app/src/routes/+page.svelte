<script lang="ts">
	import { stringify } from 'postcss';
	import './app.css';
	import { onMount, afterUpdate } from 'svelte';
	import { tick } from 'svelte';
	import { generateRandomValidStartAndTarget, bfs } from './logic';
	import type { ChangeEventHandler, EventHandler } from 'svelte/elements';

	let possible: string[] = [];
	let search: string = '';
	let currentIndex: number = -1;
	let searchResults: NodeListOf<Element>;
	let challenge: any = {
		start: null,
		end: null,
		path: []
	};
	let wordsSet: Set<string>;
	let userPath: string[][] = [['', '', '']];

	onMount(async () => {
		let simplified = await fetch('./simplified.txt').then((r) => r.text());

		const wordsArray = simplified
			.split('\n')
			.map((word: string) => word.trim())
			.map((word: string) => word.toLowerCase());

		wordsSet = new Set(wordsArray);
		possible = wordsArray;

		handleCreateChallenge(null);
	});

	afterUpdate(() => {
		searchResults = document.querySelectorAll('.search-result');
	});

	// const handleSearch = async (event: KeyboardEvent) => {
	const handleSearch = async (event: any) => {
		// if (event.key === 'Enter') {
		currentIndex = (currentIndex + 1) % searchResults.length;
		if (!searchResults[currentIndex]) return;
		searchResults[currentIndex].scrollIntoView();
		// }
	};

	const handleCreateChallenge = (event: any) => {
		let [start, end] = generateRandomValidStartAndTarget(possible);
		let path = bfs(wordsSet, start, end);
		if (path.length === 0) return;
		challenge = {
			start,
			end,
			path
		};

		// add number of userPath as the number of items in path
		userPath = [];
		for (let i = 0; i < path.length; i++) {
			userPath = [...userPath, ['', '', '']];
		}
	};

	const addNewWord = (event: any) => {
		userPath = [...userPath, ['', '', '']];
	};

	const check = (event: any) => {
		let correct = true;

		// check that each user word only has one letter difference from the last
		for (let i = 0; i < userPath.length - 1; i++) {
			let word = userPath[i];
			let nextWord = userPath[i + 1];
			let diff = 0;
			for (let j = 0; j < word.length; j++) {
				if (word[j] !== nextWord[j]) {
					diff++;
				}
			}
			if (diff !== 1) {
				correct = false;
			}
		}

		// check that each user word is a valid word
		for (let i = 0; i < userPath.length; i++) {
			let word = userPath[i];
			if (!wordsSet.has(word.join(''))) {
				correct = false;
			}
		}

		// check that the first word is the start word
		if (userPath[0].join('') !== challenge.start) {
			correct = false;
		}

		// check that the last word is the end word
		if (userPath[userPath.length - 1].join('') !== challenge.end) {
			correct = false;
		}

		if (correct) {
			alert('correct');
		} else {
			alert('incorrect');
		}
	};

	const onFocus = (index: number, i: number) => (e: any) => {
		// if theres a letter move to after it
		if (userPath[index][i]) {
			const elem = document.getElementById(index + '-' + i);
			if (elem) {
				elem.select();
			}
		}
	};

	const onKeyup = (index: number, i: number) => (e: any) => {
		

		if (e.key === 'Backspace') {
			userPath[index][i] = '';

			const sibling = e.target.parentElement.previousElementSibling;
			if (!sibling) {
				const newlineSibling = document.getElementById(index - 1 + '-' + 2);
				if (newlineSibling) {
					newlineSibling.focus();
				}
				return;
			}
			const elems = sibling.children;
			if (elems) {
				const elem = elems[0];
				elem.focus();
			}
		} else {
			if (e.target.value === '') return;
			userPath[index][i] = e.target.value;
			console.log(index, i, e.target.value);
			const sibling = document.getElementById(index + '-' + (i + 1));
			console.log(sibling);
			if (!sibling) {
				const newlineSibling = document.getElementById(index + 1 + '-' + 0);
				if (newlineSibling) {
					newlineSibling.focus();
				}
				return;
			}
			sibling.focus();
		}
	};
</script>

<div class="w-full h-full flex justify-center items-center text-3xl">
	<div class="flex w-full h-full">
		<div class="w-full h-full max-h-screen bg-blue-200 p-2">
			<input type="text" class="w-full h-10 mb-4" bind:value={search} on:keypress={handleSearch} />

			<div class="overflow-scroll max-h-[80vh]">
				{#each possible as item (item)}
					<div class={item.includes(search) ? 'search-result table' : ''}>
						{#if item.includes(search) && search.length > 0}
							{#each item.split(search) as part, index}
								<span class="m-0 p-0 w-0">{part}</span>
								{#if index < item.split(search).length - 1}
									<span class="highlight">{search}</span>
								{/if}
							{/each}
						{:else}
							{item}
						{/if}
					</div>
				{/each}
			</div>
		</div>
		<div class="w-full h-full">
			<button class="bg-green-200 px-3 py-1 m-1 rounded-full" on:click={handleCreateChallenge}
				>generate</button
			>
			<div class="flex flex-col">
				<div>
					start <strong>{challenge.start}</strong>
				</div>
				<div>
					end <strong>{challenge.end}</strong>
				</div>
				<div>
					<h3>solution</h3>
					<div class="flex flex-col space-y-1 p-2 bg-gray-200 w-full">
						{#each challenge.path as word, index}
							<ul class="flex">
								{#each word as letter}
									<li class="w-10 h-10 px-1 border-2 text-center border-gray-300 rounded">
										{letter}
									</li>
								{/each}
							</ul>
						{/each}
					</div>
					<h3>attempt</h3>
					<div class="flex flex-col space-y-1 p-2 bg-gray-200 w-full min-h-[50vh]">
						{#each userPath as word, index}
							<ul class="flex">
								{#each word as letter, i (i)}
									<li class="w-10 h-10 px-1 border-2 text-center border-gray-300 rounded">
										<input
											id={index + '-' + i}
											type="text"
											value={userPath[index][i]}
											class="w-full h-full text-center"
											maxlength="1"
											on:focus={onFocus(index, i)}
											on:keyup={onKeyup(index, i)}
										/>
									</li>
								{/each}
							</ul>
						{/each}
						<button class="bg-blue-200 px-3 py-1 m-1 rounded-full" on:click={addNewWord}
							>Add Word</button
						>
						<button class="bg-green-200 px-3 py-1 m-1 rounded-full" on:click={check}>Check</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.highlight {
		background-color: yellow;
	}
	.search-result {
		/* display: inline-table; */
	}
</style>
