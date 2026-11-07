
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaRedo, FaSearch } from 'react-icons/fa';
import { BiLeaf } from 'react-icons/bi';

/**
 * Friendly error card. Never shows raw technical text to the customer.
 *
 * Props:
 *  - error    : the thrown error (axios error, Error, or undefined)
 *  - onRetry  : function to call when "Try again" is clicked (can be async)
 *  - compact  : smaller padding, for use inside a page section
 *  - kind     : force a kind: 'network' | 'server' | 'notFound' | 'generic'
 */
const getKind = (error) => {
  if (!error) return 'generic';
  const status = error?.response?.status;
  if (status === 404) return 'notFound';
  if (status >= 500) return 'server';
  if (error?.isAxiosError && !error?.response) return 'network'; // offline / timeout / CORS
  return 'generic';
};

const ErrorState = ({ error, onRetry, compact = false, kind }) => {
  const { t } = useTranslation();
  const [retrying, setRetrying] = useState(false);

  // Technical details go to the console for developers only
  useEffect(() => {
    if (error) console.error('[ErrorState]', error);
  }, [error]);

  const k = kind || getKind(error);

  const copy = {
    network: {
      title:   t('error.networkTitle', 'No connection'),
      message: t('error.network', 'We could not reach the server. Please check your internet connection and try again.'),
    },
    server: {
      title:   t('error.serverTitle', 'Our kitchen is busy'),
      message: t('error.server', 'The server is having a temporary problem. Please try again in a moment.'),
    },
    notFound: {
      title:   t('error.notFoundTitle', 'Nothing here'),
      message: t('error.notFound', 'We could not find what you are looking for.'),
    },
    generic: {
      title:   t('error.title', 'Oops! Something went wrong'),
      message: t('error.generic', 'An unexpected problem occurred. Please try again.'),
    },
  }[k];

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center px-6 ${compact ? 'py-14' : 'py-28'}`}
    >
      <div className="w-20 h-20 rounded-full bg-[#FFF8F2] border border-[#F58220]/20 flex items-center justify-center mb-6">
        {k === 'notFound'
          ? <FaSearch className="text-[#F58220]" size={26} />
          : <BiLeaf className="text-[#F58220]" size={34} />}
      </div>

      <h3 className="text-lg font-black text-[#2D4A22] uppercase tracking-tight mb-2">
        {copy.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
        {copy.message}
      </p>

      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2D4A22] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#F58220] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FaRedo size={11} className={retrying ? 'animate-spin' : ''} />
          {retrying ? t('error.retrying', 'Retrying...') : t('error.retry', 'Try again')}
        </button>
      )}
    </div>
  );
};

export default ErrorState;