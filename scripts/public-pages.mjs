/** Public portfolio pages — shared by sitemap.xml and llms build. */

export const SITE_ORIGIN = 'https://andrewsheerin.com';

/** @type {Array<{ file: string, url: string, slug: string, label: string, summary: string }>} */
export const PUBLIC_PAGES = [
  {
    file: 'index.html',
    url: '/',
    slug: 'home',
    label: 'Home',
    summary: 'Product design leader - editorial AI, behavioural design, and clarity from complexity.',
  },
  {
    file: 'work/index.html',
    url: '/work/',
    slug: 'work',
    label: 'Work',
    summary: 'Selected case studies: Antare, Citrix DONA, and VMware RabbitMQ.',
  },
  {
    file: 'work/antare.html',
    url: '/work/antare.html',
    slug: 'work-antare',
    label: 'Antare: Compressing Reality',
    summary: 'Editorial intelligence for AI-generated incident feeds at Antare.',
  },
  {
    file: 'work/dona.html',
    url: '/work/dona.html',
    slug: 'work-dona',
    label: 'Citrix: The Hidden Cost of Good Intentions',
    summary: 'Wellbeing meets productivity - behavioural science and Human-AI interaction at Citrix.',
  },
  {
    file: 'work/education.html',
    url: '/work/education.html',
    slug: 'work-education',
    label: 'VMware: Designing Outside the Product',
    summary: 'RabbitMQ conversion - when the problem lived in education and enablement, not the product.',
  },
  {
    file: 'work/design-in-depth.html',
    url: '/work/design-in-depth.html',
    slug: 'work-design-in-depth',
    label: 'Design in Depth',
    summary: 'Field notes on Antare event card decisions - density, affordances, and delayed corrections.',
  },
  {
    file: 'about/briefing.html',
    url: '/about/briefing.html',
    slug: 'about-briefing',
    label: 'Portfolio Briefing',
    summary: 'Formal role-fit summary for recruiters and agents, with links to evidence for each claim.',
    agentBriefing: true,
  },
  {
    file: 'about/index.html',
    url: '/about/',
    slug: 'about',
    label: 'About',
    summary: 'Background, approach, and path from TerrorBull Games to product design leadership.',
  },
  {
    file: 'about/how-i-work.html',
    url: '/about/how-i-work.html',
    slug: 'about-how-i-work',
    label: 'How I Work',
    summary: 'Four practices: ambiguity, shared understanding, naming hidden things, partnering with AI.',
  },
  {
    file: 'about/origins.html',
    url: '/about/origins.html',
    slug: 'about-origins',
    label: 'Origins',
    summary: 'Before product design - TerrorBull Games, War on Terror, and persuasive communication through play.',
  },
  {
    file: 'contact/index.html',
    url: '/contact/',
    slug: 'contact',
    label: 'Contact',
    summary: 'Email, LinkedIn, and CV download.',
  },
];

/** @type {Array<{ url: string, label: string, summary: string }>} */
export const PUBLIC_ASSETS = [
  {
    url: '/assets/briefing/andrew-sheerin-portfolio-briefing.pdf',
    label: 'Portfolio Briefing (PDF)',
    summary: 'Generated briefing for recruiters and agents.',
  },
  {
    url: '/assets/briefing/andrew-sheerin-portfolio-briefing.md',
    label: 'Portfolio Briefing (Markdown)',
    summary: 'Generated markdown briefing for recruiters and agents.',
  },
  {
    url: '/assets/cv/andrew-sheerin-cv-2026.pdf',
    label: 'CV (PDF, 2026)',
    summary: 'Andrew Sheerin - Design Lead CV.',
  },
];
