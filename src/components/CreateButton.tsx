import { useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { motion } from 'framer-motion';

export function CreateButton() {
  const navigate = useNavigate();

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
