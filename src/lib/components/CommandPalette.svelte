<script lang="ts">
	import {
		Search,
		Compass,
		Code2,
		Briefcase,
		GraduationCap,
		Award,
		BookOpen,
		Mail,
		Copy,
		Sun,
		Moon,
		Globe,
		ExternalLink,
		CornerDownLeft,
		Sparkles
	} from '@lucide/svelte';
	import { mode, setMode } from 'mode-watcher';
	import { getLocale, setLocale } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';

	let { isOpen = $bindable(false) }: { isOpen?: boolean } = $props();

	let searchQuery = $state('');
	let selectedIndex = $state(0);
	let copiedEmail = $state(false);

	interface CommandItem {
		id: string;
		title: string;
		category: string;
		icon: any;
		action: () => void;
		shortcut?: string;
		badge?: string;
	}

	function close() {
		isOpen = false;
		searchQuery = '';
		selectedIndex = 0;
	}

	function navigateTo(id: string) {
		close();
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		} else {
			window.location.hash = id;
		}
	}

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText('mohamadakfry09@gmail.com');
			copiedEmail = true;
			setTimeout(() => {
				copiedEmail = false;
				close();
			}, 1200);
		} catch (err) {
			console.error('Failed to copy', err);
		}
	}

	function toggleThemeMode() {
		setMode(mode.current === 'dark' ? 'light' : 'dark');
		close();
	}

	function switchLanguage() {
		const target = getLocale() === 'id' ? 'en' : 'id';
		setLocale(target);
		close();
	}

	const allCommands: CommandItem[] = $derived([
		// Section Navigation
		{
			id: 'nav-about',
			title: m.nav_about(),
			category: m.cmd_nav_section(),
			icon: Compass,
			action: () => navigateTo('about'),
			badge: '#about'
		},
		{
			id: 'nav-stats',
			title: m.nav_stats(),
			category: m.cmd_nav_section(),
			icon: Sparkles,
			action: () => navigateTo('stats'),
			badge: '#stats'
		},
		{
			id: 'nav-stack',
			title: m.nav_stack(),
			category: m.cmd_nav_section(),
			icon: Code2,
			action: () => navigateTo('stack'),
			badge: '#stack'
		},
		{
			id: 'nav-projects',
			title: m.nav_projects(),
			category: m.cmd_nav_section(),
			icon: Briefcase,
			action: () => navigateTo('projects'),
			badge: '#projects'
		},
		{
			id: 'nav-experience',
			title: m.nav_experience(),
			category: m.cmd_nav_section(),
			icon: Briefcase,
			action: () => navigateTo('experience'),
			badge: '#experience'
		},
		{
			id: 'nav-journey',
			title: m.nav_journey(),
			category: m.cmd_nav_section(),
			icon: GraduationCap,
			action: () => navigateTo('journey'),
			badge: '#journey'
		},
		{
			id: 'nav-certifications',
			title: m.nav_certifications(),
			category: m.cmd_nav_section(),
			icon: Award,
			action: () => navigateTo('certifications'),
			badge: '#certifications'
		},
		{
			id: 'nav-blog',
			title: m.nav_blog(),
			category: m.cmd_nav_section(),
			icon: BookOpen,
			action: () => navigateTo('blog'),
			badge: '#blog'
		},
		{
			id: 'nav-contact',
			title: m.nav_contact(),
			category: m.cmd_nav_section(),
			icon: Mail,
			action: () => navigateTo('contact'),
			badge: '#contact'
		},

		// Actions
		{
			id: 'action-copy-email',
			title: copiedEmail ? m.cmd_email_copied() : m.cmd_copy_email(),
			category: m.cmd_actions(),
			icon: Copy,
			action: copyEmail,
			badge: 'mohamadakfry09@gmail.com'
		},
		{
			id: 'action-toggle-theme',
			title: m.cmd_toggle_theme(),
			category: m.cmd_actions(),
			icon: mode.current === 'dark' ? Sun : Moon,
			action: toggleThemeMode
		},
		{
			id: 'action-switch-lang',
			title: m.cmd_switch_lang(),
			category: m.cmd_actions(),
			icon: Globe,
			action: switchLanguage,
			badge: getLocale().toUpperCase()
		},

		// Socials
		{
			id: 'social-github',
			title: 'GitHub (mohamadakfry09-arch)',
			category: m.cmd_socials(),
			icon: ExternalLink,
			action: () => window.open('https://github.com/mohamadakfry09-arch', '_blank')
		},
		{
			id: 'social-linkedin',
			title: 'LinkedIn (Mohamad Akfry Hermawan)',
			category: m.cmd_socials(),
			icon: ExternalLink,
			action: () => window.open('https://linkedin.com/in/mohamadakfry', '_blank')
		},
		{
			id: 'social-instagram',
			title: 'Instagram (@akarayasadesain)',
			category: m.cmd_socials(),
			icon: ExternalLink,
			action: () => window.open('https://instagram.com/akarayasadesain', '_blank')
		}
	]);

	const filteredCommands = $derived(
		allCommands.filter((cmd) => {
			const query = searchQuery.trim().toLowerCase();
			if (!query) return true;
			return (
				cmd.title.toLowerCase().includes(query) ||
				cmd.category.toLowerCase().includes(query) ||
				(cmd.badge && cmd.badge.toLowerCase().includes(query))
			);
		})
	);

	function handleKeydown(e: KeyboardEvent) {
		// Toggle Command Palette with Ctrl+K or Cmd+K
		if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
			e.preventDefault();
			isOpen = !isOpen;
			return;
		}

		if (!isOpen) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % Math.max(1, filteredCommands.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredCommands[selectedIndex]) {
				filteredCommands[selectedIndex].action();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
			onclick={close}
			aria-label="Close command palette"
		></button>

		<!-- Dialog Panel -->
		<div
			class="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all dark:border-slate-800 dark:bg-slate-900/95"
		>
			<!-- Search Bar -->
			<div class="flex items-center border-b border-slate-100 px-4 dark:border-slate-800/80">
				<Search class="h-4 w-4 text-slate-400 dark:text-slate-500" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder={m.cmd_palette_placeholder()}
					class="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden dark:text-slate-100 dark:placeholder:text-slate-500"
				/>
				<kbd class="hidden rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline-block dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
					ESC
				</kbd>
			</div>

			<!-- Command List -->
			<div class="max-h-80 overflow-y-auto p-2">
				{#if filteredCommands.length === 0}
					<div class="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
						{m.cmd_no_results()}
					</div>
				{:else}
					{#each filteredCommands as cmd, i (cmd.id)}
						{@const isSelected = i === selectedIndex}
						{@const IconComponent = cmd.icon}
						<button
							type="button"
							class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors {isSelected ? 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400' : 'text-slate-700 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/60'}"
							onmouseenter={() => (selectedIndex = i)}
							onclick={cmd.action}
						>
							<div class="flex items-center gap-2.5">
								<div class="flex h-7 w-7 items-center justify-center rounded-lg border {isSelected ? 'border-cyan-500/30 bg-cyan-500/20 text-cyan-600 dark:text-cyan-300' : 'border-slate-200/80 bg-white/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'}">
									<IconComponent class="h-3.5 w-3.5" />
								</div>
								<div>
									<div class="font-medium text-slate-800 dark:text-slate-200">{cmd.title}</div>
									<div class="text-[10px] text-slate-400 dark:text-slate-500">{cmd.category}</div>
								</div>
							</div>

							<div class="flex items-center gap-2">
								{#if cmd.badge}
									<span class="rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
										{cmd.badge}
									</span>
								{/if}
								{#if isSelected}
									<CornerDownLeft class="h-3.5 w-3.5 text-cyan-500" />
								{/if}
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[10px] text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-500">
				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1">
						<kbd class="rounded border border-slate-200 bg-white px-1 dark:border-slate-800 dark:bg-slate-800">↑</kbd>
						<kbd class="rounded border border-slate-200 bg-white px-1 dark:border-slate-800 dark:bg-slate-800">↓</kbd>
						navigasi
					</span>
					<span class="flex items-center gap-1">
						<kbd class="rounded border border-slate-200 bg-white px-1 dark:border-slate-800 dark:bg-slate-800">↵</kbd>
						pilih
					</span>
				</div>
				<div>
					Mohamad Akfry Hermawan
				</div>
			</div>
		</div>
	</div>
{/if}
