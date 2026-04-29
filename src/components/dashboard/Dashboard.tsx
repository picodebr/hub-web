import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubUser } from '@/_base/interfaces/user';
import AccountSettings from './AccountSettings';
import MyCertificates from './MyCertificates';
import RecentProjects from './RecentProjects';
import QuickGuide from './QuickGuide';
import StudentExtract from './StudentExtract';
import { useSelectedSchool } from '@/components/Page/components/Header';

interface DashboardProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

/**
 * Dashboard Component - Main profile view with all dashboard panels
 * Combines AccountSettings, MyCertificates, RecentProjects, QuickGuide, and StudentExtract
 */
const Dashboard: React.FC<DashboardProps> = ({ isDark, onToggleTheme }) => {
  const { user } = useAuth();
  const router = useCustomRouter();
  const { school } = useSelectedSchool();
  const [isStudent, setIsStudent] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    setIsStudent(user?.role === 'student');
  }, [user, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  if (!user) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Student-specific layout */}
      {isStudent ? (
        <>
          {/* Row 1: Certificates & Extract */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <MyCertificates isDark={isDark} />
            <StudentExtract isDark={isDark} />
          </div>

          {/* Row 2: Settings only */}
          <div className="grid grid-cols-1">
            <AccountSettings
              user={user}
              isDark={isDark}
              onToggleTheme={onToggleTheme}
            />
          </div>
        </>
      ) : (
        <>
          {/* Row 1: Guide & Certificates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <QuickGuide isDark={isDark} />
            <MyCertificates isDark={isDark} />
          </div>

          {/* Row 2: Recent Projects */}
          <RecentProjects
            isDark={isDark}
            schoolId={school?.hub_school_id}
          />

          {/* Row 3: Settings */}
          <div className="grid grid-cols-1">
            <AccountSettings
              user={user}
              isDark={isDark}
              onToggleTheme={onToggleTheme}
            />
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
