<script lang="ts">
	import {
		MessageSquare,
		X,
		Send,
		Sparkles,
		RotateCcw,
		Bot,
		User,
		Loader2,
		Minimize2,
		CornerDownLeft
	} from '@lucide/svelte';
	import * as m from '#lib/paraglide/messages.js';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
		time?: string;
	}

	let isOpen = $state(false);
	let inputMessage = $state('');
	let isLoading = $state(false);
	let messagesContainer: HTMLDivElement | null = $state(null);

	const initialMessages: Message[] = [
		{
			role: 'assistant',
			content:
				'Halo! Saya **Akfry AI**, asisten resmi Mohamad Akfry Hermawan. Tanyakan apa saja tentang pengalaman magang di Disdukcapil (SINTREN), proyek Web-ATK, keahlian React/Laravel/TypeScript, atau ketersediaan kerja Akfry.',
			time: 'Baru saja'
		}
	];

	let messages = $state<Message[]>([...initialMessages]);

	const samplePrompts = [
		'Apa peran Akfry di Disdukcapil Cirebon?',
		'Ceritakan tentang proyek Web-ATK POS',
		'Teknologi apa saja yang dikuasai?',
		'Apakah Akfry tersedia untuk freelance / hire?'
	];

	function scrollToBottom() {
		if (messagesContainer) {
			setTimeout(() => {
				messagesContainer?.scrollTo({
					top: messagesContainer.scrollHeight,
					behavior: 'smooth'
				});
			}, 30);
		}
	}

	function resetChat() {
		messages = [...initialMessages];
		inputMessage = '';
	}

	async function sendMessage(textToSend?: string) {
		const text = (textToSend || inputMessage).trim();
		if (!text || isLoading) return;

		const userMsg: Message = {
			role: 'user',
			content: text,
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};

		messages = [...messages, userMsg];
		inputMessage = '';
		isLoading = true;
		scrollToBottom();

		// Create placeholder for assistant streaming response
		const assistantMsgIndex = messages.length;
		messages = [
			...messages,
			{
				role: 'assistant',
				content: '',
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			}
		];

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: text })
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || `Error: ${res.status}`);
			}

			const reader = res.body?.getReader();
			const decoder = new TextDecoder();

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					messages[assistantMsgIndex].content += chunk;
					messages = [...messages];
					scrollToBottom();
				}
			}
		} catch (err: any) {
			messages[assistantMsgIndex].content =
				'Maaf, terjadi kendala saat menghubungi asisten AI. Silakan coba kembali sesaat lagi atau kirim pesan melalui form kontak.';
			messages = [...messages];
		} finally {
			isLoading = false;
			scrollToBottom();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Floating Chatbot Trigger Button (Bottom Right Corner) -->
<div class="fixed right-4 sm:right-6 bottom-20 sm:bottom-6 z-40 flex flex-col items-end">
	<!-- Tooltip badge -->
	{#if !isOpen}
		<button
			type="button"
			class="mb-2 hidden sm:flex items-center gap-2 rounded-lg border border-edge bg-card/90 px-2.5 py-1 text-[11px] font-mono text-foreground shadow-lg backdrop-blur-md transition-all hover:border-[#00A792] dark:hover:border-[#06FBC2] group cursor-pointer animate-fade-in"
			onclick={() => {
				isOpen = true;
				scrollToBottom();
			}}
		>
			<Sparkles class="size-3 text-[#00A792] dark:text-[#06FBC2]" />
			<span class="font-medium">Tanya Akfry AI</span>
			<span class="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground tracking-wider uppercase border border-edge/50">
				Chat
			</span>
		</button>
	{/if}

	<!-- Blueprint Floating Trigger Button -->
	<button
		type="button"
		class="group relative flex h-13 w-13 items-center justify-center rounded-2xl border border-edge bg-card/95 text-foreground shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#00A792] dark:hover:border-[#06FBC2] hover:shadow-[0_0_24px_rgba(0,167,146,0.25)] dark:hover:shadow-[0_0_24px_rgba(6,251,194,0.25)] focus:outline-hidden focus:ring-2 focus:ring-[#00A792]/40 active:scale-95 cursor-pointer"
		onclick={() => {
			isOpen = !isOpen;
			if (isOpen) scrollToBottom();
		}}
		aria-label={isOpen ? 'Tutup Asisten AI' : 'Buka Asisten AI Akfry'}
		aria-expanded={isOpen}
	>
		<!-- Subtle blueprint corner accents -->
		<span class="absolute top-1 left-1 size-1 border-t border-l border-[#00A792]/50 dark:border-[#06FBC2]/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
		<span class="absolute bottom-1 right-1 size-1 border-b border-r border-[#00A792]/50 dark:border-[#06FBC2]/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>

		{#if isOpen}
			<X class="relative z-10 size-5 text-muted-foreground group-hover:text-foreground transition-transform duration-200" />
		{:else}
			<div class="relative z-10 flex items-center justify-center text-foreground group-hover:text-[#00A792] dark:group-hover:text-[#06FBC2] transition-colors">
				<Bot class="size-6 transition-transform duration-300 group-hover:scale-110" />
				<!-- Pulsing status dot -->
				<span class="absolute -top-1.5 -right-1.5 flex size-3">
					<span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
					<span class="relative inline-flex size-3 rounded-full border-2 border-card bg-emerald-500"></span>
				</span>
			</div>
		{/if}
	</button>
</div>

<!-- Chatbot Sliding Modal Panel -->
{#if isOpen}
	<div
		class="fixed right-4 sm:right-6 bottom-20 sm:bottom-22 z-50 flex h-[540px] max-h-[80vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-edge bg-card/95 shadow-2xl backdrop-blur-xl transition-all"
		role="dialog"
		aria-labelledby="chat-title"
	>
		<!-- Panel Header -->
		<div class="flex items-center justify-between border-b border-edge bg-muted/30 px-4 py-3">
			<div class="flex items-center gap-2.5">
				<div class="relative flex size-8 items-center justify-center rounded-xl border border-edge bg-card text-[#00A792] dark:text-[#06FBC2] shadow-xs">
					<Bot class="size-4.5" />
					<span class="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-card bg-emerald-500"></span>
				</div>
				<div>
					<h2 id="chat-title" class="flex items-center gap-1.5 text-xs font-bold text-foreground">
						<span>Akfry AI Assistant</span>
						<span class="rounded bg-[#00A792]/10 dark:bg-[#06FBC2]/10 border border-[#00A792]/20 dark:border-[#06FBC2]/20 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-[#00A792] dark:text-[#06FBC2]">
							v1.0
						</span>
					</h2>
					<div class="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
						<span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
						<span>Online • Siap Menjawab</span>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-1">
				<button
					type="button"
					class="flex size-7 items-center justify-center rounded-lg border border-edge text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
					onclick={resetChat}
					title="Mulai ulang percakapan"
				>
					<RotateCcw class="size-3.5" />
				</button>
				<button
					type="button"
					class="flex size-7 items-center justify-center rounded-lg border border-edge text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
					onclick={() => (isOpen = false)}
					title="Tutup chat"
				>
					<Minimize2 class="size-3.5" />
				</button>
			</div>
		</div>

		<!-- Chat Message Area -->
		<div
			bind:this={messagesContainer}
			class="flex-1 space-y-3 overflow-y-auto p-4 text-xs bg-background/50"
		>
			{#each messages as msg, i (i)}
				{#if msg.role === 'user'}
					<div class="flex justify-end">
						<div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#00A792] dark:bg-[#06FBC2] text-white dark:text-black px-3.5 py-2.5 shadow-xs font-medium">
							<p class="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
							{#if msg.time}
								<div class="mt-1 text-right text-[9px] opacity-75 font-mono">{msg.time}</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="flex items-start gap-2">
						<div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border border-edge bg-card text-[#00A792] dark:text-[#06FBC2]">
							<Bot class="size-3.5" />
						</div>
						<div class="max-w-[85%] rounded-2xl rounded-tl-xs border border-edge bg-card px-3.5 py-2.5 text-foreground shadow-2xs">
							{#if !msg.content && isLoading}
								<div class="flex items-center gap-1.5 py-1 text-muted-foreground font-mono">
									<Loader2 class="size-3.5 animate-spin text-[#00A792] dark:text-[#06FBC2]" />
									<span class="text-[11px]">Akfry AI sedang mengetik...</span>
								</div>
							{:else}
								<p class="whitespace-pre-wrap leading-relaxed text-foreground/90">{msg.content}</p>
								{#if msg.time}
									<div class="mt-1 text-[9px] text-muted-foreground font-mono">{msg.time}</div>
								{/if}
							{/if}
						</div>
					</div>
				{/if}
			{/each}

			<!-- Prompt Suggestions if messages count is low -->
			{#if messages.length <= 2}
				<div class="pt-2">
					<div class="mb-1.5 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
						Saran Pertanyaan:
					</div>
					<div class="flex flex-wrap gap-1.5">
						{#each samplePrompts as prompt}
							<button
								type="button"
								class="rounded-lg border border-edge bg-card/60 px-2.5 py-1.5 text-left text-[11px] font-mono text-muted-foreground transition-all hover:border-[#00A792] dark:hover:border-[#06FBC2] hover:bg-muted hover:text-foreground cursor-pointer"
								onclick={() => sendMessage(prompt)}
							>
								{prompt}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Input Box -->
		<div class="border-t border-edge bg-card/90 p-3 backdrop-blur-md">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				class="relative flex items-center"
			>
				<input
					type="text"
					bind:value={inputMessage}
					placeholder="Tanyakan keahlian atau proyek Akfry..."
					disabled={isLoading}
					maxlength={500}
					class="w-full rounded-xl border border-edge bg-background/80 py-2.5 pr-10 pl-3.5 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-[#00A792] dark:focus:border-[#06FBC2] focus:ring-1 focus:ring-[#00A792] dark:focus:ring-[#06FBC2] focus:outline-hidden"
				/>
				<button
					type="submit"
					disabled={!inputMessage.trim() || isLoading}
					class="absolute right-1.5 flex size-7 items-center justify-center rounded-lg bg-[#00A792] dark:bg-[#06FBC2] text-white dark:text-black transition-all hover:opacity-90 disabled:opacity-40 cursor-pointer"
					aria-label="Kirim pesan"
				>
					{#if isLoading}
						<Loader2 class="size-3.5 animate-spin" />
					{:else}
						<Send class="size-3.5" />
					{/if}
				</button>
			</form>
			<div class="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
				<span>Enter ↵ untuk kirim</span>
				<span>Khusus profil Akfry</span>
			</div>
		</div>
	</div>
{/if}
