import type { PageServerLoad } from './$types';
import { getPortfolioContent } from '#lib/server/content.js';

export const load: PageServerLoad = async () => {
	const content = getPortfolioContent();
	return {
		portfolioContent: content
	};
};
