import fs from 'node:fs';
import path from 'node:path';
import type { PortfolioContent, ContactMessage } from '#lib/types.js';
import staticPortfolioData from '../data/portfolio-content.json' with { type: 'json' };
import {
	profileData,
	socialLinks,
	techStack,
	featuredProjects,
	experiences,
	journeyEntries,
	certifications,
	blogPosts
} from '#lib/data/profile.js';

const DATA_DIR = path.resolve(process.cwd(), 'src/lib/data');
const CONTENT_FILE = path.join(DATA_DIR, 'portfolio-content.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// In-memory fallback cache for serverless environments (e.g. Vercel)
let inMemoryContent: PortfolioContent | null = null;
let inMemoryMessages: ContactMessage[] = [];

// Default initial state
export function getDefaultContent(): PortfolioContent {
	if (staticPortfolioData && (staticPortfolioData as any).profile) {
		return staticPortfolioData as unknown as PortfolioContent;
	}
	return {
		profile: profileData,
		socialLinks,
		techStack,
		featuredProjects,
		experiences,
		journeyEntries,
		certifications,
		blogPosts
	};
}

// Get portfolio content (cached or from JSON file)
export function getPortfolioContent(): PortfolioContent {
	if (inMemoryContent) return inMemoryContent;
	try {
		if (fs.existsSync(CONTENT_FILE)) {
			const data = fs.readFileSync(CONTENT_FILE, 'utf-8');
			inMemoryContent = JSON.parse(data);
			return inMemoryContent!;
		}
	} catch (err) {
		console.error('Error reading portfolio-content.json:', err);
	}

	// Fallback to static bundled data or default
	const initial = getDefaultContent();
	inMemoryContent = initial;
	try {
		if (!fs.existsSync(DATA_DIR)) {
			fs.mkdirSync(DATA_DIR, { recursive: true });
		}
		fs.writeFileSync(CONTENT_FILE, JSON.stringify(initial, null, 2), 'utf-8');
	} catch (err) {
		// Read-only serverless environment
	}

	return initial;
}

// Save portfolio content
export function savePortfolioContent(updated: PortfolioContent): boolean {
	inMemoryContent = updated;
	try {
		if (!fs.existsSync(DATA_DIR)) {
			fs.mkdirSync(DATA_DIR, { recursive: true });
		}
		fs.writeFileSync(CONTENT_FILE, JSON.stringify(updated, null, 2), 'utf-8');
		return true;
	} catch (err) {
		console.warn('Filesystem is read-only (serverless environment). Saved in memory.');
		return true;
	}
}

// Get contact messages
export function getContactMessages(): ContactMessage[] {
	try {
		if (fs.existsSync(MESSAGES_FILE)) {
			const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
			return JSON.parse(data);
		}
	} catch (err) {
		console.error('Error reading messages.json:', err);
	}
	return inMemoryMessages;
}

// Add new contact message
export function addContactMessage(msg: { name: string; email: string; message: string }): ContactMessage {
	const messages = getContactMessages();
	const newMessage: ContactMessage = {
		id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
		name: msg.name,
		email: msg.email,
		message: msg.message,
		createdAt: new Date().toISOString(),
		read: false
	};

	messages.unshift(newMessage);
	inMemoryMessages = messages;

	try {
		if (!fs.existsSync(DATA_DIR)) {
			fs.mkdirSync(DATA_DIR, { recursive: true });
		}
		fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
	} catch (err) {
		console.warn('Filesystem is read-only (serverless environment). Saved in memory.');
	}

	return newMessage;
}

// Delete contact message
export function deleteContactMessage(id: string): boolean {
	const messages = getContactMessages();
	const filtered = messages.filter((m) => m.id !== id);
	inMemoryMessages = filtered;
	try {
		fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
		return true;
	} catch (err) {
		console.warn('Filesystem is read-only. Updated in memory.');
		return true;
	}
}

// Simple admin auth verification
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyAdminPassword(pass: string): boolean {
	return pass === ADMIN_PASSWORD;
}
