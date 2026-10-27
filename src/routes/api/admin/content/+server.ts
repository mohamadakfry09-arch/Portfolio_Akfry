import { json, type RequestHandler } from '@sveltejs/kit';
import { getPortfolioContent, savePortfolioContent, verifyAdminPassword } from '#lib/server/content.js';
import type { PortfolioContent } from '#lib/types.js';

export const GET: RequestHandler = async () => {
	const content = getPortfolioContent();
	return json({ success: true, content });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const authCookie = cookies.get('admin_session');
		const body = await request.json();
		const password = body.password || '';

		if (authCookie !== 'authenticated' && !verifyAdminPassword(password)) {
			return json({ success: false, message: 'Unauthorized. Kata sandi salah.' }, { status: 401 });
		}

		const updatedContent: PortfolioContent = body.content;
		if (!updatedContent || !updatedContent.profile) {
			return json({ success: false, message: 'Format data tidak valid.' }, { status: 400 });
		}

		const saved = savePortfolioContent(updatedContent);
		if (!saved) {
			return json({ success: false, message: 'Gagal menyimpan perubahan ke server.' }, { status: 500 });
		}

		return json({ success: true, message: 'Perubahan berhasil disimpan!', content: updatedContent });
	} catch (err) {
		console.error('Error handling admin content update:', err);
		return json({ success: false, message: 'Terjadi kesalahan server internal.' }, { status: 500 });
	}
};
