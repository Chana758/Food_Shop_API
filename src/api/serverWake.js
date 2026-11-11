// src/api/serverWake.js
//
// The backend runs on Render's free plan, which goes to sleep after
// 15 minutes without traffic and needs ~30-60 s to start again.
//
// wakeServer() sends one cheap request to /api/ping as soon as the site
// opens, so the server starts waking while the customer is still looking
// at the page. Other requests wait for it (see api/axios.js) instead of
// failing with a timeout, and <ServerWakeBanner /> tells the customer
// what is happening.

export const API_URL =
  import.meta.env.VITE_API_URL || 'https://food-shop-backend-xivl.onrender.com/api';

const PING_TIMEOUT_MS = 90000; // a cold start can take about a minute
const SLOW_AFTER_MS   = 2500;  // after this long we assume the server was asleep
const AWAKE_FOR_MS    = 10 * 60 * 1000; // trust "awake" for 10 min, then ping again

// status: 'unknown' | 'checking' | 'waking' | 'awake' | 'down'
let state = { status: 'unknown', startedAt: 0 };
let pending = null;
let lastAwakeAt = 0;
const listeners = new Set();

const setState = (next) => {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn(state));
};

export const getServerState = () => state;

export const subscribeServerState = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** True while we know the server is still starting up. */
export const isServerWaking = () => state.status === 'waking';

/**
 * Ping the server. Returns a promise that resolves true when it answers,
 * false if it never does. Calls made while a ping is running share it.
 */
export const wakeServer = ({ force = false } = {}) => {
  if (pending) return pending;
  if (!force && state.status === 'awake' && Date.now() - lastAwakeAt < AWAKE_FOR_MS) {
    return Promise.resolve(true);
  }

  setState({ status: 'checking', startedAt: Date.now() });
  const slowTimer = setTimeout(() => {
    if (state.status === 'checking') setState({ status: 'waking' });
  }, SLOW_AFTER_MS);

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  pending = fetch(`${API_URL}/ping`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`ping ${res.status}`);
      lastAwakeAt = Date.now();
      setState({ status: 'awake' });
      return true;
    })
    .catch(() => {
      setState({ status: 'down' });
      return false;
    })
    .finally(() => {
      clearTimeout(slowTimer);
      clearTimeout(abortTimer);
      pending = null;
    });

  return pending;
};

/** Mark the server as awake (any successful API response proves it). */
export const markServerAwake = () => {
  lastAwakeAt = Date.now();
  if (state.status !== 'awake') setState({ status: 'awake' });
};
