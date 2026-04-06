import { useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';

export function CreateButton() {
  const navigate = useNavigate();
  const { roles } = useAuth();
  
  // Only show create button for Lyric or Epic users
  const canPublish = roles.includes('lyric') || roles.includes('epic');
  if (!canPublish) return null;

  return (
    <motion.button
      onClick={() => navigate('/create/poetry')}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 right-4 z-50 p-4 rounded-full shadow-lg bg-gradient-to-br from-primary to-warm-gold"
    >
      <Feather className="h-6 w-6 text-white" />
    </motion.button>
  );
}
