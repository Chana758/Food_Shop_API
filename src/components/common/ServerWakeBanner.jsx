import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaRedo } from 'react-icons/fa';
import { getServerState, subscribeServerState, wakeServer } from '../../api/serverWake';

/**
 * Small notice shown while the free Render server is waking up
 * (first visit after ~15 min of no traffic). Hidden the rest of the time.
 */
const ServerWakeBanner = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(getServerState().status);
  const [showReady, setShowReady] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let wasWaking = false;
    let readyTimer;
    const unsubscribe = subscribeServerState((s) => {
      setStatus(s.status);
      if (s.status === 'waking' || s.status === 'down') wasWaking = true;
      if (s.status === 'awake' && wasWaking) {
        wasWaking = false;
        setShowReady(true);
        clearTimeout(readyTimer);
        readyTimer = setTimeout(() => setShowReady(false), 2500);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(readyTimer);
    };
  }, []);

  // Elapsed-time counter while waking
  useEffect(() => {
    if (status !== 'waking') return undefined;
    const started = getServerState().startedAt || Date.now();
    const tick = () => setSeconds(Math.round((Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status]);

  const visible = status === 'waking' || status === 'down' || showReady;
  if (!visible) return null;

  const base =
    'fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-[calc(100%-2rem)] max-w-md ' +
    'rounded-2xl shadow-xl px-5 py-4 flex items-start gap-3 text-left';

  if (showReady && status === 'awake') {
    return (
      <div role="status" className={`${base} bg-[#2D4A22] text-white`}>
        <FaCheckCircle className="text-[#F58220] mt-0.5 shrink-0" size={18} />
        <p className="text-sm font-bold">{t('server.ready')}</p>
      </div>
    );
  }

  if (status === 'down') {
    return (
      <div role="alert" className={`${base} bg-white border border-red-200 text-gray-700`}>
        <div className="flex-1">
          <p className="text-sm font-black text-red-600">{t('server.downTitle')}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t('server.downHint')}</p>
        </div>
        <button
          onClick={() => wakeServer({ force: true })}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D4A22] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#F58220] transition-colors"
        >
          <FaRedo size={10} /> {t('server.retry')}
        </button>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className={`${base} bg-[#2D4A22] text-white`}>
      <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white/30 border-t-[#F58220] animate-spin" />
      <div className="flex-1">
        <p className="text-sm font-black">
          {t('server.waking')} <span className="font-normal text-white/60">({seconds}s)</span>
        </p>
        <p className="text-xs text-white/70 mt-1 leading-relaxed">{t('server.wakingHint')}</p>
      </div>
    </div>
  );
};

export default ServerWakeBanner;
