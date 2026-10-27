import type { PageServerLoad } from './$types';
import { getPortfolioContent, getContactMessages } from '#lib/server/content.js';

export const load: PageServerLoad = async ({ cookies }) => {
	const authCookie = cookies.get('admin_session');
	const isAuthenticated = authCookie === 'authenticated';

	if (!isAuthenticated) {
		return {
			isAuthenticated: false,
			content: null,
			messages: []
		};
	}

	return {
		isAuthenticated: true,
		content: getPortfolioContent(),
		messages: getContactMessages()
	};
};
