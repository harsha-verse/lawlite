
-- User roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'lawyer')),
  state TEXT,
  city TEXT,
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lawyer verification status enum
CREATE TYPE public.lawyer_verification_status AS ENUM ('pending', 'under_review', 'verified', 'rejected');
CREATE TYPE public.lawyer_role_type AS ENUM ('junior_lawyer', 'advocate', 'senior_advocate', 'legal_consultant');

-- Lawyer profiles table
CREATE TABLE public.lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bar_council_number TEXT NOT NULL,
  year_of_practice INTEGER NOT NULL DEFAULT 0,
  role_type lawyer_role_type NOT NULL DEFAULT 'advocate',
  practice_areas TEXT[] NOT NULL DEFAULT '{}',
  specialization TEXT,
  consultation_fee INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  bio TEXT,
  verification_status lawyer_verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- Lawyer documents for verification
CREATE TABLE public.lawyer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('bar_certificate', 'government_id', 'professional_photo')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lawyer_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles: only admins can manage, users can read their own
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles: users can CRUD their own
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- lawyer_profiles: lawyers can manage own, everyone can read verified
CREATE POLICY "Anyone can read verified lawyers" ON public.lawyer_profiles FOR SELECT TO authenticated USING (verification_status = 'verified');
CREATE POLICY "Lawyers can read own profile" ON public.lawyer_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Lawyers can insert own profile" ON public.lawyer_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Lawyers can update own profile" ON public.lawyer_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all lawyer profiles" ON public.lawyer_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- lawyer_documents: lawyers manage own, admins can view all
CREATE POLICY "Lawyers can manage own documents" ON public.lawyer_documents FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all documents" ON public.lawyer_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type, state, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'user'),
    NEW.raw_user_meta_data->>'state',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for lawyer documents
INSERT INTO storage.buckets (id, name, public) VALUES ('lawyer-documents', 'lawyer-documents', false);

-- Storage RLS
CREATE POLICY "Lawyers can upload own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lawyer-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Lawyers can read own documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'lawyer-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins can read all lawyer documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'lawyer-documents' AND public.has_role(auth.uid(), 'admin'));
