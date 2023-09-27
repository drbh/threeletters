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
		path: null
	};
	let wordsSet: Set<string>;

	onMount(async () => {
		let simplified = await fetch('./simplified.txt').then((r) => r.text());

		const wordsArray = simplified
			.split('\n')
			.map((word: string) => word.trim())
			.map((word: string) => word.toLowerCase());

		wordsSet = new Set(wordsArray);
		possible = wordsArray;
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
        if (path.length === 0) return
		challenge = {
			start,
			end,
			path
		};
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
					<textarea class="p-2 bg-gray-200 w-full min-h-[50vh]" />
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
