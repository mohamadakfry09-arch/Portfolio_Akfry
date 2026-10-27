<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationFrameId: number;
		let width = (canvas.width = 547);
		let height = (canvas.height = 162);
		let t = 0;

		function draw() {
			if (!ctx) return;
			ctx.clearRect(0, 0, width, height);

			t += 0.02;

			// Dark blueprint background
			ctx.fillStyle = '#0a0a0a';
			ctx.fillRect(0, 0, width, height);

			// Render elegant flowing sine wave lines
			for (let i = 0; i < 7; i++) {
				ctx.beginPath();
				const hue = (t * 20 + i * 25) % 360;
				ctx.strokeStyle = `hsla(${165 + i * 5}, 85%, ${50 + i * 5}%, ${0.15 + i * 0.1})`;
				ctx.lineWidth = 1.2;

				for (let x = 0; x < width; x += 3) {
					const angle = (x / width) * Math.PI * 4 + t + i * 0.4;
					const y = height / 2 + Math.sin(angle) * (20 + i * 4) * Math.cos(t * 0.5 + i * 0.2);
					if (x === 0) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.stroke();
			}

			// Render subtle matrix grid dots
			ctx.fillStyle = 'rgba(6, 251, 194, 0.15)';
			for (let x = 12; x < width; x += 24) {
				for (let y = 12; y < height; y += 24) {
					const dist = Math.sin(x * 0.05 + t) * Math.cos(y * 0.05 + t);
					if (dist > 0.4) {
						ctx.fillRect(x, y, 1.5, 1.5);
					}
				}
			}

			animationFrameId = requestAnimationFrame(draw);
		}

		draw();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<div
	data-header-container="true"
	id="hero-banner"
	class="select-none relative aspect-2/1 border-x border-edge screen-line-after sm:aspect-3/1 flex items-center justify-center overflow-hidden bg-[#0a0a0a] dark:bg-black"
>
	<div class="absolute inset-0 flex items-center justify-center">
		<div class="flex w-full items-center justify-center p-2 sm:w-fit">
			<div class="w-full overflow-hidden rounded-xl bg-[#0a0a0a] p-3 dark:bg-transparent">
				<div class="relative w-full overflow-hidden" style="aspect-ratio: 547 / 162">
					<canvas
						bind:this={canvas}
						width="547"
						height="162"
						class="block h-auto w-full rounded-lg"
					></canvas>
				</div>
			</div>
		</div>
	</div>

	<!-- Teks HELLO dengan efek animasi dinamis mengambang dan kilauan teal -->
	<div class="relative z-10 flex items-center justify-center pointer-events-none select-none">
		<h1
			class="hello-container font-antic text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.25em] flex items-center justify-center uppercase pl-[0.25em]"
		>
			{#each ['H', 'E', 'L', 'L', 'O'] as letter, index}
				<span
					class="hello-char inline-block"
					style="--char-index: {index};"
				>
					{letter}
				</span>
			{/each}
		</h1>
	</div>

	<div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent"></div>
</div>

<style>
	.hello-container {
		animation: glowPulse 3.5s ease-in-out infinite alternate;
		will-change: filter;
	}

	.hello-char {
		background: linear-gradient(
			135deg,
			#ffffff 0%,
			#d1fae5 20%,
			#06FBC2 50%,
			#00A792 75%,
			#ffffff 100%
		);
		background-size: 250% 250%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation:
			waveBob 2.8s ease-in-out infinite calc(var(--char-index) * 0.2s),
			shimmerSweep 4.5s ease-in-out infinite calc(var(--char-index) * 0.15s);
		will-change: transform, background-position;
	}

	@keyframes waveBob {
		0%, 100% {
			transform: translateY(0px) scale(1) rotate(0deg);
		}
		35% {
			transform: translateY(-9px) scale(1.05) rotate(calc((var(--char-index) - 2) * 1.5deg));
		}
		70% {
			transform: translateY(4px) scale(0.97) rotate(calc((var(--char-index) - 2) * -0.8deg));
		}
	}

	@keyframes shimmerSweep {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	@keyframes glowPulse {
		0% {
			filter: drop-shadow(0 0 15px rgba(6, 251, 194, 0.35)) drop-shadow(0 0 30px rgba(0, 167, 146, 0.2));
		}
		100% {
			filter: drop-shadow(0 0 25px rgba(6, 251, 194, 0.75)) drop-shadow(0 0 55px rgba(6, 251, 194, 0.45));
		}
	}
</style>
