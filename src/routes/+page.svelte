<script lang="ts">
	import {
		CodeXml,
		MapPinHouse,
		MailOpen,
		Phone,
		FileUser,
		Download,
		Copy,
		Check,
		ArrowRight,
		ArrowUpRight,
		Briefcase,
		LayoutGrid,
		BadgeCheck,
		Code,
		FolderCode,
		Newspaper,
		Sparkles,
		Layers,
		Terminal,
		ExternalLink,
		MessageSquare,
		Send,
		User
	} from '@lucide/svelte';
	import GithubIcon from '#lib/components/icons/GithubIcon.svelte';
	import LinkedinIcon from '#lib/components/icons/LinkedinIcon.svelte';
	import InstagramIcon from '#lib/components/icons/InstagramIcon.svelte';
	import HeroBanner from '#lib/components/HeroBanner.svelte';
	import GithubGraph from '#lib/components/GithubGraph.svelte';
	import {
		profileData,
		socialLinks,
		techStack,
		featuredProjects,
		experiences,
		journeyEntries,
		certifications,
		blogPosts
	} from '#lib/data/profile.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let content = $derived(
		data?.portfolioContent || {
			profile: profileData,
			socialLinks,
			techStack,
			featuredProjects,
			experiences,
			journeyEntries,
			certifications,
			blogPosts
		}
	);

	let currentLocale = $derived(getLocale());
	let isEn = $derived(currentLocale === 'en');

	// Avatar flip state
	let currentPhotoIndex = $state(1); // 1 = formal, 2 = casual
	function flipAvatar() {
		currentPhotoIndex = currentPhotoIndex === 1 ? 2 : 1;
	}

	// Copy helpers
	let copiedEmail = $state(false);
	let copiedPhone = $state(false);

	function copyText(text: string, type: 'email' | 'phone') {
		navigator.clipboard.writeText(text);
		if (type === 'email') {
			copiedEmail = true;
			setTimeout(() => (copiedEmail = false), 2000);
		} else {
			copiedPhone = true;
			setTimeout(() => (copiedPhone = false), 2000);
		}
	}

	// Dynamic greeting
	const hour = new Date().getHours();
	let greeting = $derived(
		isEn
			? hour < 12
				? 'Good Morning'
				: hour < 18
					? 'Good Afternoon'
					: 'Good Evening'
			: hour < 12
				? 'Selamat Pagi'
				: hour < 15
					? 'Selamat Siang'
					: hour < 18
						? 'Selamat Sore'
						: 'Selamat Malam'
	);

	// Tech stack filter
	let groupByCat = $state(true);

	const techCategories = ['Languages', 'Frontend', 'Backend & Database', 'Tools & Workflow'] as const;

	// Contact form state
	let contactName = $state('');
	let contactEmail = $state('');
	let contactMessage = $state('');
	let isMessageSent = $state(false);

	async function handleContactSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!contactEmail || !contactMessage) return;

		try {
			await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: contactName,
					email: contactEmail,
					message: contactMessage
				})
			});
		} catch (err) {
			console.error('Failed to submit message:', err);
		}

		isMessageSent = true;
		setTimeout(() => {
			contactName = '';
			contactEmail = '';
			contactMessage = '';
			isMessageSent = false;
		}, 4000);
	}
</script>

<!-- Top Generative Canvas Banner -->
<HeroBanner />

<!-- 1. Hero Profile Section -->
<div class="screen-line-after flex border-x border-edge" id="profile">
	<!-- Left: Avatar Column -->
	<div class="relative shrink-0 border-r border-edge group">
		<!-- Online Status Dot -->
		<div class="absolute bottom-1 right-1 z-10">
			<span class="inline-block size-2 sm:size-3 rounded-full translate-y-[6px] animate-pulse bg-emerald-500"></span>
		</div>

		<!-- Photo index badge (1/2) -->
		<div
			class="absolute top-1 left-1 z-10 text-[10px] sm:text-xs font-medium text-zinc-400 dark:text-zinc-600 select-none pointer-events-none font-mono"
		>
			{currentPhotoIndex}/2
		</div>

		<!-- Avatar Image with Flip Click -->
		<div class="mx-3 my-2 sm:mx-5 sm:my-4">
			<button
				type="button"
				onclick={flipAvatar}
				class="relative cursor-pointer overflow-hidden rounded-full ring-1 ring-[#00A792] dark:ring-[#06FBC2] ring-offset-background ring-offset-2 shadow-xl size-28 sm:size-38 transition-transform duration-300 hover:scale-102 focus:outline-hidden"
				aria-label="Click to flip photo"
			>
				<img
					alt="Mohamad Akfry Hermawan"
					src={currentPhotoIndex === 1 ? '/profile.jpg?v=4' : '/profile-alt.jpg?v=4'}
					class="size-full object-cover transition-opacity duration-300 select-none"
				/>
			</button>
		</div>

		<!-- Floating Speech Bubble -->
		<div class="absolute -top-6 sm:-top-7 right-1 sm:right-2 z-20 pointer-events-none select-none">
			<div class="relative flex flex-col items-center">
				<div
					class="relative z-10 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-2xl shadow-xl border border-zinc-300 dark:border-zinc-700 text-sm sm:text-base font-caveat font-bold tracking-wide whitespace-nowrap"
				>
					Hi, Let's Explore!
				</div>
				<div class="absolute -bottom-1.5 right-6 size-3 bg-white dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-xs"></div>
				<div class="absolute -bottom-3 right-7 size-1.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-xs"></div>
			</div>
		</div>

		<!-- Handwritten Desktop Note "Click to flip" -->
		<div
			class="pointer-events-none absolute font-caveat text-xl/none font-medium tracking-normal text-muted-foreground select-none top-1/2 right-full mr-2 hidden w-28 -translate-y-1/2 flex-col items-end text-right lg:flex"
			aria-hidden="true"
		>
			<span class="mr-1 -rotate-9">Click to flip</span>
			<svg
				class="size-8 shrink-0 text-muted-foreground/50 -scale-x-100 -rotate-12"
				viewBox="0 0 40 40"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M34 4c1 15-5 26-21 30"></path>
				<path d="m21 36-8-2 7-7"></path>
			</svg>
		</div>
	</div>

	<!-- Right: Name & Title Column -->
	<div class="flex flex-col w-full justify-center">
		<!-- Pronouns -->
		<div class="flex grow items-end pb-1 pl-3 sm:pl-5">
			<div class="font-antic line-clamp-1 text-xs sm:text-sm text-zinc-400 select-none dark:text-zinc-500 font-mono">
				he/him • Akfry
			</div>
		</div>

		<!-- Name -->
		<div class="border-t border-edge">
			<div class="flex items-center gap-2 pl-3 sm:pl-5 py-2">
				<h1 class="select-none text-foreground text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
					{content.profile.name}
				</h1>
			</div>
		</div>

		<!-- Subtitle / Role -->
		<div class="h-12 border-t border-edge py-1 pl-3 sm:pl-5 text-sm sm:text-base text-muted-foreground flex items-center overflow-hidden">
			<p class="font-antic font-medium text-foreground/90">
				{isEn ? content.profile.headline.en : content.profile.headline.id}
			</p>
		</div>
	</div>
</div>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 2. Quick Metadata & Direct Actions -->
<div class="screen-line-after screen-line-before space-y-2.5 border-x border-t-0 p-4 text-sm sm:text-base">
	<!-- Role -->
	<div class="flex items-center gap-3.5 py-0.5">
		<div
			class="flex size-6 shrink-0 items-center justify-center rounded-md border border-[#00A792] dark:border-[#06FBC2] bg-muted/60"
		>
			<CodeXml class="size-3.5 text-foreground" />
		</div>
		<p class="font-medium text-balance text-foreground">
			{isEn ? content.profile.headline.en : content.profile.headline.id}
		</p>
	</div>

	<!-- Grid of Location, Email, Phone, Resume -->
	<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
		<!-- Location -->
		<div class="flex items-center gap-3.5 py-0.5">
			<div
				class="flex size-6 shrink-0 items-center justify-center rounded-md border border-[#00A792] dark:border-[#06FBC2] bg-muted/60"
			>
				<MapPinHouse class="size-3.5 text-foreground" />
			</div>
			<p class="font-medium">
				<a
					class="relative inline-block tracking-wide transition-all after:absolute after:bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[#00A792] hover:after:w-full dark:after:bg-[#06FBC2]"
					href={content.profile.locationUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					{content.profile.location}
				</a>
			</p>
		</div>

		<!-- Email with Copy -->
		<div class="flex items-center gap-3.5 py-0.5">
			<div
				class="flex size-6 shrink-0 items-center justify-center rounded-md border border-[#00A792] dark:border-[#06FBC2] bg-muted/60"
			>
				<MailOpen class="size-3.5 text-foreground" />
			</div>
			<div class="flex items-center gap-1.5 font-medium">
				<a
					href="mailto:{content.profile.email}"
					class="relative inline-block tracking-wide transition-all after:absolute after:bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[#00A792] hover:after:w-full dark:after:bg-[#06FBC2]"
				>
					{content.profile.email}
				</a>
				<button
					type="button"
					onclick={() => copyText(content.profile.email, 'email')}
					class="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					title="Copy Email"
				>
					{#if copiedEmail}
						<Check class="size-3.5 text-[#00A792] dark:text-[#06FBC2]" />
					{:else}
						<Copy class="size-3.5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Phone with Copy -->
		<div class="flex items-center gap-3.5 py-0.5">
			<div
				class="flex size-6 shrink-0 items-center justify-center rounded-md border border-[#00A792] dark:border-[#06FBC2] bg-muted/60"
			>
				<Phone class="size-3.5 text-foreground" />
			</div>
			<div class="flex items-center gap-1.5 font-medium">
				<a
					href="https://wa.me/6283167602196"
					target="_blank"
					rel="noopener noreferrer"
					class="relative inline-block tracking-wide transition-all after:absolute after:bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[#00A792] hover:after:w-full dark:after:bg-[#06FBC2]"
				>
					{content.profile.phone || '+62 831-6760-2196'}
				</a>
				<button
					type="button"
					onclick={() => copyText(content.profile.phone || '+6283167602196', 'phone')}
					class="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					title="Copy Phone"
				>
					{#if copiedPhone}
						<Check class="size-3.5 text-[#00A792] dark:text-[#06FBC2]" />
					{:else}
						<Copy class="size-3.5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Resume -->
		<div class="flex items-center gap-3.5 py-0.5">
			<div
				class="flex size-6 shrink-0 items-center justify-center rounded-md border border-[#00A792] dark:border-[#06FBC2] bg-muted/60"
			>
				<FileUser class="size-3.5 text-foreground" />
			</div>
			<p class="flex items-center gap-2 font-medium">
				<a
					class="relative inline-block tracking-wide transition-all after:absolute after:bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[#00A792] hover:after:w-full dark:after:bg-[#06FBC2]"
					href={content.profile.resumeUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					Resume
				</a>
				<a
					href={content.profile.resumeUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Download resume"
				>
					<Download class="size-3.5" />
				</a>
			</p>
		</div>
	</div>
</div>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 3. Social Links Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1 relative"
	id="social-links"
>
	<h2 class="sr-only">Social Links</h2>

	<!-- Grid of Social Platforms -->
	<div class="grid grid-cols-2 gap-0 sm:grid-cols-3 divide-y divide-edge sm:divide-y-0">
		<!-- LinkedIn -->
		<a
			href={content.socialLinks[1].url}
			target="_blank"
			rel="noopener"
			class="group/link flex cursor-pointer items-center gap-2 sm:gap-3 p-3.5 transition-colors hover:bg-muted/40 border-r border-edge"
		>
			<div class="relative size-8 shrink-0 flex items-center justify-center rounded-md border border-edge bg-muted/50">
				<LinkedinIcon class="size-4.5 text-foreground/80 group-hover/link:text-primary transition-colors" />
			</div>
			<div class="flex-1 min-w-0 transition-transform duration-300 ease-out group-hover/link:translate-x-1">
				<h3 class="font-medium text-sm sm:text-base">LinkedIn</h3>
				<p class="text-xs text-muted-foreground truncate font-mono">{content.socialLinks[1].label}</p>
			</div>
			<ArrowRight class="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out group-hover/link:-rotate-45 group-hover/link:text-primary" />
		</a>

		<!-- GitHub -->
		<a
			href={content.socialLinks[0].url}
			target="_blank"
			rel="noopener"
			class="group/link flex cursor-pointer items-center gap-2 sm:gap-3 p-3.5 transition-colors hover:bg-muted/40 sm:border-r border-edge"
		>
			<div class="relative size-8 shrink-0 flex items-center justify-center rounded-md border border-edge bg-muted/50">
				<GithubIcon class="size-4.5 text-foreground/80 group-hover/link:text-primary transition-colors" />
			</div>
			<div class="flex-1 min-w-0 transition-transform duration-300 ease-out group-hover/link:translate-x-1">
				<h3 class="font-medium text-sm sm:text-base">GitHub</h3>
				<p class="text-xs text-muted-foreground truncate font-mono">{content.socialLinks[0].label}</p>
			</div>
			<ArrowRight class="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out group-hover/link:-rotate-45 group-hover/link:text-primary" />
		</a>

		<!-- Instagram -->
		<a
			href={content.socialLinks[2].url}
			target="_blank"
			rel="noopener"
			class="group/link flex cursor-pointer items-center gap-2 sm:gap-3 p-3.5 transition-colors hover:bg-muted/40 border-r sm:border-r-0 border-edge"
		>
			<div class="relative size-8 shrink-0 flex items-center justify-center rounded-md border border-edge bg-muted/50">
				<InstagramIcon class="size-4.5 text-foreground/80 group-hover/link:text-primary transition-colors" />
			</div>
			<div class="flex-1 min-w-0 transition-transform duration-300 ease-out group-hover/link:translate-x-1">
				<h3 class="font-medium text-sm sm:text-base">Instagram</h3>
				<p class="text-xs text-muted-foreground truncate font-mono">{content.socialLinks[2].label}</p>
			</div>
			<ArrowRight class="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out group-hover/link:-rotate-45 group-hover/link:text-primary" />
		</a>
	</div>

	<!-- Handwritten Desktop Note "Say hi" -->
	<div
		class="pointer-events-none absolute font-caveat text-xl/none font-medium tracking-normal text-muted-foreground select-none top-4 right-full mr-2 hidden w-32 flex-col items-end text-right lg:flex"
		aria-hidden="true"
	>
		<span class="mr-1 -rotate-8">Say hi</span>
		<svg
			class="size-8 shrink-0 text-muted-foreground/50 -scale-x-100 -rotate-12"
			viewBox="0 0 40 40"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M34 4c1 15-5 26-21 30"></path>
			<path d="m21 36-8-2 7-7"></path>
		</svg>
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 4. GitHub Contribution Activity Graph -->
<GithubGraph />

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 5. About Section with Dynamic Greeting -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="about"
>
	<header class="screen-line-after px-4 py-3 border-b border-edge flex items-center justify-between">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center gap-2">
			<!-- Waving Hand SVG animation -->
			<span class="inline-block hover:animate-bounce cursor-default">👋</span>
			<span class="font-caveat font-bold text-2xl sm:text-3xl text-foreground">
				{greeting}
			</span>
		</h2>
		<span class="text-xs font-mono text-muted-foreground border border-edge rounded-full px-2.5 py-0.5">
			Akarayasa Desain
		</span>
	</header>

	<div class="p-4 sm:p-6 text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3.5">
		<p>
			{isEn ? content.profile.about.en : content.profile.about.id}
		</p>
		<p>
			{isEn
				? 'Specializing in clean UI architecture, type safety, responsive design systems, and resilient full-stack workflows. Passionate about empowering citizen services and commercial enterprises with intuitive digital tools.'
				: 'Berpengalaman dalam merancang arsitektur antarmuka modern yang bersih, type-safe, sistem desain responsif, serta alur kerja full-stack tangguh. Berdedikasi menghadirkan sistem informasi yang andal bagi instansi publik maupun pelaku bisnis.'}
		</p>
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 6. Key Stats Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="stats"
>
	<h2 class="sr-only">{m.nav_stats()}</h2>
	<div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-edge">
		<!-- Years experience -->
		<div class="flex flex-col items-center justify-center p-4 gap-1">
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<Briefcase class="size-4" />
				<span class="text-xl sm:text-2xl font-bold font-mono text-foreground">{content.profile.stats.yearsExperience}+</span>
			</div>
			<p class="text-xs sm:text-sm text-muted-foreground text-center">
				{isEn ? 'Years Experience' : 'Tahun Pengalaman'}
			</p>
		</div>

		<!-- Projects -->
		<div class="flex flex-col items-center justify-center p-4 gap-1">
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<LayoutGrid class="size-4" />
				<span class="text-xl sm:text-2xl font-bold font-mono text-foreground">{content.profile.stats.completedProjects}+</span>
			</div>
			<p class="text-xs sm:text-sm text-muted-foreground text-center">
				{isEn ? 'Completed Projects' : 'Proyek Selesai'}
			</p>
		</div>

		<!-- Certifications -->
		<div class="flex flex-col items-center justify-center p-4 gap-1">
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<BadgeCheck class="size-4" />
				<span class="text-xl sm:text-2xl font-bold font-mono text-foreground">{content.certifications.length}+</span>
			</div>
			<p class="text-xs sm:text-sm text-muted-foreground text-center">
				{isEn ? 'Certifications' : 'Sertifikasi'}
			</p>
		</div>

		<!-- Tech stack items -->
		<div class="flex flex-col items-center justify-center p-4 gap-1">
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<Code class="size-4" />
				<span class="text-xl sm:text-2xl font-bold font-mono text-foreground">{content.techStack.length}+</span>
			</div>
			<p class="text-xs sm:text-sm text-muted-foreground text-center">
				{isEn ? 'Technologies' : 'Teknologi Dikuasai'}
			</p>
		</div>
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 7. Tech Stack Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="stack"
>
	<header class="screen-line-after px-4 py-3 border-b border-edge flex items-center justify-between">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center gap-2">
			<Code class="size-5 text-primary" />
			<span>{m.nav_stack()}</span>
		</h2>
		<button
			type="button"
			onclick={() => (groupByCat = !groupByCat)}
			class="text-xs font-mono border border-edge rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
		>
			{groupByCat ? (isEn ? 'Show All' : 'Lihat Semua') : (isEn ? 'Group by Category' : 'Kelompokkan Kategori')}
		</button>
	</header>

	<div class="p-4 sm:p-6">
		{#if groupByCat}
			<div class="space-y-6">
				{#each techCategories as category}
					{@const items = content.techStack.filter((t) => t.category === category)}
					{#if items.length > 0}
						<div>
							<h3 class="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2.5">
								{category}
							</h3>
							<div class="flex flex-wrap gap-2">
								{#each items as item}
									<a
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
										class="group flex items-center gap-1.5 rounded-full border border-dashed border-edge hover:border-solid hover:border-primary/60 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted/80"
									>
										<span class="size-1.5 rounded-full bg-primary/70 group-hover:scale-125 transition-transform"></span>
										<span>{item.name}</span>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each content.techStack as item}
					<a
						href={item.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex items-center gap-1.5 rounded-full border border-dashed border-edge hover:border-solid hover:border-primary/60 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted/80"
					>
						<span class="size-1.5 rounded-full bg-primary/70 group-hover:scale-125 transition-transform"></span>
						<span>{item.name}</span>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 8. Featured Projects Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="projects"
>
	<header class="screen-line-after px-4 py-3 border-b border-edge flex items-center justify-between">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center gap-2">
			<FolderCode class="size-5 text-primary" />
			<span>{m.nav_projects()}</span>
			<sup class="text-xs font-mono text-muted-foreground">({content.featuredProjects.length})</sup>
		</h2>
		<a
			href="https://github.com/mohamadakfry09-arch"
			target="_blank"
			rel="noopener noreferrer"
			class="text-xs font-antic text-primary hover:underline flex items-center gap-1"
		>
			<span>{m.view_all_projects()}</span>
			<ArrowUpRight class="size-3.5" />
		</a>
	</header>

	<div class="divide-y divide-edge">
		{#each content.featuredProjects as project}
			<div class="p-4 sm:p-6 transition-colors hover:bg-muted/20">
				<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
					<div class="space-y-1.5 flex-1">
						<div class="flex items-center gap-2">
							<h3 class="text-base sm:text-lg font-semibold text-foreground">
								{project.title}
							</h3>
						</div>
						<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
							{isEn ? project.summary.en : project.summary.id}
						</p>

						<!-- Tech Tags -->
						<div class="flex flex-wrap gap-1.5 pt-2">
							{#each project.tags as tag}
								<span
									class="rounded-md border border-edge bg-muted/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
								>
									{tag}
								</span>
							{/each}
						</div>
					</div>

					<!-- Action Links -->
					<div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
						{#if project.demoUrl && project.demoUrl !== '#'}
							<a
								href={project.demoUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-1 rounded-md border border-edge bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-all"
							>
								<span>Live</span>
								<ExternalLink class="size-3" />
							</a>
						{/if}
						<a
							href={project.repoUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1 rounded-md border border-edge bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-all"
						>
							<GithubIcon class="size-3" />
							<span>Code</span>
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 9. Experience & Milestones Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="experience"
>
	<header class="screen-line-after px-4 py-3 border-b border-edge">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center gap-2">
			<Briefcase class="size-5 text-primary" />
			<span>{m.nav_experience()}</span>
		</h2>
	</header>

	<!-- Experience items -->
	<div class="divide-y divide-edge">
		{#each content.experiences as exp}
			<div class="p-4 sm:p-6 space-y-2">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
					<h3 class="font-semibold text-base sm:text-lg text-foreground">
						{isEn ? exp.role.en : exp.role.id}
					</h3>
					<span class="text-xs font-mono text-muted-foreground border border-edge rounded px-2 py-0.5 self-start sm:self-auto">
						{isEn ? exp.period.en : exp.period.id}
					</span>
				</div>
				<div class="text-sm font-medium text-primary">
					{exp.organization}
				</div>
				<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
					{isEn ? exp.description.en : exp.description.id}
				</p>
				<div class="flex flex-wrap gap-1.5 pt-1.5">
					{#each exp.techs as tech}
						<span class="rounded bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
							{tech}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Journey Milestones Subheader -->
	<header class="screen-line-before screen-line-after px-4 py-3 border-t border-b border-edge bg-muted/20">
		<h3 class="text-lg font-medium flex items-center gap-2">
			<span>{m.nav_journey()}</span>
		</h3>
	</header>

	<div class="divide-y divide-edge">
		{#each content.journeyEntries as journey}
			<div class="p-4 sm:p-5 flex gap-4">
				<div class="w-16 shrink-0 font-mono text-xs font-bold text-primary pt-0.5">
					{journey.year}
				</div>
				<div class="space-y-1 flex-1">
					<h4 class="font-medium text-sm sm:text-base text-foreground">
						{isEn ? journey.title.en : journey.title.id}
					</h4>
					<ul class="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1">
						{#each isEn ? journey.bullets.en : journey.bullets.id as bullet}
							<li>{bullet}</li>
						{/each}
					</ul>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 10. Certifications Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="certifications"
>
	<header class="screen-line-after px-4 py-3 border-b border-edge">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center gap-2">
			<BadgeCheck class="size-5 text-primary" />
			<span>{m.nav_certifications()}</span>
			<sup class="text-xs font-mono text-muted-foreground">({content.certifications.length})</sup>
		</h2>
	</header>

	<div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-edge border-b border-edge">
		{#each content.certifications as cert}
			<div class="p-4 sm:p-5 space-y-1.5 flex flex-col justify-between hover:bg-muted/20 transition-colors">
				<div>
					<div class="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
						<span>{cert.issuer}</span>
						<span>{cert.issueDate}</span>
					</div>
					<h3 class="font-semibold text-sm sm:text-base text-foreground">
						{cert.title}
					</h3>
				</div>
				{#if cert.credentialUrl && cert.credentialUrl !== '#'}
					<a
						href={cert.credentialUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs font-mono text-primary hover:underline flex items-center gap-1 pt-2"
					>
						<span>Credential</span>
						<ExternalLink class="size-3" />
					</a>
				{/if}
			</div>
		{/each}
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 11. Blog Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1"
	id="blog"
>
	<header class="screen-line-after px-4 py-3 border-b border-edge flex items-center justify-between">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center gap-2">
			<Newspaper class="size-5 text-primary" />
			<span>{m.nav_blog()}</span>
			<sup class="text-xs font-mono text-muted-foreground">({content.blogPosts.length})</sup>
		</h2>
		<span class="text-xs font-mono text-muted-foreground">
			{isEn ? 'Articles & Thoughts' : 'Artikel & Refleksi'}
		</span>
	</header>

	<div class="divide-y divide-edge">
		{#each content.blogPosts as post}
			<article class="p-4 sm:p-6 space-y-2 hover:bg-muted/20 transition-colors">
				<div class="flex items-center gap-3 text-xs font-mono text-muted-foreground">
					<time datetime={post.publishedAt}>{post.publishedAt}</time>
					<span>•</span>
					<span>{post.readTime}</span>
				</div>
				<h3 class="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors">
					{isEn ? post.title.en : post.title.id}
				</h3>
				<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
					{isEn ? post.excerpt.en : post.excerpt.id}
				</p>
				<div class="flex flex-wrap gap-1.5 pt-1">
					{#each post.tags as tag}
						<span class="rounded bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
							#{tag}
						</span>
					{/each}
				</div>
			</article>
		{/each}
	</div>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>

<!-- 12. Contact Section -->
<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1 p-4 sm:p-6"
	id="contact"
>
	<div class="text-center max-w-lg mx-auto space-y-2 mb-6">
		<h2 class="text-2xl sm:text-3xl font-medium flex items-center justify-center gap-2">
			<MessageSquare class="size-6 text-primary" />
			<span class="font-caveat font-bold text-3xl sm:text-4xl">
				{isEn ? "Let's Talk" : 'Mari Berdiskusi'}
			</span>
		</h2>
		<p class="text-xs sm:text-sm text-muted-foreground">
			{isEn
				? 'Available for full-time frontend engineering roles, enterprise Laravel systems, and UI/UX design consultations via Akarayasa Desain.'
				: 'Terbuka untuk tawaran posisi frontend developer, pengembangan sistem web berbasis Laravel, dan konsultasi UI/UX profesional.'}
		</p>
	</div>

	<!-- Interactive Direct Action Buttons -->
	<div class="flex flex-wrap items-center justify-center gap-3 mb-8">
		<a
			href="mailto:{content.profile.email}"
			class="flex items-center gap-2 rounded-lg border border-edge bg-muted/40 hover:bg-muted px-4 py-2 text-xs font-medium text-foreground transition-all hover:border-primary cursor-pointer"
		>
			<MailOpen class="size-4 text-primary" />
			<span>{content.profile.email}</span>
		</a>
		<a
			href="https://wa.me/6283167602196"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 rounded-lg border border-edge bg-muted/40 hover:bg-muted px-4 py-2 text-xs font-medium text-foreground transition-all hover:border-primary cursor-pointer"
		>
			<Phone class="size-4 text-emerald-500" />
			<span>WhatsApp ({content.profile.phone || '+62 831-6760-2196'})</span>
		</a>
	</div>

	<!-- Quick Message Form -->
	<form
		onsubmit={handleContactSubmit}
		class="max-w-md mx-auto space-y-3 rounded-xl border border-edge p-4 sm:p-5 bg-card/60 shadow-xs"
	>
		<div>
			<label for="contact-name" class="block text-xs font-mono text-muted-foreground mb-1">
				{isEn ? 'Your Name' : 'Nama Anda'}
			</label>
			<input
				id="contact-name"
				type="text"
				bind:value={contactName}
				placeholder={isEn ? 'e.g. Alex Smith' : 'Contoh: Alex Pratama'}
				class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
			/>
		</div>

		<div>
			<label for="contact-email" class="block text-xs font-mono text-muted-foreground mb-1">
				{isEn ? 'Email Address' : 'Alamat Email'} *
			</label>
			<input
				id="contact-email"
				type="email"
				required
				bind:value={contactEmail}
				placeholder="you@domain.com"
				class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary"
			/>
		</div>

		<div>
			<label for="contact-message" class="block text-xs font-mono text-muted-foreground mb-1">
				{isEn ? 'Message' : 'Pesan'} *
			</label>
			<textarea
				id="contact-message"
				rows="3"
				required
				bind:value={contactMessage}
				placeholder={isEn ? 'Write your project idea or message here...' : 'Tuliskan ide proyek atau pesan Anda...'}
				class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-primary resize-none"
			></textarea>
		</div>

		<button
			type="submit"
			class="w-full flex items-center justify-center gap-2 rounded-md bg-[#00A792] dark:bg-[#06FBC2] text-white dark:text-black py-2 px-4 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
		>
			{#if isMessageSent}
				<Check class="size-4" />
				<span>{isEn ? 'Message Sent!' : 'Pesan Terkirim!'}</span>
			{:else}
				<Send class="size-3.5" />
				<span>{isEn ? 'Send Message' : 'Kirim Pesan'}</span>
			{/if}
		</button>
	</form>
</section>

<!-- Diagonal Blueprint Pattern Spacer -->
<div class="diagonal-spacer"></div>
