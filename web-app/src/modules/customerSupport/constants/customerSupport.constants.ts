import type {
  SupportContactMethod,
  SupportConversation,
  SupportExecutive,
} from '../types/customerSupport.types'

export const SUPPORT_EXECUTIVES: SupportExecutive[] = [
  {
    id: 'exec_rohit',
    name: 'Rohit Kulkarni',
    role: 'Senior GST Specialist',
    department: 'GST Services & Filing',
    avatarInitials: 'RK',
    avatarColor: '#059669',
    status: 'Online',
    responseTime: 'Replies in ~2 mins',
    phone: '+91 20 4141 8800',
    email: 'rohit.k@taxedge.in',
  },
  {
    id: 'exec_meera',
    name: 'CA Meera Iyer',
    role: 'Tax Advisory Executive',
    department: 'Direct Tax & ITR Filing',
    avatarInitials: 'MI',
    avatarColor: '#032b69',
    status: 'Online',
    responseTime: 'Replies in ~5 mins',
    phone: '+91 20 4141 8801',
    email: 'meera.i@taxedge.in',
  },
  {
    id: 'exec_ananya',
    name: 'Ananya Deshmukh',
    role: 'Corporate Compliance Officer',
    department: 'Company Incorporation & Business',
    avatarInitials: 'AD',
    avatarColor: '#ea580c',
    status: 'Online',
    responseTime: 'Replies in ~4 mins',
    phone: '+91 20 4141 8804',
    email: 'ananya.d@taxedge.in',
  },
  {
    id: 'exec_sameer',
    name: 'Sameer Joshi',
    role: 'Credit & Loan Manager',
    department: 'MSME & Business Credit',
    avatarInitials: 'SJ',
    avatarColor: '#D97706',
    status: 'Away',
    responseTime: 'Replies within 30 mins',
    phone: '+91 20 4141 8802',
    email: 'sameer.j@taxedge.in',
  },
  {
    id: 'exec_sneha',
    name: 'Sneha Patil',
    role: 'Underwriting Executive',
    department: 'General & Health Insurance',
    avatarInitials: 'SP',
    avatarColor: '#7C3AED',
    status: 'Online',
    responseTime: 'Replies in ~10 mins',
    phone: '+91 20 4141 8803',
    email: 'sneha.p@taxedge.in',
  },
]

export const QUICK_SUPPORT_TOPICS = [
  'Track my application',
  'Document help',
  'Payment issue',
  'Talk to an expert',
]

export const INITIAL_SUPPORT_CONVERSATIONS: Record<string, SupportConversation> = {}

export const SUPPORT_CONTACT_METHODS: SupportContactMethod[] = [
  {
    id: 'contact_phone',
    type: 'phone',
    label: 'Direct Helpline',
    value: '+91 20 4141 8800',
    actionUrl: 'tel:+912041418800',
    icon: 'phone',
  },
  {
    id: 'contact_whatsapp',
    type: 'whatsapp',
    label: 'WhatsApp Support',
    value: '+91 98220 41880',
    actionUrl: 'https://wa.me/919822041880',
    icon: 'whatsapp',
  },
  {
    id: 'contact_email',
    type: 'email',
    label: 'Helpdesk Email',
    value: 'support@taxedge.in',
    actionUrl: 'mailto:support@taxedge.in',
    icon: 'email',
  },
  {
    id: 'contact_hours',
    type: 'hours',
    label: 'Operating Hours',
    value: 'Mon–Sat: 09:30 AM to 07:30 PM IST',
    icon: 'clock',
  },
]

export const SECURITY_NOTICE_CONTENT = {
  title: 'TaxEdge Security & Privacy Guarantee',
  body: 'Your data is encrypted end-to-end. Our staff will never request confidential banking OTPs, login passwords, or UPI PINs.',
}

/** Longest single chat message a customer can send. */
export const SUPPORT_MESSAGE_MAX_LENGTH = 1000
