import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import ChatBot from '@/components/Chat/ChatBot';
import { useTranslation } from 'react-i18next';

type Role = 'user' | 'lawyer' | 'admin';

interface Props {
  children: React.ReactNode;
  allow: Role[];
}

/**
 * Strict role-based route guard.
 * - Unauthenticated users are sent to /login.
 * - Authenticated users whose role is not in `allow` are redirected to
 *   their own home (lawyer → /lawyer-dashboard, user → /dashboard, admin → /admin).
 * - Renders the appropriate chrome (Header + Navigation). The public consumer
 *   ChatBot is mounted ONLY for users, never for lawyers or admins.
 */
const RoleRoute: React.FC<Props> = ({ children, allow }) => {
  const { t } = useTranslation();
  const { user, profile, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const currentRole: Role = isAdmin
    ? 'admin'
    : profile?.user_type === 'lawyer'
    ? 'lawyer'
    : 'user';

  if (!allow.includes(currentRole)) {
    const home =
      currentRole === 'lawyer'
        ? '/lawyer-dashboard'
        : currentRole === 'admin'
        ? '/admin'
        : '/dashboard';
    return <Navigate to={home} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 ml-64 pt-16">{children}</main>
      </div>
      {currentRole === 'user' && <ChatBot />}
    </div>
  );
};

export default RoleRoute;
