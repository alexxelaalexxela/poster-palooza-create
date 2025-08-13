import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFingerprint } from '@/hooks/useFingerprint';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';

interface AttemptsCounterProps {
  className?: string;
}

export const AttemptsCounter = ({ className = '' }: AttemptsCounterProps) => {
  const { user } = useAuth();
  const visitorId = useFingerprint();
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = useCallback(async () => {
    if (!user && !visitorId) return;

    try {
      const { data, error } = await supabase.rpc('get_attempts', {
        p_visitor_id: user ? null : visitorId,
        p_user_id: user ? user.id : null,
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setAttemptsRemaining(row.attempts_remaining ?? 0);
        setIsPaid(!!row.is_paid);
      }
    } catch (e) {
      console.error('get_attempts error', e);
      setAttemptsRemaining(0);
      setIsPaid(false);
    }
  }, [user, visitorId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      await fetchAttempts();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [fetchAttempts]);

  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];
    if (user) {
      channels.push(
        supabase.channel('attempts-profiles')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, fetchAttempts)
          .subscribe()
      );
    } else if (visitorId) {
      channels.push(
        supabase.channel('attempts-visitor')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_user_links', filter: `visitor_id=eq.${visitorId}` }, fetchAttempts)
          .subscribe()
      );
    }

    const onManualRefresh = () => fetchAttempts();
    window.addEventListener('attempts:refresh', onManualRefresh);

    return () => {
      channels.forEach((ch) => { try { supabase.removeChannel(ch); } catch {} });
      window.removeEventListener('attempts:refresh', onManualRefresh);
    };
  }, [user, visitorId, fetchAttempts]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        Chargement...
      </div>
    );
  }

  if (attemptsRemaining === null) return null;

  const isAnonymous = !user;
  const maxAttempts = isPaid ? 15 : 3;
  const percentage = (attemptsRemaining / maxAttempts) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 bg-white/60 backdrop-blur rounded-xl ring-1 ring-gray-200 ${className}`}
    >
      <div className="flex items-center gap-2">
        {isPaid ? (
          <Sparkles size={16} className="text-yellow-500" />
        ) : (
          <AlertCircle size={16} className="text-blue-500" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {isAnonymous ? 'Tentatives restantes' : 'Générations restantes'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentage > 66 ? 'bg-green-500' : percentage > 33 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-800 min-w-[3rem]">
          {attemptsRemaining}/{maxAttempts}
        </span>
      </div>

      {!user && attemptsRemaining === 0 && (
        <span className="text-xs text-red-600 font-medium">
          Créez un compte pour continuer
        </span>
      )}
    </motion.div>
  );
};
