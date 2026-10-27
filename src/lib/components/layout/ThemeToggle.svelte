<script lang="ts">
	import { mode, toggleMode } from 'mode-watcher';
	import { Sun, Moon } from '@lucide/svelte';
	import * as m from '#lib/paraglide/messages.js';
</script>

<button
	type="button"
	class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-hidden"
	onclick={toggleMode}
	aria-label={m.theme_toggle_label()}
	title="Toggle Theme"
>
	{#if mode.current === 'dark'}
		<Moon class="size-4.5 transition-transform duration-300" />
	{:else}
		<Sun class="size-4.5 text-amber-500 transition-transform duration-300" />
	{/if}
</button>
