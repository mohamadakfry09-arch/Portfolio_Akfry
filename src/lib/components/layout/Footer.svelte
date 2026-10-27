<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';

	const currentYear = new Date().getFullYear();
</script>

<footer class="screen-line-before border-x border-edge mx-auto md:max-w-3xl w-full px-4 py-8 text-xs text-muted-foreground">
	<div class="flex flex-col sm:flex-row items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<span>© {currentYear} Mohamad Akfry Hermawan.</span>
			<span class="hidden sm:inline">•</span>
			<span class="text-zinc-500">{m.footer_rights()}</span>
		</div>
		<div class="text-zinc-500 font-mono text-[11px]">
			<span>Akarayasa Desain</span>
		</div>
	</div>
</footer>
