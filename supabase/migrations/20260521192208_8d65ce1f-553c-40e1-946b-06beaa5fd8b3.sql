
-- =================== Consultants tables ===================
CREATE TABLE public.consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  qualification text,
  description text,
  experience integer NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0,
  total_reviews integer NOT NULL DEFAULT 0,
  consultation_fee integer NOT NULL DEFAULT 0,
  city text,
  state text,
  languages text[] DEFAULT '{}',
  expertise text[] DEFAULT '{}',
  avatar_url text,
  verified boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read consultants" ON public.consultants FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage consultants" ON public.consultants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.consultant_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES public.consultants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  consultation_type text NOT NULL DEFAULT 'online',
  topic text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consultant_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own bookings" ON public.consultant_bookings FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Clients create bookings" ON public.consultant_bookings FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients update own bookings" ON public.consultant_bookings FOR UPDATE TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Admins manage bookings" ON public.consultant_bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =================== Direct messaging ===================
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('lawyer','consultant','demo_lawyer')),
  recipient_id uuid NOT NULL,
  subject text,
  message text NOT NULL,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sender can read own" ON public.direct_messages FOR SELECT TO authenticated USING (sender_id = auth.uid());
CREATE POLICY "Lawyer recipient can read" ON public.direct_messages FOR SELECT TO authenticated USING (recipient_type='lawyer' AND recipient_id = auth.uid());
CREATE POLICY "Authenticated can send" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Admins read all messages" ON public.direct_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =================== Demo Lawyers (showcase data, no auth user) ===================
CREATE TABLE public.demo_lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  city text,
  state text,
  role_type text NOT NULL DEFAULT 'advocate',
  bar_council_number text NOT NULL,
  year_of_practice integer NOT NULL,
  experience integer NOT NULL,
  practice_areas text[] DEFAULT '{}',
  specialization text,
  consultation_fee integer NOT NULL DEFAULT 0,
  consultation_duration integer NOT NULL DEFAULT 30,
  consultation_types text[] DEFAULT '{}',
  available_days text[] DEFAULT '{}',
  available_start_time text DEFAULT '10:00',
  available_end_time text DEFAULT '18:00',
  bio text,
  tagline text,
  law_firm text,
  languages_spoken text[] DEFAULT '{}',
  court_jurisdictions text[] DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 0,
  total_reviews integer NOT NULL DEFAULT 0,
  total_cases integer NOT NULL DEFAULT 0,
  education jsonb DEFAULT '[]'::jsonb,
  case_stats jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.demo_lawyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read demo lawyers" ON public.demo_lawyers FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage demo lawyers" ON public.demo_lawyers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =================== Seed Demo Consultants ===================
INSERT INTO public.consultants (name, specialization, qualification, description, experience, rating, total_reviews, consultation_fee, city, state, languages, expertise, email) VALUES
('Dr. Anjali Mehta','Legal Consultation & Advisory','LLM, PhD in Law','Expert in providing strategic legal advice for complex business and personal matters.',15,4.9,234,800,'Mumbai','Maharashtra',ARRAY['English','Hindi','Marathi'],ARRAY['Business Strategy','Legal Compliance','Risk Management'],'anjali.mehta@lawlite.demo'),
('Prof. Ramesh Kumar','Constitutional Law Expert','LLM Constitutional Law','Constitutional law professor with 20+ years of advisory and court experience.',20,4.8,189,1200,'Delhi','Delhi',ARRAY['English','Hindi'],ARRAY['Constitutional Rights','Government Law','Public Policy'],'ramesh.kumar@lawlite.demo'),
('Adv. Priya Sinha','Corporate Legal Advisory','LLM Corporate Law, MBA','Specialized in corporate governance, mergers, and startup legal frameworks.',12,4.7,156,1500,'Bangalore','Karnataka',ARRAY['English','Hindi','Kannada'],ARRAY['Startup Law','M&A','Corporate Governance'],'priya.sinha@lawlite.demo'),
('Dr. Kavita Sharma','Family Law Counselor','LLM Family Law, Counseling Cert.','Combines legal expertise with counseling to resolve family disputes amicably.',10,4.9,201,600,'Pune','Maharashtra',ARRAY['English','Hindi','Marathi'],ARRAY['Mediation','Divorce Counseling','Child Custody'],'kavita.sharma@lawlite.demo'),
('Adv. Suresh Nair','Property Law Consultant','LLM Property Law','Expert in property transactions, land acquisition, and real estate disputes.',18,4.6,98,1000,'Kochi','Kerala',ARRAY['English','Malayalam','Hindi'],ARRAY['Real Estate','Land Acquisition','Property Disputes'],'suresh.nair@lawlite.demo'),
('Dr. Meera Gupta','Intellectual Property Expert','LLM IP Law, Patent Agent','Specializes in IP protection, patent filing, and technology law.',14,4.8,167,1800,'Hyderabad','Telangana',ARRAY['English','Hindi','Telugu'],ARRAY['Patents','Trademarks','Copyrights'],'meera.gupta@lawlite.demo'),
('Adv. Vikram Reddy','Criminal Defense Strategist','LLM Criminal Law','Renowned criminal defense strategist with high success rate in complex trials.',22,4.9,312,1800,'Chennai','Tamil Nadu',ARRAY['English','Tamil','Telugu'],ARRAY['Criminal Defense','Bail Matters','White Collar Crime'],'vikram.reddy@lawlite.demo'),
('Adv. Neha Kapoor','Cyber Law & Data Privacy','LLM Cyber Law, CIPP','Advises corporates on cyber crime, GDPR, and IT Act compliance.',9,4.7,142,1400,'Gurugram','Haryana',ARRAY['English','Hindi','Punjabi'],ARRAY['Cyber Crime','Data Protection','IT Compliance'],'neha.kapoor@lawlite.demo');

-- =================== Seed Demo Lawyers ===================
INSERT INTO public.demo_lawyers (name,email,phone,city,state,role_type,bar_council_number,year_of_practice,experience,practice_areas,specialization,consultation_fee,consultation_types,available_days,bio,tagline,law_firm,languages_spoken,court_jurisdictions,rating,total_reviews,total_cases,education,case_stats) VALUES
('Adv. Arjun Menon','arjun.menon@lawlite.demo','+91-98450-12345','Bangalore','Karnataka','advocate','KAR/2014/1023',2014,11,ARRAY['Family Law','Civil Litigation'],'Family Law',900,ARRAY['Online','Phone','In-Person'],ARRAY['Mon','Tue','Wed','Thu','Fri'],'Family and civil litigation specialist with 11 years of courtroom experience across the Karnataka High Court and district courts. Handles divorces, custody, partition and consumer matters with clarity.','Resolving family matters with empathy and rigor.','Menon Legal Associates',ARRAY['English','Hindi','Kannada'],ARRAY['Karnataka High Court','Bangalore Civil Court'],4.8,67,151,
'[{"degree":"LLB","university":"National Law School of India University, Bangalore","graduation_year":2013,"certifications":"Mediation Certification 2018"}]'::jsonb,
'[{"case_category":"Divorce & Maintenance","cases_handled":82},{"case_category":"Child Custody","cases_handled":41},{"case_category":"Civil Disputes","cases_handled":28}]'::jsonb),

('Adv. Sneha Iyer','sneha.iyer@lawlite.demo','+91-98201-22113','Mumbai','Maharashtra','senior_advocate','MAH/2010/2298',2010,15,ARRAY['Corporate Law','Mergers & Acquisitions'],'Corporate Law',1800,ARRAY['Online','In-Person'],ARRAY['Mon','Tue','Wed','Thu','Fri'],'Senior corporate counsel advising listed companies and high-growth startups on M&A, governance, SEBI compliance and complex commercial contracts.','Strategic counsel for ambitious businesses.','Iyer & Partners',ARRAY['English','Hindi','Marathi'],ARRAY['Bombay High Court','NCLT Mumbai'],4.9,142,164,
'[{"degree":"LLM Corporate Law","university":"Government Law College, Mumbai","graduation_year":2009,"certifications":"Company Secretary"}]'::jsonb,
'[{"case_category":"M&A Transactions","cases_handled":54},{"case_category":"Corporate Governance","cases_handled":71},{"case_category":"SEBI Compliance","cases_handled":39}]'::jsonb),

('Adv. Rohit Verma','rohit.verma@lawlite.demo','+91-98101-33122','Delhi','Delhi','senior_advocate','DEL/2008/0788',2008,17,ARRAY['Criminal Law','Constitutional Law'],'Criminal Law',2200,ARRAY['Online','Phone','In-Person'],ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'],'Criminal defence and constitutional matters before the Supreme Court of India and Delhi High Court. Frequently briefed on bail, anticipatory bail and writ petitions.','Defending rights, upholding justice.','Verma Chambers',ARRAY['English','Hindi'],ARRAY['Supreme Court of India','Delhi High Court'],4.7,201,254,
'[{"degree":"LLM Criminal Law","university":"Faculty of Law, Delhi University","graduation_year":2007,"certifications":"Supreme Court Advocate-on-Record"}]'::jsonb,
'[{"case_category":"Criminal Trials","cases_handled":120},{"case_category":"Bail Matters","cases_handled":88},{"case_category":"Constitutional Writs","cases_handled":46}]'::jsonb),

('Adv. Isha Bansal','isha.bansal@lawlite.demo','+91-97990-44215','Jaipur','Rajasthan','advocate','RAJ/2016/4011',2016,9,ARRAY['Property Disputes','Civil Litigation'],'Property Disputes',700,ARRAY['Online','Phone'],ARRAY['Mon','Tue','Wed','Thu','Fri'],'Property and civil litigation lawyer handling title disputes, partition suits, tenancy and revenue matters across Rajasthan.','Clear titles, peaceful possession.','Bansal Law Office',ARRAY['English','Hindi'],ARRAY['Rajasthan High Court'],4.5,38,53,
'[{"degree":"LLB","university":"University of Rajasthan","graduation_year":2015}]'::jsonb,
'[{"case_category":"Title Disputes","cases_handled":31},{"case_category":"Partition Suits","cases_handled":22}]'::jsonb),

('Adv. Karthik Rao','karthik.rao@lawlite.demo','+91-98480-55321','Hyderabad','Telangana','advocate','TS/2012/3344',2012,13,ARRAY['Cyber Law','Corporate Law'],'Cyber Law',1300,ARRAY['Online','Phone'],ARRAY['Mon','Tue','Wed','Thu','Fri'],'Cyber law and data protection expert advising IT companies in Hyderabad and Bangalore corridors on IT Act, DPDP Act and cyber crime defence.','Securing the digital frontier.','Rao Tech Legal',ARRAY['English','Hindi','Telugu'],ARRAY['Telangana High Court'],4.8,89,140,
'[{"degree":"LLM Cyber Law","university":"NALSAR Hyderabad","graduation_year":2011,"certifications":"Certified Privacy Professional"}]'::jsonb,
'[{"case_category":"Data Protection","cases_handled":45},{"case_category":"Cyber Fraud Defense","cases_handled":37},{"case_category":"IT Contracts","cases_handled":58}]'::jsonb),

('Adv. Fatima Khan','fatima.khan@lawlite.demo','+91-95220-66433','Lucknow','Uttar Pradesh','advocate','UP/2017/5621',2017,8,ARRAY['Family Law','Women Rights'],'Family Law',500,ARRAY['Online','Phone','In-Person'],ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'],'Family and women rights advocate. Pro-bono support for domestic violence, maintenance, dowry harassment and women safety cases.','Justice for women, dignity for all.','Khan Legal Aid',ARRAY['English','Hindi','Urdu'],ARRAY['Allahabad High Court Lucknow Bench'],4.9,118,150,
'[{"degree":"LLB","university":"Aligarh Muslim University","graduation_year":2016,"certifications":"Domestic Violence Act Specialist"}]'::jsonb,
'[{"case_category":"Domestic Violence","cases_handled":64},{"case_category":"Maintenance","cases_handled":49},{"case_category":"Women Rights","cases_handled":37}]'::jsonb),

('Sr. Adv. Siddharth Joshi','siddharth.joshi@lawlite.demo','+91-98671-77922','Mumbai','Maharashtra','senior_advocate','MAH/2003/0145',2003,22,ARRAY['Constitutional Law','Tax Law','Corporate Law'],'Constitutional Law',3500,ARRAY['In-Person','Online'],ARRAY['Tue','Wed','Thu'],'Senior counsel with 22 years before the Bombay High Court and Supreme Court of India. Practice spans constitutional, tax, and complex commercial litigation.','Two decades of constitutional advocacy.','Joshi Senior Chambers',ARRAY['English','Hindi','Marathi','Gujarati'],ARRAY['Supreme Court of India','Bombay High Court'],5.0,287,286,
'[{"degree":"LLM Constitutional Law","university":"National Law School of India University, Bangalore","graduation_year":2002,"certifications":"Senior Advocate Designation 2018"}]'::jsonb,
'[{"case_category":"Constitutional Writs","cases_handled":98},{"case_category":"Tax Appeals","cases_handled":76},{"case_category":"Commercial Disputes","cases_handled":112}]'::jsonb),

('Adv. Ananya Das','ananya.das@lawlite.demo','+91-98311-88011','Kolkata','West Bengal','advocate','WB/2015/7782',2015,10,ARRAY['Consumer Rights','Civil Litigation'],'Consumer Rights',600,ARRAY['Online','Phone','In-Person'],ARRAY['Mon','Tue','Wed','Thu','Fri'],'Consumer rights and civil litigation lawyer, frequently representing residents in District and State Consumer Commissions and recovery suits.','Empowering consumers, one case at a time.','Das & Associates',ARRAY['English','Hindi','Bengali'],ARRAY['Calcutta High Court','WB State Consumer Commission'],4.6,72,122,
'[{"degree":"LLB","university":"Calcutta University","graduation_year":2014}]'::jsonb,
'[{"case_category":"Consumer Complaints","cases_handled":88},{"case_category":"Civil Recovery","cases_handled":34}]'::jsonb);
