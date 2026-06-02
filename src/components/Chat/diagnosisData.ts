// Legal Problem Diagnosis decision tree data

export interface DiagnosisOption {
  label: string; // i18n key
  value: string;
}

export interface DiagnosisStep {
  id: string;
  questionKey: string; // i18n key for the question text
  options: DiagnosisOption[];
  allowFreeText?: boolean;
}

export interface DiagnosisResult {
  categoryKey: string;
  lawKey: string;
  authorityKey: string;
  suggestedTemplates: string[]; // template IDs/names
  severity: 'low' | 'medium' | 'high';
}

// Category selection — the first step
export const CATEGORY_STEP: DiagnosisStep = {
  id: 'category',
  questionKey: 'diagWhatIssue',
  options: [
    { label: 'diagOptProperty', value: 'property' },
    { label: 'diagOptEmployment', value: 'employment' },
    { label: 'diagOptConsumer', value: 'consumer' },
    { label: 'diagOptFamily', value: 'family' },
    { label: 'diagOptRental', value: 'rental' },
    { label: 'diagOptLoan', value: 'loan' },
    { label: 'diagOptPolice', value: 'police' },
    { label: 'diagOptBusiness', value: 'business' },
    { label: 'diagOptOther', value: 'other' },
  ],
  allowFreeText: true,
};

// Follow-up questions per category
export const FOLLOW_UP_STEPS: Record<string, DiagnosisStep[]> = {
  property: [
    {
      id: 'property_1',
      questionKey: 'diagPropertyDocs',
      options: [
        { label: 'yes', value: 'has_docs' },
        { label: 'no', value: 'no_docs' },
        { label: 'diagNotSure', value: 'unsure' },
      ],
    },
    {
      id: 'property_2',
      questionKey: 'diagPropertyWho',
      options: [
        { label: 'diagOptNeighbor', value: 'neighbor' },
        { label: 'diagOptFamilyMember', value: 'family' },
        { label: 'diagOptGovernment', value: 'government' },
        { label: 'diagOptOther', value: 'other' },
      ],
    },
    {
      id: 'property_3',
      questionKey: 'diagPropertyOccupied',
      options: [
        { label: 'yes', value: 'occupied' },
        { label: 'no', value: 'not_occupied' },
      ],
    },
    {
      id: 'property_4',
      questionKey: 'diagReportedAuthority',
      options: [
        { label: 'yes', value: 'reported' },
        { label: 'no', value: 'not_reported' },
      ],
    },
  ],
  employment: [
    {
      id: 'employment_1',
      questionKey: 'diagEmploymentType',
      options: [
        { label: 'diagOptUnpaidSalary', value: 'unpaid_salary' },
        { label: 'diagOptWrongTermination', value: 'wrongful_termination' },
        { label: 'diagOptHarassment', value: 'harassment' },
        { label: 'diagOptOther', value: 'other' },
      ],
    },
    {
      id: 'employment_2',
      questionKey: 'diagEmploymentContract',
      options: [
        { label: 'yes', value: 'has_contract' },
        { label: 'no', value: 'no_contract' },
      ],
    },
    {
      id: 'employment_3',
      questionKey: 'diagEmploymentDuration',
      options: [
        { label: 'diagOpt1Month', value: '1_month' },
        { label: 'diagOpt3Months', value: '3_months' },
        { label: 'diagOptMoreThan3', value: 'more_than_3' },
      ],
    },
  ],
  consumer: [
    {
      id: 'consumer_1',
      questionKey: 'diagConsumerType',
      options: [
        { label: 'diagOptProduct', value: 'product' },
        { label: 'diagOptService', value: 'service' },
        { label: 'diagOptOnline', value: 'online' },
      ],
    },
    {
      id: 'consumer_2',
      questionKey: 'diagConsumerRefund',
      options: [
        { label: 'yes', value: 'refund_denied' },
        { label: 'no', value: 'other_issue' },
      ],
    },
    {
      id: 'consumer_3',
      questionKey: 'diagConsumerBill',
      options: [
        { label: 'yes', value: 'has_bill' },
        { label: 'no', value: 'no_bill' },
      ],
    },
  ],
  family: [
    {
      id: 'family_1',
      questionKey: 'diagFamilyType',
      options: [
        { label: 'diagOptDivorce', value: 'divorce' },
        { label: 'diagOptDomesticViolence', value: 'domestic_violence' },
        { label: 'diagOptMaintenance', value: 'maintenance' },
        { label: 'diagOptCustody', value: 'custody' },
        { label: 'diagOptDowry', value: 'dowry' },
      ],
    },
    {
      id: 'family_2',
      questionKey: 'diagFamilyFiled',
      options: [
        { label: 'yes', value: 'already_filed' },
        { label: 'no', value: 'not_filed' },
      ],
    },
  ],
  rental: [
    {
      id: 'rental_1',
      questionKey: 'diagRentalRole',
      options: [
        { label: 'diagOptTenant', value: 'tenant' },
        { label: 'diagOptLandlord', value: 'landlord' },
      ],
    },
    {
      id: 'rental_2',
      questionKey: 'diagRentalIssue',
      options: [
        { label: 'diagOptDepositReturn', value: 'deposit' },
        { label: 'diagOptEviction', value: 'eviction' },
        { label: 'diagOptRentIncrease', value: 'rent_increase' },
        { label: 'diagOptMaintenance', value: 'maintenance' },
      ],
    },
    {
      id: 'rental_3',
      questionKey: 'diagRentalAgreement',
      options: [
        { label: 'yes', value: 'has_agreement' },
        { label: 'no', value: 'no_agreement' },
      ],
    },
  ],
  loan: [
    {
      id: 'loan_1',
      questionKey: 'diagLoanType',
      options: [
        { label: 'diagOptHarassment', value: 'harassment' },
        { label: 'diagOptHighInterest', value: 'high_interest' },
        { label: 'diagOptFraud', value: 'fraud' },
        { label: 'diagOptOther', value: 'other' },
      ],
    },
    {
      id: 'loan_2',
      questionKey: 'diagLoanSource',
      options: [
        { label: 'diagOptBank', value: 'bank' },
        { label: 'diagOptNBFC', value: 'nbfc' },
        { label: 'diagOptPrivate', value: 'private' },
        { label: 'diagOptApp', value: 'app' },
      ],
    },
  ],
  police: [
    {
      id: 'police_1',
      questionKey: 'diagPoliceType',
      options: [
        { label: 'diagOptFileFIR', value: 'file_fir' },
        { label: 'diagOptPoliceRefusing', value: 'police_refusing' },
        { label: 'diagOptFalseCase', value: 'false_case' },
        { label: 'diagOptOther', value: 'other' },
      ],
    },
    {
      id: 'police_2',
      questionKey: 'diagPoliceEvidence',
      options: [
        { label: 'yes', value: 'has_evidence' },
        { label: 'no', value: 'no_evidence' },
        { label: 'diagNotSure', value: 'unsure' },
      ],
    },
  ],
  business: [
    {
      id: 'business_1',
      questionKey: 'diagBusinessType',
      options: [
        { label: 'diagOptRegistration', value: 'registration' },
        { label: 'diagOptGST', value: 'gst' },
        { label: 'diagOptPartnership', value: 'partnership' },
        { label: 'diagOptContractDispute', value: 'contract_dispute' },
      ],
    },
    {
      id: 'business_2',
      questionKey: 'diagBusinessRegistered',
      options: [
        { label: 'yes', value: 'registered' },
        { label: 'no', value: 'not_registered' },
      ],
    },
  ],
  other: [],
};

// Build a summary prompt from diagnosis answers
export function buildDiagnosisSummary(
  category: string,
  answers: Record<string, string>,
  freeText?: string
): string {
  const parts: string[] = [];

  // Map category to readable name
  const categoryNames: Record<string, string> = {
    property: 'Property Dispute',
    employment: 'Employment / Salary Issue',
    consumer: 'Consumer Complaint',
    family: 'Family / Domestic Issue',
    rental: 'Tenant / Rental Problem',
    loan: 'Loan / Financial Harassment',
    police: 'Police / Criminal Matter',
    business: 'Business / MSME Issue',
    other: 'Other Legal Issue',
  };

  parts.push(`Legal Issue Category: ${categoryNames[category] || category}`);

  // Add each answer as context
  const answerDescriptions: Record<string, Record<string, string>> = {
    property_1: { has_docs: 'Has ownership documents', no_docs: 'No ownership documents', unsure: 'Unsure about documents' },
    property_2: { neighbor: 'Dispute with neighbor', family: 'Dispute with family member', government: 'Dispute involving government', other: 'Dispute with other party' },
    property_3: { occupied: 'Land has been occupied without permission', not_occupied: 'No illegal occupation' },
    property_4: { reported: 'Already reported to authorities', not_reported: 'Not yet reported to authorities' },
    employment_1: { unpaid_salary: 'Unpaid salary issue', wrongful_termination: 'Wrongful termination', harassment: 'Workplace harassment', other: 'Other employment issue' },
    employment_2: { has_contract: 'Has written employment contract', no_contract: 'No written contract' },
    employment_3: { '1_month': '1 month salary pending', '3_months': 'Up to 3 months salary pending', 'more_than_3': 'More than 3 months salary pending' },
    consumer_1: { product: 'Issue with product', service: 'Issue with service', online: 'Online purchase issue' },
    consumer_2: { refund_denied: 'Refund/repair refused by company', other_issue: 'Other consumer issue' },
    consumer_3: { has_bill: 'Has purchase bill/receipt', no_bill: 'No purchase bill' },
    family_1: { divorce: 'Seeking divorce', domestic_violence: 'Domestic violence situation', maintenance: 'Maintenance/alimony issue', custody: 'Child custody matter', dowry: 'Dowry harassment' },
    family_2: { already_filed: 'Case already filed', not_filed: 'No case filed yet' },
    rental_1: { tenant: 'User is tenant', landlord: 'User is landlord' },
    rental_2: { deposit: 'Security deposit not returned', eviction: 'Facing eviction', rent_increase: 'Unfair rent increase', maintenance: 'Property maintenance issue' },
    rental_3: { has_agreement: 'Has rental agreement', no_agreement: 'No written rental agreement' },
    loan_1: { harassment: 'Loan recovery harassment', high_interest: 'Excessive interest rate', fraud: 'Loan fraud', other: 'Other loan issue' },
    loan_2: { bank: 'Loan from bank', nbfc: 'Loan from NBFC', private: 'Private money lender', app: 'Loan app' },
    police_1: { file_fir: 'Wants to file FIR', police_refusing: 'Police refusing to file FIR', false_case: 'False case filed against user', other: 'Other police matter' },
    police_2: { has_evidence: 'Has evidence', no_evidence: 'No evidence', unsure: 'Unsure about evidence' },
    business_1: { registration: 'Business registration help', gst: 'GST related issue', partnership: 'Partnership dispute', contract_dispute: 'Contract dispute' },
    business_2: { registered: 'Business is registered', not_registered: 'Business not registered' },
  };

  for (const [stepId, answerValue] of Object.entries(answers)) {
    const desc = answerDescriptions[stepId]?.[answerValue];
    if (desc) parts.push(`- ${desc}`);
  }

  if (freeText) {
    parts.push(`User's description: "${freeText}"`);
  }

  parts.push('\nPlease provide legal guidance based on this diagnosis. Follow your mandatory response format.');

  return parts.join('\n');
}
