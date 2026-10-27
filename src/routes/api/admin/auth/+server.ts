import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyAdminPassword } from '#lib/server/content.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { password, action } = await request.json();

		if (action === 'logout') {
			cookies.delete('admin_session', { path: '/' });
			return json({ success: true, message: 'Berhasil logout' });
		}

		if (verifyAdminPassword(password)) {
			cookies.set('admin_session', 'authenticated', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
			return json({ success: true, message: 'Login berhasil!' });
		}

		return json({ success: false, message: 'Kata sandi salah.' }, { status: 401 });
	} catch (err) {
		console.error('Error in admin auth:', err);
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};
