import React, { useState, useEffect } from 'react';
import { apiErrorMessage } from '../../utils/apiError';
import axiosInstance from '../../api/axios';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';

// SVG ICONS 
const Icon = ({ d, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const I = {
  store:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  bell:     "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  printer:  "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  globe:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  check:    "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff:   "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22",
  trash:    "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  upload:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  palette:  "M12 2a10 10 0 0 0 0 20c.6 0 1-.4 1-1v-1c0-.6-.4-1-1-1a8 8 0 1 1 0-16 8 8 0 0 1 8 8c0 1.1-.9 2-2 2h-1a2 2 0 0 0-2 2 2 2 0 0 1-2 2",
  loader:   "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83",
  sliders:  "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  layoutSidebar: "M3 4h18v16H3zM9 4v16",
  layoutPage:    "M3 4h18v16H3zM3 9h18",
};

// THEME ─
const buildTheme = (isDark, accent) => ({
  accent,
  pageBg:       isDark ? '#0F1A1D' : '#f8fafc',
  cardBg:       isDark ? '#18242A' : '#fff',
  cardBorder:   isDark ? '#2A3A40' : '#e2e8f0',
  cardShadow:   isDark ? '0 4px 6px -1px rgba(0,0,0,0.25)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  panelBg:      isDark ? '#1E2A2E' : '#fafafa',
  panelBorder:  isDark ? '#2A3A40' : '#f1f5f9',
  heading:      isDark ? '#FBF9F5' : '#0f172a',
  subtext:      isDark ? '#9AA5A3' : '#64748b',
  label:        isDark ? '#D7DEDD' : '#334155',
  hint:         isDark ? '#7C8A8D' : '#94a3b8',
  rowBorder:    isDark ? '#233238' : '#f8fafc',
  inputBg:      isDark ? '#0F1A1D' : '#fff',
  inputBorder:  isDark ? '#32444A' : '#cbd5e1',
  inputText:    isDark ? '#FBF9F5' : '#0f172a',
  toggleOff:    isDark ? '#3C4E53' : '#cbd5e1',
  headerBarBg:  isDark ? '#0F1A1D' : '#f8fafc',
  headerBarBd:  isDark ? '#32444A' : '#cbd5e1',
  chipIconBg:   isDark ? '#0f172a' : '#0f172a',
  dangerBg:     isDark ? '#241615' : '#fff5f5',
  dangerBorder: isDark ? '#3D211F' : '#fee2e2',
  dangerRowBd:  isDark ? '#2E1A19' : '#fef2f2',
  dangerHeadBg: isDark ? '#3A211F' : '#fee2e2',
  toastDark:    '#0f172a',
});

// TOGGLE COMPONENT
const Toggle = ({ checked, onChange, theme }) => (
  <div onClick={() => onChange(!checked)} style={{
    width: 44, height: 24, borderRadius: 12,
    background: checked ? theme.accent : theme.toggleOff,
    position: 'relative', cursor: 'pointer', transition: 'background .2s ease', flexShrink: 0,
  }}>
    <div style={{
      position: 'absolute', top: 3, left: checked ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%',
      background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.15)',
      transition: 'left .2s ease',
    }} />
  </div>
);

// SECTION WRAPPER─
const Section = ({ icon, iconBg, title, subtitle, children, theme }) => (
  <div style={{ background: theme.cardBg, borderRadius: 16, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow, overflow: 'hidden', marginBottom: 24, transition: 'background .2s ease, border-color .2s ease' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', alignItems: 'stretch' }}>
      <div style={{ padding: '32px 28px', background: theme.panelBg, borderRight: `1px solid ${theme.panelBorder}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Icon d={I[icon]} size={20} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.heading }}>{title}</h3>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.subtext, lineHeight: '1.5' }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: '24px 32px' }}>
        {children}
      </div>
    </div>
  </div>
);

// FORM UTILITIES──
const Row = ({ label, hint, children, theme }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start', padding: '14px 0', borderBottom: `1px solid ${theme.rowBorder}` }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.label }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: theme.hint, marginTop: 3, lineHeight: '1.4' }}>{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Input = ({ value, onChange, type = 'text', placeholder, style = {}, theme }) => (
  <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.inputBorder}`, fontSize: 13, color: theme.inputText, background: theme.inputBg, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', ...style }}
    onFocus={e => e.target.style.borderColor = theme.accent}
    onBlur={e => e.target.style.borderColor = theme.inputBorder}
  />
);

const Select = ({ value, onChange, options, theme }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: '100%', maxWidth: 320, padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.inputBorder}`, fontSize: 13, color: theme.inputText, background: theme.inputBg, outline: 'none', cursor: 'pointer' }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const ToggleRow = ({ label, hint, checked, onChange, theme }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${theme.rowBorder}` }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.label }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: theme.hint, marginTop: 2, lineHeight: '1.4' }}>{hint}</div>}
    </div>
    <Toggle checked={!!checked} onChange={onChange} theme={theme} />
  </div>
);

// ✅ NEW — 2-option selector card for "where should the accent color apply".
// Visually similar to a radio-card group: click either option, active one
// gets a colored border + tinted background using the LIVE draft accent
// color, so the customer can preview which target they're picking before
// they even save.
const ThemeTargetPicker = ({ value, onChange, theme }) => {
  const { t } = useTranslation();
  const options = [
    {
      value: 'sidebar',
      icon: I.layoutSidebar,
      label: t('admin.settings.targetSidebar'),
      desc: t('admin.settings.targetSidebarDesc'),
    },
    {
      value: 'page',
      icon: I.layoutPage,
      label: t('admin.settings.targetPage'),
      desc: t('admin.settings.targetPageDesc'),
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: '1 1 220px',
              minWidth: 220,
              cursor: 'pointer',
              padding: '14px 16px',
              borderRadius: 12,
              border: `2px solid ${active ? theme.accent : theme.inputBorder}`,
              background: active ? `${theme.accent}14` : theme.inputBg,
              transition: 'border-color .15s ease, background .15s ease',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: active ? theme.accent : theme.toggleOff,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .15s ease',
            }}>
              <Icon d={opt.icon} size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.heading, display: 'flex', alignItems: 'center', gap: 6 }}>
                {opt.label}
                {active && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.04em', color: '#fff',
                    background: theme.accent, borderRadius: 999, padding: '2px 7px',
                  }}>
                    {t('status.active')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: theme.hint, marginTop: 3, lineHeight: '1.5' }}>{opt.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// MAIN COMPONENT──
const ManageSettings = () => {
  const { t, i18n } = useTranslation();
  const { settings: globalSettings, loading: globalLoading, refresh } = useSettings();

  const [savingSection, setSavingSection] = useState(null);
  const [toast, setToast] = useState(null);

  const [settings, setSettings] = useState({
    restaurant_name: 'Khmer-Fresh',
    tagline: 'Authentic Traditional Food',
    phone: '+855 12 345 678',
    email: 'support@khmerfresh.com',
    address: 'Street, City, Country',
    currency: 'USD',
    timezone: 'Asia/Phnom_Penh',
    language: 'en',
    notify_new_order: true,
    notify_low_stock: true,
    notify_payment: false,
    notify_daily_report: true,
    sound_alert: true,
    show_logo_receipt: true,
    show_tax_receipt: true,
    tax_rate: '10',
    receipt_note: 'Thank you for dining with us!',
    table_service: true,
    takeaway: true,
    dark_mode: false,
    compact_mode: false,
    accent_color: '#10b981',
    theme_target: 'sidebar', 
    two_fa: false,
    auto_logout: true,
    logout_time: '30'
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (globalSettings) {
      setSettings(prev => ({ ...prev, ...globalSettings }));
    }
  }, [globalSettings]);

  const isDark = !!settings.dark_mode;
  const theme = buildTheme(isDark, settings.accent_color || '#10b981');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveSection = async (sectionName, payload) => {
    setSavingSection(sectionName);
    try {
      await axiosInstance.put('/admin/settings', payload);
      await refresh(); 
      showToast(t('admin.settings.saved', { section: t(`admin.settings.section.${sectionName}`) }));
      // Default Language also switches the admin UI right away
      if (sectionName === 'General' && ['en', 'kh'].includes(payload.language)) i18n.changeLanguage(payload.language);
    } catch (error) {
      console.error(`Save ${sectionName} failed:`, error.response ?? error);
      showToast(t('admin.settings.saveFailed', { section: t(`admin.settings.section.${sectionName}`) }), 'error');
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      // The API has no logo upload yet, so be honest that this is only a preview
      showToast(t('admin.settings.logoPreviewOnly'));
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.current) {
      showToast(t('admin.settings.enterCurrentPw'), 'error');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast(t('auth.passwordMismatch'), 'error');
      return;
    }
    if (passwords.new.length < 8) {
      showToast(t('auth.passwordMin'), 'error');
      return;
    }

    setSavingSection('Password');
    try {
      await axiosInstance.put('/user/password', {
        current_password: passwords.current,
        password: passwords.new,
        password_confirmation: passwords.confirm,
      });
      showToast(t('admin.settings.pwUpdated'));
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      const code = error.response?.data?.code;
      showToast(
        code === 'wrong_password' ? t('admin.settings.wrongPw')
          : code === 'demo_account' ? t('admin.settings.demoPw')
          : apiErrorMessage(error, t),
        'error'
      );
    } finally {
      setSavingSection(null);
    }
  };

  const handleDangerAction = (actionType, confirmText) => {
    if (!window.confirm(t('admin.settings.dangerConfirm', { action: confirmText }))) return;
    showToast(t('admin.settings.dangerDisabled'), 'error');
  };

  const Btn = ({ label, variant = 'green', onClick, section }) => {
    const isSaving = savingSection === section;
    const bg = variant === 'green' ? theme.accent : variant === 'dark' ? (isDark ? '#0B1315' : '#0f172a') : (isDark ? '#233238' : '#f1f5f9');
    const cl = variant === 'outline' ? theme.label : '#fff';

    const borderColor = variant === 'green' ? theme.accent : variant === 'dark' ? '#1e293b' : theme.inputBorder;
    const boxShadow = variant === 'green'
      ? `0 4px 12px ${theme.accent}59`
      : variant === 'dark'
      ? '0 4px 12px rgba(15, 23, 42, 0.3)'
      : '0 2px 6px rgba(0, 0, 0, 0.05)';

    return (
      <button
        disabled={isSaving}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 22px',
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          background: bg,
          color: cl,
          fontSize: 13,
          fontWeight: 600,
          cursor: isSaving ? 'wait' : 'pointer',
          boxShadow: boxShadow,
          transition: 'all 0.2s ease',
          opacity: isSaving ? 0.7 : 1
        }}
        onMouseOver={e => {
          if (!isSaving) {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={e => {
          if (!isSaving) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = boxShadow;
          }
        }}
      >
        {isSaving && <span style={{ animation: 'spin 1s linear infinite' }}><Icon d={I.loader} size={14} color="#fff" /></span>}
        {label}
      </button>
    );
  };

  if (globalLoading) {
    return (
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', background: theme.pageBg, color: theme.subtext, fontSize: 14, fontWeight: 600, gap: 10 }}>
        <span style={{ animation: 'spin 1s linear infinite' }}><Icon d={I.loader} size={20} color={theme.accent} /></span> {t('common.loading')}
      </div>
    );
  }

  return (
    <div style={{ background: theme.pageBg, minHeight: '100vh', padding: '32px 40px', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box', transition: 'background .2s ease' }}>

      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : theme.toastDark, color: '#fff', padding: '14px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 25px -5px rgba(0,0,0,.2)' }}>
          <Icon d={toast.type === 'error' ? I.lock : I.check} size={16} color={toast.type === 'error' ? '#fff' : theme.accent} />
          {toast.msg}
        </div>
      )}

      <div style={{
        background: theme.cardBg,
        borderRadius: 16,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow,
        padding: '24px 32px',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: isDark ? '#0B1315' : '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.25)',
            flexShrink: 0
          }}>
            <Icon d={I.settings} size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: theme.heading, letterSpacing: '-0.025em' }}>{t('admin.settings.title')}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.subtext, fontWeight: 500 }}>{t('admin.settings.subtitle')}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: theme.headerBarBg, padding: '10px 16px', borderRadius: 10, border: `1px solid ${theme.headerBarBd}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Icon d={I.sliders} size={16} color={theme.heading} />
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.heading }}>{t('admin.settings.livePanel')}</span>
        </div>
      </div>

      {/* 1. GENERAL SETTINGS */}
      <Section theme={theme} icon="store" iconBg={isDark ? '#0B1315' : '#0f172a'} title={t('admin.settings.general')} subtitle={t('admin.settings.generalSub')}>
        <Row theme={theme} label={t('admin.settings.restaurantName')} hint={t('admin.settings.restaurantNameHint')}>
          <Input theme={theme} value={settings.restaurant_name} onChange={val => setSettings({...settings, restaurant_name: val})} placeholder="Khmer-Fresh" />
        </Row>
        <Row theme={theme} label={t('admin.settings.tagline')} hint={t('admin.settings.taglineHint')}>
          <Input theme={theme} value={settings.tagline} onChange={val => setSettings({...settings, tagline: val})} placeholder={t('admin.settings.taglinePlaceholder')} />
        </Row>
        <Row theme={theme} label={t('admin.settings.phone')}>
          <Input theme={theme} value={settings.phone} onChange={val => setSettings({...settings, phone: val})} placeholder="+855 12 345 678" />
        </Row>
        <Row theme={theme} label={t('admin.settings.email')}>
          <Input theme={theme} value={settings.email} onChange={val => setSettings({...settings, email: val})} type="email" placeholder="support@khmerfresh.com" />
        </Row>
        <Row theme={theme} label={t('admin.settings.address')}>
          <Input theme={theme} value={settings.address} onChange={val => setSettings({...settings, address: val})} placeholder={t('admin.settings.addressPlaceholder')} />
        </Row>
        <Row theme={theme} label={t('admin.settings.currency')} hint={t('admin.settings.currencyHint')}>
          <Select theme={theme} value={settings.currency} onChange={val => setSettings({...settings, currency: val})} options={[
            { value: 'USD', label: t('admin.settings.usd') },
            { value: 'KHR', label: t('admin.settings.khr') },
            { value: 'THB', label: t('admin.settings.thb') }
          ]} />
        </Row>
        <Row theme={theme} label={t('admin.settings.timezone')}>
          <Select theme={theme} value={settings.timezone} onChange={val => setSettings({...settings, timezone: val})} options={[
            { value: 'Asia/Phnom_Penh', label: 'Asia/Phnom_Penh (UTC+7)' },
            { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
            { value: 'UTC', label: 'UTC' }
          ]} />
        </Row>
        <Row theme={theme} label={t('admin.settings.language')}>
          <Select theme={theme} value={settings.language} onChange={val => setSettings({...settings, language: val})} options={[
            { value: 'en', label: 'English' },
            { value: 'kh', label: 'ភាសាខ្មែរ (Khmer)' },
          ]} />
        </Row>
        <div style={{ marginTop: 20 }}>
          <Btn
            label={t('admin.settings.saveGeneral')}
            section="General"
            onClick={() => saveSection('General', {
              restaurant_name: settings.restaurant_name,
              tagline: settings.tagline,
              phone: settings.phone,
              email: settings.email,
              address: settings.address,
              currency: settings.currency,
              timezone: settings.timezone,
              language: settings.language,
            })}
          />
        </div>
      </Section>

      {/* 2. NOTIFICATIONS SETTINGS */}
      <Section theme={theme} icon="bell" iconBg="#d97706" title={t('admin.settings.notifications')} subtitle={t('admin.settings.notificationsSub')}>
        <ToggleRow theme={theme} label={t('admin.settings.newOrder')} hint={t('admin.settings.newOrderHint')} checked={settings.notify_new_order} onChange={val => setSettings({...settings, notify_new_order: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.lowStock')} hint={t('admin.settings.lowStockHint')} checked={settings.notify_low_stock} onChange={val => setSettings({...settings, notify_low_stock: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.payment')} hint={t('admin.settings.paymentHint')} checked={settings.notify_payment} onChange={val => setSettings({...settings, notify_payment: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.dailyReport')} hint={t('admin.settings.dailyReportHint')} checked={settings.notify_daily_report} onChange={val => setSettings({...settings, notify_daily_report: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.sound')} hint={t('admin.settings.soundHint')} checked={settings.sound_alert} onChange={val => setSettings({...settings, sound_alert: val})} />
        <div style={{ marginTop: 20 }}>
          <Btn
            label={t('admin.settings.saveNotifications')}
            section="Notifications"
            onClick={() => saveSection('Notifications', {
              notify_new_order: settings.notify_new_order,
              notify_low_stock: settings.notify_low_stock,
              notify_payment: settings.notify_payment,
              notify_daily_report: settings.notify_daily_report,
              sound_alert: settings.sound_alert,
            })}
          />
        </div>
      </Section>

      {/* 3. RECEIPT & POS SETTINGS */}
      <Section theme={theme} icon="printer" iconBg="#2563eb" title={t('admin.settings.receipt')} subtitle={t('admin.settings.receiptSub')}>
        <ToggleRow theme={theme} label={t('admin.settings.printLogo')} hint={t('admin.settings.printLogoHint')} checked={settings.show_logo_receipt} onChange={val => setSettings({...settings, show_logo_receipt: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.showTax')} hint={t('admin.settings.showTaxHint')} checked={settings.show_tax_receipt} onChange={val => setSettings({...settings, show_tax_receipt: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.tableService')} hint={t('admin.settings.tableServiceHint')} checked={settings.table_service} onChange={val => setSettings({...settings, table_service: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.takeaway')} hint={t('admin.settings.takeawayHint')} checked={settings.takeaway} onChange={val => setSettings({...settings, takeaway: val})} />
        {settings.show_tax_receipt && (
          <Row theme={theme} label={t('admin.settings.taxRate')} hint={t('admin.settings.taxRateHint')}>
            <Input theme={theme} value={settings.tax_rate} onChange={val => setSettings({...settings, tax_rate: val})} type="number" placeholder="10" style={{ maxWidth: 140 }} />
          </Row>
        )}
        <Row theme={theme} label={t('admin.settings.footerNote')} hint={t('admin.settings.footerNoteHint')}>
          <Input theme={theme} value={settings.receipt_note} onChange={val => setSettings({...settings, receipt_note: val})} placeholder={t('admin.settings.footerNotePlaceholder')} />
        </Row>
        <div style={{ marginTop: 20 }}>
          <Btn
            label={t('admin.settings.saveReceipt')}
            section="Receipt"
            onClick={() => saveSection('Receipt', {
              show_logo_receipt: settings.show_logo_receipt,
              show_tax_receipt: settings.show_tax_receipt,
              table_service: settings.table_service,
              takeaway: settings.takeaway,
              tax_rate: settings.tax_rate,
              receipt_note: settings.receipt_note,
            })}
          />
        </div>
      </Section>

      {/* 4. APPEARANCE SETTINGS */}
      <Section theme={theme} icon="palette" iconBg="#7c3aed" title={t('admin.settings.appearance')} subtitle={t('admin.settings.appearanceSub')}>
        <ToggleRow theme={theme} label={t('admin.settings.darkMode')} hint={t('admin.settings.darkModeHint')} checked={settings.dark_mode} onChange={val => setSettings({...settings, dark_mode: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.compact')} hint={t('admin.settings.compactHint')} checked={settings.compact_mode} onChange={val => setSettings({...settings, compact_mode: val})} />

        <Row theme={theme} label={t('admin.settings.accent')} hint={t('admin.settings.accentHint')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input type="color" value={settings.accent_color} onChange={e => setSettings({...settings, accent_color: e.target.value})}
              style={{ width: 44, height: 38, borderRadius: 8, border: `1px solid ${theme.inputBorder}`, cursor: 'pointer', padding: 2, background: theme.inputBg }} />
            <span style={{ fontSize: 13, color: theme.label, fontFamily: 'monospace', fontWeight: 600 }}>{settings.accent_color}</span>
            {['#10b981', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0ea5e9', '#ec4899', '#84cc16'].map(c => (
              <div key={c} onClick={() => setSettings({...settings, accent_color: c})} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: settings.accent_color === c ? `2px solid ${theme.heading}` : '2px solid transparent', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            ))}
          </div>
        </Row>

        {/* ✅ NEW — the 2-option "apply accent color to" picker requested:
            Sidebar & Header  vs  Page Content. Only one moves at a time,
            the other side stays pinned to the fixed brand color. */}
        <Row theme={theme} label={t('admin.settings.applyTo')} hint={t('admin.settings.applyToHint')}>
          <ThemeTargetPicker
            theme={theme}
            value={settings.theme_target}
            onChange={val => setSettings({ ...settings, theme_target: val })}
          />
        </Row>

        <Row theme={theme} label={t('admin.settings.logo')} hint={t('admin.settings.logoHint')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {logoPreview && (
              <img src={logoPreview} alt={t('admin.settings.logoPreview')} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, border: `1px solid ${theme.inputBorder}`, background: '#fff' }} />
            )}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: `1px dashed ${theme.inputBorder}`, background: theme.inputBg, color: theme.label, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              <Icon d={I.upload} size={15} color={theme.subtext} /> {t('admin.settings.uploadLogo')}
              <input type="file" accept="image/png, image/svg+xml, image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </Row>

        <div style={{ marginTop: 20 }}>
          <Btn
            label={t('admin.settings.saveAppearance')}
            section="Appearance"
            onClick={() => saveSection('Appearance', {
              dark_mode: settings.dark_mode,
              compact_mode: settings.compact_mode,
              accent_color: settings.accent_color,
              theme_target: settings.theme_target, // ✅ NEW
            })}
          />
        </div>
      </Section>

      {/* 5. SECURITY SETTINGS */}
      <Section theme={theme} icon="lock" iconBg="#dc2626" title={t('admin.settings.security')} subtitle={t('admin.settings.securitySub')}>
        <Row theme={theme} label={t('admin.settings.currentPw')}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Input theme={theme} value={passwords.current} onChange={val => setPasswords({...passwords, current: val})} type={showPw ? 'text' : 'password'} placeholder={t('admin.settings.currentPwPlaceholder')} />
            <span onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: 11, cursor: 'pointer' }}>
              <Icon d={showPw ? I.eyeOff : I.eye} size={16} color={theme.hint} />
            </span>
          </div>
        </Row>
        <Row theme={theme} label={t('admin.settings.newPw')}>
          <Input theme={theme} value={passwords.new} onChange={val => setPasswords({...passwords, new: val})} type={showPw ? 'text' : 'password'} placeholder={t('admin.settings.newPwPlaceholder')} style={{ maxWidth: 360 }} />
        </Row>
        <Row theme={theme} label={t('admin.settings.confirmPw')}>
          <Input theme={theme} value={passwords.confirm} onChange={val => setPasswords({...passwords, confirm: val})} type={showPw ? 'text' : 'password'} placeholder={t('admin.settings.confirmPwPlaceholder')} style={{ maxWidth: 360 }} />
        </Row>

        <ToggleRow theme={theme} label={t('admin.settings.twoFa')} hint={t('admin.settings.twoFaHint')} checked={settings.two_fa} onChange={val => setSettings({...settings, two_fa: val})} />
        <ToggleRow theme={theme} label={t('admin.settings.autoLogout')} hint={t('admin.settings.autoLogoutHint')} checked={settings.auto_logout} onChange={val => setSettings({...settings, auto_logout: val})} />

        {settings.auto_logout && (
          <Row theme={theme} label={t('admin.settings.timeout')}>
            <Select theme={theme} value={settings.logout_time} onChange={val => setSettings({...settings, logout_time: val})} options={[
              { value: '15', label: t('admin.settings.minutes', { count: 15 }) },
              { value: '30', label: t('admin.settings.minutes', { count: 30 }) },
              { value: '60', label: t('admin.settings.hours', { count: 1 }) },
              { value: '120', label: t('admin.settings.hours', { count: 2 }) }
            ]} />
          </Row>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Btn label={t('admin.settings.updatePw')} variant="dark" section="Password" onClick={handlePasswordUpdate} />
          <Btn
            label={t('admin.settings.saveSecurity')}
            section="Security"
            onClick={() => saveSection('Security', {
              two_fa: settings.two_fa,
              auto_logout: settings.auto_logout,
              logout_time: settings.logout_time,
            })}
          />
        </div>
      </Section>

      {/* 6. DANGER ZONE */}
      <div style={{ background: theme.cardBg, borderRadius: 16, border: `1px solid ${isDark ? '#4A2A26' : '#fecaca'}`, boxShadow: theme.cardShadow, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', alignItems: 'stretch' }}>
          <div style={{ padding: '32px 28px', background: theme.dangerBg, borderRight: `1px solid ${theme.dangerBorder}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.dangerHeadBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={I.trash} size={20} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#dc2626' }}>{t('admin.settings.danger')}</h3>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: isDark ? '#f19a92' : '#ef4444', lineHeight: '1.5' }}>{t('admin.settings.dangerSub')}</p>
            </div>
          </div>
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            {[
              { key: 'clear_orders', label: t('admin.settings.clearOrders'), hint: t('admin.settings.clearOrdersHint') },
              { key: 'reset_settings', label: t('admin.settings.reset'), hint: t('admin.settings.resetHint') },
              { key: 'purge_data', label: t('admin.settings.purge'), hint: t('admin.settings.purgeHint') },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${theme.dangerRowBd}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.heading }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{item.hint}</div>
                </div>
                <button
                  onClick={() => handleDangerAction(item.key, item.label)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1px solid #fca5a5',
                    background: isDark ? '#1E2A2E' : '#fff',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = isDark ? '#3A211F' : '#fee2e2';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(220, 38, 38, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = isDark ? '#1E2A2E' : '#fff';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(220, 38, 38, 0.1)';
                  }}>
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ManageSettings;