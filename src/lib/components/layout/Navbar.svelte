<script lang="ts">
	import {
		Search,
		User,
		FolderCode,
		Briefcase,
		Newspaper,
		Mail,
		House
	} from '@lucide/svelte';
	import GithubIcon from '#lib/components/icons/GithubIcon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import LangSwitcher from './LangSwitcher.svelte';
	import * as m from '#lib/paraglide/messages.js';

	let { onOpenCommandPalette }: { onOpenCommandPalette: () => void } = $props();

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		} else {
			window.location.hash = '#' + id;
		}
	}
</script>

<!-- Top Sticky Navbar Header -->
<header
	class="sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70 px-2"
>
	<div
		class="screen-line-before screen-line-after mx-auto flex h-[var(--header-height)] items-center justify-between gap-2 border-x border-edge px-3 md:max-w-3xl"
	>
		<!-- Brand Monogram Logo -->
		<a
			href="#top"
			onclick={(e) => {
				e.preventDefault();
				scrollTo('top');
			}}
			class="flex items-center gap-2 group cursor-pointer"
			aria-label="Home"
		>
			<div
				class="size-8.5 rounded-lg border border-edge bg-muted/60 flex items-center justify-center font-bold font-mono text-base tracking-tighter text-foreground transition-all duration-300 group-hover:border-primary group-hover:text-primary group-hover:scale-105"
			>
				<span>Ak</span>
			</div>
		</a>

		<!-- Right Controls & Navigation -->
		<div class="flex gap-2 items-center">
			<!-- Desktop Nav items -->
			<nav class="hidden sm:flex items-center gap-3.5 text-sm font-medium tracking-wide text-muted-foreground">
				<button
					type="button"
					onclick={() => scrollTo('about')}
					class="flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer"
				>
					<User class="size-4" />
					<span>{m.nav_about()}</span>
				</button>
				<button
					type="button"
					onclick={() => scrollTo('projects')}
					class="flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer"
				>
					<FolderCode class="size-4" />
					<span>{m.nav_projects()}</span>
				</button>
				<button
					type="button"
					onclick={() => scrollTo('experience')}
					class="flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer"
				>
					<Briefcase class="size-4" />
					<span>{m.nav_experience()}</span>
				</button>
				<button
					type="button"
					onclick={() => scrollTo('blog')}
					class="flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer"
				>
					<Newspaper class="size-4" />
					<span>{m.nav_blog()}</span>
				</button>
				<button
					type="button"
					onclick={() => scrollTo('contact')}
					class="flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer"
				>
					<Mail class="size-4" />
					<span>{m.nav_contact()}</span>
				</button>
			</nav>

			<!-- Separator -->
			<div class="hidden sm:block w-px h-4.5 bg-border my-2"></div>

			<!-- Search / Command Palette Button -->
			<div class="hidden sm:block">
				<button
					type="button"
					onclick={onOpenCommandPalette}
					class="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground rounded-full border border-border bg-muted/40 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
				>
					<Search class="size-3.5" />
					<span class="flex items-center gap-0.5 font-mono text-[11px]">
						<kbd class="rounded border border-border/80 bg-background px-1 py-0.2">⌘</kbd>
						<kbd class="rounded border border-border/80 bg-background px-1 py-0.2">K</kbd>
					</span>
				</button>
			</div>

			<!-- Separator -->
			<div class="w-px h-4.5 bg-border my-2 hidden sm:block"></div>

			<!-- GitHub Profile Link with Badge -->
			<a
				href="https://github.com/mohamadakfry09-arch"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
				aria-label="GitHub Profile"
			>
				<GithubIcon class="size-4.5" />
				<span class="text-xs font-mono tabular-nums text-muted-foreground">12</span>
			</a>

			<!-- Separator -->
			<div class="w-px h-4.5 bg-border my-2"></div>

			<!-- Language Switcher -->
			<LangSwitcher />

			<!-- Separator -->
			<div class="w-px h-4.5 bg-border my-2"></div>

			<!-- Theme Switcher -->
			<ThemeToggle />
		</div>
	</div>
</header>

<!-- Mobile Floating Dock (Pill at bottom center) -->
<div
	class="fixed bottom-3 left-1/2 z-50 flex w-fit -translate-x-1/2 items-center rounded-2xl bg-card/90 backdrop-blur-md py-1 px-1.5 shadow-2xl ring-1 ring-border sm:hidden"
>
	<div class="flex items-center gap-1">
		<button
			type="button"
			onclick={() => scrollTo('top')}
			class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			aria-label="Home"
		>
			<House class="size-4" />
		</button>
		<button
			type="button"
			onclick={() => scrollTo('about')}
			class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			aria-label="About"
		>
			<User class="size-4" />
		</button>
		<button
			type="button"
			onclick={() => scrollTo('projects')}
			class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			aria-label="Projects"
		>
			<FolderCode class="size-4" />
		</button>
		<button
			type="button"
			onclick={() => scrollTo('experience')}
			class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			aria-label="Experience"
		>
			<Briefcase class="size-4" />
		</button>
		<button
			type="button"
			onclick={() => scrollTo('contact')}
			class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			aria-label="Contact"
		>
			<Mail class="size-4" />
		</button>
	</div>

	<div class="w-px h-5 bg-border mx-1"></div>

	<button
		type="button"
		onclick={onOpenCommandPalette}
		class="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
		aria-label="Search"
	>
		<Search class="size-3.5" />
		<span class="font-antic text-xs">Search</span>
	</button>
</div>
