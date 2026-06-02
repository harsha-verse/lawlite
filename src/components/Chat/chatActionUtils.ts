// Legal category detection and matching utilities

export interface DetectedContext {
  categories: string[];
  needsLawyer: boolean;
  needsTemplate: boolean;
  needsGuide: boolean;
  isComplex: boolean;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  property: [
    'property', 'rent', 'rental', 'landlord', 'tenant', 'deposit', 'lease', 'house', 'flat', 'land',
    'real estate', 'sale deed', 'noc', 'stamp duty', 'registration', 'eviction', 'possession',
    // Hinglish & rural
    'zameen', 'jameen', 'ghar', 'makaan', 'kiraya', 'kirayedar', 'makan malik', 'kabza',
    'encroachment', 'boundary', 'plot', 'registry', 'mutation', 'land grab', 'bagal wala',
  ],
  family: [
    'divorce', 'marriage', 'custody', 'alimony', 'maintenance', 'dowry', 'domestic violence',
    'wife', 'husband', 'child', 'matrimonial', 'family', 'women', 'dv act',
    // Hinglish & rural
    'talaq', 'shaadi', 'biwi', 'pati', 'baccha', 'dahej', 'maarpeet', 'ghar ka jhagda',
    'sasural', 'separation', 'nikah',
  ],
  criminal: [
    'fir', 'police', 'arrest', 'bail', 'theft', 'fraud', 'cheating', 'assault', 'murder',
    'criminal', 'ipc', 'bns', 'complaint police',
    // Hinglish & rural
    'chori', 'dhoka', 'maar', 'dhamki', 'threat', 'kidnap', 'agwa', 'loot',
    'police complaint', 'thana', 'jail', 'giraftari',
  ],
  corporate: [
    'company', 'startup', 'business', 'gst', 'incorporation', 'partnership', 'msme',
    'trademark', 'copyright', 'patent', 'contract',
    // Hinglish
    'dukaan', 'vyapaar', 'karobaar', 'firm',
  ],
  civil: [
    'civil', 'dispute', 'contract', 'agreement', 'breach', 'damages', 'injunction', 'suit',
    'litigation',
    // Hinglish
    'jhagda', 'vivad', 'samjhauta', 'case file',
  ],
  cyber: [
    'cyber', 'online', 'internet', 'hacking', 'data', 'privacy', 'social media', 'it act',
    'digital', 'phishing', 'identity theft',
    // Hinglish
    'online fraud', 'online dhoka', 'upi fraud', 'otp fraud', 'whatsapp fraud',
  ],
  consumer: [
    'consumer', 'product', 'service', 'refund', 'defective', 'warranty', 'complaint',
    'e-commerce', 'shopping',
    // Hinglish & rural
    'saman kharab', 'paisa wapas', 'return nahi', 'nakli product', 'duplicate',
  ],
  labour: [
    'salary', 'wages', 'employer', 'employee', 'termination', 'fired', 'labour', 'labor',
    'pf', 'provident fund', 'gratuity', 'workplace', 'harassment work',
    // Hinglish & rural
    'tankhwah', 'naukri', 'nikala', 'paisa nahi diya', 'malik', 'kaam se nikala',
    'salary nahi', 'vetan', 'mazdoori', 'unpaid', 'not paid',
  ],
};

const TEMPLATE_KEYWORDS: Record<string, number[]> = {
  property: [18, 4, 5, 19, 20, 6],
  family: [15, 16, 17],
  consumer: [10, 11],
  corporate: [12, 13, 14],
  labour: [7, 8, 9],
  civil: [3, 1],
  criminal: [3],
  cyber: [11],
};

const COMPLEXITY_KEYWORDS = [
  'court', 'case', 'file case', 'sue', 'petition', 'hearing',
  'appeal', 'high court', 'supreme court', 'injunction', 'stay order',
  'compensation', 'damages', 'multiple', 'serious', 'urgent', 'emergency',
  // Hinglish & rural
  'adalat', 'kachehri', 'muqadma', 'case karna', 'court jaana',
  'bail chahiye', 'zamanat', 'notice aaya', 'summon', 'warrant',
];

export function detectContext(messageContent: string): DetectedContext {
  const lower = messageContent.toLowerCase();
  const categories: string[] = [];

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      categories.push(cat);
    }
  }

  const isComplex = COMPLEXITY_KEYWORDS.some((kw) => lower.includes(kw));

  return {
    categories: categories.length > 0 ? categories : ['civil'],
    needsLawyer: true,
    needsTemplate: categories.some((c) => TEMPLATE_KEYWORDS[c]?.length > 0),
    needsGuide: true,
    isComplex,
  };
}

export interface MatchedLawyer {
  id: number;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  experience: number;
  consultationFee: number;
  category: string;
}

const ALL_LAWYERS: MatchedLawyer[] = [
  { id: 1, name: 'Adv. Priya Sharma', specialization: 'Family Law', location: 'Mumbai', rating: 4.9, experience: 12, consultationFee: 2500, category: 'family' },
  { id: 2, name: 'Adv. Rajesh Kumar', specialization: 'Criminal Law', location: 'Delhi', rating: 4.8, experience: 15, consultationFee: 3000, category: 'criminal' },
  { id: 3, name: 'Adv. Meera Patel', specialization: 'Corporate Law', location: 'Bangalore', rating: 4.7, experience: 10, consultationFee: 4000, category: 'corporate' },
  { id: 4, name: 'Adv. Arjun Singh', specialization: 'Civil Law', location: 'Jaipur', rating: 4.6, experience: 8, consultationFee: 2000, category: 'civil' },
  { id: 5, name: 'Adv. Kavya Nair', specialization: 'Cyber Law', location: 'Kochi', rating: 4.8, experience: 6, consultationFee: 3500, category: 'cyber' },
  { id: 6, name: 'Adv. Rohit Gupta', specialization: 'Property Law', location: 'Pune', rating: 4.7, experience: 14, consultationFee: 2800, category: 'property' },
  { id: 7, name: 'Adv. Sunita Reddy', specialization: 'Family Law', location: 'Hyderabad', rating: 4.6, experience: 9, consultationFee: 2200, category: 'family' },
  { id: 8, name: 'Adv. Vikram Joshi', specialization: 'Criminal Law', location: 'Chennai', rating: 4.9, experience: 11, consultationFee: 3200, category: 'criminal' },
  { id: 9, name: 'Adv. Anita Deshmukh', specialization: 'Consumer Law', location: 'Pune', rating: 4.5, experience: 7, consultationFee: 1800, category: 'consumer' },
  { id: 10, name: 'Adv. Sanjay Verma', specialization: 'Labour Law', location: 'Delhi', rating: 4.7, experience: 13, consultationFee: 2500, category: 'labour' },
];

// State-to-location mapping for nearby matching
const STATE_LOCATIONS: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune'],
  'Karnataka': ['Bangalore'],
  'Delhi': ['Delhi'],
  'Tamil Nadu': ['Chennai'],
  'Kerala': ['Kochi'],
  'Rajasthan': ['Jaipur'],
  'Telangana': ['Hyderabad'],
};

export function matchLawyers(
  categories: string[],
  userState?: string,
  limit = 3
): MatchedLawyer[] {
  let matched = ALL_LAWYERS.filter((l) => categories.includes(l.category));
  if (matched.length === 0) matched = [...ALL_LAWYERS];

  // Prioritize lawyers in user's state
  if (userState) {
    const stateLocations = STATE_LOCATIONS[userState] || [];
    matched.sort((a, b) => {
      const aLocal = stateLocations.includes(a.location) ? 0 : 1;
      const bLocal = stateLocations.includes(b.location) ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      return b.rating - a.rating;
    });
  } else {
    matched.sort((a, b) => b.rating - a.rating);
  }

  return matched.slice(0, limit);
}

export interface MatchedTemplate {
  id: number;
  title: string;
  category: string;
  type: string;
}

const ALL_TEMPLATES: MatchedTemplate[] = [
  { id: 1, title: 'Power of Attorney', category: 'personal', type: 'Document' },
  { id: 3, title: 'Legal Notice', category: 'personal', type: 'Notice' },
  { id: 4, title: 'Rental Agreement', category: 'property', type: 'Agreement' },
  { id: 5, title: 'Property Sale Deed', category: 'property', type: 'Deed' },
  { id: 7, title: 'Employment Contract', category: 'employment', type: 'Contract' },
  { id: 9, title: 'Resignation Letter', category: 'employment', type: 'Letter' },
  { id: 10, title: 'Consumer Complaint', category: 'consumer', type: 'Complaint' },
  { id: 11, title: 'RTI Application', category: 'consumer', type: 'Application' },
  { id: 15, title: 'Divorce Petition', category: 'family', type: 'Petition' },
  { id: 16, title: 'Maintenance Application', category: 'family', type: 'Application' },
  { id: 17, title: 'Domestic Violence Complaint', category: 'family', type: 'Complaint' },
  { id: 18, title: 'Rental Agreement (Individual)', category: 'property', type: 'Agreement' },
  { id: 19, title: 'Property NOC', category: 'property', type: 'Certificate' },
  { id: 12, title: 'Partnership Deed', category: 'business', type: 'Deed' },
  { id: 13, title: 'Service Agreement', category: 'business', type: 'Agreement' },
];

const CATEGORY_TO_TEMPLATE: Record<string, string[]> = {
  property: ['property'],
  family: ['family'],
  criminal: ['personal'],
  corporate: ['business'],
  civil: ['personal'],
  cyber: ['consumer'],
  consumer: ['consumer'],
  labour: ['employment'],
};

export function matchTemplates(categories: string[], limit = 2): MatchedTemplate[] {
  const templateCategories = categories.flatMap((c) => CATEGORY_TO_TEMPLATE[c] || []);
  let matched = ALL_TEMPLATES.filter((t) => templateCategories.includes(t.category));
  if (matched.length === 0) matched = ALL_TEMPLATES.slice(0, limit);
  return matched.slice(0, limit);
}

export function getGuideRoute(categories: string[]): { path: string; label: string } {
  if (categories.includes('corporate') || categories.includes('labour')) {
    return { path: '/msme-support', label: 'Business & MSME Guide' };
  }
  return { path: '/state-legal-support', label: 'State Legal Support Guide' };
}

export function getAuthorityRoute(categories: string[]): { path: string; label: string } {
  const cat = categories[0] || 'all';
  return { path: `/authority-finder?category=${cat}`, label: 'Find Relevant Authority' };
}
