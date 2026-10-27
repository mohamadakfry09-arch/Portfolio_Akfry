import { json, type RequestHandler } from '@sveltejs/kit';
import { addContactMessage, getContactMessages, deleteContactMessage } from '#lib/server/content.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, email, message } = body;

		if (!email || !message) {
			return json({ success: false, message: 'Email dan pesan wajib diisi.' }, { status: 400 });
		}

		const saved = addContactMessage({
			name: name || 'Anonim',
			email,
			message
		});

		return json({ success: true, message: 'Pesan berhasil dikirim!', data: saved });
	} catch (err) {
		console.error('Error submitting contact form:', err);
		return json({ success: false, message: 'Gagal mengirim pesan.' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
	const authCookie = cookies.get('admin_session');
	if (authCookie !== 'authenticated') {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}
	const messages = getContactMessages();
	return json({ success: true, messages });
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	const authCookie = cookies.get('admin_session');
	if (authCookie !== 'authenticated') {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const { id } = await request.json();
		deleteContactMessage(id);
		return json({ success: true });
	} catch (err) {
		return json({ success: false }, { status: 500 });
	}
};
