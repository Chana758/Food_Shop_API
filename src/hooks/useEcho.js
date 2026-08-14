import { useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Singleton echo instance — create once, reuse everywhere.
let echoInstance = null;
let echoInitAttempted = false;

const getEcho = () => {
    if (echoInstance || echoInitAttempted) return echoInstance;
    echoInitAttempted = true;

    const key = import.meta.env.VITE_REVERB_APP_KEY;
    if (!key) {
        console.error(
            '[Echo] VITE_REVERB_APP_KEY is missing. Check your .env file ' +
            'and restart `npm run dev`. Real-time updates are disabled; ' +
            'the 15s polling fallback will still work.'
        );
        return null;
    }

    echoInstance = new Echo({
        broadcaster:       'reverb',
        key,
        wsHost:            import.meta.env.VITE_REVERB_HOST,
        wsPort:            import.meta.env.VITE_REVERB_PORT ?? 8080,
        wssPort:           import.meta.env.VITE_REVERB_PORT ?? 8080,
        forceTLS:          (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        disableStats:      true,
    });

    echoInstance.connector.pusher.connection.bind('connected', () => {
        console.info('[Echo] connected to Reverb');
    });
    echoInstance.connector.pusher.connection.bind('unavailable', () => {
        console.warn(
            '[Echo] could not reach Reverb at',
            `${import.meta.env.VITE_REVERB_SCHEME ?? 'http'}://${import.meta.env.VITE_REVERB_HOST}:${import.meta.env.VITE_REVERB_PORT ?? 8080}`,
            '— run `php artisan reverb:start`. Real-time updates are paused; the dashboard\'s 15s polling fallback still works.'
        );
    });

    return echoInstance;
};

/**
 
 * @param {number|null} orderId     - order to watch, or null for "all orders"
 * @param {Function}    onPaid      - single-order mode: fires when status === 'paid'
 * @param {Function}    onRejected  - single-order mode: fires when status === 'cancelled'
 * @param {Function}    onAnyChange - broadcast-wide mode: fires for any event on the channel
 */
const useEcho = (orderId, { onPaid, onRejected, onAnyChange } = {}) => {
    useEffect(() => {
        
        if (!orderId && !onAnyChange) return;

        const echo = getEcho();

       
        if (!echo) return;
  
        const channel = echo.channel('orders');

        const handleStatusChanged = (event) => {
            console.log('[Echo] order.status.changed received:', event);

            if (onAnyChange) onAnyChange(event);
            if (!orderId) return;
            if (Number(event.order?.id) !== Number(orderId)) return;

            const status = event.order?.new_status ?? event.order?.status;
            if (status === 'paid')      onPaid?.(event.order);
            if (status === 'cancelled') onRejected?.(event.order);
        };
        const handleOrderPaid = (event) => {
            console.log('[Echo] order.paid received:', event);

            if (onAnyChange) onAnyChange(event);

            if (!orderId) return;
            if (Number(event.order?.id) !== Number(orderId)) return;

            onPaid?.(event.order);
        };

        channel.listen('.order.status.changed', handleStatusChanged);
        channel.listen('.order.paid', handleOrderPaid); 

        return () => {
            channel.stopListening('.order.status.changed', handleStatusChanged);
            channel.stopListening('.order.paid', handleOrderPaid); 
        };
    }, [orderId, onPaid, onRejected, onAnyChange]);
};

export default useEcho;