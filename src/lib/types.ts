export interface Profile {
	name: string;
	nickname: string;
	headline: {
		id: string;
		en: string;
	};
	education: string;
	location: string;
	locationUrl: string;
	email: string;
	phone?: string;
	resumeUrl: string;
	brand: {
		name: string;
		tagline: string;
		services: string[];
	};
	about: {
		id: string;
		en: string;
	};
	stats: {
		yearsExperience: number;
		completedProjects: number;
	};
}

export interface SocialLink {
	platform: string;
	label: string;
	url: string;
	iconName: string;
}

export type TechCategory = 'Languages' | 'Frontend' | 'Backend & Database' | 'Tools & Workflow';

export interface TechItem {
	name: string;
	icon: string;
	url: string;
	category: TechCategory;
	popular?: boolean;
}

export interface Project {
	id: string;
	title: string;
	slug: string;
	summary: {
		id: string;
		en: string;
	};
	description: {
		id: string;
		en: string;
	};
	thumbnail: string;
	tags: string[];
	demoUrl?: string;
	repoUrl?: string;
	featured: boolean;
	accentColor?: string;
}

export interface Experience {
	id: string;
	organization: string;
	role: {
		id: string;
		en: string;
	};
	period: {
		id: string;
		en: string;
	};
	description: {
		id: string;
		en: string;
	};
	techs: string[];
}

export interface JourneyEntry {
	year: string;
	phase: {
		id: string;
		en: string;
	};
	title: {
		id: string;
		en: string;
	};
	bullets: {
		id: string[];
		en: string[];
	};
}

export interface Certification {
	id: string;
	title: string;
	issuer: string;
	issuerLogo?: string;
	issueDate: string;
	credentialUrl: string;
	previewFile?: string;
}

export interface BlogPost {
	id: string;
	title: {
		id: string;
		en: string;
	};
	slug: string;
	excerpt: {
		id: string;
		en: string;
	};
	publishedAt: string;
	readTime: string;
	cover: string;
	tags: string[];
}

export interface ContactMessage {
	id: string;
	name: string;
	email: string;
	message: string;
	createdAt: string;
	read?: boolean;
}

export interface PortfolioContent {
	profile: Profile;
	socialLinks: SocialLink[];
	techStack: TechItem[];
	featuredProjects: Project[];
	experiences: Experience[];
	journeyEntries: JourneyEntry[];
	certifications: Certification[];
	blogPosts: BlogPost[];
}

