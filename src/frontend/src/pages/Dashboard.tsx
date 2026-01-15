import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import WelcomeHero from '../components/WelcomeHero';
import DashboardContent from '../components/DashboardContent';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <WelcomeHero />;
  }

  return <DashboardContent userProfile={userProfile} />;
}
