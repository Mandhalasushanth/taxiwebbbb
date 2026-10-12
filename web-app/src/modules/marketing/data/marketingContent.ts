import { appConfig, routePaths } from '@core/config'
import type {
  MarketingContactChannel,
  MarketingFaq,
  MarketingFeature,
  MarketingFooterGroup,
  MarketingHero,
  MarketingNavLink,
  MarketingSectionCopy,
  MarketingService,
  MarketingStat,
  MarketingStep,
  MarketingTestimonial,
  MarketingTrustBadge,
  PageMeta,
} from '../types/marketing.types'

/**
 * All copy for the public marketing site lives here so text can change
 * without touching layout code. Paths always come from routePaths.
 */

const servicesHash = `${routePaths.marketing.home}#${routePaths.marketing.servicesAnchor}`
const faqHash = `${routePaths.marketing.home}#${routePaths.marketing.faqAnchor}`

export const MARKETING_BRAND = {
  name: appConfig.name,
  legalName: `${appConfig.name} Fin Solutions`,
  tagline: 'Simple • Secure • Compliant',
  description:
    'Tax, GST, loans, insurance and company compliance handled by experts, tracked in one secure dashboard.',
  iconSrc: '/assets/images/taxedge-brand-icon.png',
} as const

export const MARKETING_NAV_LINKS: MarketingNavLink[] = [
  { id: 'nav-services', label: 'Services', to: servicesHash },
  { id: 'nav-pricing', label: 'Pricing', to: routePaths.marketing.pricing },
  { id: 'nav-about', label: 'About', to: routePaths.marketing.about },
  { id: 'nav-faq', label: 'FAQ', to: faqHash },
  { id: 'nav-contact', label: 'Contact', to: routePaths.marketing.contact },
]

export const MARKETING_AUTH_CTA = {
  login: { label: 'Login', to: routePaths.auth.login },
  register: { label: 'Get Started', to: routePaths.auth.register },
} as const

export const MARKETING_HERO: MarketingHero = {
  eyebrow: 'Trusted by businesses & individuals across India',
  title: 'Tax, GST & Business Compliance,',
  highlight: 'Simplified.',
  subtitle:
    'File your ITR, register and file GST, incorporate your company and apply for loans — guided by experts and tracked in one secure dashboard.',
  primaryCta: { label: 'Get Started Free', to: routePaths.auth.register },
  secondaryCta: { label: 'Explore Services', to: servicesHash },
  imageSrc: '/assets/images/tax-journey-illustration.png',
  imageAlt: 'Secure tax filing dashboard illustration',
  points: ['No hidden charges', 'Expert-assisted filing', 'Live application tracking'],
}

export const MARKETING_TRUST_BADGES: MarketingTrustBadge[] = [
  {
    id: 'trust-secure',
    label: 'Secure & Reliable',
    description: 'Bank-grade encryption for every document',
    imageSrc: '/assets/images/badge-secure.png',
  },
  {
    id: 'trust-fast',
    label: 'Fast & Easy',
    description: 'Complete most filings in minutes',
    imageSrc: '/assets/images/badge-fast.png',
  },
  {
    id: 'trust-support',
    label: 'Expert Support',
    description: 'Dedicated CAs and tax professionals',
    imageSrc: '/assets/images/badge-support.png',
  },
]

export const SERVICES_SECTION: MarketingSectionCopy = {
  eyebrow: 'Our Services',
  title: 'Everything your finances need, in one place',
  subtitle: 'Pick a service, upload your documents and let our experts take it from there.',
}

export const MARKETING_SERVICES: MarketingService[] = [
  {
    id: 'itr',
    title: 'Income Tax (ITR)',
    description: 'Accurate ITR filing for salaried, business and capital-gains income with maximum refunds.',
    iconSrc: '/assets/images/services/icon-itr.png',
    highlights: ['ITR filing', 'TDS refund', 'Tax notice replies'],
  },
  {
    id: 'gst',
    title: 'GST Services',
    description: 'GST registration, monthly and quarterly returns, amendments and compliance support.',
    iconSrc: '/assets/images/services/icon-gst.png',
    highlights: ['Registration', 'GSTR-1 & 3B', 'Amendments'],
  },
  {
    id: 'incorporation',
    title: 'Company Incorporation',
    description: 'Register a Private Limited, LLP, OPC or Section 8 company with end-to-end guidance.',
    iconSrc: '/assets/icons/incorporation/pvt-ltd.png',
    highlights: ['Pvt Ltd & LLP', 'OPC', 'Section 8'],
  },
  {
    id: 'loans',
    title: 'Business & Personal Loans',
    description: 'Compare and apply for home, business, MSME, vehicle and working-capital finance.',
    iconSrc: '/assets/images/services/icon-loans.png',
    highlights: ['MSME loans', 'Home loans', 'Working capital'],
  },
  {
    id: 'insurance',
    title: 'Insurance',
    description: 'Health, life, motor and commercial cover tailored to your family and your business.',
    iconSrc: '/assets/images/services/icon-insurance.png',
    highlights: ['Health', 'Life', 'Commercial'],
  },
  {
    id: 'business',
    title: 'Business Services',
    description: 'Accounting, MSME Udyam, trademark and ongoing compliance for growing businesses.',
    iconSrc: '/assets/images/services/icon-business.png',
    highlights: ['Udyam', 'Trademark', 'Accounting'],
  },
  {
    id: 'projects',
    title: 'Project Finance',
    description: 'Structured project reports and funding support for new ventures and expansions.',
    iconSrc: '/assets/images/services/icon-projects.png',
    highlights: ['Project reports', 'Machinery loans', 'Funding'],
  },
]

export const HOW_IT_WORKS_SECTION: MarketingSectionCopy = {
  eyebrow: 'How It Works',
  title: 'Done in four simple steps',
  subtitle: 'No office visits, no paperwork chase — everything happens online.',
}

export const HOW_IT_WORKS_STEPS: MarketingStep[] = [
  {
    id: 'step-signup',
    step: 1,
    icon: 'user-plus',
    title: 'Create your account',
    description: 'Sign up with your mobile number in under two minutes.',
  },
  {
    id: 'step-upload',
    step: 2,
    icon: 'upload',
    title: 'Upload documents',
    description: 'Share PAN, Aadhaar and service documents securely.',
  },
  {
    id: 'step-expert',
    step: 3,
    icon: 'file-check',
    title: 'Experts file for you',
    description: 'Our CAs verify, prepare and submit your application.',
  },
  {
    id: 'step-track',
    step: 4,
    icon: 'activity',
    title: 'Track & get it done',
    description: 'Follow live status and download receipts anytime.',
  },
]

export const WHY_CHOOSE_SECTION: MarketingSectionCopy = {
  eyebrow: `Why ${appConfig.name}`,
  title: 'Built for accuracy, speed and peace of mind',
  subtitle: 'We combine expert professionals with a secure platform so nothing slips through.',
}

export const WHY_CHOOSE_FEATURES: MarketingFeature[] = [
  {
    id: 'why-experts',
    icon: 'badge-check',
    title: 'Qualified experts',
    description: 'Every filing is reviewed by experienced chartered accountants.',
  },
  {
    id: 'why-secure',
    icon: 'lock',
    title: 'Secure by design',
    description: 'Encrypted storage and strict access controls protect your data.',
  },
  {
    id: 'why-fast',
    icon: 'clock',
    title: 'On-time, every time',
    description: 'Deadline reminders and fast turnaround keep you penalty free.',
  },
  {
    id: 'why-transparent',
    icon: 'trending-up',
    title: 'Transparent pricing',
    description: 'Clear professional fees shown upfront before you pay.',
  },
]

export const MARKETING_STATS: MarketingStat[] = [
  { id: 'stat-filings', value: 50000, suffix: '+', label: 'Filings completed' },
  { id: 'stat-customers', value: 25000, suffix: '+', label: 'Happy customers' },
  { id: 'stat-cities', value: 300, suffix: '+', label: 'Cities served' },
  { id: 'stat-rating', value: 4.8, suffix: '/5', label: 'Average rating' },
]

export const TESTIMONIALS_SECTION: MarketingSectionCopy = {
  eyebrow: 'Testimonials',
  title: 'Loved by customers across India',
  subtitle: 'Real feedback from people who file, register and grow with us.',
}

export const MARKETING_TESTIMONIALS: MarketingTestimonial[] = [
  {
    id: 'testimonial-1',
    quote: 'GST registration was done in days, not weeks. The live tracking made it completely stress free.',
    name: 'Ravi Kumar',
    role: 'Retail business owner',
    city: 'Bengaluru',
    rating: 5,
  },
  {
    id: 'testimonial-2',
    quote: 'My ITR was filed with every deduction claimed. I got my refund faster than ever before.',
    name: 'Priya Sharma',
    role: 'Software engineer',
    city: 'Pune',
    rating: 5,
  },
  {
    id: 'testimonial-3',
    quote: 'They incorporated our LLP end to end and still help us with monthly compliance.',
    name: 'Arjun Mehta',
    role: 'Startup founder',
    city: 'Hyderabad',
    rating: 4,
  },
  {
    id: 'testimonial-4',
    quote: 'The deadline reminders alone have saved me thousands in late fees. Filing every month is now effortless.',
    name: 'Sneha Iyer',
    role: 'Boutique owner',
    city: 'Chennai',
    rating: 5,
  },
  {
    id: 'testimonial-5',
    quote: 'Got my working-capital loan approved with their help and my GST returns are always filed on time.',
    name: 'Mohammed Faiz',
    role: 'Manufacturer',
    city: 'Ahmedabad',
    rating: 5,
  },
]

export const FAQ_SECTION: MarketingSectionCopy = {
  eyebrow: 'FAQ',
  title: 'Frequently asked questions',
  subtitle: 'Can’t find your answer? Our support team is a message away.',
}

export const MARKETING_FAQS: MarketingFaq[] = [
  {
    id: 'faq-start',
    question: `How do I get started with ${appConfig.name}?`,
    answer: 'Create a free account with your mobile number, choose a service from your dashboard and follow the guided steps.',
  },
  {
    id: 'faq-documents',
    question: 'Which documents do I need?',
    answer: 'Most services need your PAN and Aadhaar. Each service lists any extra documents before you start.',
  },
  {
    id: 'faq-security',
    question: 'Is my data safe?',
    answer: 'Yes. Documents are encrypted in transit and at rest, and only the assigned expert can access your application.',
  },
  {
    id: 'faq-time',
    question: 'How long does a filing take?',
    answer: 'ITR and GST returns are usually filed within 1–2 working days of receiving complete documents.',
  },
  {
    id: 'faq-track',
    question: 'Can I track my application?',
    answer: 'Every application has a live tracker in your dashboard with status updates, receipts and certificates.',
  },
  {
    id: 'faq-payment',
    question: 'What payment options are supported?',
    answer: 'Pay securely using UPI, cards or net banking. Fees are shown upfront and receipts are issued instantly.',
  },
]

export const CTA_BANNER = {
  title: 'Ready to file? Get started in 2 minutes.',
  subtitle: 'Join thousands of individuals and businesses who trust us with their compliance.',
  primaryCta: { label: 'Create Free Account', to: routePaths.auth.register },
  secondaryCta: { label: 'Talk to an Expert', to: routePaths.marketing.contact },
} as const

export const MARKETING_CONTACT_CHANNELS: MarketingContactChannel[] = [
  { id: 'contact-phone', label: 'Call us', value: '+91 20 4141 8800', href: 'tel:+912041418800', icon: 'phone' },
  {
    id: 'contact-email',
    label: 'Email us',
    value: appConfig.supportEmail,
    href: `mailto:${appConfig.supportEmail}`,
    icon: 'mail',
  },
  { id: 'contact-hours', label: 'Working hours', value: 'Mon–Sat, 09:30 AM – 07:30 PM IST', icon: 'clock' },
  { id: 'contact-office', label: 'Head office', value: 'Pune, Maharashtra', icon: 'map-pin' },
]

export const CONTACT_HERO: MarketingSectionCopy = {
  eyebrow: 'Contact Us',
  title: 'Talk to a tax expert',
  subtitle: 'Our tax and compliance experts usually reply within one working day.',
}

/** Choices for "What do you need help with?" on the contact form */
export const CONTACT_SERVICE_OPTIONS = [
  ...MARKETING_SERVICES.map((service) => ({ id: service.id, label: service.title })),
  { id: 'general', label: 'Something else' },
]

export const CONTACT_FORM_COPY = {
  title: 'Send us a message',
  subtitle: 'Fill in a few details and an expert will call you back.',
  serviceLabel: 'What do you need help with?',
  submitLabel: 'Send enquiry',
  footnote: 'We reply within one working day · Your details stay private',
  successTitle: 'Thank you! We’ve received your enquiry.',
  successText: 'Our team will get back to you within one working day.',
  resetLabel: 'Send another enquiry',
} as const

export const CONTACT_INFO_COPY = {
  title: 'Get in touch',
  text: 'Prefer to talk? Reach us by phone or email, or send the form and we’ll call you back.',
} as const

export const MARKETING_FOOTER_GROUPS: MarketingFooterGroup[] = [
  {
    id: 'footer-services',
    title: 'Services',
    links: MARKETING_SERVICES.slice(0, 5).map((service) => ({
      id: `footer-${service.id}`,
      label: service.title,
      to: servicesHash,
    })),
  },
  {
    id: 'footer-company',
    title: 'Company',
    links: [
      { id: 'footer-about', label: 'About Us', to: routePaths.marketing.about },
      { id: 'footer-pricing', label: 'Pricing', to: routePaths.marketing.pricing },
      { id: 'footer-contact', label: 'Contact', to: routePaths.marketing.contact },
      { id: 'footer-faq', label: 'FAQ', to: faqHash },
    ],
  },
  {
    id: 'footer-legal',
    title: 'Legal',
    links: [
      { id: 'footer-terms', label: 'Terms of Service', to: routePaths.legal.terms },
      { id: 'footer-privacy', label: 'Privacy Policy', to: routePaths.legal.privacy },
    ],
  },
]

export const MARKETING_PAGE_META: Record<'home' | 'pricing' | 'about' | 'contact', PageMeta> = {
  home: {
    title: `${appConfig.name} – Tax, GST & Business Compliance Simplified`,
    description: MARKETING_BRAND.description,
  },
  pricing: {
    title: `Pricing – ${appConfig.name}`,
    description: 'Transparent professional fees for ITR, GST, company incorporation and more.',
  },
  about: {
    title: `About Us – ${appConfig.name}`,
    description: `Learn how ${appConfig.name} helps individuals and businesses stay compliant and grow.`,
  },
  contact: {
    title: `Contact – ${appConfig.name}`,
    description: 'Talk to our tax and compliance experts. We usually reply within one working day.',
  },
}
