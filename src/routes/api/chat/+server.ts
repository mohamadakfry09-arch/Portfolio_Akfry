import type { RequestHandler } from './$types';

// In-memory rate limiter: max 15 requests per 60 seconds per IP
const ipRateMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const userLimit = ipRateMap.get(ip);

	if (!userLimit || now > userLimit.resetTime) {
		ipRateMap.set(ip, { count: 1, resetTime: now + 60000 });
		return true;
	}

	if (userLimit.count >= 15) {
		return false;
	}

	userLimit.count += 1;
	return true;
}

const SYSTEM_PROMPT = `
Kamu adalah "Akfry AI", asisten virtual resmi untuk portofolio Mohamad Akfry Hermawan (Akfry).
Tugasmu adalah menjawab pertanyaan pengunjung, recruiter, calon klien, atau kolaborator dengan ramah, profesional, ringkas, dan percaya diri.

PROFIL MOHAMAD AKFRY HERMAWAN:
- Nama Lengkap: Mohamad Akfry Hermawan (panggilan: Akfry)
- Role: Front-End Specialist & Full Stack Web Developer
- Lokasi: Cirebon / Kuningan, Jawa Barat, Indonesia
- Pendidikan: D3 Manajemen Informatika di STMIK IKMI Cirebon; alumni SMK Pertiwi Kuningan (Rekayasa Perangkat Lunak)
- Brand/Layanan: Akarayasa Desain (Layanan Web Development, UI/UX Design, Creative Digital Services)
- Ketersediaan: Terbuka untuk peluang kerja full-time, remote, kontrak, maupun freelance lewat Akarayasa Desain
- Kontak: Email mohamadakfry09@gmail.com, GitHub @mohamadakfry09-arch, LinkedIn Mohamad Akfry Hermawan, Instagram @akarayasadesain

KEAHLIAN TEKNOLOGI (TECH STACK):
- Utama / Frontend: React.js, Svelte / SvelteKit, TypeScript, JavaScript, Tailwind CSS, CoreUI, Bootstrap, Vite, Three.js, MediaPipe Hands
- Backend & Database: Laravel 12, Node.js, PHP, MySQL, Oracle APEX, SQL
- Tools: VS Code, Git, GitHub, Laragon, XAMPP, Figma, DBeaver, Docker/WSL2

PENGALAMAN & PROYEK UTAMA:
1. Internship IT SIAK — Disdukcapil Kab. Cirebon (Front-End Developer Intern):
   - Mengembangkan dan mengoptimalkan antarmuka portal publik kependudukan SINTREN dan KATON SINTREN.
   - Menggunakan React.js, TypeScript, dan Tailwind CSS.
   - Menyelaraskan desain dengan ornamen khas Cirebon (batik Mega Mendung) untuk estetika budaya lokal yang ramah warga.
2. Web-ATK (Enterprise POS & Inventory):
   - Aplikasi kasir dan inventaris toko ATK enterprise berbasis Laravel 12, React, dan Tailwind CSS.
   - Terintegrasi pembayaran otomatis QRIS Tripay dan scanner barcode produk.
3. SiAlim:
   - Sistem Informasi Akademik terpadu untuk data siswa/mahasiswa, presensi, dan penilaian digital.
4. 3D Solar System (Gesture Control):
   - Simulasi tata surya 3D interaktif menggunakan Three.js dan deteksi gestur tangan kamera via MediaPipe Hands.
5. Hero's Quest:
   - Game 2D petualangan berkonsep penyelamatan putri berbasis Java Greenfoot.
6. IT & Technical Support Intern di STKIP Muhammadiyah Kuningan:
   - Pemeliharaan infrastruktur jaringan kampus dan perangkat komputer.

BATASAN PENTING (ATURAN KETAT):
1. Jawab HANYA pertanyaan seputar Akfry (skills, portofolio, magang Disdukcapil, Web-ATK, edukasi, Akarayasa Desain, atau ketersediaan kerja/kolaborasi).
2. Jika ditanya topik di luar profil Akfry (misalnya politik, resep masakan, coding umum yang tidak berhubungan dengan Akfry, atau hal acak), tolak dengan sopan: "Maaf, saya adalah asisten khusus profil Mohamad Akfry Hermawan. Saya hanya dapat menjawab hal-hal seputar pengalaman, keahlian teknis, dan proyek Akfry."
3. Gunakan bahasa yang sama dengan yang ditanyakan oleh pengguna (Bahasa Indonesia atau English).
4. Buat jawaban padat, informatif, dan tidak bertele-tele.
`;

function getIntelligentLocalResponse(message: string): string {
	const lower = message.toLowerCase();

	if (
		lower.includes('siapa') ||
		lower.includes('who are you') ||
		lower.includes('tentang akfry') ||
		lower.includes('about akfry') ||
		lower.includes('profil')
	) {
		return 'Mohamad Akfry Hermawan (Akfry) adalah seorang Front-End Specialist & Full Stack Developer asal Cirebon / Kuningan, Jawa Barat. Beliau merupakan mahasiswa D3 Manajemen Informatika STMIK IKMI Cirebon dan alumni RPL SMK Pertiwi Kuningan, serta pendiri studio kreatif Akarayasa Desain. Akfry berspesialisasi dalam membangun antarmuka web modern dengan React.js, TypeScript, Tailwind CSS, dan Laravel.';
	}

	if (
		lower.includes('disdukcapil') ||
		lower.includes('sintren') ||
		lower.includes('katon') ||
		lower.includes('magang') ||
		lower.includes('intern')
	) {
		return 'Di Disdukcapil Kab. Cirebon, Akfry berkontribusi sebagai Front-End Developer Intern (IT SIAK). Beliau merancang dan mengoptimasi antarmuka digital portal pelayanan kependudukan publik SINTREN dan KATON SINTREN menggunakan React.js, TypeScript, dan Tailwind CSS, dengan sentuhan kultural motif batik Mega Mendung.';
	}

	if (
		lower.includes('proyek') ||
		lower.includes('project') ||
		lower.includes('web-atk') ||
		lower.includes('portofolio') ||
		lower.includes('atk') ||
		lower.includes('sialim') ||
		lower.includes('solar')
	) {
		return 'Beberapa proyek unggulan Akfry antara lain:\n1. SINTREN & KATON SINTREN: Portal layanan Adminduk Disdukcapil Cirebon (React + TypeScript + Mega Mendung).\n2. Web-ATK: Point of Sale & inventory enterprise terintegrasi QRIS otomatis Tripay & barcode scanner (Laravel 12 + React).\n3. SiAlim: Sistem informasi akademik terpadu.\n4. 3D Solar System: Eksperimen interaktif 3D dengan kontrol gestur tangan (Three.js + MediaPipe Hands).\n5. Hero\'s Quest: Game petualangan 2D berbasis Java Greenfoot.';
	}

	if (
		lower.includes('skill') ||
		lower.includes('stack') ||
		lower.includes('keahlian') ||
		lower.includes('bahasa') ||
		lower.includes('teknologi')
	) {
		return 'Keahlian utama Akfry mencakup:\n- Front-End: React.js, Svelte / SvelteKit, TypeScript, Tailwind CSS, CoreUI, Vite, Three.js.\n- Back-End & DB: Laravel 12, Node.js, PHP, MySQL, Oracle APEX.\n- Tools & Workflow: VS Code, Git/GitHub, Figma, Laragon, DBeaver, Docker.';
	}

	if (
		lower.includes('kerja') ||
		lower.includes('hire') ||
		lower.includes('freelance') ||
		lower.includes('kontak') ||
		lower.includes('contact') ||
		lower.includes('tersedia') ||
		lower.includes('available') ||
		lower.includes('email')
	) {
		return 'Akfry saat ini TERBUKA untuk peluang kerja (Open for Work) full-time, part-time, kontrak, maupun proyek freelance via studio Akarayasa Desain. Anda dapat menghubungi langsung lewat formulir kontak di situs ini atau via email di mohamadakfry09@gmail.com.';
	}

	if (
		lower.includes('pendidikan') ||
		lower.includes('kuliah') ||
		lower.includes('sekolah') ||
		lower.includes('education') ||
		lower.includes('stmik') ||
		lower.includes('smk')
	) {
		return 'Akfry menempuh pendidikan formal D3 Manajemen Informatika di STMIK IKMI Cirebon dan merupakan alumni jurusan Rekayasa Perangkat Lunak (RPL) dari SMK Pertiwi Kuningan. Beliau juga aktif berpartisipasi dalam kompetisi IT nasional seperti di UNIKOM Bandung dan Telkom University Purwokerto.';
	}

	if (
		lower.includes('akarayasa') ||
		lower.includes('desain') ||
		lower.includes('studio') ||
		lower.includes('brand')
	) {
		return 'Akarayasa Desain adalah brand studio layanan digital yang didirikan oleh Akfry, melayani Pengembangan Website profesional, UI/UX Engineering presisi tinggi, dan konsultasi desain digital untuk klien dan mitra bisnis.';
	}

	if (
		lower.includes('halo') ||
		lower.includes('hai') ||
		lower.includes('hi') ||
		lower.includes('hello') ||
		lower.includes('selamat')
	) {
		return 'Halo! Selamat datang di portofolio Mohamad Akfry Hermawan. Ada yang bisa saya bantu terkait pengalaman magang di Disdukcapil, proyek Web-ATK, keahlian teknis, atau ketersediaan kerja Akfry?';
	}

	// Refusal for off-topic query
	return 'Maaf, sebagai asisten khusus portofolio Mohamad Akfry Hermawan, saya hanya dapat menjawab pertanyaan seputar keahlian teknis (React/Laravel/TypeScript), proyek (SINTREN, Web-ATK), pengalaman magang Disdukcapil, dan ketersediaan kerja Akfry.';
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientAddress ? getClientAddress() : '127.0.0.1';

	if (!checkRateLimit(ip)) {
		return new Response(
			JSON.stringify({ error: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.' }),
			{ status: 429, headers: { 'Content-Type': 'application/json' } }
		);
	}

	let body: { message?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Format JSON tidak valid.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const message = body.message?.trim();
	if (!message) {
		return new Response(JSON.stringify({ error: 'Pesan tidak boleh kosong.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (message.length > 500) {
		return new Response(JSON.stringify({ error: 'Pesan terlalu panjang (maksimal 500 karakter).' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const apiKey = process.env.ANTHROPIC_API_KEY;

	// If Anthropic API key is available in environment, stream from Claude API
	if (apiKey) {
		try {
			const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': apiKey,
					'anthropic-version': '2023-06-01'
				},
				body: JSON.stringify({
					model: 'claude-3-5-haiku-latest',
					max_tokens: 450,
					system: SYSTEM_PROMPT,
					messages: [{ role: 'user', content: message }],
					stream: true
				})
			});

			if (!anthropicResponse.ok) {
				throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
			}

			// Stream directly from Anthropic SSE
			const stream = new ReadableStream({
				async start(controller) {
					const reader = anthropicResponse.body?.getReader();
					if (!reader) {
						controller.close();
						return;
					}

					const decoder = new TextDecoder();
					const encoder = new TextEncoder();

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						const chunk = decoder.decode(value);
						const lines = chunk.split('\n');

						for (const line of lines) {
							if (line.startsWith('data: ')) {
								const dataStr = line.replace('data: ', '').trim();
								if (dataStr === '[DONE]') continue;

								try {
									const parsed = JSON.parse(dataStr);
									if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
										controller.enqueue(encoder.encode(parsed.delta.text));
									}
								} catch {
									// Ignore JSON parse error on malformed chunks
								}
							}
						}
					}
					controller.close();
				}
			});

			return new Response(stream, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive'
				}
			});
		} catch (err) {
			console.warn('Falling back to local AI assistant due to Anthropic error:', err);
		}
	}

	// Smart Local Streaming Fallback
	const responseText = getIntelligentLocalResponse(message);
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const words = responseText.split(' ');
			for (let i = 0; i < words.length; i++) {
				const word = (i === 0 ? '' : ' ') + words[i];
				controller.enqueue(encoder.encode(word));
				// Small delay to simulate realistic AI generation
				await new Promise((r) => setTimeout(r, 22));
			}
			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
