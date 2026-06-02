export interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date' | 'number';
}

export interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  fields: TemplateField[];
  downloads: number;
  languages: string[];
  type: string;
}

export const templateCategories = [
  { id: 'all', name: 'All Templates', icon: 'FileText' },
  { id: 'property', name: 'Property & Rental', icon: 'Home' },
  { id: 'employment', name: 'Employment & Work', icon: 'Briefcase' },
  { id: 'consumer', name: 'Consumer Complaints', icon: 'ShieldCheck' },
  { id: 'personal', name: 'Personal Legal', icon: 'Users' },
  { id: 'financial', name: 'Financial Agreements', icon: 'IndianRupee' },
  { id: 'business', name: 'Business & MSME', icon: 'Building' },
];

export const legalTemplates: LegalTemplate[] = [
  // Property & Rental
  {
    id: 'rental-agreement',
    title: 'Rental Agreement Template',
    description: 'Standard rental agreement for property owners and tenants covering all essential terms.',
    category: 'property',
    type: 'Agreement',
    downloads: 3200,
    languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Malayalam'],
    fields: [
      { key: 'landlord_name', label: 'Landlord Name', placeholder: '[Landlord Name]' },
      { key: 'tenant_name', label: 'Tenant Name', placeholder: '[Tenant Name]' },
      { key: 'property_address', label: 'Property Address', placeholder: '[Property Address]' },
      { key: 'monthly_rent', label: 'Monthly Rent (₹)', placeholder: '[Monthly Rent]', type: 'number' },
      { key: 'security_deposit', label: 'Security Deposit (₹)', placeholder: '[Security Deposit]', type: 'number' },
      { key: 'agreement_date', label: 'Agreement Date', placeholder: '[Agreement Date]', type: 'date' },
      { key: 'lease_duration', label: 'Lease Duration (months)', placeholder: '[Lease Duration]', type: 'number' },
    ],
    content: `RENTAL AGREEMENT

This Rental Agreement is made and executed on [Agreement Date] between:

LANDLORD: [Landlord Name] (hereinafter referred to as the "Landlord/Owner")

AND

TENANT: [Tenant Name] (hereinafter referred to as the "Tenant")

PROPERTY ADDRESS: [Property Address]

TERMS AND CONDITIONS:

1. RENT: The Tenant agrees to pay a monthly rent of ₹[Monthly Rent] (Rupees Only) to the Landlord on or before the 5th of every month.

2. SECURITY DEPOSIT: The Tenant has paid a security deposit of ₹[Security Deposit] (Rupees Only) which shall be refunded at the time of vacating the premises, subject to deductions for damages if any.

3. DURATION: This agreement shall be valid for a period of [Lease Duration] months commencing from [Agreement Date].

4. MAINTENANCE: The Tenant shall maintain the property in good condition and shall be responsible for minor repairs and upkeep.

5. UTILITIES: All utility charges including electricity, water, and gas shall be borne by the Tenant.

6. SUBLETTING: The Tenant shall not sublet or assign the premises to any third party without the prior written consent of the Landlord.

7. TERMINATION: Either party may terminate this agreement by providing 30 days written notice to the other party.

8. DISPUTE RESOLUTION: Any disputes arising from this agreement shall be settled amicably. If unresolved, the matter shall be referred to the appropriate court of jurisdiction.

IN WITNESS WHEREOF, the parties have signed this agreement on the date first mentioned above.

Landlord Signature: ___________________
Name: [Landlord Name]

Tenant Signature: ___________________
Name: [Tenant Name]

Witness 1: ___________________
Witness 2: ___________________`,
  },
  {
    id: 'lease-agreement',
    title: 'Lease Agreement',
    description: 'Comprehensive lease agreement for long-term property rental with detailed clauses.',
    category: 'property',
    type: 'Agreement',
    downloads: 1800,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'lessor_name', label: 'Lessor Name', placeholder: '[Lessor Name]' },
      { key: 'lessee_name', label: 'Lessee Name', placeholder: '[Lessee Name]' },
      { key: 'property_address', label: 'Property Address', placeholder: '[Property Address]' },
      { key: 'lease_amount', label: 'Lease Amount (₹)', placeholder: '[Lease Amount]', type: 'number' },
      { key: 'lease_start_date', label: 'Lease Start Date', placeholder: '[Lease Start Date]', type: 'date' },
      { key: 'lease_end_date', label: 'Lease End Date', placeholder: '[Lease End Date]', type: 'date' },
    ],
    content: `LEASE AGREEMENT

This Lease Agreement is entered into on this day between:

LESSOR: [Lessor Name]
LESSEE: [Lessee Name]

PROPERTY: [Property Address]

1. LEASE PERIOD: The lease shall commence from [Lease Start Date] and shall remain in force until [Lease End Date].

2. LEASE AMOUNT: The Lessee shall pay ₹[Lease Amount] as the total lease consideration.

3. PURPOSE: The property shall be used solely for residential/commercial purposes as agreed.

4. MAINTENANCE: The Lessee shall maintain the property in good habitable condition throughout the lease period.

5. RENEWAL: This lease may be renewed upon mutual agreement of both parties, with revised terms if applicable.

6. TERMINATION: Early termination requires 60 days written notice from either party.

Lessor: ___________________
Name: [Lessor Name]

Lessee: ___________________
Name: [Lessee Name]`,
  },
  {
    id: 'property-sale-agreement',
    title: 'Property Sale Agreement Draft',
    description: 'Draft agreement for sale of immovable property between buyer and seller.',
    category: 'property',
    type: 'Deed',
    downloads: 980,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'seller_name', label: 'Seller Name', placeholder: '[Seller Name]' },
      { key: 'buyer_name', label: 'Buyer Name', placeholder: '[Buyer Name]' },
      { key: 'property_address', label: 'Property Address', placeholder: '[Property Address]' },
      { key: 'sale_price', label: 'Sale Price (₹)', placeholder: '[Sale Price]', type: 'number' },
      { key: 'agreement_date', label: 'Agreement Date', placeholder: '[Agreement Date]', type: 'date' },
    ],
    content: `AGREEMENT FOR SALE OF PROPERTY

This Agreement for Sale is made on [Agreement Date] between:

SELLER: [Seller Name] (hereinafter called the "Seller")
BUYER: [Buyer Name] (hereinafter called the "Buyer")

PROPERTY DETAILS: [Property Address]

1. SALE PRICE: The total sale consideration is ₹[Sale Price] (Rupees Only).

2. PAYMENT SCHEDULE: The Buyer shall pay the sale consideration as follows:
   a) Advance/Token Amount: ₹__________ on signing this agreement
   b) Balance Amount: ₹__________ at the time of registration

3. ENCUMBRANCE: The Seller declares that the property is free from all encumbrances, liens, and legal disputes.

4. REGISTRATION: The sale deed shall be registered within 60 days from the date of this agreement.

5. POSSESSION: Physical possession shall be handed over on the date of registration.

Seller: ___________________    Buyer: ___________________
Name: [Seller Name]           Name: [Buyer Name]`,
  },
  {
    id: 'property-noc',
    title: 'Property NOC Template',
    description: 'No Objection Certificate template for property transactions.',
    category: 'property',
    type: 'Certificate',
    downloads: 750,
    languages: ['English', 'Hindi', 'Kannada'],
    fields: [
      { key: 'issuer_name', label: 'Issuer Name', placeholder: '[Issuer Name]' },
      { key: 'recipient_name', label: 'Recipient Name', placeholder: '[Recipient Name]' },
      { key: 'property_address', label: 'Property Address', placeholder: '[Property Address]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `NO OBJECTION CERTIFICATE

Date: [Date]

To Whom It May Concern,

I, [Issuer Name], hereby declare that I have no objection to the sale/transfer/lease of the property situated at:

[Property Address]

to [Recipient Name].

I confirm that I have no claims, rights, or interests in the said property and I shall not raise any objection in the future regarding this transaction.

This NOC is issued at the request of [Recipient Name] for their records.

Signature: ___________________
Name: [Issuer Name]
Date: [Date]`,
  },
  {
    id: 'property-affidavit',
    title: 'Property Affidavit Template',
    description: 'Sworn affidavit for property ownership declaration.',
    category: 'property',
    type: 'Affidavit',
    downloads: 620,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'deponent_name', label: 'Deponent Name', placeholder: '[Deponent Name]' },
      { key: 'property_address', label: 'Property Address', placeholder: '[Property Address]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `AFFIDAVIT

I, [Deponent Name], do hereby solemnly affirm and declare as under:

1. That I am the lawful owner of the property situated at [Property Address].

2. That the said property is free from any encumbrance, mortgage, lien, or legal dispute.

3. That I have not sold, transferred, or created any third-party interest in the said property.

4. That the statements made herein are true and correct to the best of my knowledge and belief.

DEPONENT

Signature: ___________________
Name: [Deponent Name]
Date: [Date]

VERIFICATION
Verified at __________ on [Date] that the contents of this affidavit are true and correct.`,
  },
  {
    id: 'purchase-agreement',
    title: 'Property Purchase Agreement',
    description: 'Detailed agreement template for purchasing property.',
    category: 'property',
    type: 'Agreement',
    downloads: 890,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'buyer_name', label: 'Buyer Name', placeholder: '[Buyer Name]' },
      { key: 'seller_name', label: 'Seller Name', placeholder: '[Seller Name]' },
      { key: 'property_details', label: 'Property Details', placeholder: '[Property Details]' },
      { key: 'purchase_price', label: 'Purchase Price (₹)', placeholder: '[Purchase Price]', type: 'number' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `PROPERTY PURCHASE AGREEMENT

Date: [Date]

BUYER: [Buyer Name]
SELLER: [Seller Name]

PROPERTY: [Property Details]

1. The Seller agrees to sell and the Buyer agrees to purchase the above property for ₹[Purchase Price].

2. The Buyer has verified the title documents and is satisfied with the ownership.

3. Registration charges and stamp duty shall be borne by the Buyer.

4. Possession shall be given on the date of registration of the sale deed.

Buyer: ___________________    Seller: ___________________`,
  },

  // Employment & Work
  {
    id: 'employment-offer-letter',
    title: 'Employment Offer Letter Template',
    description: 'Professional offer letter template for new employee hires.',
    category: 'employment',
    type: 'Letter',
    downloads: 2100,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'employee_name', label: 'Employee Name', placeholder: '[Employee Name]' },
      { key: 'designation', label: 'Designation', placeholder: '[Designation]' },
      { key: 'salary', label: 'Annual CTC (₹)', placeholder: '[Annual CTC]', type: 'number' },
      { key: 'joining_date', label: 'Joining Date', placeholder: '[Joining Date]', type: 'date' },
    ],
    content: `OFFER LETTER

Date: [Joining Date]

Dear [Employee Name],

We are pleased to offer you the position of [Designation] at [Company Name].

Your annual CTC will be ₹[Annual CTC]. Your employment will commence from [Joining Date].

Terms:
1. You will be on probation for the first 6 months.
2. Working hours: 9:00 AM to 6:00 PM, Monday to Friday.
3. You are entitled to company benefits as per HR policy.

Please confirm your acceptance by signing and returning this letter.

Regards,
[Company Name]
HR Department`,
  },
  {
    id: 'employment-contract',
    title: 'Employment Contract Template',
    description: 'Standard employment contract with comprehensive terms and conditions.',
    category: 'employment',
    type: 'Contract',
    downloads: 1500,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'employer_name', label: 'Employer/Company Name', placeholder: '[Employer Name]' },
      { key: 'employee_name', label: 'Employee Name', placeholder: '[Employee Name]' },
      { key: 'designation', label: 'Designation', placeholder: '[Designation]' },
      { key: 'salary', label: 'Monthly Salary (₹)', placeholder: '[Monthly Salary]', type: 'number' },
      { key: 'start_date', label: 'Start Date', placeholder: '[Start Date]', type: 'date' },
    ],
    content: `EMPLOYMENT CONTRACT

This Employment Contract is entered into between:

EMPLOYER: [Employer Name]
EMPLOYEE: [Employee Name]

1. POSITION: [Designation]
2. COMMENCEMENT: [Start Date]
3. COMPENSATION: ₹[Monthly Salary] per month
4. PROBATION: 6 months from the date of joining
5. NOTICE PERIOD: 30 days from either party
6. CONFIDENTIALITY: Employee shall maintain confidentiality of all business information.
7. NON-COMPETE: Employee shall not engage in competing business for 12 months after leaving.

Employer: ___________________    Employee: ___________________`,
  },
  {
    id: 'salary-complaint',
    title: 'Salary Complaint Letter',
    description: 'Formal complaint letter for unpaid or delayed salary issues.',
    category: 'employment',
    type: 'Complaint',
    downloads: 890,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'employee_name', label: 'Employee Name', placeholder: '[Employee Name]' },
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'pending_months', label: 'Pending Months', placeholder: '[Pending Months]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `SALARY COMPLAINT LETTER

Date: [Date]

To,
The HR Manager / Managing Director
[Company Name]

Subject: Complaint regarding non-payment of salary

Dear Sir/Madam,

I, [Employee Name], am writing to bring to your attention that my salary for [Pending Months] has not been paid despite multiple verbal requests.

I request you to kindly release my pending salary at the earliest. Failure to do so will compel me to approach the Labour Commissioner for redressal.

Yours sincerely,
[Employee Name]`,
  },
  {
    id: 'resignation-letter',
    title: 'Resignation Letter Template',
    description: 'Professional resignation letter template with proper notice period.',
    category: 'employment',
    type: 'Letter',
    downloads: 1650,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'employee_name', label: 'Employee Name', placeholder: '[Employee Name]' },
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'designation', label: 'Designation', placeholder: '[Designation]' },
      { key: 'last_working_date', label: 'Last Working Date', placeholder: '[Last Working Date]', type: 'date' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `RESIGNATION LETTER

Date: [Date]

To,
The Manager / HR Department
[Company Name]

Subject: Resignation from the position of [Designation]

Dear Sir/Madam,

I, [Employee Name], hereby tender my resignation from the position of [Designation] at [Company Name].

My last working day will be [Last Working Date], in accordance with the notice period.

I thank you for the opportunities and experience gained during my tenure.

Yours sincerely,
[Employee Name]`,
  },
  {
    id: 'internship-agreement',
    title: 'Internship Agreement',
    description: 'Agreement template for internship positions with stipend and duration details.',
    category: 'employment',
    type: 'Agreement',
    downloads: 720,
    languages: ['English'],
    fields: [
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'intern_name', label: 'Intern Name', placeholder: '[Intern Name]' },
      { key: 'stipend', label: 'Monthly Stipend (₹)', placeholder: '[Monthly Stipend]', type: 'number' },
      { key: 'start_date', label: 'Start Date', placeholder: '[Start Date]', type: 'date' },
      { key: 'end_date', label: 'End Date', placeholder: '[End Date]', type: 'date' },
    ],
    content: `INTERNSHIP AGREEMENT

Between: [Company Name] ("Company") and [Intern Name] ("Intern")

1. DURATION: [Start Date] to [End Date]
2. STIPEND: ₹[Monthly Stipend] per month
3. WORKING HOURS: As per company policy
4. DUTIES: As assigned by the reporting manager
5. CONFIDENTIALITY: The Intern shall maintain confidentiality of all proprietary information.
6. CERTIFICATE: A completion certificate will be provided upon successful completion.

Company: ___________________    Intern: ___________________`,
  },

  // Consumer Complaints
  {
    id: 'consumer-complaint',
    title: 'Consumer Complaint Letter',
    description: 'Formal complaint letter for consumer court or grievance redressal.',
    category: 'consumer',
    type: 'Complaint',
    downloads: 1100,
    languages: ['English', 'Hindi', 'Kannada'],
    fields: [
      { key: 'complainant_name', label: 'Complainant Name', placeholder: '[Complainant Name]' },
      { key: 'company_name', label: 'Company/Seller Name', placeholder: '[Company Name]' },
      { key: 'product_service', label: 'Product/Service', placeholder: '[Product/Service]' },
      { key: 'complaint_details', label: 'Complaint Details', placeholder: '[Complaint Details]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `CONSUMER COMPLAINT

Date: [Date]

To,
The District Consumer Disputes Redressal Forum

COMPLAINANT: [Complainant Name]
OPPOSITE PARTY: [Company Name]

Subject: Complaint regarding defective [Product/Service]

Sir/Madam,

I purchased [Product/Service] from [Company Name]. However, [Complaint Details].

Despite repeated requests, the company has failed to address the issue. I request the Forum to direct the company to:
1. Replace/repair the defective product or refund the amount
2. Pay compensation for mental agony and harassment

Complainant: ___________________
Name: [Complainant Name]`,
  },
  {
    id: 'refund-request',
    title: 'Refund Request Letter',
    description: 'Professional refund request letter for products or services.',
    category: 'consumer',
    type: 'Letter',
    downloads: 950,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'customer_name', label: 'Customer Name', placeholder: '[Customer Name]' },
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'order_number', label: 'Order/Invoice Number', placeholder: '[Order Number]' },
      { key: 'refund_amount', label: 'Refund Amount (₹)', placeholder: '[Refund Amount]', type: 'number' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `REFUND REQUEST LETTER

Date: [Date]

To,
Customer Service Department
[Company Name]

Subject: Request for refund — Order #[Order Number]

Dear Sir/Madam,

I, [Customer Name], request a refund of ₹[Refund Amount] for order #[Order Number] due to the product/service not meeting the described specifications.

Please process the refund within 15 working days.

Yours sincerely,
[Customer Name]`,
  },
  {
    id: 'product-defect-complaint',
    title: 'Product Defect Complaint Template',
    description: 'Complaint template for defective products with warranty claims.',
    category: 'consumer',
    type: 'Complaint',
    downloads: 670,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'customer_name', label: 'Customer Name', placeholder: '[Customer Name]' },
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'product_name', label: 'Product Name', placeholder: '[Product Name]' },
      { key: 'purchase_date', label: 'Purchase Date', placeholder: '[Purchase Date]', type: 'date' },
      { key: 'defect_description', label: 'Defect Description', placeholder: '[Defect Description]' },
    ],
    content: `PRODUCT DEFECT COMPLAINT

To: [Company Name]
From: [Customer Name]

Product: [Product Name]
Date of Purchase: [Purchase Date]

Description of Defect:
[Defect Description]

I demand immediate replacement or full refund under the Consumer Protection Act, 2019.

[Customer Name]`,
  },
  {
    id: 'service-complaint',
    title: 'Service Complaint Letter',
    description: 'Complaint letter for deficient services received.',
    category: 'consumer',
    type: 'Complaint',
    downloads: 580,
    languages: ['English', 'Hindi', 'Tamil'],
    fields: [
      { key: 'customer_name', label: 'Customer Name', placeholder: '[Customer Name]' },
      { key: 'service_provider', label: 'Service Provider', placeholder: '[Service Provider]' },
      { key: 'service_type', label: 'Service Type', placeholder: '[Service Type]' },
      { key: 'complaint_details', label: 'Complaint Details', placeholder: '[Complaint Details]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `SERVICE COMPLAINT LETTER

Date: [Date]

To: [Service Provider]

Subject: Complaint regarding deficient [Service Type]

I, [Customer Name], availed [Service Type] from your establishment. However, [Complaint Details].

I demand immediate rectification and compensation for the inconvenience caused.

[Customer Name]`,
  },

  // Personal Legal
  {
    id: 'general-affidavit',
    title: 'Affidavit Template',
    description: 'General purpose affidavit for legal declarations and sworn statements.',
    category: 'personal',
    type: 'Affidavit',
    downloads: 2400,
    languages: ['English', 'Hindi', 'Tamil'],
    fields: [
      { key: 'deponent_name', label: 'Deponent Name', placeholder: '[Deponent Name]' },
      { key: 'father_name', label: 'Father/Husband Name', placeholder: "[Father's/Husband's Name]" },
      { key: 'address', label: 'Address', placeholder: '[Address]' },
      { key: 'declaration', label: 'Declaration Content', placeholder: '[Declaration Content]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `AFFIDAVIT

I, [Deponent Name], Son/Daughter/Wife of [Father's/Husband's Name], residing at [Address], do hereby solemnly affirm and declare as under:

1. That I am a citizen of India and am making this affidavit of my own free will.

2. [Declaration Content]

3. That the statements made herein are true and correct to the best of my knowledge and belief and nothing has been concealed therein.

DEPONENT
Signature: ___________________
Name: [Deponent Name]
Date: [Date]

VERIFICATION
I, [Deponent Name], do hereby verify that the contents of this affidavit are true and correct.`,
  },
  {
    id: 'general-declaration',
    title: 'General Declaration Letter',
    description: 'Multi-purpose declaration letter for various official purposes.',
    category: 'personal',
    type: 'Declaration',
    downloads: 1300,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'declarant_name', label: 'Declarant Name', placeholder: '[Declarant Name]' },
      { key: 'purpose', label: 'Purpose', placeholder: '[Purpose]' },
      { key: 'declaration_content', label: 'Declaration', placeholder: '[Declaration Content]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `DECLARATION

Date: [Date]

I, [Declarant Name], hereby declare for the purpose of [Purpose]:

[Declaration Content]

I declare that the above information is true and correct to the best of my knowledge.

Signature: ___________________
Name: [Declarant Name]`,
  },
  {
    id: 'identity-declaration',
    title: 'Identity Declaration Letter',
    description: 'Self-declaration of identity for official and legal purposes.',
    category: 'personal',
    type: 'Declaration',
    downloads: 890,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'person_name', label: 'Full Name', placeholder: '[Full Name]' },
      { key: 'aadhaar', label: 'Aadhaar Number', placeholder: '[Aadhaar Number]' },
      { key: 'address', label: 'Address', placeholder: '[Address]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `IDENTITY DECLARATION

Date: [Date]

I, [Full Name], Aadhaar No. [Aadhaar Number], residing at [Address], declare that the identity documents submitted are genuine and belong to me.

I take full responsibility for the authenticity of these documents.

Signature: ___________________
Name: [Full Name]`,
  },
  {
    id: 'address-declaration',
    title: 'Address Declaration Letter',
    description: 'Self-declaration of residential address for official records.',
    category: 'personal',
    type: 'Declaration',
    downloads: 760,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'person_name', label: 'Full Name', placeholder: '[Full Name]' },
      { key: 'current_address', label: 'Current Address', placeholder: '[Current Address]' },
      { key: 'purpose', label: 'Purpose', placeholder: '[Purpose]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `ADDRESS DECLARATION

Date: [Date]

To Whom It May Concern,

I, [Full Name], hereby declare that my current residential address is:

[Current Address]

This declaration is made for the purpose of [Purpose].

Signature: ___________________
Name: [Full Name]`,
  },

  // Financial Agreements
  {
    id: 'loan-agreement',
    title: 'Loan Agreement Template',
    description: 'Comprehensive loan agreement between lender and borrower.',
    category: 'financial',
    type: 'Agreement',
    downloads: 1450,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'lender_name', label: 'Lender Name', placeholder: '[Lender Name]' },
      { key: 'borrower_name', label: 'Borrower Name', placeholder: '[Borrower Name]' },
      { key: 'loan_amount', label: 'Loan Amount (₹)', placeholder: '[Loan Amount]', type: 'number' },
      { key: 'interest_rate', label: 'Interest Rate (%)', placeholder: '[Interest Rate]', type: 'number' },
      { key: 'repayment_period', label: 'Repayment Period (months)', placeholder: '[Repayment Period]', type: 'number' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `LOAN AGREEMENT

Date: [Date]

LENDER: [Lender Name]
BORROWER: [Borrower Name]

1. LOAN AMOUNT: ₹[Loan Amount]
2. INTEREST RATE: [Interest Rate]% per annum
3. REPAYMENT PERIOD: [Repayment Period] months
4. EMI: Payable on the 1st of every month
5. DEFAULT: Failure to pay 3 consecutive EMIs shall make the entire amount due immediately
6. SECURITY: As per mutual agreement

Lender: ___________________    Borrower: ___________________`,
  },
  {
    id: 'payment-acknowledgement',
    title: 'Payment Acknowledgement Letter',
    description: 'Acknowledgement letter confirming receipt of payment.',
    category: 'financial',
    type: 'Letter',
    downloads: 680,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'receiver_name', label: 'Receiver Name', placeholder: '[Receiver Name]' },
      { key: 'payer_name', label: 'Payer Name', placeholder: '[Payer Name]' },
      { key: 'amount', label: 'Amount (₹)', placeholder: '[Amount]', type: 'number' },
      { key: 'purpose', label: 'Purpose', placeholder: '[Purpose]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `PAYMENT ACKNOWLEDGEMENT

Date: [Date]

I, [Receiver Name], hereby acknowledge receipt of ₹[Amount] from [Payer Name] towards [Purpose].

The payment has been received in full and I have no further claims in this regard.

Signature: ___________________
Name: [Receiver Name]`,
  },
  {
    id: 'debt-settlement',
    title: 'Debt Settlement Agreement',
    description: 'Agreement for settling outstanding debts between parties.',
    category: 'financial',
    type: 'Agreement',
    downloads: 520,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'creditor_name', label: 'Creditor Name', placeholder: '[Creditor Name]' },
      { key: 'debtor_name', label: 'Debtor Name', placeholder: '[Debtor Name]' },
      { key: 'original_amount', label: 'Original Debt (₹)', placeholder: '[Original Amount]', type: 'number' },
      { key: 'settlement_amount', label: 'Settlement Amount (₹)', placeholder: '[Settlement Amount]', type: 'number' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `DEBT SETTLEMENT AGREEMENT

Date: [Date]

CREDITOR: [Creditor Name]
DEBTOR: [Debtor Name]

Original debt: ₹[Original Amount]
Settlement amount: ₹[Settlement Amount]

Both parties agree that payment of ₹[Settlement Amount] shall constitute full and final settlement of the debt.

Creditor: ___________________    Debtor: ___________________`,
  },
  {
    id: 'loan-repayment',
    title: 'Loan Repayment Agreement',
    description: 'Structured repayment plan agreement for existing loans.',
    category: 'financial',
    type: 'Agreement',
    downloads: 430,
    languages: ['English'],
    fields: [
      { key: 'lender_name', label: 'Lender Name', placeholder: '[Lender Name]' },
      { key: 'borrower_name', label: 'Borrower Name', placeholder: '[Borrower Name]' },
      { key: 'outstanding_amount', label: 'Outstanding Amount (₹)', placeholder: '[Outstanding Amount]', type: 'number' },
      { key: 'monthly_payment', label: 'Monthly Payment (₹)', placeholder: '[Monthly Payment]', type: 'number' },
      { key: 'start_date', label: 'Start Date', placeholder: '[Start Date]', type: 'date' },
    ],
    content: `LOAN REPAYMENT AGREEMENT

LENDER: [Lender Name]
BORROWER: [Borrower Name]

Outstanding Amount: ₹[Outstanding Amount]
Monthly Payment: ₹[Monthly Payment]
Payments commence: [Start Date]

The Borrower agrees to make regular monthly payments until the outstanding amount is fully repaid.

Lender: ___________________    Borrower: ___________________`,
  },

  // Business & MSME
  {
    id: 'partnership-agreement',
    title: 'Partnership Agreement Template',
    description: 'Comprehensive partnership deed for business ventures.',
    category: 'business',
    type: 'Deed',
    downloads: 1200,
    languages: ['English'],
    fields: [
      { key: 'partner1_name', label: 'Partner 1 Name', placeholder: '[Partner 1 Name]' },
      { key: 'partner2_name', label: 'Partner 2 Name', placeholder: '[Partner 2 Name]' },
      { key: 'business_name', label: 'Business Name', placeholder: '[Business Name]' },
      { key: 'business_type', label: 'Business Type', placeholder: '[Business Type]' },
      { key: 'profit_share', label: 'Profit Share Ratio', placeholder: '[Profit Share Ratio]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `PARTNERSHIP AGREEMENT

Date: [Date]

PARTNERS:
1. [Partner 1 Name]
2. [Partner 2 Name]

BUSINESS NAME: [Business Name]
NATURE OF BUSINESS: [Business Type]

1. PROFIT SHARING: [Profit Share Ratio]
2. CAPITAL CONTRIBUTION: As mutually agreed
3. MANAGEMENT: Joint management by all partners
4. DISSOLUTION: Requires mutual consent or 90 days notice

Partner 1: ___________________    Partner 2: ___________________`,
  },
  {
    id: 'nda-agreement',
    title: 'NDA (Non-Disclosure Agreement)',
    description: 'Confidentiality agreement to protect sensitive business information.',
    category: 'business',
    type: 'Agreement',
    downloads: 1800,
    languages: ['English'],
    fields: [
      { key: 'disclosing_party', label: 'Disclosing Party', placeholder: '[Disclosing Party]' },
      { key: 'receiving_party', label: 'Receiving Party', placeholder: '[Receiving Party]' },
      { key: 'purpose', label: 'Purpose', placeholder: '[Purpose]' },
      { key: 'duration', label: 'Duration (years)', placeholder: '[Duration]', type: 'number' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `NON-DISCLOSURE AGREEMENT

Date: [Date]

DISCLOSING PARTY: [Disclosing Party]
RECEIVING PARTY: [Receiving Party]

1. PURPOSE: [Purpose]
2. CONFIDENTIAL INFORMATION: All information shared in connection with the above purpose.
3. DURATION: [Duration] years from the date of this agreement.
4. OBLIGATIONS: The Receiving Party shall not disclose, share, or use the confidential information for any purpose other than stated.
5. REMEDIES: Breach of this agreement shall entitle the Disclosing Party to seek injunctive relief and damages.

Disclosing Party: ___________________    Receiving Party: ___________________`,
  },
  {
    id: 'vendor-agreement',
    title: 'Vendor Agreement Template',
    description: 'Service/product vendor agreement for business relationships.',
    category: 'business',
    type: 'Agreement',
    downloads: 780,
    languages: ['English', 'Hindi'],
    fields: [
      { key: 'company_name', label: 'Company Name', placeholder: '[Company Name]' },
      { key: 'vendor_name', label: 'Vendor Name', placeholder: '[Vendor Name]' },
      { key: 'services', label: 'Services/Products', placeholder: '[Services/Products]' },
      { key: 'payment_terms', label: 'Payment Terms', placeholder: '[Payment Terms]' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `VENDOR AGREEMENT

Date: [Date]

COMPANY: [Company Name]
VENDOR: [Vendor Name]

1. SCOPE: The Vendor shall provide [Services/Products] as per specifications.
2. PAYMENT: [Payment Terms]
3. QUALITY: All deliverables must meet agreed quality standards.
4. TERMINATION: 30 days written notice by either party.
5. LIABILITY: The Vendor shall be liable for any defects in goods/services provided.

Company: ___________________    Vendor: ___________________`,
  },
  {
    id: 'service-agreement',
    title: 'Service Agreement Template',
    description: 'General service agreement for professional service providers.',
    category: 'business',
    type: 'Agreement',
    downloads: 920,
    languages: ['English'],
    fields: [
      { key: 'client_name', label: 'Client Name', placeholder: '[Client Name]' },
      { key: 'provider_name', label: 'Service Provider Name', placeholder: '[Service Provider]' },
      { key: 'services', label: 'Services Description', placeholder: '[Services Description]' },
      { key: 'fee', label: 'Service Fee (₹)', placeholder: '[Service Fee]', type: 'number' },
      { key: 'date', label: 'Date', placeholder: '[Date]', type: 'date' },
    ],
    content: `SERVICE AGREEMENT

Date: [Date]

CLIENT: [Client Name]
SERVICE PROVIDER: [Service Provider]

1. SERVICES: [Services Description]
2. FEE: ₹[Service Fee]
3. DURATION: As per project requirements
4. WARRANTY: Provider guarantees quality of service for 30 days after completion.

Client: ___________________    Provider: ___________________`,
  },
  {
    id: 'freelancer-agreement',
    title: 'Freelancer Agreement Template',
    description: 'Contract template for freelance work engagements.',
    category: 'business',
    type: 'Contract',
    downloads: 1050,
    languages: ['English'],
    fields: [
      { key: 'client_name', label: 'Client Name', placeholder: '[Client Name]' },
      { key: 'freelancer_name', label: 'Freelancer Name', placeholder: '[Freelancer Name]' },
      { key: 'project_description', label: 'Project Description', placeholder: '[Project Description]' },
      { key: 'fee', label: 'Project Fee (₹)', placeholder: '[Project Fee]', type: 'number' },
      { key: 'deadline', label: 'Deadline', placeholder: '[Deadline]', type: 'date' },
    ],
    content: `FREELANCER AGREEMENT

CLIENT: [Client Name]
FREELANCER: [Freelancer Name]

1. PROJECT: [Project Description]
2. FEE: ₹[Project Fee]
3. DEADLINE: [Deadline]
4. PAYMENT: 50% advance, 50% on completion
5. INTELLECTUAL PROPERTY: All work product shall belong to the Client upon full payment.
6. REVISIONS: Up to 2 rounds of revisions included.

Client: ___________________    Freelancer: ___________________`,
  },
];
