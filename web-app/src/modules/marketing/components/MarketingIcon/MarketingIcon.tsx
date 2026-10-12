import {
  Activity,
  Award,
  BadgeCheck,
  Clock,
  Eye,
  FileCheck,
  HeartHandshake,
  Headset,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import type { LucideIcon, LucideProps } from 'lucide-react'
import type { MarketingIconName } from '../../types/marketing.types'

const ICONS: Record<MarketingIconName, LucideIcon> = {
  shield: ShieldCheck,
  zap: Zap,
  headset: Headset,
  'user-plus': UserPlus,
  upload: Upload,
  'file-check': FileCheck,
  activity: Activity,
  'badge-check': BadgeCheck,
  clock: Clock,
  users: Users,
  'map-pin': MapPin,
  star: Star,
  phone: Phone,
  mail: Mail,
  message: MessageCircle,
  lock: Lock,
  'trending-up': TrendingUp,
  award: Award,
  target: Target,
  eye: Eye,
  handshake: HeartHandshake,
}

export interface MarketingIconProps extends LucideProps {
  name: MarketingIconName
}

/** Resolves an icon key from the content data to the matching lucide icon */
export const MarketingIcon = ({ name, ...rest }: MarketingIconProps) => {
  const Icon = ICONS[name]
  return <Icon aria-hidden="true" {...rest} />
}
