import { appConfig } from '@core/config'
import type { MarketingFeature, MarketingSectionCopy } from '../types/marketing.types'

export const ABOUT_HERO: MarketingSectionCopy = {
  eyebrow: 'About Us',
  title: `Making compliance effortless for every Indian business`,
  subtitle: `${appConfig.name} brings chartered accountants, tax experts and a secure digital platform together so individuals and businesses can file, register and grow without the paperwork.`,
}

export const ABOUT_STORY = {
  title: 'Our story',
  paragraphs: [
    'We started with a simple belief: taxes and compliance should not slow anyone down. Too many people lose time and money to complex forms, missed deadlines and unclear fees.',
    `Today ${appConfig.name} helps thousands of salaried professionals, small businesses and startups handle ITR, GST, incorporation, loans and insurance from one dashboard — with real experts behind every application.`,
  ],
  imageSrc: '/assets/images/dashboard/tax-calculator-hero.png',
  imageAlt: 'Tax experts reviewing filings',
} as const

export const ABOUT_VALUES_SECTION: MarketingSectionCopy = {
  eyebrow: 'What drives us',
  title: 'Our mission & values',
  subtitle: 'The principles behind every filing we handle.',
}

export const ABOUT_VALUES: MarketingFeature[] = [
  {
    id: 'value-mission',
    icon: 'target',
    title: 'Mission',
    description: 'Make tax and business compliance simple, affordable and stress free for everyone.',
  },
  {
    id: 'value-vision',
    icon: 'eye',
    title: 'Vision',
    description: 'Become India’s most trusted platform for personal and business finance compliance.',
  },
  {
    id: 'value-trust',
    icon: 'handshake',
    title: 'Integrity',
    description: 'Honest advice, transparent fees and complete confidentiality, always.',
  },
  {
    id: 'value-excellence',
    icon: 'award',
    title: 'Excellence',
    description: 'Expert-reviewed work that is accurate the first time and delivered on time.',
  },
]
