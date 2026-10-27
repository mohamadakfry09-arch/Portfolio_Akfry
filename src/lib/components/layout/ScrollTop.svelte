<script lang="ts">
	import { ArrowUp } from '@lucide/svelte';
	import * as m from '#lib/paraglide/messages.js';

	let scrollY = $state(0);
	let isVisible = $derived(scrollY > 400);

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
</script>

<svelte:window bind:scrollY />

{#if isVisible}
	<button
		type="button"
		class="glass-panel fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-cyan-500 hover:text-white hover:shadow-cyan-500/25 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:bg-cyan-500 dark:hover:text-white"
		onclick={scrollToTop}
		aria-label={m.scroll_to_top()}
	>
		<ArrowUp class="h-5 w-5 transition-transform hover:-translate-y-0.5" />
	</button>
{/if}
