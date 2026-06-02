import { IndianState } from '@/types';

export interface StateAuthority {
  name: string;
  department: string;
  url?: string;
  helpline?: string;
}

export interface StatePortal {
  name: string;
  url: string;
  description: string;
}

export interface StateLegalInfo {
  quickFacts: string[];
  authorities: StateAuthority[];
  portals: StatePortal[];
  commonIssues: string[];
  stampDuty: string;
  policeVerification: string;
  rentControl: string;
}

// Comprehensive state data map
const stateDataMap: Partial<Record<IndianState, StateLegalInfo>> = {
  Maharashtra: {
    quickFacts: [
      'Stamp duty: 3-6% (women get 1% concession)',
      'Rent increase capped at 4% per annum',
      'Police verification within 15 days of tenancy',
      'MahaRERA for real estate complaints',
    ],
    authorities: [
      { name: 'MahaRERA', department: 'Real Estate Regulatory Authority', url: 'https://maharera.mahaonline.gov.in', helpline: '1800-123-6725' },
      { name: 'Mumbai Police', department: 'Police Verification', url: 'https://mumbaipolice.gov.in' },
      { name: 'IGR Maharashtra', department: 'Property Registration', url: 'https://igrmaharashtra.gov.in' },
    ],
    portals: [
      { name: 'MahaRERA', url: 'https://maharera.mahaonline.gov.in', description: 'Real estate complaints & project status' },
      { name: 'IGR Maharashtra', url: 'https://igrmaharashtra.gov.in', description: 'Property registration & stamp duty' },
      { name: 'Maharashtra e-Courts', url: 'https://districts.ecourts.gov.in/maharashtra', description: 'Case status & court info' },
    ],
    commonIssues: ['Tenant eviction disputes', 'Property registration delays', 'RERA complaints', 'Housing society disputes', 'Domestic violence cases'],
    stampDuty: '3-6% depending on location. Women get 1% concession.',
    policeVerification: 'Mandatory within 15 days. Submit Form-V at nearest police station.',
    rentControl: 'Maharashtra Rent Control Act 1999. Rent increase capped at 4% per annum.',
  },
  Karnataka: {
    quickFacts: [
      'Stamp duty: 2-5% based on property value',
      'Rent agreement must be registered if >11 months',
      'Online tenant verification via Kaveri portal',
      'K-RERA for projects >500 sq.m or 8 units',
    ],
    authorities: [
      { name: 'K-RERA', department: 'Real Estate Regulatory Authority', url: 'https://rera.karnataka.gov.in' },
      { name: 'Karnataka Police', department: 'Police Services', url: 'https://ksp.karnataka.gov.in', helpline: '100' },
      { name: 'Kaveri Online', department: 'Property Registration', url: 'https://kaverionline.karnataka.gov.in' },
    ],
    portals: [
      { name: 'K-RERA', url: 'https://rera.karnataka.gov.in', description: 'Real estate regulatory complaints' },
      { name: 'Kaveri Online', url: 'https://kaverionline.karnataka.gov.in', description: 'Property registration services' },
      { name: 'Karnataka e-Courts', url: 'https://districts.ecourts.gov.in/karnataka', description: 'Court case status' },
    ],
    commonIssues: ['Deposit return disputes', 'Unauthorized construction', 'Land encroachment', 'Consumer complaints', 'IT sector labour issues'],
    stampDuty: '2% below ₹20L, 3% ₹21-45L, 5% above ₹45L.',
    policeVerification: 'Online via Kaveri portal within 7 days of occupancy.',
    rentControl: 'Karnataka Rent Act 1999. Registration mandatory for leases >11 months.',
  },
  Delhi: {
    quickFacts: [
      'Stamp duty: 4% for women, 6% for men',
      'Circle rates vary by colony category (A-H)',
      'Online tenant verification within 3 days',
      'Consumer Forum handles claims up to ₹1 crore',
    ],
    authorities: [
      { name: 'Delhi Revenue Dept', department: 'Revenue & Land', url: 'https://revenue.delhi.gov.in' },
      { name: 'Delhi Police', department: 'Police Verification', url: 'https://delhipolice.gov.in', helpline: '112' },
      { name: 'DDA', department: 'Development Authority', url: 'https://dda.gov.in' },
    ],
    portals: [
      { name: 'Delhi Revenue Dept', url: 'https://revenue.delhi.gov.in', description: 'Property & revenue services' },
      { name: 'Delhi Police', url: 'https://delhipolice.gov.in', description: 'FIR, verification & complaints' },
      { name: 'Delhi e-Courts', url: 'https://districts.ecourts.gov.in/delhi', description: 'Case tracking & court info' },
    ],
    commonIssues: ['Unauthorized colony issues', 'DDA flat disputes', 'Tenant eviction', 'Traffic challans', 'Property mutation delays'],
    stampDuty: '4% for women, 6% for men. Circle rates vary by colony category.',
    policeVerification: 'Online through Delhi Police website. Mandatory within 3 days.',
    rentControl: 'Delhi Rent Control Act for pre-1988 premises. New tenancies under Model Tenancy Act.',
  },
  'Tamil Nadu': {
    quickFacts: [
      'Stamp duty: 7%, Registration fee: 4%',
      'Women get 1% stamp duty concession',
      'Fair rent fixed by Rent Controller',
      'TNRERA for projects >500 sq.m or 8 apartments',
    ],
    authorities: [
      { name: 'TNRERA', department: 'Real Estate Regulatory Authority', url: 'https://tnrera.in' },
      { name: 'TNREGINET', department: 'Property Registration', url: 'https://tnreginet.gov.in' },
      { name: 'TN Police', department: 'Police Services', url: 'https://eservices.tnpolice.gov.in' },
    ],
    portals: [
      { name: 'TNRERA', url: 'https://tnrera.in', description: 'Real estate complaints' },
      { name: 'TNREGINET', url: 'https://tnreginet.gov.in', description: 'Property registration' },
      { name: 'TN e-Courts', url: 'https://districts.ecourts.gov.in/tamilnadu', description: 'Court case status' },
    ],
    commonIssues: ['Land grabbing', 'Temple land disputes', 'Labour court cases', 'Cooperative frauds', 'Motor accident claims'],
    stampDuty: '7% stamp duty + 4% registration fee. Women get 1% concession.',
    policeVerification: 'Through local police station within 15 days.',
    rentControl: 'TN Buildings (Lease & Rent Control) Act. Fair rent determined by Rent Controller.',
  },
  Rajasthan: {
    quickFacts: [
      'Stamp duty: 5% for men, 4% for women',
      'Registration fee: 1%',
      'RERA registration for projects >500 sq.m',
      'Tenant verification within 10 days',
    ],
    authorities: [
      { name: 'Rajasthan RERA', department: 'Real Estate Regulatory Authority', url: 'https://rera.rajasthan.gov.in' },
      { name: 'e-Panjiyan', department: 'Property Registration', url: 'https://epanjiyan.raj.nic.in' },
      { name: 'Rajasthan Police', department: 'Police Services', url: 'https://police.rajasthan.gov.in' },
    ],
    portals: [
      { name: 'Rajasthan RERA', url: 'https://rera.rajasthan.gov.in', description: 'Real estate complaints' },
      { name: 'e-Panjiyan', url: 'https://epanjiyan.raj.nic.in', description: 'Property registration' },
      { name: 'Rajasthan e-Courts', url: 'https://districts.ecourts.gov.in/rajasthan', description: 'Court info' },
    ],
    commonIssues: ['Agricultural land conversion', 'Tribal land protection', 'Mining lease conflicts', 'Child marriage cases', 'Water rights disputes'],
    stampDuty: '5% for men, 4% for women. Registration fee 1%.',
    policeVerification: 'Via Rajasthan Police portal within 10 days.',
    rentControl: 'Rajasthan Rent Control Act 2001. Protects against arbitrary eviction in urban areas.',
  },
  Kerala: {
    quickFacts: [
      'Stamp duty: 8%, Registration fee: 2%',
      'One of the highest stamp duties in India',
      'Strict CRZ restrictions along coastline',
      'Special paddy land conversion rules',
    ],
    authorities: [
      { name: 'Kerala RERA', department: 'Real Estate Regulatory Authority', url: 'https://rera.kerala.gov.in' },
      { name: 'Kerala Registration', department: 'Property Registration', url: 'https://keralaregistration.gov.in' },
      { name: 'Kerala Police', department: 'Police Services', url: 'https://keralapolice.gov.in' },
    ],
    portals: [
      { name: 'Kerala RERA', url: 'https://rera.kerala.gov.in', description: 'Real estate complaints' },
      { name: 'Kerala Registration', url: 'https://keralaregistration.gov.in', description: 'Property registration' },
      { name: 'Kerala e-Courts', url: 'https://districts.ecourts.gov.in/kerala', description: 'Court case status' },
    ],
    commonIssues: ['CRZ violations', 'Paddy land conversion', 'Labour union disputes', 'NRI property inheritance', 'Consumer protection cases'],
    stampDuty: '8% stamp duty + 2% registration fee.',
    policeVerification: 'Online through Kerala Police portal. Mandatory for all tenants.',
    rentControl: 'Kerala Buildings (Lease & Rent Control) Act. Fair rent by Rent Control Court.',
  },
  Gujarat: {
    quickFacts: [
      'Stamp duty: 4.9% (3.5% stamp + 1% registration + 0.4% surcharge)',
      'Women get reduced stamp duty at 3.5%',
      'GujRERA for real estate complaints',
      'Tenant verification mandatory',
    ],
    authorities: [
      { name: 'GujRERA', department: 'Real Estate Regulatory Authority', url: 'https://gujrera.gujarat.gov.in' },
      { name: 'Gujarat Police', department: 'Police Services', url: 'https://police.gujarat.gov.in' },
    ],
    portals: [
      { name: 'GujRERA', url: 'https://gujrera.gujarat.gov.in', description: 'Real estate complaints' },
      { name: 'Gujarat e-Courts', url: 'https://districts.ecourts.gov.in/gujarat', description: 'Court case status' },
    ],
    commonIssues: ['Industrial land disputes', 'SEZ-related issues', 'Labour law violations', 'Consumer complaints', 'Property registration delays'],
    stampDuty: '4.9% total (stamp + registration + surcharge). Women get reduced rates.',
    policeVerification: 'Through local police station.',
    rentControl: 'Gujarat Rent Control Act. Applicable in urban areas.',
  },
  'Uttar Pradesh': {
    quickFacts: [
      'Stamp duty: 7% for men, 6% for women',
      'Registration fee: 1%',
      'UP-RERA is one of the most active in India',
      'Police verification within 24 hours online',
    ],
    authorities: [
      { name: 'UP-RERA', department: 'Real Estate Regulatory Authority', url: 'https://up-rera.in' },
      { name: 'UP Police', department: 'Police Services', url: 'https://uppolice.gov.in' },
    ],
    portals: [
      { name: 'UP-RERA', url: 'https://up-rera.in', description: 'Real estate complaints (very active)' },
      { name: 'UP e-Courts', url: 'https://districts.ecourts.gov.in/up', description: 'Court case tracking' },
    ],
    commonIssues: ['Builder-buyer disputes', 'Land acquisition issues', 'Police FIR delays', 'Property mutation', 'Labour wage disputes'],
    stampDuty: '7% for men, 6% for women. Registration fee 1%.',
    policeVerification: 'Online via UP Police portal within 24 hours.',
    rentControl: 'UP Urban Buildings (Regulation of Letting, Rent & Eviction) Act.',
  },
};

// Default info for states not in the detailed map
const defaultStateInfo: StateLegalInfo = {
  quickFacts: [
    'Contact your District Legal Services Authority for free legal aid',
    'NALSA helpline: 15100 for legal assistance',
    'File consumer complaints online at consumerhelpline.gov.in',
    'e-Courts portal available for case tracking',
  ],
  authorities: [
    { name: 'District Legal Services Authority', department: 'Free Legal Aid', helpline: '15100' },
    { name: 'State Consumer Commission', department: 'Consumer Disputes' },
    { name: 'State Police', department: 'Law & Order', helpline: '100' },
  ],
  portals: [
    { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', description: 'File consumer complaints' },
    { name: 'e-Courts Services', url: 'https://services.ecourts.gov.in', description: 'Case status & court info' },
    { name: 'NALSA', url: 'https://nalsa.gov.in', description: 'Free legal aid services' },
  ],
  commonIssues: ['Property disputes', 'Consumer complaints', 'Labour issues', 'Police FIR filing', 'Rental disputes'],
  stampDuty: 'Varies by state. Contact local sub-registrar office.',
  policeVerification: 'Contact local police station for tenant verification.',
  rentControl: 'Check state-specific rent control act.',
};

export function getStateInfo(state?: string): StateLegalInfo {
  if (!state) return defaultStateInfo;
  return stateDataMap[state as IndianState] || defaultStateInfo;
}

export function getStateInfoExists(state?: string): boolean {
  if (!state) return false;
  return !!(stateDataMap[state as IndianState]);
}
