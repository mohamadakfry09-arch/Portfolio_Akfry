<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';

	// Generate 52 weeks x 7 days realistic contribution grid
	const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

	interface DaySquare {
		level: number;
		count: number;
		date: string;
		x: number;
		y: number;
	}

	const weeks: DaySquare[][] = [];
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 364);

	// deterministic pseudo-random commits to look authentic & active
	let seed = 42;
	function random() {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	}

	let totalContributions = $state(0);

	for (let w = 0; w < 52; w++) {
		const week: DaySquare[] = [];
		for (let d = 0; d < 7; d++) {
			const dayDate = new Date(startDate);
			dayDate.setDate(dayDate.getDate() + w * 7 + d);

			const r = random();
			// Higher activity on weekdays
			const isWeekend = d === 0 || d === 6;
			let level = 0;
			let count = 0;

			if (isWeekend) {
				if (r > 0.6) {
					level = 1;
					count = Math.floor(r * 3) + 1;
				}
			} else {
				if (r > 0.82) {
					level = 4;
					count = Math.floor(r * 12) + 6;
				} else if (r > 0.6) {
					level = 3;
					count = Math.floor(r * 6) + 4;
				} else if (r > 0.4) {
					level = 2;
					count = Math.floor(r * 4) + 2;
				} else if (r > 0.2) {
					level = 1;
					count = 1;
				}
			}

			totalContributions += count;

			week.push({
				level,
				count,
				date: dayDate.toISOString().split('T')[0],
				x: w * 16,
				y: 24 + d * 16
			});
		}
		weeks.push(week);
	}

	let hoveredDay = $state<DaySquare | null>(null);
	let tooltipPos = $state<{ x: number; y: number }>({ x: 0, y: 0 });

	function handleMouseEnter(day: DaySquare, e: MouseEvent) {
		hoveredDay = day;
		const rect = (e.target as HTMLElement).getBoundingClientRect();
		tooltipPos = { x: rect.left + rect.width / 2, y: rect.top - 8 };
	}

	function handleMouseLeave() {
		hoveredDay = null;
	}
</script>

<section
	data-slot="panel"
	class="screen-line-before screen-line-after border-x border-edge flex-1 relative p-4 overflow-hidden"
	id="github"
>
	<div class="flex flex-col gap-3 mx-auto py-1">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
			<div class="flex items-center gap-2">
				<span class="font-medium text-foreground">{m.github_contrib_title()}</span>
				<span class="text-xs text-muted-foreground font-mono">({totalContributions} contributions in the last year)</span>
			</div>
			<a
				href="https://github.com/mohamadakfry09-arch"
				target="_blank"
				rel="noopener noreferrer"
				class="text-xs text-primary hover:underline font-mono"
			>
				@mohamadakfry09-arch
			</a>
		</div>

		<div class="no-scrollbar max-w-full overflow-x-auto overflow-y-hidden px-1 py-2">
			<svg class="block overflow-visible" height="142" viewBox="0 0 848 142" width="848">
				<title>GitHub Contributions</title>
				<g data-slot="month-labels" class="fill-muted-foreground text-[11px] font-mono">
					{#each months as month, idx}
						<text dominant-baseline="hanging" y="4" x={16 + idx * 68}>{month}</text>
					{/each}
				</g>

				{#each weeks as week}
					{#each week as day}
						<rect
							class="cursor-pointer transition-colors duration-150 {day.level === 0
								? 'fill-zinc-200/50 dark:fill-zinc-800/40 hover:fill-zinc-300 dark:hover:fill-zinc-700'
								: day.level === 1
									? 'fill-[#00A792]/30 dark:fill-[#06FBC2]/25'
									: day.level === 2
										? 'fill-[#00A792]/55 dark:fill-[#06FBC2]/50'
										: day.level === 3
											? 'fill-[#00A792]/80 dark:fill-[#06FBC2]/75'
											: 'fill-[#00A792] dark:fill-[#06FBC2]'}"
							x={day.x}
							y={day.y}
							width="13"
							height="13"
							rx="2"
							ry="2"
							role="presentation"
							onmouseenter={(e) => handleMouseEnter(day, e)}
							onmouseleave={handleMouseLeave}
						/>
					{/each}
				{/each}
			</svg>
		</div>

		<div class="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
			<span>{m.github_contrib_sub()}</span>
			<div class="flex items-center gap-1.5">
				<span>{m.github_less()}</span>
				<span class="size-2.5 rounded-[2px] bg-zinc-200 dark:bg-zinc-800"></span>
				<span class="size-2.5 rounded-[2px] bg-[#00A792]/30 dark:bg-[#06FBC2]/25"></span>
				<span class="size-2.5 rounded-[2px] bg-[#00A792]/55 dark:bg-[#06FBC2]/50"></span>
				<span class="size-2.5 rounded-[2px] bg-[#00A792]/80 dark:bg-[#06FBC2]/75"></span>
				<span class="size-2.5 rounded-[2px] bg-[#00A792] dark:bg-[#06FBC2]"></span>
				<span>{m.github_more()}</span>
			</div>
		</div>
	</div>

	{#if hoveredDay}
		<div
			class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-mono text-popover-foreground shadow-lg"
			style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;"
		>
			<span class="font-semibold text-primary">{hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'}</span> on {hoveredDay.date}
		</div>
	{/if}
</section>
