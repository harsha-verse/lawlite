export interface DocumentField {
  id: string;
  label: string;
  labelHi: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface DocumentType {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  icon: string;
  category: string;
  fields: DocumentField[];
  suggestedAuthority?: string;
  authorityLink?: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'police-complaint',
    title: 'Police Complaint Letter',
    titleHi: 'पुलिस शिकायत पत्र',
    description: 'File a formal complaint with the police station',
    descriptionHi: 'पुलिस स्टेशन में औपचारिक शिकायत दर्ज करें',
    icon: '🚔',
    category: 'criminal',
    suggestedAuthority: 'Local Police Station',
    authorityLink: 'https://cybercrime.gov.in',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Your Address', labelHi: 'आपका पता', type: 'textarea', required: true },
      { id: 'phone', label: 'Phone Number', labelHi: 'फोन नंबर', type: 'text', required: true },
      { id: 'incidentDate', label: 'Date of Incident', labelHi: 'घटना की तारीख', type: 'date', required: true },
      { id: 'incidentLocation', label: 'Location of Incident', labelHi: 'घटना का स्थान', type: 'text', required: true },
      { id: 'description', label: 'Description of Incident', labelHi: 'घटना का विवरण', type: 'textarea', required: true, placeholder: 'Describe what happened in detail...' },
      { id: 'accusedDetails', label: 'Accused Person Details (if known)', labelHi: 'आरोपी का विवरण (यदि पता हो)', type: 'textarea', required: false },
    ],
  },
  {
    id: 'consumer-complaint',
    title: 'Consumer Complaint Letter',
    titleHi: 'उपभोक्ता शिकायत पत्र',
    description: 'Complaint against defective product or poor service',
    descriptionHi: 'खराब उत्पाद या सेवा के खिलाफ शिकायत',
    icon: '🛒',
    category: 'consumer',
    suggestedAuthority: 'Consumer Court / National Consumer Helpline',
    authorityLink: 'https://consumerhelpline.gov.in',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Your Address', labelHi: 'आपका पता', type: 'textarea', required: true },
      { id: 'companyName', label: 'Company / Seller Name', labelHi: 'कंपनी / विक्रेता का नाम', type: 'text', required: true },
      { id: 'productService', label: 'Product or Service', labelHi: 'उत्पाद या सेवा', type: 'text', required: true },
      { id: 'purchaseDate', label: 'Purchase Date', labelHi: 'खरीद की तारीख', type: 'date', required: true },
      { id: 'amount', label: 'Amount Paid (₹)', labelHi: 'भुगतान राशि (₹)', type: 'text', required: true },
      { id: 'issue', label: 'Describe the Issue', labelHi: 'समस्या का विवरण', type: 'textarea', required: true },
      { id: 'hasBill', label: 'Do you have purchase bill?', labelHi: 'क्या आपके पास बिल है?', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'relief', label: 'Relief Sought (Refund/Replacement/Compensation)', labelHi: 'मांगी गई राहत', type: 'text', required: true },
    ],
  },
  {
    id: 'legal-notice',
    title: 'Legal Notice Draft',
    titleHi: 'कानूनी नोटिस ड्राफ्ट',
    description: 'Send a formal legal notice before taking legal action',
    descriptionHi: 'कानूनी कार्रवाई से पहले औपचारिक कानूनी नोटिस',
    icon: '⚖️',
    category: 'civil',
    fields: [
      { id: 'senderName', label: 'Sender (Your) Name', labelHi: 'भेजने वाले का नाम', type: 'text', required: true },
      { id: 'senderAddress', label: 'Sender Address', labelHi: 'भेजने वाले का पता', type: 'textarea', required: true },
      { id: 'recipientName', label: 'Recipient Name', labelHi: 'प्राप्तकर्ता का नाम', type: 'text', required: true },
      { id: 'recipientAddress', label: 'Recipient Address', labelHi: 'प्राप्तकर्ता का पता', type: 'textarea', required: true },
      { id: 'subject', label: 'Subject of Notice', labelHi: 'नोटिस का विषय', type: 'text', required: true },
      { id: 'facts', label: 'Facts of the Case', labelHi: 'मामले के तथ्य', type: 'textarea', required: true },
      { id: 'demand', label: 'Demand / Relief Sought', labelHi: 'मांग / राहत', type: 'textarea', required: true },
      { id: 'deadline', label: 'Deadline for Response (days)', labelHi: 'जवाब की समय सीमा (दिन)', type: 'text', required: true, placeholder: '15' },
    ],
  },
  {
    id: 'salary-complaint',
    title: 'Salary / Employment Complaint',
    titleHi: 'वेतन / रोजगार शिकायत',
    description: 'Complaint for unpaid salary or employment issues',
    descriptionHi: 'अवैतनिक वेतन या रोजगार मुद्दों की शिकायत',
    icon: '💼',
    category: 'labour',
    suggestedAuthority: 'Labour Commissioner Office',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Your Address', labelHi: 'आपका पता', type: 'textarea', required: true },
      { id: 'employerName', label: 'Employer / Company Name', labelHi: 'नियोक्ता / कंपनी का नाम', type: 'text', required: true },
      { id: 'employerAddress', label: 'Employer Address', labelHi: 'नियोक्ता का पता', type: 'textarea', required: true },
      { id: 'designation', label: 'Your Designation', labelHi: 'आपका पद', type: 'text', required: true },
      { id: 'joiningDate', label: 'Date of Joining', labelHi: 'कार्यग्रहण तिथि', type: 'date', required: true },
      { id: 'salary', label: 'Monthly Salary (₹)', labelHi: 'मासिक वेतन (₹)', type: 'text', required: true },
      { id: 'pendingMonths', label: 'Months of Pending Salary', labelHi: 'लंबित वेतन के महीने', type: 'text', required: true },
      { id: 'hasContract', label: 'Written Employment Contract?', labelHi: 'लिखित रोजगार अनुबंध?', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'additionalDetails', label: 'Additional Details', labelHi: 'अतिरिक्त विवरण', type: 'textarea', required: false },
    ],
  },
  {
    id: 'tenant-complaint',
    title: 'Tenant Complaint Letter',
    titleHi: 'किरायेदार शिकायत पत्र',
    description: 'Complaint for deposit return, eviction, or rental issues',
    descriptionHi: 'जमा वापसी, बेदखली, या किराए के मुद्दों की शिकायत',
    icon: '🏠',
    category: 'property',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Rental Property Address', labelHi: 'किराये की संपत्ति का पता', type: 'textarea', required: true },
      { id: 'landlordName', label: 'Landlord Name', labelHi: 'मकान मालिक का नाम', type: 'text', required: true },
      { id: 'rentAmount', label: 'Monthly Rent (₹)', labelHi: 'मासिक किराया (₹)', type: 'text', required: true },
      { id: 'depositAmount', label: 'Security Deposit (₹)', labelHi: 'सुरक्षा जमा (₹)', type: 'text', required: true },
      { id: 'issueType', label: 'Type of Issue', labelHi: 'समस्या का प्रकार', type: 'select', required: true, options: ['Deposit not returned', 'Illegal eviction', 'Maintenance issues', 'Rent increase dispute', 'Other'] },
      { id: 'description', label: 'Describe the Issue', labelHi: 'समस्या का विवरण', type: 'textarea', required: true },
      { id: 'hasAgreement', label: 'Rental Agreement Exists?', labelHi: 'किराया समझौता है?', type: 'select', required: true, options: ['Yes', 'No'] },
    ],
  },
  {
    id: 'cybercrime-complaint',
    title: 'Cybercrime Complaint Draft',
    titleHi: 'साइबर अपराध शिकायत',
    description: 'Report online fraud, hacking, or cyber harassment',
    descriptionHi: 'ऑनलाइन धोखाधड़ी, हैकिंग, या साइबर उत्पीड़न की रिपोर्ट',
    icon: '💻',
    category: 'cyber',
    suggestedAuthority: 'National Cyber Crime Reporting Portal',
    authorityLink: 'https://cybercrime.gov.in',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Your Address', labelHi: 'आपका पता', type: 'textarea', required: true },
      { id: 'phone', label: 'Phone Number', labelHi: 'फोन नंबर', type: 'text', required: true },
      { id: 'crimeType', label: 'Type of Cybercrime', labelHi: 'साइबर अपराध का प्रकार', type: 'select', required: true, options: ['Online Fraud / UPI Fraud', 'Hacking', 'Identity Theft', 'Cyber Harassment', 'Social Media Abuse', 'Phishing / OTP Fraud', 'Other'] },
      { id: 'incidentDate', label: 'Date of Incident', labelHi: 'घटना की तारीख', type: 'date', required: true },
      { id: 'description', label: 'Describe what happened', labelHi: 'क्या हुआ बताएं', type: 'textarea', required: true },
      { id: 'financialLoss', label: 'Financial Loss (₹) if any', labelHi: 'वित्तीय नुकसान (₹)', type: 'text', required: false },
      { id: 'evidence', label: 'Evidence Available (screenshots, URLs etc.)', labelHi: 'उपलब्ध साक्ष्य', type: 'textarea', required: false },
    ],
  },
  {
    id: 'loan-harassment',
    title: 'Loan Harassment Complaint',
    titleHi: 'लोन उत्पीड़न शिकायत',
    description: 'Complaint against illegal loan recovery or harassment',
    descriptionHi: 'अवैध वसूली या उत्पीड़न के खिलाफ शिकायत',
    icon: '🏦',
    category: 'consumer',
    suggestedAuthority: 'RBI Complaint Portal',
    authorityLink: 'https://cms.rbi.org.in',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Your Address', labelHi: 'आपका पता', type: 'textarea', required: true },
      { id: 'lenderName', label: 'Lender / Company Name', labelHi: 'ऋणदाता / कंपनी का नाम', type: 'text', required: true },
      { id: 'loanAmount', label: 'Loan Amount (₹)', labelHi: 'ऋण राशि (₹)', type: 'text', required: true },
      { id: 'harassmentType', label: 'Type of Harassment', labelHi: 'उत्पीड़न का प्रकार', type: 'select', required: true, options: ['Threatening calls', 'Contacting family/friends', 'Abusive language', 'Physical threats', 'Unauthorized access to contacts', 'Other'] },
      { id: 'description', label: 'Describe the harassment', labelHi: 'उत्पीड़न का विवरण', type: 'textarea', required: true },
    ],
  },
  {
    id: 'rental-agreement',
    title: 'Basic Rental Agreement',
    titleHi: 'बुनियादी किराया समझौता',
    description: 'Generate a basic rental agreement between landlord and tenant',
    descriptionHi: 'मकान मालिक और किरायेदार के बीच बुनियादी किराया समझौता',
    icon: '📋',
    category: 'property',
    fields: [
      { id: 'landlordName', label: 'Landlord Name', labelHi: 'मकान मालिक का नाम', type: 'text', required: true },
      { id: 'landlordAddress', label: 'Landlord Address', labelHi: 'मकान मालिक का पता', type: 'textarea', required: true },
      { id: 'tenantName', label: 'Tenant Name', labelHi: 'किरायेदार का नाम', type: 'text', required: true },
      { id: 'tenantAddress', label: 'Tenant Permanent Address', labelHi: 'किरायेदार का स्थायी पता', type: 'textarea', required: true },
      { id: 'propertyAddress', label: 'Rental Property Address', labelHi: 'किराये की संपत्ति का पता', type: 'textarea', required: true },
      { id: 'rent', label: 'Monthly Rent (₹)', labelHi: 'मासिक किराया (₹)', type: 'text', required: true },
      { id: 'deposit', label: 'Security Deposit (₹)', labelHi: 'सुरक्षा जमा (₹)', type: 'text', required: true },
      { id: 'startDate', label: 'Agreement Start Date', labelHi: 'समझौता प्रारंभ तिथि', type: 'date', required: true },
      { id: 'duration', label: 'Duration (months)', labelHi: 'अवधि (महीने)', type: 'select', required: true, options: ['6', '11', '12', '24', '36'] },
    ],
  },
  {
    id: 'property-dispute',
    title: 'Property Dispute Complaint',
    titleHi: 'संपत्ति विवाद शिकायत',
    description: 'Complaint for land encroachment, ownership dispute etc.',
    descriptionHi: 'भूमि अतिक्रमण, स्वामित्व विवाद आदि की शिकायत',
    icon: '🏗️',
    category: 'property',
    suggestedAuthority: 'Civil Court / Legal Services Authority',
    fields: [
      { id: 'fullName', label: 'Your Full Name', labelHi: 'आपका पूरा नाम', type: 'text', required: true },
      { id: 'address', label: 'Your Address', labelHi: 'आपका पता', type: 'textarea', required: true },
      { id: 'propertyLocation', label: 'Property Location', labelHi: 'संपत्ति का स्थान', type: 'textarea', required: true },
      { id: 'disputeType', label: 'Type of Dispute', labelHi: 'विवाद का प्रकार', type: 'select', required: true, options: ['Land encroachment', 'Boundary dispute', 'Ownership dispute', 'Illegal construction', 'Property fraud', 'Other'] },
      { id: 'opposingParty', label: 'Opposing Party Details', labelHi: 'विरोधी पक्ष का विवरण', type: 'textarea', required: true },
      { id: 'hasDocuments', label: 'Do you have ownership documents?', labelHi: 'क्या आपके पास स्वामित्व दस्तावेज़ हैं?', type: 'select', required: true, options: ['Yes', 'No', 'Partial'] },
      { id: 'description', label: 'Describe the dispute', labelHi: 'विवाद का विवरण', type: 'textarea', required: true },
    ],
  },
];

export function getDocumentTypesByCategory(category?: string): DocumentType[] {
  if (!category) return DOCUMENT_TYPES;
  return DOCUMENT_TYPES.filter(d => d.category === category);
}
