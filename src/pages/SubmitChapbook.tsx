import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { SubmitChapbookForm } from '@/components/chapbooks/SubmitChapbookForm';
import { BottomNav } from '@/components/BottomNav';

export default function SubmitChapbook() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SubmitChapbookForm />
      <BottomNav />
    </>
  );
}
