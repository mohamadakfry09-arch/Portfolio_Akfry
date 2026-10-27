<script lang="ts">
	import { mode, toggleMode } from 'mode-watcher';
	import {
		LayoutGrid,
		User,
		FolderCode,
		Briefcase,
		Newspaper,
		Mail,
		Save,
		Plus,
		Trash2,
		ExternalLink,
		LogOut,
		Check,
		AlertCircle,
		Sparkles,
		Eye,
		EyeOff,
		MessageSquare,
		Clock,
		ArrowLeft,
		ChevronRight,
		ChevronDown,
		ChevronUp,
		Shield,
		Globe,
		Sun,
		Moon,
		Inbox,
		CheckCircle2,
		KeyRound,
		BadgeCheck,
		ArrowUp,
		ArrowDown,
		Copy,
		Search,
		Menu,
		X,
		Pencil,
		Image as ImageIcon,
		Calendar,
		Building,
		Tag
	} from '@lucide/svelte';
	import type { PortfolioContent, Project, Experience, JourneyEntry, BlogPost, ContactMessage, Certification } from '#lib/types.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let isAuthenticated = $state(data.isAuthenticated);
	let passwordInput = $state('');
	let showPassword = $state(false);
	let loginError = $state('');
	let isLoggingIn = $state(false);

	function fillDefaultPassword() {
		passwordInput = 'admin123';
	}

	// Active tab: 'overview' | 'about' | 'projects' | 'experience' | 'certifications' | 'blog' | 'contact'
	let activeTab = $state<'overview' | 'about' | 'projects' | 'experience' | 'certifications' | 'blog' | 'contact'>('overview');
	let experienceSubTab = $state<'work' | 'journey'>('work');
	let aboutLangTab = $state<'id' | 'en'>('id');
	let searchQuery = $state('');
	let sidebarOpen = $state(false);

	// Expanded card state trackers for clean master-detail experience
	let expandedProjects = $state<Record<string, boolean>>({});
	let expandedCerts = $state<Record<string, boolean>>({});
	let expandedExp = $state<Record<string, boolean>>({});
	let expandedBlog = $state<Record<string, boolean>>({});

	// Local mutable copy of content
	// svelte-ignore state_referenced_locally
	let content = $state<PortfolioContent | null>(
		(() => {
			if (!data.content) return null;
			const parsed = JSON.parse(JSON.stringify(data.content));
			if (!parsed.certifications) parsed.certifications = [];
			return parsed;
		})()
	);

	// Local mutable copy of contact messages
	// svelte-ignore state_referenced_locally
	let messages = $state<ContactMessage[]>(
		data.messages ? JSON.parse(JSON.stringify(data.messages)) : []
	);

	let isSaving = $state(false);
	let toastMessage = $state<{ text: string; type: 'success' | 'error' } | null>(null);

	function showToast(text: string, type: 'success' | 'error' = 'success') {
		toastMessage = { text, type };
		setTimeout(() => {
			toastMessage = null;
		}, 3500);
	}

	function switchTab(tab: typeof activeTab) {
		activeTab = tab;
		searchQuery = '';
		sidebarOpen = false;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Expand / Collapse helpers
	function toggleItem(record: Record<string, boolean>, id: string) {
		record[id] = !record[id];
	}

	function toggleAll(record: Record<string, boolean>, ids: string[], open: boolean) {
		ids.forEach((id) => {
			record[id] = open;
		});
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loginError = '';
		isLoggingIn = true;

		try {
			const res = await fetch('/api/admin/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: passwordInput })
			});

			const result = await res.json();
			if (result.success) {
				isAuthenticated = true;
				// Fetch latest content & messages
				const contentRes = await fetch('/api/admin/content');
				const contentData = await contentRes.json();
				if (contentData.success) {
					content = contentData.content;
					if (content && !content.certifications) {
						content.certifications = [];
					}
				}
				const msgRes = await fetch('/api/contact');
				const msgData = await msgRes.json();
				if (msgData.success) {
					messages = msgData.messages;
				}
				showToast('Selamat datang di Panel Admin!');
			} else {
				loginError = result.message || 'Kata sandi salah';
			}
		} catch (err) {
			loginError = 'Terjadi kesalahan koneksi';
		} finally {
			isLoggingIn = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/admin/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'logout' })
		});
		isAuthenticated = false;
		passwordInput = '';
	}

	async function saveAllChanges() {
		if (!content) return;
		isSaving = true;

		try {
			const res = await fetch('/api/admin/content', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			});

			const result = await res.json();
			if (result.success) {
				showToast('Semua perubahan berhasil disimpan & langsung aktif!');
			} else {
				showToast(result.message || 'Gagal menyimpan perubahan', 'error');
			}
		} catch (err) {
			showToast('Gagal menghubungi server', 'error');
		} finally {
			isSaving = false;
		}
	}

	// Filtered lists for search
	let filteredProjects = $derived(
		content?.featuredProjects.filter((p) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				p.title.toLowerCase().includes(q) ||
				p.slug.toLowerCase().includes(q) ||
				p.tags.some((t) => t.toLowerCase().includes(q))
			);
		}) || []
	);

	let filteredCertifications = $derived(
		content?.certifications?.filter((c) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				c.title.toLowerCase().includes(q) ||
				c.issuer.toLowerCase().includes(q) ||
				c.issueDate.toLowerCase().includes(q)
			);
		}) || []
	);

	let filteredBlogPosts = $derived(
		content?.blogPosts.filter((b) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				b.title.id.toLowerCase().includes(q) ||
				b.title.en.toLowerCase().includes(q) ||
				b.tags.some((t) => t.toLowerCase().includes(q))
			);
		}) || []
	);

	// Project helpers
	function addProject() {
		if (!content) return;
		const newId = 'proj-' + Date.now();
		const newProj: Project = {
			id: newId,
			title: 'Judul Proyek Baru',
			slug: 'proyek-baru-' + Date.now().toString().slice(-4),
			summary: {
				id: 'Ringkasan singkat deskripsi proyek.',
				en: 'Brief summary of the project.'
			},
			description: {
				id: 'Rincian lengkap fitur aplikasi dan arsitektur yang dibangun.',
				en: 'Detailed overview of application features and architecture.'
			},
			thumbnail: '/projects/default.webp',
			tags: ['React', 'TypeScript', 'Tailwind CSS'],
			demoUrl: '#',
			repoUrl: 'https://github.com/mohamadakfry09-arch',
			featured: true
		};
		content.featuredProjects.unshift(newProj);
		expandedProjects[newId] = true;
		showToast('Proyek baru ditambahkan (form langsung terbuka)');
	}

	function removeProject(id: string) {
		if (!content) return;
		const idx = content.featuredProjects.findIndex((p) => p.id === id);
		if (idx === -1) return;
		const proj = content.featuredProjects[idx];
		if (confirm(`Yakin ingin menghapus proyek "${proj.title}"?`)) {
			content.featuredProjects.splice(idx, 1);
			delete expandedProjects[id];
			showToast('Proyek berhasil dihapus');
		}
	}

	function duplicateProject(id: string) {
		if (!content) return;
		const idx = content.featuredProjects.findIndex((p) => p.id === id);
		if (idx === -1) return;
		const original = content.featuredProjects[idx];
		const newId = 'proj-' + Date.now();
		const copy: Project = {
			...JSON.parse(JSON.stringify(original)),
			id: newId,
			title: original.title ? `${original.title} (Salinan)` : 'Proyek Salinan',
			slug: original.slug ? `${original.slug}-salinan` : 'proyek-salinan'
		};
		content.featuredProjects.splice(idx + 1, 0, copy);
		expandedProjects[newId] = true;
		showToast('Proyek berhasil diduplikasi');
	}

	function moveProject(id: string, direction: 'up' | 'down') {
		if (!content) return;
		const idx = content.featuredProjects.findIndex((p) => p.id === id);
		if (idx === -1) return;
		const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= content.featuredProjects.length) return;
		const [item] = content.featuredProjects.splice(idx, 1);
		content.featuredProjects.splice(targetIdx, 0, item);
	}

	// Experience helpers
	function addExperience() {
		if (!content) return;
		const newId = 'exp-' + Date.now();
		const newExp: Experience = {
			id: newId,
			organization: 'Nama Instansi / Perusahaan',
			role: {
				id: 'Posisi / Role Anda',
				en: 'Your Role / Position'
			},
			period: {
				id: '2025 — Sekarang',
				en: '2025 — Present'
			},
			description: {
				id: 'Deskripsi tugas, tanggung jawab, dan hasil kontribusi.',
				en: 'Description of duties, responsibilities, and achievements.'
			},
			techs: ['React', 'Laravel', 'Tailwind CSS']
		};
		content.experiences.unshift(newExp);
		expandedExp[newId] = true;
		showToast('Pengalaman kerja ditambahkan');
	}

	function removeExperience(index: number) {
		if (!content) return;
		const exp = content.experiences[index];
		if (confirm(`Hapus pengalaman "${exp.organization}"?`)) {
			content.experiences.splice(index, 1);
			showToast('Pengalaman dihapus');
		}
	}

	function duplicateExperience(index: number) {
		if (!content) return;
		const original = content.experiences[index];
		const newId = 'exp-' + Date.now();
		const copy: Experience = {
			...JSON.parse(JSON.stringify(original)),
			id: newId,
			organization: original.organization ? `${original.organization} (Salinan)` : 'Instansi Salinan'
		};
		content.experiences.splice(index + 1, 0, copy);
		expandedExp[newId] = true;
		showToast('Pengalaman berhasil diduplikasi');
	}

	function moveExperience(index: number, direction: 'up' | 'down') {
		if (!content) return;
		const targetIdx = direction === 'up' ? index - 1 : index + 1;
		if (targetIdx < 0 || targetIdx >= content.experiences.length) return;
		const [item] = content.experiences.splice(index, 1);
		content.experiences.splice(targetIdx, 0, item);
	}

	// Journey helpers
	function addJourney() {
		if (!content) return;
		const newJourney: JourneyEntry = {
			year: new Date().getFullYear().toString(),
			phase: {
				id: 'Fase Baru',
				en: 'New Milestone'
			},
			title: {
				id: 'Pencapaian Baru',
				en: 'New Achievement'
			},
			bullets: {
				id: ['Rincian capaian utama.'],
				en: ['Details of key achievement.']
			}
		};
		content.journeyEntries.push(newJourney);
		showToast('Milestone perjalanan ditambahkan');
	}

	function removeJourney(index: number) {
		if (!content) return;
		content.journeyEntries.splice(index, 1);
		showToast('Milestone dihapus');
	}

	// Certification helpers
	function addCertification() {
		if (!content) return;
		if (!content.certifications) content.certifications = [];
		const newId = 'cert-' + Date.now();
		const newCert: Certification = {
			id: newId,
			title: 'Nama Sertifikasi / Lisensi Baru',
			issuer: 'Lembaga / Penyelenggara',
			issueDate: new Date().getFullYear().toString(),
			credentialUrl: 'https://',
			previewFile: '#'
		};
		content.certifications.unshift(newCert);
		expandedCerts[newId] = true;
		showToast('Sertifikasi baru ditambahkan (form langsung terbuka)');
	}

	function removeCertification(id: string) {
		if (!content || !content.certifications) return;
		const idx = content.certifications.findIndex((c) => c.id === id);
		if (idx === -1) return;
		const cert = content.certifications[idx];
		if (confirm(`Yakin ingin menghapus sertifikasi "${cert.title || 'ini'}"?`)) {
			content.certifications.splice(idx, 1);
			delete expandedCerts[id];
			showToast('Sertifikasi dihapus');
		}
	}

	function duplicateCertification(id: string) {
		if (!content || !content.certifications) return;
		const idx = content.certifications.findIndex((c) => c.id === id);
		if (idx === -1) return;
		const original = content.certifications[idx];
		const newId = 'cert-' + Date.now();
		const copy: Certification = {
			...JSON.parse(JSON.stringify(original)),
			id: newId,
			title: original.title ? `${original.title} (Salinan)` : 'Sertifikasi Salinan'
		};
		content.certifications.splice(idx + 1, 0, copy);
		expandedCerts[newId] = true;
		showToast('Sertifikasi berhasil diduplikasi');
	}

	function moveCertification(id: string, direction: 'up' | 'down') {
		if (!content || !content.certifications) return;
		const idx = content.certifications.findIndex((c) => c.id === id);
		if (idx === -1) return;
		const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= content.certifications.length) return;
		const [item] = content.certifications.splice(idx, 1);
		content.certifications.splice(targetIdx, 0, item);
	}

	// Blog helpers
	function addBlogPost() {
		if (!content) return;
		const newId = 'post-' + Date.now();
		const newPost: BlogPost = {
			id: newId,
			title: {
				id: 'Judul Artikel Baru',
				en: 'New Article Title'
			},
			slug: 'judul-artikel-baru-' + Date.now().toString().slice(-4),
			excerpt: {
				id: 'Ringkasan singkat isi tulisan atau artikel.',
				en: 'Brief summary of the article content.'
			},
			publishedAt: new Date().toISOString().split('T')[0],
			readTime: '5 min read',
			cover: '/blog/cover.webp',
			tags: ['WebDev', 'Tutorial']
		};
		content.blogPosts.unshift(newPost);
		expandedBlog[newId] = true;
		showToast('Artikel baru ditambahkan (form langsung terbuka)');
	}

	function removeBlogPost(id: string) {
		if (!content) return;
		const idx = content.blogPosts.findIndex((b) => b.id === id);
		if (idx === -1) return;
		const post = content.blogPosts[idx];
		if (confirm(`Hapus artikel "${post.title.id}"?`)) {
			content.blogPosts.splice(idx, 1);
			delete expandedBlog[id];
			showToast('Artikel dihapus');
		}
	}

	function duplicateBlogPost(id: string) {
		if (!content) return;
		const idx = content.blogPosts.findIndex((b) => b.id === id);
		if (idx === -1) return;
		const original = content.blogPosts[idx];
		const newId = 'post-' + Date.now();
		const copy: BlogPost = {
			...JSON.parse(JSON.stringify(original)),
			id: newId,
			title: {
				id: original.title.id ? `${original.title.id} (Salinan)` : 'Artikel Salinan',
				en: original.title.en ? `${original.title.en} (Copy)` : 'Article Copy'
			},
			slug: original.slug ? `${original.slug}-salinan` : 'artikel-salinan'
		};
		content.blogPosts.splice(idx + 1, 0, copy);
		expandedBlog[newId] = true;
		showToast('Artikel berhasil diduplikasi');
	}

	function moveBlogPost(id: string, direction: 'up' | 'down') {
		if (!content) return;
		const idx = content.blogPosts.findIndex((b) => b.id === id);
		if (idx === -1) return;
		const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= content.blogPosts.length) return;
		const [item] = content.blogPosts.splice(idx, 1);
		content.blogPosts.splice(targetIdx, 0, item);
	}

	// Messages helper
	async function deleteMessage(id: string) {
		if (confirm('Hapus pesan ini dari inbox?')) {
			await fetch('/api/contact', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			messages = messages.filter((m) => m.id !== id);
			showToast('Pesan dihapus');
		}
	}
</script>

<svelte:head>
	<title>Admin Studio — Akarayasa Control Center</title>
</svelte:head>

<!-- Toast Notification -->
{#if toastMessage}
	<div
		class="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-edge bg-card/95 backdrop-blur-md px-4 py-3 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200 {toastMessage.type === 'success' ? 'text-primary border-primary/30' : 'text-red-500 border-red-500/30'}"
	>
		{#if toastMessage.type === 'success'}
			<CheckCircle2 class="size-4 shrink-0 text-primary" />
		{:else}
			<AlertCircle class="size-4 shrink-0 text-red-500" />
		{/if}
		<span>{toastMessage.text}</span>
	</div>
{/if}

<div class="min-h-screen bg-background text-foreground transition-colors duration-200">
	{#if !isAuthenticated}
		<!-- STANDALONE LOGIN SCREEN -->
		<div class="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
			<div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

			<div class="relative w-full max-w-md rounded-2xl border border-edge/80 bg-card/85 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
				<!-- Header Section -->
				<div class="text-center space-y-2.5">
					<div class="mx-auto size-12 rounded-xl border border-edge bg-primary/10 flex items-center justify-center text-primary shadow-inner">
						<Shield class="size-6" />
					</div>
					<div>
						<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-muted/60 text-muted-foreground border border-edge mb-2">
							<span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							Sistem CMS Terpisah
						</span>
						<h1 class="text-xl font-bold tracking-tight">Portal Admin Portofolio</h1>
						<p class="text-xs text-muted-foreground mt-1">
							Kelola seluruh konten, proyek, sertifikasi, dan kontak portofolio secara terpusat.
						</p>
					</div>
				</div>

				<!-- Separation Indicator -->
				<div class="rounded-lg border border-edge/60 bg-muted/30 p-3 text-[11px] font-mono text-muted-foreground space-y-1.5">
					<div class="flex items-center justify-between">
						<span>Website Publik:</span>
						<a href="/" target="_blank" class="text-primary hover:underline flex items-center gap-1 font-semibold">
							<span>http://localhost:5173/</span>
							<ExternalLink class="size-3" />
						</a>
					</div>
					<div class="flex items-center justify-between">
						<span>Halaman Admin:</span>
						<span class="text-foreground font-semibold">http://localhost:5173/admin</span>
					</div>
				</div>

				<form onsubmit={handleLogin} class="space-y-4">
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label for="admin-pass" class="block text-xs font-mono text-muted-foreground">
								Kata Sandi Admin
							</label>
							<button
								type="button"
								onclick={fillDefaultPassword}
								class="text-[11px] font-mono text-primary hover:underline cursor-pointer"
							>
								Isi Default (admin123)
							</button>
						</div>

						<div class="relative">
							<input
								id="admin-pass"
								type={showPassword ? 'text' : 'password'}
								required
								bind:value={passwordInput}
								placeholder="Masukkan kata sandi..."
								class="w-full rounded-lg border border-edge bg-background px-3 py-2 text-sm pr-10 focus:outline-hidden focus:border-primary font-mono transition-colors"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
								title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
							>
								{#if showPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</div>

					{#if loginError}
						<div class="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
							<AlertCircle class="size-4 shrink-0" />
							<span>{loginError}</span>
						</div>
					{/if}

					<button
						type="submit"
						disabled={isLoggingIn}
						class="w-full flex items-center justify-center gap-2 rounded-lg bg-[#00A792] dark:bg-[#06FBC2] text-white dark:text-black py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md disabled:opacity-50"
					>
						{#if isLoggingIn}
							<span>Memverifikasi Sandi...</span>
						{:else}
							<KeyRound class="size-4" />
							<span>Buka Panel Dashboard</span>
							<ChevronRight class="size-4" />
						{/if}
					</button>

					<div class="pt-2 text-center">
						<a
							href="/"
							class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono py-1 px-2 rounded-md hover:bg-muted"
						>
							<ArrowLeft class="size-3.5" />
							<span>← Kembali ke Website Utama</span>
						</a>
					</div>
				</form>
			</div>
		</div>
	{:else if content}
		<!-- AUTHENTICATED MODERN STUDIO LAYOUT WITH SIDEBAR -->
		<div class="min-h-screen flex bg-background">
			<!-- MOBILE BACKDROP -->
			{#if sidebarOpen}
				<div
					tabindex="0"
					role="button"
					aria-label="Tutup Menu Navigasi"
					onclick={() => (sidebarOpen = false)}
					onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (sidebarOpen = false)}
					class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden cursor-pointer"
				></div>
			{/if}

			<!-- SIDEBAR NAVIGATION (FIXED ON LEFT) -->
			<aside
				class="fixed lg:sticky top-0 left-0 z-50 h-screen w-64 xl:w-72 bg-card/95 border-r border-edge flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
			>
				<!-- Sidebar Top: Brand & Menu -->
				<div class="flex-1 overflow-y-auto p-4 space-y-6">
					<!-- Brand Header -->
					<div class="flex items-center justify-between pb-3 border-b border-edge">
						<div class="flex items-center gap-2.5">
							<div class="size-9 rounded-xl border border-edge bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-xs">
								<Shield class="size-5" />
							</div>
							<div>
								<div class="flex items-center gap-1.5">
									<span class="text-sm font-bold tracking-tight">Akarayasa</span>
									<span class="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20">Studio</span>
								</div>
								<p class="text-[11px] text-muted-foreground font-mono">Control Center</p>
							</div>
						</div>

						<button
							type="button"
							onclick={() => (sidebarOpen = false)}
							class="p-1 rounded-md text-muted-foreground hover:text-foreground lg:hidden"
						>
							<X class="size-5" />
						</button>
					</div>

					<!-- Navigation Menu Groups -->
					<div class="space-y-5">
						<!-- Group 1: Utama -->
						<div class="space-y-1">
							<span class="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
								Menu Utama
							</span>
							<button
								type="button"
								onclick={() => switchTab('overview')}
								class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'overview' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<LayoutGrid class="size-4 shrink-0" />
								<span>Ringkasan Dashboard</span>
							</button>
						</div>

						<!-- Group 2: Kelola Konten -->
						<div class="space-y-1">
							<span class="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
								Kelola Konten Portofolio
							</span>

							<button
								type="button"
								onclick={() => switchTab('about')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'about' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<div class="flex items-center gap-2.5">
									<User class="size-4 shrink-0" />
									<span>Profil & Identitas</span>
								</div>
							</button>

							<button
								type="button"
								onclick={() => switchTab('projects')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'projects' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<div class="flex items-center gap-2.5">
									<FolderCode class="size-4 shrink-0" />
									<span>Proyek Unggulan</span>
								</div>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold {activeTab === 'projects' ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'}">
									{content.featuredProjects.length}
								</span>
							</button>

							<button
								type="button"
								onclick={() => switchTab('experience')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'experience' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<div class="flex items-center gap-2.5">
									<Briefcase class="size-4 shrink-0" />
									<span>Pengalaman & Karir</span>
								</div>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold {activeTab === 'experience' ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'}">
									{content.experiences.length}
								</span>
							</button>

							<button
								type="button"
								onclick={() => switchTab('certifications')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'certifications' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<div class="flex items-center gap-2.5">
									<BadgeCheck class="size-4 shrink-0" />
									<span>Sertifikasi & Lisensi</span>
								</div>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold {activeTab === 'certifications' ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'}">
									{content.certifications?.length || 0}
								</span>
							</button>

							<button
								type="button"
								onclick={() => switchTab('blog')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'blog' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<div class="flex items-center gap-2.5">
									<Newspaper class="size-4 shrink-0" />
									<span>Artikel Blog</span>
								</div>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold {activeTab === 'blog' ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'}">
									{content.blogPosts.length}
								</span>
							</button>
						</div>

						<!-- Group 3: Komunikasi -->
						<div class="space-y-1">
							<span class="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
								Komunikasi
							</span>
							<button
								type="button"
								onclick={() => switchTab('contact')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer {activeTab === 'contact' ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
							>
								<div class="flex items-center gap-2.5">
									<Inbox class="size-4 shrink-0" />
									<span>Pesan Masuk (Inbox)</span>
								</div>
								{#if messages.length > 0}
									<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
										{messages.length}
									</span>
								{:else}
									<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
										0
									</span>
								{/if}
							</button>
						</div>
					</div>
				</div>

				<!-- Sidebar Bottom: Controls & Logout -->
				<div class="p-3 border-t border-edge bg-muted/20 space-y-2">
					<div class="flex items-center justify-between px-2 py-1 text-xs">
						<span class="text-[11px] font-mono text-muted-foreground truncate">
							@{content.profile.nickname}
						</span>
						<span class="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500">
							<span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							Live CMS
						</span>
					</div>

					<div class="grid grid-cols-2 gap-1.5">
						<a
							href="/"
							target="_blank"
							class="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono border border-edge bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
							title="Buka Website Publik"
						>
							<Globe class="size-3.5 text-primary" />
							<span>Web Publik</span>
							<ExternalLink class="size-3 opacity-60" />
						</a>

						<button
							type="button"
							onclick={toggleMode}
							class="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono border border-edge bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
							title="Ganti Tema"
						>
							{#if mode.current === 'dark'}
								<Moon class="size-3.5" />
								<span>Dark</span>
							{:else}
								<Sun class="size-3.5 text-amber-500" />
								<span>Light</span>
							{/if}
						</button>
					</div>

					<button
						type="button"
						onclick={handleLogout}
						class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
					>
						<LogOut class="size-3.5" />
						<span>Logout dari Admin</span>
					</button>
				</div>
			</aside>

			<!-- MAIN WORKSPACE -->
			<div class="flex-1 flex flex-col min-w-0">
				<!-- TOP STICKY BAR -->
				<header class="sticky top-0 z-30 w-full border-b border-edge bg-background/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
					<div class="flex items-center justify-between gap-3">
						<!-- Left: Mobile Trigger & Breadcrumbs -->
						<div class="flex items-center gap-3">
							<button
								type="button"
								onclick={() => (sidebarOpen = !sidebarOpen)}
								class="p-2 rounded-lg border border-edge hover:bg-muted lg:hidden cursor-pointer"
								title="Buka Navigasi"
							>
								<Menu class="size-4" />
							</button>

							<div class="flex items-center gap-2 text-xs font-mono text-muted-foreground">
								<span>Admin Studio</span>
								<span>/</span>
								<span class="text-foreground font-semibold uppercase tracking-wider">
									{#if activeTab === 'overview'}Ringkasan Dashboard
									{:else if activeTab === 'about'}Profil & Identitas
									{:else if activeTab === 'projects'}Proyek Unggulan
									{:else if activeTab === 'experience'}Pengalaman & Karir
									{:else if activeTab === 'certifications'}Sertifikasi & Lisensi
									{:else if activeTab === 'blog'}Artikel Blog
									{:else if activeTab === 'contact'}Kontak & Pesan
									{/if}
								</span>
							</div>
						</div>

						<!-- Right: Quick Actions & Save -->
						<div class="flex items-center gap-2">
							<!-- Save Button -->
							<button
								type="button"
								onclick={saveAllChanges}
								disabled={isSaving}
								class="inline-flex items-center gap-1.5 rounded-lg bg-[#00A792] dark:bg-[#06FBC2] text-white dark:text-black px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
							>
								<Save class="size-3.5" />
								<span>{isSaving ? 'Menyimpan...' : 'Simpan Semua'}</span>
							</button>
						</div>
					</div>
				</header>

				<!-- CONTENT AREA (CLEAN & SPACIOUS) -->
				<main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">

					<!-- 1. TAB: OVERVIEW (RINGKASAN DASHBOARD) -->
					{#if activeTab === 'overview'}
						<div class="space-y-6">
							<!-- Welcome Banner -->
							<div class="relative overflow-hidden rounded-2xl border border-edge bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 space-y-3">
								<div class="flex items-center gap-2 text-primary text-xs font-mono font-medium">
									<Sparkles class="size-4" />
									<span>Akarayasa Admin Studio Control Center</span>
								</div>
								<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
									Selamat Datang, {content.profile.nickname}!
								</h1>
								<p class="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
									Panel manajemen konten terpusat. Pilih modul di bawah ini atau navigasi samping untuk memperbarui proyek, pengalaman, sertifikasi, dan pesan kontak secara instan.
								</p>

								<!-- Quick Actions -->
								<div class="pt-3 flex flex-wrap gap-2">
									<button
										type="button"
										onclick={() => { switchTab('projects'); addProject(); }}
										class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
									>
										<Plus class="size-3.5" />
										<span>Tambah Proyek Baru</span>
									</button>
									<button
										type="button"
										onclick={() => { switchTab('certifications'); addCertification(); }}
										class="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-card hover:bg-muted px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
									>
										<Plus class="size-3.5" />
										<span>Tambah Sertifikasi</span>
									</button>
									<button
										type="button"
										onclick={() => { switchTab('blog'); addBlogPost(); }}
										class="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-card hover:bg-muted px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
									>
										<Plus class="size-3.5" />
										<span>Tulis Artikel Blog</span>
									</button>
								</div>
							</div>

							<!-- 5 Dedicated Metric Cards (Clean & Clickable) -->
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<!-- Card 1: Profil -->
								<button
									type="button"
									onclick={() => switchTab('about')}
									class="rounded-xl border border-edge bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group space-y-3"
								>
									<div class="flex items-center justify-between">
										<div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<User class="size-5" />
										</div>
										<span class="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-mono">
											<span>Kelola</span>
											<ChevronRight class="size-3.5" />
										</span>
									</div>
									<div>
										<h2 class="text-sm font-semibold">{content.profile.name}</h2>
										<p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">
											{content.profile.education} • {content.profile.location}
										</p>
									</div>
								</button>

								<!-- Card 2: Proyek -->
								<button
									type="button"
									onclick={() => switchTab('projects')}
									class="rounded-xl border border-edge bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group space-y-3"
								>
									<div class="flex items-center justify-between">
										<div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<FolderCode class="size-5" />
										</div>
										<span class="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-mono">
											<span>Kelola</span>
											<ChevronRight class="size-3.5" />
										</span>
									</div>
									<div>
										<div class="text-xl font-bold font-mono">{content.featuredProjects.length} Proyek</div>
										<p class="text-xs text-muted-foreground mt-0.5">Portofolio aplikasi & karya unggulan</p>
									</div>
								</button>

								<!-- Card 3: Pengalaman -->
								<button
									type="button"
									onclick={() => switchTab('experience')}
									class="rounded-xl border border-edge bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group space-y-3"
								>
									<div class="flex items-center justify-between">
										<div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<Briefcase class="size-5" />
										</div>
										<span class="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-mono">
											<span>Kelola</span>
											<ChevronRight class="size-3.5" />
										</span>
									</div>
									<div>
										<div class="text-xl font-bold font-mono">
											{content.experiences.length} Karir / {content.journeyEntries.length} Milestone
										</div>
										<p class="text-xs text-muted-foreground mt-0.5">Riwayat profesional & perjalanan</p>
									</div>
								</button>

								<!-- Card 4: Sertifikasi -->
								<button
									type="button"
									onclick={() => switchTab('certifications')}
									class="rounded-xl border border-edge bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group space-y-3"
								>
									<div class="flex items-center justify-between">
										<div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<BadgeCheck class="size-5" />
										</div>
										<span class="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-mono">
											<span>Kelola</span>
											<ChevronRight class="size-3.5" />
										</span>
									</div>
									<div>
										<div class="text-xl font-bold font-mono">
											{content.certifications?.length || 0} Sertifikat
										</div>
										<p class="text-xs text-muted-foreground mt-0.5">Lisensi & sertifikasi kompetensi</p>
									</div>
								</button>

								<!-- Card 5: Blog -->
								<button
									type="button"
									onclick={() => switchTab('blog')}
									class="rounded-xl border border-edge bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group space-y-3"
								>
									<div class="flex items-center justify-between">
										<div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
											<Newspaper class="size-5" />
										</div>
										<span class="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-mono">
											<span>Kelola</span>
											<ChevronRight class="size-3.5" />
										</span>
									</div>
									<div>
										<div class="text-xl font-bold font-mono">{content.blogPosts.length} Artikel</div>
										<p class="text-xs text-muted-foreground mt-0.5">Tulisan teknologi & pemikiran</p>
									</div>
								</button>

								<!-- Card 6: Inbox -->
								<button
									type="button"
									onclick={() => switchTab('contact')}
									class="rounded-xl border border-edge bg-card p-5 text-left hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group space-y-3"
								>
									<div class="flex items-center justify-between">
										<div class="size-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
											<Inbox class="size-5" />
										</div>
										<span class="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-mono">
											<span>Lihat Inbox</span>
											<ChevronRight class="size-3.5" />
										</span>
									</div>
									<div>
										<div class="text-xl font-bold font-mono flex items-center gap-2">
											<span>{messages.length} Pesan Masuk</span>
											{#if messages.length > 0}
												<span class="size-2 rounded-full bg-amber-500 animate-ping"></span>
											{/if}
										</div>
										<p class="text-xs text-muted-foreground mt-0.5">Dari formulir kontak website</p>
									</div>
								</button>
							</div>

							<!-- Recent Messages Box -->
							<div class="rounded-xl border border-edge bg-card p-5 space-y-4">
								<div class="flex items-center justify-between border-b border-edge pb-3">
									<div class="flex items-center gap-2">
										<Inbox class="size-4 text-primary" />
										<h2 class="text-sm font-semibold">Pesan Kontak Terbaru</h2>
									</div>
									<button
										type="button"
										onclick={() => switchTab('contact')}
										class="text-xs font-mono text-primary hover:underline"
									>
										Lihat Semua Pesan ({messages.length}) →
									</button>
								</div>

								{#if messages.length === 0}
									<p class="text-xs text-muted-foreground py-4 text-center">
										Belum ada pesan baru masuk.
									</p>
								{:else}
									<div class="divide-y divide-edge">
										{#each messages.slice(0, 3) as msg (msg.id)}
											<div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<div class="space-y-0.5">
													<div class="flex items-center gap-2">
														<span class="text-xs font-semibold">{msg.name}</span>
														<span class="text-[11px] font-mono text-muted-foreground">({msg.email})</span>
													</div>
													<p class="text-xs text-muted-foreground line-clamp-1">{msg.message}</p>
												</div>
												<span class="text-[10px] font-mono text-muted-foreground shrink-0">
													{new Date(msg.createdAt).toLocaleDateString('id-ID')}
												</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- 2. TAB: TENTANG & PROFIL -->
					{#if activeTab === 'about'}
						<div class="space-y-6">
							<!-- Section Banner -->
							<div class="border-b border-edge pb-4">
								<h1 class="text-lg font-bold tracking-tight">Profil & Identitas Pengembang</h1>
								<p class="text-xs text-muted-foreground mt-0.5">
									Kelola identitas personal, domisili, headline dwi-bahasa, dan biografi portofolio.
								</p>
							</div>

							<!-- Identitas Pokok -->
							<div class="rounded-xl border border-edge bg-card p-5 space-y-4">
								<div class="flex items-center gap-2 border-b border-edge pb-2.5">
									<User class="size-4 text-primary" />
									<h2 class="text-sm font-semibold">Identitas & Kontak Utama</h2>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Nama Lengkap</span>
											<input
												type="text"
												bind:value={content.profile.name}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-semibold"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Nama Panggilan (@username)</span>
											<input
												type="text"
												bind:value={content.profile.nickname}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Lokasi Domisili</span>
											<input
												type="text"
												bind:value={content.profile.location}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Tautan Google Maps</span>
											<input
												type="text"
												bind:value={content.profile.locationUrl}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Pendidikan</span>
											<input
												type="text"
												bind:value={content.profile.education}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Tautan Resume / CV (PDF/Drive)</span>
											<input
												type="text"
												bind:value={content.profile.resumeUrl}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>
								</div>
							</div>

							<!-- Headline & Biografi Dwi-Bahasa dengan Tab Switcher Rapi -->
							<div class="rounded-xl border border-edge bg-card p-5 space-y-4">
								<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-edge pb-2.5">
									<div class="flex items-center gap-2">
										<Globe class="size-4 text-primary" />
										<h2 class="text-sm font-semibold">Headline & Biografi Dwi-Bahasa</h2>
									</div>

									<!-- Language Tab Switcher -->
									<div class="flex items-center gap-1 rounded-lg border border-edge bg-muted/40 p-1 self-start sm:self-auto">
										<button
											type="button"
											onclick={() => (aboutLangTab = 'id')}
											class="px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer {aboutLangTab === 'id' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}"
										>
											🇮🇩 Bahasa Indonesia
										</button>
										<button
											type="button"
											onclick={() => (aboutLangTab = 'en')}
											class="px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer {aboutLangTab === 'en' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}"
										>
											🇬🇧 English
										</button>
									</div>
								</div>

								{#if aboutLangTab === 'id'}
									<div class="space-y-4 animate-in fade-in duration-150">
										<div>
											<label class="block text-xs font-mono text-muted-foreground mb-1">
												<span>Headline (Bahasa Indonesia)</span>
												<textarea
													rows="2"
													bind:value={content.profile.headline.id}
													placeholder="contoh: Front-End Specialist & Full Stack Web Developer"
													class="w-full rounded-md border border-edge bg-background p-2.5 text-xs leading-relaxed focus:outline-hidden focus:border-primary mt-1"
												></textarea>
											</label>
										</div>

										<div>
											<label class="block text-xs font-mono text-muted-foreground mb-1">
												<span>Biografi Lengkap "Tentang Saya" (Bahasa Indonesia)</span>
												<textarea
													rows="5"
													bind:value={content.profile.about.id}
													class="w-full rounded-md border border-edge bg-background p-3 text-xs leading-relaxed focus:outline-hidden focus:border-primary mt-1"
												></textarea>
											</label>
										</div>
									</div>
								{:else}
									<div class="space-y-4 animate-in fade-in duration-150">
										<div>
											<label class="block text-xs font-mono text-muted-foreground mb-1">
												<span>Headline (English)</span>
												<textarea
													rows="2"
													bind:value={content.profile.headline.en}
													placeholder="example: Front-End Specialist & Full Stack Web Developer"
													class="w-full rounded-md border border-edge bg-background p-2.5 text-xs leading-relaxed focus:outline-hidden focus:border-primary mt-1"
												></textarea>
											</label>
										</div>

										<div>
											<label class="block text-xs font-mono text-muted-foreground mb-1">
												<span>Complete Biography (English)</span>
												<textarea
													rows="5"
													bind:value={content.profile.about.en}
													class="w-full rounded-md border border-edge bg-background p-3 text-xs leading-relaxed focus:outline-hidden focus:border-primary mt-1"
												></textarea>
											</label>
										</div>
									</div>
								{/if}
							</div>

							<!-- Angka Statistik Profil -->
							<div class="rounded-xl border border-edge bg-card p-5 space-y-4">
								<h2 class="text-sm font-semibold tracking-tight border-b border-edge pb-2.5">
									Statistik & Pengalaman Portofolio
								</h2>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Tahun Pengalaman Kerja</span>
											<input
												type="number"
												bind:value={content.profile.stats.yearsExperience}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Total Proyek Selesai</span>
											<input
												type="number"
												bind:value={content.profile.stats.completedProjects}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- 3. TAB: PROYEK UNGGULAN -->
					{#if activeTab === 'projects'}
						<div class="space-y-4">
							<!-- Section Header Toolbar -->
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-edge pb-4">
								<div>
									<div class="flex items-center gap-2">
										<h1 class="text-lg font-bold tracking-tight">Daftar Proyek Unggulan</h1>
										<span class="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[11px] font-mono font-semibold">
											{content.featuredProjects.length} Proyek
										</span>
									</div>
									<p class="text-xs text-muted-foreground mt-0.5">
										Kelola karya, tautan demonstrasi, dan repositori proyek publik Anda. Klik "Edit" pada kartu untuk mengubah rincian proyek.
									</p>
								</div>

								<div class="flex items-center gap-2 flex-wrap">
									<!-- Expand / Collapse All -->
									<button
										type="button"
										onclick={() => toggleAll(expandedProjects, content?.featuredProjects.map((p) => p.id) || [], Object.values(expandedProjects).filter(Boolean).length === 0)}
										class="px-2.5 py-1.5 rounded-lg border border-edge bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
									>
										{Object.values(expandedProjects).filter(Boolean).length === 0 ? 'Buka Semua Form' : 'Tutup Semua Form'}
									</button>

									<!-- Add Project Button -->
									<button
										type="button"
										onclick={addProject}
										class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
									>
										<Plus class="size-4" />
										<span>Tambah Proyek Baru</span>
									</button>
								</div>
							</div>

							<!-- Search Bar inside Section -->
							<div class="relative">
								<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Cari proyek berdasarkan judul, slug, atau tag teknologi..."
									class="w-full rounded-xl border border-edge bg-card pl-9 pr-8 py-2 text-xs focus:outline-hidden focus:border-primary font-mono transition-colors"
								/>
								{#if searchQuery}
									<button
										type="button"
										onclick={() => (searchQuery = '')}
										class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
									>
										<X class="size-3.5" />
									</button>
								{/if}
							</div>

							<!-- Projects List with Master-Detail Toggle -->
							<div class="space-y-3">
								{#each filteredProjects as project, idx (project.id)}
									<div class="rounded-xl border border-edge bg-card transition-all shadow-xs {expandedProjects[project.id] ? 'ring-1 ring-primary/40' : 'hover:border-primary/40'}">
										<!-- Card Master Header (Clean Summary View) -->
										<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
											<div class="flex items-start sm:items-center gap-3">
												<span class="size-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 sm:mt-0">
													#{idx + 1}
												</span>

												<!-- Thumbnail Preview -->
												{#if project.thumbnail && project.thumbnail !== '#'}
													<img
														src={project.thumbnail}
														alt=""
														class="size-11 rounded-lg object-cover border border-edge bg-muted shrink-0"
														onerror={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
													/>
												{/if}

												<div>
													<div class="flex items-center gap-2 flex-wrap">
														<span class="text-sm font-bold text-foreground">
															{project.title || 'Proyek Tanpa Judul'}
														</span>
														<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-edge/60">
															/{project.slug}
														</span>
													</div>

													<!-- Tags preview -->
													<div class="flex items-center gap-1.5 flex-wrap mt-1">
														{#each project.tags.slice(0, 4) as tag}
															<span class="text-[10px] font-mono bg-primary/5 text-primary border border-primary/15 px-1.5 py-0.2 rounded">
																{tag}
															</span>
														{/each}
														{#if project.tags.length > 4}
															<span class="text-[10px] font-mono text-muted-foreground">
																+{project.tags.length - 4} lainnya
															</span>
														{/if}
													</div>
												</div>
											</div>

											<!-- Right Header Actions -->
											<div class="flex items-center gap-1 self-end sm:self-auto shrink-0">
												<!-- Live Demo link indicator -->
												{#if project.demoUrl && project.demoUrl !== '#'}
													<a
														href={project.demoUrl}
														target="_blank"
														rel="noopener noreferrer"
														class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
														title="Buka Demo: {project.demoUrl}"
													>
														<ExternalLink class="size-3.5" />
													</a>
												{/if}

												<button
													type="button"
													onclick={() => moveProject(project.id, 'up')}
													disabled={idx === 0}
													class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
													title="Pindah ke Atas"
												>
													<ArrowUp class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => moveProject(project.id, 'down')}
													disabled={idx === content.featuredProjects.length - 1}
													class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
													title="Pindah ke Bawah"
												>
													<ArrowDown class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => duplicateProject(project.id)}
													class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
													title="Duplikasi Proyek"
												>
													<Copy class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => removeProject(project.id)}
													class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
													title="Hapus Proyek"
												>
													<Trash2 class="size-3.5" />
												</button>

												<!-- Toggle Edit Form Button -->
												<button
													type="button"
													onclick={() => toggleItem(expandedProjects, project.id)}
													class="inline-flex items-center gap-1 ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {expandedProjects[project.id] ? 'bg-muted text-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}"
												>
													<Pencil class="size-3" />
													<span>{expandedProjects[project.id] ? 'Tutup' : 'Edit Proyek'}</span>
													{#if expandedProjects[project.id]}
														<ChevronUp class="size-3.5" />
													{:else}
														<ChevronDown class="size-3.5" />
													{/if}
												</button>
											</div>
										</div>

										<!-- Expanded Form Body (Only shows when opened) -->
										{#if expandedProjects[project.id]}
											<div class="p-5 pt-2 border-t border-edge/80 space-y-4 bg-muted/10 animate-in fade-in duration-150">
												<!-- Form Sections -->
												<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Judul Proyek</span>
															<input
																type="text"
																bind:value={project.title}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-semibold"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Slug URL</span>
															<input
																type="text"
																bind:value={project.slug}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tautan Live Demo</span>
															<div class="relative flex items-center">
																<input
																	type="text"
																	bind:value={project.demoUrl}
																	placeholder="https://..."
																	class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono pr-8"
																/>
																{#if project.demoUrl && project.demoUrl !== '#'}
																	<a
																		href={project.demoUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																		class="absolute right-2 text-muted-foreground hover:text-primary transition-colors"
																		title="Uji Live Demo"
																	>
																		<ExternalLink class="size-3.5" />
																	</a>
																{/if}
															</div>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tautan Repositori GitHub</span>
															<div class="relative flex items-center">
																<input
																	type="text"
																	bind:value={project.repoUrl}
																	placeholder="https://github.com/..."
																	class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono pr-8"
																/>
																{#if project.repoUrl && project.repoUrl !== '#'}
																	<a
																		href={project.repoUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																		class="absolute right-2 text-muted-foreground hover:text-primary transition-colors"
																		title="Uji Buka Repo"
																	>
																		<ExternalLink class="size-3.5" />
																	</a>
																{/if}
															</div>
														</label>
													</div>

													<div class="sm:col-span-2">
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Path Gambar Thumbnail</span>
															<input
																type="text"
																bind:value={project.thumbnail}
																placeholder="/projects/nama-file.webp"
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>

													<div class="sm:col-span-2">
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tech Stack Tags (pisahkan dengan koma)</span>
															<input
																type="text"
																value={project.tags.join(', ')}
																oninput={(e) => {
																	project.tags = (e.currentTarget as HTMLInputElement).value
																		.split(',')
																		.map((t) => t.trim())
																		.filter(Boolean);
																}}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
														{#if project.tags.length > 0}
															<div class="flex flex-wrap gap-1 mt-1.5">
																{#each project.tags as tag}
																	<span class="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
																		{tag}
																	</span>
																{/each}
															</div>
														{/if}
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span class="inline-flex items-center gap-1">
																<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇮🇩 ID</span>
																<span>Ringkasan Proyek</span>
															</span>
															<textarea
																rows="3"
																bind:value={project.summary.id}
																class="w-full rounded-md border border-edge bg-background p-2.5 text-xs focus:outline-hidden focus:border-primary mt-1"
															></textarea>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span class="inline-flex items-center gap-1">
																<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇬🇧 EN</span>
																<span>Summary (English)</span>
															</span>
															<textarea
																rows="3"
																bind:value={project.summary.en}
																class="w-full rounded-md border border-edge bg-background p-2.5 text-xs focus:outline-hidden focus:border-primary mt-1"
															></textarea>
														</label>
													</div>
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 4. TAB: PENGALAMAN & KARIR -->
					{#if activeTab === 'experience'}
						<div class="space-y-6">
							<!-- Section Header Toolbar -->
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-edge pb-4">
								<div>
									<h1 class="text-lg font-bold tracking-tight">Pengalaman Kerja & Milestone</h1>
									<p class="text-xs text-muted-foreground mt-0.5">
										Kelola rekam jejak profesional serta pencapaian perjalanan waktu karier.
									</p>
								</div>

								<!-- Sub-Tab Switcher -->
								<div class="flex items-center gap-1 rounded-lg border border-edge bg-muted/40 p-1">
									<button
										type="button"
										onclick={() => (experienceSubTab = 'work')}
										class="px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer {experienceSubTab === 'work' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}"
									>
										Pengalaman Kerja ({content.experiences.length})
									</button>
									<button
										type="button"
										onclick={() => (experienceSubTab = 'journey')}
										class="px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer {experienceSubTab === 'journey' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}"
									>
										Milestone Journey ({content.journeyEntries.length})
									</button>
								</div>
							</div>

							<!-- SUB-TAB 1: PENGALAMAN KERJA -->
							{#if experienceSubTab === 'work'}
								<div class="space-y-4">
									<div class="flex items-center justify-between">
										<button
											type="button"
											onclick={() => toggleAll(expandedExp, content?.experiences.map((e) => e.id) || [], Object.values(expandedExp).filter(Boolean).length === 0)}
											class="px-2.5 py-1.5 rounded-lg border border-edge bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
										>
											{Object.values(expandedExp).filter(Boolean).length === 0 ? 'Buka Semua Form' : 'Tutup Semua Form'}
										</button>

										<button
											type="button"
											onclick={addExperience}
											class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
										>
											<Plus class="size-3.5" />
											<span>Tambah Pengalaman Kerja</span>
										</button>
									</div>

									<div class="space-y-3">
										{#each content.experiences as exp, idx (exp.id)}
											<div class="rounded-xl border border-edge bg-card transition-all shadow-xs {expandedExp[exp.id] ? 'ring-1 ring-primary/40' : 'hover:border-primary/40'}">
												<!-- Header Summary View -->
												<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
													<div class="flex items-center gap-3">
														<span class="size-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
															#{idx + 1}
														</span>
														<div>
															<div class="flex items-center gap-2 flex-wrap">
																<span class="text-sm font-bold text-foreground">
																	{exp.organization || 'Nama Instansi'}
																</span>
																<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-edge/60">
																	{exp.period.id || 'Periode'}
																</span>
															</div>
															<p class="text-xs text-muted-foreground mt-0.5">
																{exp.role.id || 'Role / Jabatan'}
															</p>
														</div>
													</div>

													<div class="flex items-center gap-1 self-end sm:self-auto shrink-0">
														<button
															type="button"
															onclick={() => moveExperience(idx, 'up')}
															disabled={idx === 0}
															class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
															title="Pindah ke Atas"
														>
															<ArrowUp class="size-3.5" />
														</button>

														<button
															type="button"
															onclick={() => moveExperience(idx, 'down')}
															disabled={idx === content.experiences.length - 1}
															class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
															title="Pindah ke Bawah"
														>
															<ArrowDown class="size-3.5" />
														</button>

														<button
															type="button"
															onclick={() => duplicateExperience(idx)}
															class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
															title="Duplikasi"
														>
															<Copy class="size-3.5" />
														</button>

														<button
															type="button"
															onclick={() => removeExperience(idx)}
															class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
															title="Hapus"
														>
															<Trash2 class="size-3.5" />
														</button>

														<button
															type="button"
															onclick={() => toggleItem(expandedExp, exp.id)}
															class="inline-flex items-center gap-1 ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {expandedExp[exp.id] ? 'bg-muted text-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}"
														>
															<Pencil class="size-3" />
															<span>{expandedExp[exp.id] ? 'Tutup' : 'Edit Data'}</span>
															{#if expandedExp[exp.id]}
																<ChevronUp class="size-3.5" />
															{:else}
																<ChevronDown class="size-3.5" />
															{/if}
														</button>
													</div>
												</div>

												<!-- Form Details (when expanded) -->
												{#if expandedExp[exp.id]}
													<div class="p-5 pt-2 border-t border-edge/80 space-y-4 bg-muted/10 animate-in fade-in duration-150">
														<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
															<div>
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span>Organisasi / Instansi</span>
																	<input
																		type="text"
																		bind:value={exp.organization}
																		class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-semibold"
																	/>
																</label>
															</div>

															<div>
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span>Periode (e.g. 2024 — Sekarang)</span>
																	<input
																		type="text"
																		bind:value={exp.period.id}
																		class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
																	/>
																</label>
															</div>

															<div>
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span class="inline-flex items-center gap-1">
																		<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇮🇩 ID</span>
																		<span>Role / Jabatan</span>
																	</span>
																	<input
																		type="text"
																		bind:value={exp.role.id}
																		class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary mt-1"
																	/>
																</label>
															</div>

															<div>
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span class="inline-flex items-center gap-1">
																		<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇬🇧 EN</span>
																		<span>Role / Position</span>
																	</span>
																	<input
																		type="text"
																		bind:value={exp.role.en}
																		class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary mt-1"
																	/>
																</label>
															</div>

															<div class="sm:col-span-2">
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span>Teknologi yang Digunakan (pisahkan dengan koma)</span>
																	<input
																		type="text"
																		value={exp.techs.join(', ')}
																		oninput={(e) => {
																			exp.techs = (e.currentTarget as HTMLInputElement).value
																				.split(',')
																				.map((t) => t.trim())
																				.filter(Boolean);
																		}}
																		class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
																	/>
																</label>
															</div>

															<div>
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span class="inline-flex items-center gap-1">
																		<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇮🇩 ID</span>
																		<span>Deskripsi Tugas & Capaian</span>
																	</span>
																	<textarea
																		rows="3"
																		bind:value={exp.description.id}
																		class="w-full rounded-md border border-edge bg-background p-2.5 text-xs focus:outline-hidden focus:border-primary mt-1"
																	></textarea>
																</label>
															</div>

															<div>
																<label class="block text-xs font-mono text-muted-foreground mb-1">
																	<span class="inline-flex items-center gap-1">
																		<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇬🇧 EN</span>
																		<span>Duties & Achievements</span>
																	</span>
																	<textarea
																		rows="3"
																		bind:value={exp.description.en}
																		class="w-full rounded-md border border-edge bg-background p-2.5 text-xs focus:outline-hidden focus:border-primary mt-1"
																	></textarea>
																</label>
															</div>
														</div>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<!-- SUB-TAB 2: MILESTONE PERJALANAN -->
								<div class="space-y-4">
									<div class="flex justify-end">
										<button
											type="button"
											onclick={addJourney}
											class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
										>
											<Plus class="size-3.5" />
											<span>Tambah Milestone Perjalanan</span>
										</button>
									</div>

									<div class="space-y-3">
										{#each content.journeyEntries as journey, idx (idx)}
											<div class="rounded-xl border border-edge bg-card p-4 space-y-3 hover:border-primary/40 transition-colors shadow-xs">
												<div class="flex items-center justify-between">
													<div class="flex items-center gap-2">
														<input
															type="text"
															bind:value={journey.year}
															placeholder="Tahun"
															class="w-24 rounded border border-edge bg-background px-2.5 py-1 text-xs font-mono font-bold text-primary"
														/>
														<input
															type="text"
															bind:value={journey.title.id}
															placeholder="Judul Capaian Milestone"
															class="w-64 sm:w-80 rounded border border-edge bg-background px-2.5 py-1 text-xs font-semibold"
														/>
													</div>
													<button
														type="button"
														onclick={() => removeJourney(idx)}
														class="text-muted-foreground hover:text-red-500 p-1 transition-colors cursor-pointer"
														title="Hapus Milestone"
													>
														<Trash2 class="size-4" />
													</button>
												</div>

												<div>
													<label class="block text-[11px] font-mono text-muted-foreground mb-1">
														<span>Poin Capaian (pisahkan per baris baru)</span>
														<textarea
															rows="2"
															value={journey.bullets.id.join('\n')}
															oninput={(e) => {
																journey.bullets.id = (e.currentTarget as HTMLTextAreaElement).value
																	.split('\n')
																	.filter((line) => line.trim().length > 0);
															}}
															class="w-full rounded border border-edge bg-background p-2 text-xs focus:outline-hidden focus:border-primary"
														></textarea>
													</label>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<!-- 5. TAB: SERTIFIKASI & LISENSI -->
					{#if activeTab === 'certifications'}
						<div class="space-y-4">
							<!-- Section Header Toolbar -->
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-edge pb-4">
								<div>
									<div class="flex items-center gap-2">
										<h1 class="text-lg font-bold tracking-tight">Kelola Sertifikasi & Kredensial</h1>
										<span class="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[11px] font-mono font-semibold">
											{content.certifications?.length || 0} Terdaftar
										</span>
									</div>
									<p class="text-xs text-muted-foreground mt-0.5">
										Kelola daftar sertifikat, lisensi keahlian, dan penerbit yang ditampilkan pada portofolio.
									</p>
								</div>

								<div class="flex items-center gap-2 flex-wrap">
									<button
										type="button"
										onclick={() => toggleAll(expandedCerts, content?.certifications?.map((c) => c.id) || [], Object.values(expandedCerts).filter(Boolean).length === 0)}
										class="px-2.5 py-1.5 rounded-lg border border-edge bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
									>
										{Object.values(expandedCerts).filter(Boolean).length === 0 ? 'Buka Semua Form' : 'Tutup Semua Form'}
									</button>

									<button
										type="button"
										onclick={addCertification}
										class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
									>
										<Plus class="size-4" />
										<span>Tambah Sertifikasi Baru</span>
									</button>
								</div>
							</div>

							<!-- Search filter -->
							<div class="relative">
								<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Cari sertifikasi berdasarkan judul, lembaga penerbit, atau tahun..."
									class="w-full rounded-xl border border-edge bg-card pl-9 pr-8 py-2 text-xs focus:outline-hidden focus:border-primary font-mono transition-colors"
								/>
								{#if searchQuery}
									<button
										type="button"
										onclick={() => (searchQuery = '')}
										class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
									>
										<X class="size-3.5" />
									</button>
								{/if}
							</div>

							<!-- Certifications Master-Detail List -->
							<div class="space-y-3">
								{#each filteredCertifications as cert, idx (cert.id)}
									<div class="rounded-xl border border-edge bg-card transition-all shadow-xs {expandedCerts[cert.id] ? 'ring-1 ring-primary/40' : 'hover:border-primary/40'}">
										<!-- Header Summary View -->
										<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
											<div class="flex items-center gap-3">
												<span class="size-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
													#{idx + 1}
												</span>
												<div>
													<div class="flex items-center gap-2 flex-wrap">
														<span class="text-sm font-bold text-foreground">
															{cert.title || 'Sertifikasi Tanpa Judul'}
														</span>
														<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-edge/60">
															{cert.issueDate || 'Tahun'}
														</span>
													</div>
													<p class="text-xs text-muted-foreground mt-0.5">
														{cert.issuer || 'Lembaga Penerbit'}
													</p>
												</div>
											</div>

											<div class="flex items-center gap-1 self-end sm:self-auto shrink-0">
												{#if cert.credentialUrl && cert.credentialUrl !== '#'}
													<a
														href={cert.credentialUrl}
														target="_blank"
														rel="noopener noreferrer"
														class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
														title="Uji Link Kredensial"
													>
														<ExternalLink class="size-3.5" />
													</a>
												{/if}

												<button
													type="button"
													onclick={() => moveCertification(cert.id, 'up')}
													disabled={idx === 0}
													class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
													title="Pindah ke Atas"
												>
													<ArrowUp class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => moveCertification(cert.id, 'down')}
													disabled={idx === (content.certifications?.length || 0) - 1}
													class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
													title="Pindah ke Bawah"
												>
													<ArrowDown class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => duplicateCertification(cert.id)}
													class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
													title="Duplikasi Sertifikasi"
												>
													<Copy class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => removeCertification(cert.id)}
													class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
													title="Hapus Sertifikasi"
												>
													<Trash2 class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => toggleItem(expandedCerts, cert.id)}
													class="inline-flex items-center gap-1 ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {expandedCerts[cert.id] ? 'bg-muted text-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}"
												>
													<Pencil class="size-3" />
													<span>{expandedCerts[cert.id] ? 'Tutup' : 'Edit Data'}</span>
													{#if expandedCerts[cert.id]}
														<ChevronUp class="size-3.5" />
													{:else}
														<ChevronDown class="size-3.5" />
													{/if}
												</button>
											</div>
										</div>

										<!-- Form Inputs & Live Preview (when expanded) -->
										{#if expandedCerts[cert.id]}
											<div class="p-5 pt-2 border-t border-edge/80 space-y-4 bg-muted/10 animate-in fade-in duration-150">
												<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
													<div class="sm:col-span-2">
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Judul Sertifikat / Pelatihan</span>
															<input
																type="text"
																bind:value={cert.title}
																placeholder="contoh: Front-End Web Development with React & TypeScript"
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-semibold"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Lembaga Penerbit / Penyelenggara</span>
															<input
																type="text"
																bind:value={cert.issuer}
																placeholder="contoh: Dicoding Indonesia / Kementerian Kominfo"
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tahun / Waktu Terbit</span>
															<input
																type="text"
																bind:value={cert.issueDate}
																placeholder="contoh: 2024 atau Nov 2024"
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tautan Kredensial / Verifikasi (URL)</span>
															<div class="relative flex items-center">
																<input
																	type="text"
																	bind:value={cert.credentialUrl}
																	placeholder="https://..."
																	class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono pr-8"
																/>
																{#if cert.credentialUrl && cert.credentialUrl !== '#' && cert.credentialUrl.startsWith('http')}
																	<a
																		href={cert.credentialUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																		class="absolute right-2 text-muted-foreground hover:text-primary transition-colors"
																		title="Uji Buka Tautan Kredensial"
																	>
																		<ExternalLink class="size-3.5" />
																	</a>
																{/if}
															</div>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>File Dokumen / Pratinjau (# atau Path File)</span>
															<input
																type="text"
																bind:value={cert.previewFile}
																placeholder="# atau /certificates/sertifikat.pdf"
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>
												</div>

												<!-- Live Preview Box -->
												<div class="mt-2 pt-3 border-t border-edge/60">
													<span class="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">
														Pratinjau Tampilan Publik (Website):
													</span>
													<div class="rounded-lg border border-edge bg-background/60 p-3 space-y-1">
														<div class="flex items-center justify-between text-xs font-mono text-muted-foreground">
															<span class="font-medium text-foreground">{cert.issuer || '(Nama Penerbit)'}</span>
															<span>{cert.issueDate || '(Tahun)'}</span>
														</div>
														<div class="font-semibold text-sm text-foreground">
															{cert.title || '(Judul Sertifikasi)'}
														</div>
													</div>
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 6. TAB: ARTIKEL BLOG -->
					{#if activeTab === 'blog'}
						<div class="space-y-4">
							<!-- Section Header Toolbar -->
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-edge pb-4">
								<div>
									<div class="flex items-center gap-2">
										<h1 class="text-lg font-bold tracking-tight">Artikel & Tulisan Blog</h1>
										<span class="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[11px] font-mono font-semibold">
											{content.blogPosts.length} Artikel
										</span>
									</div>
									<p class="text-xs text-muted-foreground mt-0.5">
										Kelola artikel, refleksi teknologi, dan konten bacaan portofolio.
									</p>
								</div>

								<div class="flex items-center gap-2 flex-wrap">
									<button
										type="button"
										onclick={() => toggleAll(expandedBlog, content?.blogPosts.map((b) => b.id) || [], Object.values(expandedBlog).filter(Boolean).length === 0)}
										class="px-2.5 py-1.5 rounded-lg border border-edge bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
									>
										{Object.values(expandedBlog).filter(Boolean).length === 0 ? 'Buka Semua Form' : 'Tutup Semua Form'}
									</button>

									<button
										type="button"
										onclick={addBlogPost}
										class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
									>
										<Plus class="size-4" />
										<span>Tulis Artikel Baru</span>
									</button>
								</div>
							</div>

							<!-- Search Bar -->
							<div class="relative">
								<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Cari artikel berdasarkan judul atau tag..."
									class="w-full rounded-xl border border-edge bg-card pl-9 pr-8 py-2 text-xs focus:outline-hidden focus:border-primary font-mono transition-colors"
								/>
								{#if searchQuery}
									<button
										type="button"
										onclick={() => (searchQuery = '')}
										class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
									>
										<X class="size-3.5" />
									</button>
								{/if}
							</div>

							<!-- Blog Master-Detail List -->
							<div class="space-y-3">
								{#each filteredBlogPosts as post, idx (post.id)}
									<div class="rounded-xl border border-edge bg-card transition-all shadow-xs {expandedBlog[post.id] ? 'ring-1 ring-primary/40' : 'hover:border-primary/40'}">
										<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
											<div class="flex items-center gap-3">
												<span class="size-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
													#{idx + 1}
												</span>
												<div>
													<div class="flex items-center gap-2 flex-wrap">
														<span class="text-sm font-bold text-foreground">
															{post.title.id || 'Artikel Tanpa Judul'}
														</span>
														<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-edge/60">
															{post.publishedAt}
														</span>
													</div>
													<p class="text-xs text-muted-foreground mt-0.5">
														{post.readTime} • {post.tags.join(', ')}
													</p>
												</div>
											</div>

											<div class="flex items-center gap-1 self-end sm:self-auto shrink-0">
												<button
													type="button"
													onclick={() => moveBlogPost(post.id, 'up')}
													disabled={idx === 0}
													class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
													title="Pindah ke Atas"
												>
													<ArrowUp class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => moveBlogPost(post.id, 'down')}
													disabled={idx === content.blogPosts.length - 1}
													class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 cursor-pointer"
													title="Pindah ke Bawah"
												>
													<ArrowDown class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => duplicateBlogPost(post.id)}
													class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
													title="Duplikasi Artikel"
												>
													<Copy class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => removeBlogPost(post.id)}
													class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
													title="Hapus Artikel"
												>
													<Trash2 class="size-3.5" />
												</button>

												<button
													type="button"
													onclick={() => toggleItem(expandedBlog, post.id)}
													class="inline-flex items-center gap-1 ml-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {expandedBlog[post.id] ? 'bg-muted text-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}"
												>
													<Pencil class="size-3" />
													<span>{expandedBlog[post.id] ? 'Tutup' : 'Edit Artikel'}</span>
													{#if expandedBlog[post.id]}
														<ChevronUp class="size-3.5" />
													{:else}
														<ChevronDown class="size-3.5" />
													{/if}
												</button>
											</div>
										</div>

										<!-- Expanded Blog Form -->
										{#if expandedBlog[post.id]}
											<div class="p-5 pt-2 border-t border-edge/80 space-y-4 bg-muted/10 animate-in fade-in duration-150">
												<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span class="inline-flex items-center gap-1">
																<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇮🇩 ID</span>
																<span>Judul Artikel</span>
															</span>
															<input
																type="text"
																bind:value={post.title.id}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-semibold mt-1"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span class="inline-flex items-center gap-1">
																<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇬🇧 EN</span>
																<span>Article Title</span>
															</span>
															<input
																type="text"
																bind:value={post.title.en}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-semibold mt-1"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tanggal Publikasi</span>
															<input
																type="date"
																bind:value={post.publishedAt}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Perkiraan Waktu Baca</span>
															<input
																type="text"
																bind:value={post.readTime}
																placeholder="contoh: 5 min read"
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>

													<div class="sm:col-span-2">
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span>Tags (pisahkan koma)</span>
															<input
																type="text"
																value={post.tags.join(', ')}
																oninput={(e) => {
																	post.tags = (e.currentTarget as HTMLInputElement).value
																		.split(',')
																		.map((t) => t.trim())
																		.filter(Boolean);
																}}
																class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
															/>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span class="inline-flex items-center gap-1">
																<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇮🇩 ID</span>
																<span>Ringkasan Artikel</span>
															</span>
															<textarea
																rows="3"
																bind:value={post.excerpt.id}
																class="w-full rounded-md border border-edge bg-background p-2.5 text-xs focus:outline-hidden focus:border-primary mt-1"
															></textarea>
														</label>
													</div>

													<div>
														<label class="block text-xs font-mono text-muted-foreground mb-1">
															<span class="inline-flex items-center gap-1">
																<span class="px-1.5 py-0.2 rounded bg-muted text-[10px]">🇬🇧 EN</span>
																<span>Article Excerpt</span>
															</span>
															<textarea
																rows="3"
																bind:value={post.excerpt.en}
																class="w-full rounded-md border border-edge bg-background p-2.5 text-xs focus:outline-hidden focus:border-primary mt-1"
															></textarea>
														</label>
													</div>
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 7. TAB: KONTAK & INBOX -->
					{#if activeTab === 'contact'}
						<div class="space-y-6">
							<!-- Section Header -->
							<div class="border-b border-edge pb-4">
								<h1 class="text-lg font-bold tracking-tight">Kanal Kontak & Pesan Pengunjung</h1>
								<p class="text-xs text-muted-foreground mt-0.5">
									Atur tautan media sosial resmi serta kelola pesan masuk dari pengunjung website.
								</p>
							</div>

							<!-- Pengaturan Kanal Kontak Publik -->
							<div class="rounded-xl border border-edge bg-card p-5 space-y-4 shadow-xs">
								<h2 class="text-sm font-semibold tracking-tight border-b border-edge pb-2.5">
									Informasi Kontak & Media Sosial Publik
								</h2>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Email Resmi</span>
											<input
												type="email"
												bind:value={content.profile.email}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Nomor Telepon / WhatsApp</span>
											<input
												type="text"
												bind:value={content.profile.phone}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
												placeholder="+62 831-6760-2196"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Tautan LinkedIn</span>
											<input
												type="text"
												bind:value={content.socialLinks[1].url}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Tautan GitHub</span>
											<input
												type="text"
												bind:value={content.socialLinks[0].url}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>

									<div>
										<label class="block text-xs font-mono text-muted-foreground mb-1">
											<span>Tautan Instagram</span>
											<input
												type="text"
												bind:value={content.socialLinks[2].url}
												class="w-full rounded-md border border-edge bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary font-mono"
											/>
										</label>
									</div>
								</div>
							</div>

							<!-- Kotak Masuk Pesan Pengunjung -->
							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<h2 class="text-sm font-semibold tracking-tight">Kotak Masuk Pesan Pengunjung</h2>
									<span class="rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-xs font-mono font-bold">
										{messages.length} Pesan
									</span>
								</div>

								{#if messages.length === 0}
									<div class="rounded-xl border border-dashed border-edge p-8 text-center text-muted-foreground text-xs">
										Belum ada pesan masuk dari formulir kontak.
									</div>
								{:else}
									<div class="space-y-3">
										{#each messages as msg (msg.id)}
											<div class="rounded-xl border border-edge bg-card p-4 space-y-2 hover:border-primary/40 transition-colors shadow-xs">
												<div class="flex items-center justify-between border-b border-edge pb-2">
													<div class="flex items-center gap-2">
														<span class="font-semibold text-xs text-foreground">{msg.name}</span>
														<a href="mailto:{msg.email}" class="text-[11px] font-mono text-primary hover:underline">
															({msg.email})
														</a>
													</div>
													<div class="flex items-center gap-2">
														<span class="text-[10px] font-mono text-muted-foreground">
															{new Date(msg.createdAt).toLocaleString('id-ID')}
														</span>
														<a
															href="mailto:{msg.email}?subject=Balasan Portofolio Mohamad Akfry&body=Halo {msg.name},"
															class="text-xs font-mono text-primary hover:underline px-2 py-0.5 rounded bg-primary/10"
														>
															Balas Email
														</a>
														<button
															type="button"
															onclick={() => deleteMessage(msg.id)}
															class="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer"
															title="Hapus Pesan"
														>
															<Trash2 class="size-3.5" />
														</button>
													</div>
												</div>
												<p class="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
													{msg.message}
												</p>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</main>
			</div>
		</div>
	{/if}
</div>
