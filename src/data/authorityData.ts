import { IndianState } from '@/types';

export interface Authority {
  id: string;
  name: string;
  description: string;
  category: AuthorityCategory;
  phone?: string;
  website?: string;
  complaintPortal?: string;
  address?: string;
}

export type AuthorityCategory =
  | 'legal_services'
  | 'consumer'
  | 'police'
  | 'labour'
  | 'msme'
  | 'women'
  | 'cyber'
  | 'property'
  | 'court';

export const AUTHORITY_CATEGORY_LABELS: Record<AuthorityCategory, string> = {
  legal_services: 'Legal Services Authority',
  consumer: 'Consumer Court / Forum',
  police: 'Police Complaint Portal',
  labour: 'Labour Commissioner',
  msme: 'MSME Grievance Portal',
  women: 'Women Helpline',
  cyber: 'Cybercrime Portal',
  property: 'Property / Revenue',
  court: 'Courts & Tribunals',
};

export const ISSUE_TO_AUTHORITY: Record<string, AuthorityCategory[]> = {
  property: ['property', 'legal_services', 'court'],
  consumer: ['consumer'],
  labour: ['labour', 'legal_services'],
  cyber: ['cyber', 'police'],
  family: ['women', 'legal_services', 'court'],
  criminal: ['police', 'court'],
  corporate: ['msme', 'consumer'],
  civil: ['court', 'legal_services'],
};

// National authorities available in all states
const NATIONAL_AUTHORITIES: Authority[] = [
  { id: 'nalsa', name: 'NALSA (National Legal Services Authority)', description: 'Free legal aid for eligible citizens', category: 'legal_services', phone: '15100', website: 'https://nalsa.gov.in' },
  { id: 'ncdrc', name: 'National Consumer Disputes Redressal Commission', description: 'Consumer complaints above ₹2 crore', category: 'consumer', phone: '1800-11-4000', website: 'https://ncdrc.nic.in', complaintPortal: 'https://edaakhil.nic.in' },
  { id: 'nch', name: 'National Consumer Helpline', description: 'Register consumer complaints online', category: 'consumer', phone: '1800-11-4000', website: 'https://consumerhelpline.gov.in', complaintPortal: 'https://consumerhelpline.gov.in' },
  { id: 'cybercrime-gov', name: 'National Cyber Crime Reporting Portal', description: 'Report cybercrimes including financial fraud and social media crimes', category: 'cyber', phone: '1930', website: 'https://cybercrime.gov.in', complaintPortal: 'https://cybercrime.gov.in' },
  { id: 'women-helpline', name: 'Women Helpline (NCW)', description: '24/7 helpline for women in distress', category: 'women', phone: '181', website: 'http://ncw.nic.in' },
  { id: 'she-box', name: 'SHe-Box (Sexual Harassment Portal)', description: 'Report workplace sexual harassment', category: 'women', website: 'https://shebox.wcd.gov.in', complaintPortal: 'https://shebox.wcd.gov.in' },
  { id: 'msme-samadhan', name: 'MSME Samadhaan', description: 'Delayed payment monitoring for MSMEs', category: 'msme', website: 'https://samadhaan.msme.gov.in', complaintPortal: 'https://samadhaan.msme.gov.in' },
  { id: 'msme-champions', name: 'CHAMPIONS Portal', description: 'MSME grievance redressal and support', category: 'msme', phone: '011-23063288', website: 'https://champions.gov.in', complaintPortal: 'https://champions.gov.in' },
  { id: 'ecourts', name: 'e-Courts Services', description: 'Case status, court orders & cause lists', category: 'court', website: 'https://services.ecourts.gov.in' },
  { id: 'clc', name: 'Chief Labour Commissioner (Central)', description: 'Central labour complaints and disputes', category: 'labour', phone: '011-23710240', website: 'https://clc.gov.in' },
];

const stateAuthorities: Partial<Record<IndianState, Authority[]>> = {
  Maharashtra: [
    { id: 'mh-slsa', name: 'Maharashtra State Legal Services Authority', description: 'Free legal aid and Lok Adalats', category: 'legal_services', phone: '022-22025553', website: 'https://mslsa.gov.in' },
    { id: 'mh-consumer', name: 'Maharashtra State Consumer Commission', description: 'Consumer disputes ₹1–2 crore', category: 'consumer', website: 'https://consumer.maharashtra.gov.in' },
    { id: 'mh-police', name: 'Maharashtra Police Citizen Portal', description: 'File FIR, complaints & verifications', category: 'police', phone: '112', website: 'https://citizen.mahapolice.gov.in', complaintPortal: 'https://citizen.mahapolice.gov.in' },
    { id: 'mh-labour', name: 'Maharashtra Labour Commissioner', description: 'Labour disputes, wages & PF issues', category: 'labour', website: 'https://mahakamgar.maharashtra.gov.in' },
    { id: 'mh-rera', name: 'MahaRERA', description: 'Real estate complaints & project status', category: 'property', phone: '1800-123-6725', website: 'https://maharera.mahaonline.gov.in', complaintPortal: 'https://maharera.mahaonline.gov.in' },
    { id: 'mh-igr', name: 'IGR Maharashtra', description: 'Property registration & stamp duty', category: 'property', website: 'https://igrmaharashtra.gov.in' },
    { id: 'mh-women', name: 'Maharashtra State Women Commission', description: 'Women rights protection', category: 'women', phone: '022-26592707', website: 'https://mscw.maharashtra.gov.in' },
    { id: 'mh-cyber', name: 'Maharashtra Cyber Police', description: 'Cybercrime complaints for Maharashtra', category: 'cyber', website: 'https://citizen.mahapolice.gov.in' },
  ],
  Karnataka: [
    { id: 'ka-slsa', name: 'Karnataka State Legal Services Authority', description: 'Free legal aid & Lok Adalats', category: 'legal_services', phone: '080-22113854', website: 'https://kslsa.kar.nic.in' },
    { id: 'ka-consumer', name: 'Karnataka State Consumer Commission', description: 'Consumer disputes for Karnataka', category: 'consumer', website: 'https://karscdrc.kar.nic.in' },
    { id: 'ka-police', name: 'Karnataka State Police', description: 'File complaints & FIR online', category: 'police', phone: '100', website: 'https://ksp.karnataka.gov.in', complaintPortal: 'https://ksp.karnataka.gov.in' },
    { id: 'ka-labour', name: 'Karnataka Labour Department', description: 'Employment and labour disputes', category: 'labour', website: 'https://labour.karnataka.gov.in' },
    { id: 'ka-rera', name: 'K-RERA', description: 'Real estate regulatory complaints', category: 'property', website: 'https://rera.karnataka.gov.in', complaintPortal: 'https://rera.karnataka.gov.in' },
    { id: 'ka-kaveri', name: 'Kaveri Online Services', description: 'Property registration & encumbrance', category: 'property', website: 'https://kaverionline.karnataka.gov.in' },
    { id: 'ka-women', name: 'Karnataka Women Commission', description: 'Women rights and protection', category: 'women', phone: '181', website: 'https://kswc.karnataka.gov.in' },
    { id: 'ka-cyber', name: 'Karnataka CEN Police', description: 'Cybercrime, Economic & Narcotics wing', category: 'cyber', website: 'https://ksp.karnataka.gov.in' },
  ],
  Delhi: [
    { id: 'dl-slsa', name: 'Delhi State Legal Services Authority', description: 'Free legal aid services in Delhi', category: 'legal_services', phone: '011-23385014', website: 'https://dslsa.org' },
    { id: 'dl-consumer', name: 'Delhi State Consumer Commission', description: 'Consumer forum for Delhi NCR', category: 'consumer', website: 'https://ncdrc.nic.in' },
    { id: 'dl-police', name: 'Delhi Police', description: 'File FIR, complaints & tenant verification', category: 'police', phone: '112', website: 'https://delhipolice.gov.in', complaintPortal: 'https://delhipolice.gov.in' },
    { id: 'dl-labour', name: 'Delhi Labour Department', description: 'Wage disputes and labour complaints', category: 'labour', website: 'https://labour.delhi.gov.in' },
    { id: 'dl-revenue', name: 'Delhi Revenue Department', description: 'Property registration & mutation', category: 'property', website: 'https://revenue.delhi.gov.in' },
    { id: 'dl-dcw', name: 'Delhi Commission for Women', description: 'Women protection and helpline', category: 'women', phone: '181', website: 'https://dcw.delhigovt.nic.in' },
    { id: 'dl-cyber', name: 'Delhi Cyber Crime Cell', description: 'Report cybercrimes in Delhi', category: 'cyber', phone: '011-26882888', website: 'https://delhipolice.gov.in' },
  ],
  'Tamil Nadu': [
    { id: 'tn-slsa', name: 'Tamil Nadu State Legal Services Authority', description: 'Free legal aid & Lok Adalats', category: 'legal_services', website: 'https://tnslsa.tn.gov.in' },
    { id: 'tn-consumer', name: 'TN State Consumer Commission', description: 'Consumer disputes for Tamil Nadu', category: 'consumer', website: 'https://tncdrc.gov.in' },
    { id: 'tn-police', name: 'Tamil Nadu Police', description: 'File complaints & FIR', category: 'police', phone: '100', website: 'https://eservices.tnpolice.gov.in', complaintPortal: 'https://eservices.tnpolice.gov.in' },
    { id: 'tn-labour', name: 'TN Labour Department', description: 'Labour welfare and disputes', category: 'labour', website: 'https://labour.tn.gov.in' },
    { id: 'tn-rera', name: 'TNRERA', description: 'Real estate complaints', category: 'property', website: 'https://tnrera.in', complaintPortal: 'https://tnrera.in' },
    { id: 'tn-reginet', name: 'TNREGINET', description: 'Property registration services', category: 'property', website: 'https://tnreginet.gov.in' },
    { id: 'tn-women', name: 'TN State Women Commission', description: 'Women protection and welfare', category: 'women', phone: '181', website: 'https://tnspc.gov.in' },
    { id: 'tn-cyber', name: 'TN Cyber Crime Wing', description: 'Report cyber offences in Tamil Nadu', category: 'cyber', website: 'https://eservices.tnpolice.gov.in' },
  ],
  Rajasthan: [
    { id: 'rj-slsa', name: 'Rajasthan State Legal Services Authority', description: 'Free legal aid & awareness', category: 'legal_services', website: 'https://rlsa.gov.in' },
    { id: 'rj-consumer', name: 'Rajasthan State Consumer Commission', description: 'Consumer disputes for Rajasthan', category: 'consumer', website: 'https://consumeraffairs.rajasthan.gov.in' },
    { id: 'rj-police', name: 'Rajasthan Police', description: 'File FIR and complaints', category: 'police', phone: '100', website: 'https://police.rajasthan.gov.in', complaintPortal: 'https://police.rajasthan.gov.in' },
    { id: 'rj-labour', name: 'Rajasthan Labour Department', description: 'Labour disputes and welfare', category: 'labour', website: 'https://labour.rajasthan.gov.in' },
    { id: 'rj-rera', name: 'Rajasthan RERA', description: 'Real estate complaints', category: 'property', website: 'https://rera.rajasthan.gov.in', complaintPortal: 'https://rera.rajasthan.gov.in' },
    { id: 'rj-women', name: 'Rajasthan State Women Commission', description: 'Women rights and protection', category: 'women', phone: '181', website: 'https://wcd.rajasthan.gov.in' },
    { id: 'rj-cyber', name: 'Rajasthan Cyber Crime Cell', description: 'Report cybercrimes in Rajasthan', category: 'cyber', website: 'https://police.rajasthan.gov.in' },
  ],
  Kerala: [
    { id: 'kl-slsa', name: 'Kerala State Legal Services Authority', description: 'Free legal aid services', category: 'legal_services', website: 'https://kelsa.nic.in' },
    { id: 'kl-consumer', name: 'Kerala State Consumer Commission', description: 'Consumer disputes for Kerala', category: 'consumer', website: 'https://kerscdrc.kerala.gov.in' },
    { id: 'kl-police', name: 'Kerala Police', description: 'File complaints & FIR', category: 'police', phone: '100', website: 'https://keralapolice.gov.in', complaintPortal: 'https://keralapolice.gov.in' },
    { id: 'kl-labour', name: 'Kerala Labour Commissioner', description: 'Labour disputes and PF issues', category: 'labour', website: 'https://labour.kerala.gov.in' },
    { id: 'kl-rera', name: 'Kerala RERA', description: 'Real estate complaints', category: 'property', website: 'https://rera.kerala.gov.in', complaintPortal: 'https://rera.kerala.gov.in' },
    { id: 'kl-women', name: 'Kerala Women Commission', description: 'Women welfare and complaints', category: 'women', phone: '181', website: 'https://kswc.kerala.gov.in' },
    { id: 'kl-cyber', name: 'Kerala Cyber Crime Cell', description: 'Report cybercrimes in Kerala', category: 'cyber', website: 'https://keralapolice.gov.in' },
  ],
  Gujarat: [
    { id: 'gj-slsa', name: 'Gujarat State Legal Services Authority', description: 'Free legal aid services', category: 'legal_services', website: 'https://gujslsa.org' },
    { id: 'gj-consumer', name: 'Gujarat State Consumer Commission', description: 'Consumer disputes for Gujarat', category: 'consumer', website: 'https://consumer.gujarat.gov.in' },
    { id: 'gj-police', name: 'Gujarat Police', description: 'File complaints & FIR', category: 'police', phone: '112', website: 'https://police.gujarat.gov.in', complaintPortal: 'https://police.gujarat.gov.in' },
    { id: 'gj-labour', name: 'Gujarat Labour Commissioner', description: 'Labour welfare and disputes', category: 'labour', website: 'https://labour.gujarat.gov.in' },
    { id: 'gj-rera', name: 'GujRERA', description: 'Real estate complaints', category: 'property', website: 'https://gujrera.gujarat.gov.in', complaintPortal: 'https://gujrera.gujarat.gov.in' },
    { id: 'gj-women', name: 'Gujarat State Women Commission', description: 'Women protection services', category: 'women', phone: '181', website: 'https://wcd.gujarat.gov.in' },
    { id: 'gj-cyber', name: 'Gujarat Cyber Crime Cell', description: 'Report cybercrimes in Gujarat', category: 'cyber', website: 'https://police.gujarat.gov.in' },
  ],
  'Uttar Pradesh': [
    { id: 'up-slsa', name: 'UP State Legal Services Authority', description: 'Free legal aid & Lok Adalats', category: 'legal_services', website: 'https://upslsa.gov.in' },
    { id: 'up-consumer', name: 'UP State Consumer Commission', description: 'Consumer disputes for UP', category: 'consumer', website: 'https://consumer.up.gov.in' },
    { id: 'up-police', name: 'UP Police', description: 'File FIR & complaints online', category: 'police', phone: '112', website: 'https://uppolice.gov.in', complaintPortal: 'https://uppolice.gov.in' },
    { id: 'up-labour', name: 'UP Labour Department', description: 'Labour welfare and wage disputes', category: 'labour', website: 'https://uplabour.gov.in' },
    { id: 'up-rera', name: 'UP-RERA', description: 'Real estate regulatory authority (very active)', category: 'property', website: 'https://up-rera.in', complaintPortal: 'https://up-rera.in' },
    { id: 'up-women', name: 'UP Women Commission', description: 'Women rights and protection', category: 'women', phone: '181', website: 'https://mahilakalyan.up.nic.in' },
    { id: 'up-cyber', name: 'UP Cyber Crime Cell', description: 'Report cybercrimes in UP', category: 'cyber', website: 'https://uppolice.gov.in' },
  ],
};

const defaultAuthorities: Authority[] = [
  { id: 'def-slsa', name: 'District Legal Services Authority', description: 'Free legal aid for eligible citizens in your district', category: 'legal_services', phone: '15100' },
  { id: 'def-consumer', name: 'District Consumer Forum', description: 'Consumer disputes up to ₹1 crore', category: 'consumer', phone: '1800-11-4000', complaintPortal: 'https://edaakhil.nic.in' },
  { id: 'def-police', name: 'State Police', description: 'File FIR and complaints', category: 'police', phone: '100' },
  { id: 'def-labour', name: 'Labour Commissioner Office', description: 'Labour and wage dispute resolution', category: 'labour' },
  { id: 'def-women', name: 'Women Helpline', description: 'Women in distress helpline', category: 'women', phone: '181' },
  { id: 'def-cyber', name: 'Cybercrime Portal', description: 'National portal for cybercrime complaints', category: 'cyber', phone: '1930', complaintPortal: 'https://cybercrime.gov.in' },
];

export function getAuthoritiesForState(state?: string): Authority[] {
  const stateSpecific = state ? (stateAuthorities[state as IndianState] || defaultAuthorities) : defaultAuthorities;
  return [...stateSpecific, ...NATIONAL_AUTHORITIES];
}

export function getAuthoritiesByIssue(state: string | undefined, issueCategory: string): Authority[] {
  const all = getAuthoritiesForState(state);
  const relevantCategories = ISSUE_TO_AUTHORITY[issueCategory];
  if (!relevantCategories) return all;
  return all.filter(a => relevantCategories.includes(a.category));
}

export function searchAuthorities(authorities: Authority[], query: string): Authority[] {
  const lower = query.toLowerCase();
  return authorities.filter(a =>
    a.name.toLowerCase().includes(lower) ||
    a.description.toLowerCase().includes(lower) ||
    a.category.toLowerCase().includes(lower)
  );
}
