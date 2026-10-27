<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import ScrollTop from '#lib/components/layout/ScrollTop.svelte';
	import CommandPalette from '#lib/components/CommandPalette.svelte';
	import ChatWidget from '#lib/components/ChatWidget.svelte';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let isCommandPaletteOpen = $state(false);

	function openCommandPalette() {
		isCommandPaletteOpen = true;
	}

	function handleMouseMove(e: MouseEvent) {
		document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
		document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
	}

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
</script>

<svelte:window onmousemove={isAdminRoute ? undefined : handleMouseMove} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Mohamad Akfry Hermawan - Front-End Specialist & Full Stack Developer</title>
	<meta
		name="description"
		content="Portofolio interaktif Mohamad Akfry Hermawan (Akfry): Front-End Specialist & Full Stack Developer. React, TypeScript, Tailwind CSS, Laravel, Akarayasa Desain."
	/>
</svelte:head>

<ModeWatcher />

{#if isAdminRoute}
	<!-- ISOLATED STANDALONE ADMIN INTERFACE (SEPARATED FROM PUBLIC PORTFOLIO) -->
	<div class="min-h-screen bg-background text-foreground transition-colors duration-300">
		{@render children()}
	</div>
{:else}
	<!-- PUBLIC PORTFOLIO WEBSITE INTERFACE -->
	<div class="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-background text-foreground transition-colors duration-300">
		<!-- Spotlight Glow tracking cursor -->
		<div aria-hidden="true" class="pointer-events-none fixed inset-0 z-40 spotlight-glow"></div>

		<!-- Sticky Header / Navbar -->
		<Navbar onOpenCommandPalette={openCommandPalette} />

		<!-- Main Page Content Slot -->
		<main id="top" class="relative z-10 w-full overflow-x-hidden px-2 pointer-events-auto flex-1">
			<div class="mx-auto md:max-w-3xl">
				{@render children()}
			</div>
		</main>

		<!-- Footer -->
		<Footer />

		<!-- Global Floating Widgets -->
		<ScrollTop />
		<ChatWidget />
		<CommandPalette bind:isOpen={isCommandPaletteOpen} />
	</div>

	<!-- Hidden prefetch links for Paraglide SEO & routing -->
	<div style="display:none">
		{#each locales as locale (locale)}
			<a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
		{/each}
	</div>
{/if}
