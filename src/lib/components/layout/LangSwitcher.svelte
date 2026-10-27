<script lang="ts">
	import { getLocale, setLocale } from '#lib/paraglide/runtime.js';
	import { Languages } from '@lucide/svelte';
	import * as m from '#lib/paraglide/messages.js';

	let currentLocale = $derived(getLocale());

	function toggleLocale() {
		const nextLocale = currentLocale === 'en' ? 'id' : 'en';
		setLocale(nextLocale);
	}
</script>

<button
	type="button"
	class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-hidden"
	onclick={toggleLocale}
	aria-label={currentLocale === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
	title={currentLocale === 'en' ? 'Switch to ID' : 'Switch to EN'}
>
	<Languages class="size-4" />
</button>

