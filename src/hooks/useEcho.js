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

    // Guard: without a key, `new Echo(...)` throws synchronously and
    // takes down the whole React tree with it. Real-time is optional —
    // the dashboard already polls every 15s — so we log loudly and
    // bail out instead of crashing.
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

    // Connection-state logging. Without this, a Reverb server that
    // isn't running just means events silently never arrive, with
    // nothing in the console explaining why. This makes that failure
    // mode loud and actionable instead of silent.
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
 * useEcho — listens to the shared 'orders' broadcast channel.
 *
 * TWO MODES, same hook:
 *
 *  1. SINGLE-ORDER WATCH (original behaviour — used by Checkout.jsx
 *     while a customer waits for their KHQR payment to confirm):
 *
 *       useEcho(orderId, { onPaid, onRejected })
 *
 *     Filters events down to just the one order the customer is
 *     currently watching, ignoring everything else on the channel.
 *
 *  2. BROADCAST-WIDE WATCH (used by AdminDashboard.jsx so the
 *     dashboard refetches the moment ANY order changes, including a
 *     brand-new delivery order arriving from checkout):
 *
 *       useEcho(null, { onAnyChange })
 *
 *     Pass orderId = null to skip the per-order filter entirely.
 *     onAnyChange fires for every event on the channel — including
 *     the new 'created' status fired by OrderController::store() and
 *     the KHQR 'paid' confirmation fired by PaymentController — regardless
 *     of which order it belongs to.
 *
 * ✅ FIX: previously only listened for '.order.status.changed'
 * (from the OrderStatusChanged event). The KHQR payment-confirmation
 * flow (PaymentController::checkStatus / confirm) fires a SEPARATE
 * event — OrderPaid — whose broadcastAs() is 'order.paid', not
 * 'order.status.changed'. Without this second listener, a real KHQR
 * payment confirming successfully never reached the dashboard or the
 * customer's Checkout modal in real time — it only showed up after
 * the 15s polling fallback caught up.
 *
 * @param {number|null} orderId     - order to watch, or null for "all orders"
 * @param {Function}    onPaid      - single-order mode: fires when status === 'paid'
 * @param {Function}    onRejected  - single-order mode: fires when status === 'cancelled'
 * @param {Function}    onAnyChange - broadcast-wide mode: fires for any event on the channel
 */
const useEcho = (orderId, { onPaid, onRejected, onAnyChange } = {}) => {
    useEffect(() => {
        // Single-order mode needs an id; broadcast-wide mode needs
        // onAnyChange. If neither condition is met there is nothing to
        // listen for, so skip subscribing entirely.
        if (!orderId && !onAnyChange) return;

        const echo = getEcho();

        // Echo failed to initialize (missing key, etc.) — the warning
        // was already logged in getEcho(). Nothing to subscribe to.
        if (!echo) return;

        const channel = echo.channel('orders');

        const handleStatusChanged = (event) => {
            console.log('[Echo] order.status.changed received:', event);

            // Broadcast-wide listeners (like the dashboard) get notified
            // of every event regardless of which order it concerns.
            if (onAnyChange) onAnyChange(event);

            // Single-order mode stops here unless this event is about
            // the specific order being watched.
            if (!orderId) return;
            if (Number(event.order?.id) !== Number(orderId)) return;

            const status = event.order?.new_status ?? event.order?.status;
            if (status === 'paid')      onPaid?.(event.order);
            if (status === 'cancelled') onRejected?.(event.order);
        };

        //  NEW — handles the OrderPaid event fired specifically by
        // PaymentController when a KHQR (or admin-confirmed) payment
        // succeeds. Same shape of payload ({ order: {...} }), same
        // filtering logic, just a different broadcast name.
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