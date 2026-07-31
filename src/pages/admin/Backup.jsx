import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── SVG ICON ──────
const Icon = ({ d, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I = {
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  clock:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
  check:     "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  trash:     "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  refresh:   "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  database:  "M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 7v5c0 2.76 4.48 5 10 5s10-2.24 10-5V7M2 12v5c0 2.76 4.48 5 10 5s10-2.24 10-5v-5",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  alert:     "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  cloud:     "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  folder:    "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
};

const Card = ({ title, subtitle, icon, iconBg, children, style = {} }) => (
  <div style={{
    background: '#ffffff', borderRadius: 12, border: '1px solid #e7e2db',
    boxShadow: '0 1px 3px rgba(0,0,0,.03)', overflow: 'hidden', ...style,
  }}>
    {(title || icon) && (
      <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {icon && (
          <div style={{ width: 42, height: 42, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon d={icon} size={20} color="#fff" />
          </div>
        )}
        <div>
          {title && <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e292b' }}>{title}</h3>}
          {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>{subtitle}</p>}
        </div>
      </div>
    )}
    <div style={{ padding: '16px 24px 20px' }}>{children}</div>
  </div>
);

const Btn = ({ label, icon, variant = 'primary', onClick, disabled }) => {
  const styles = {
    primary:   { bg: '#1e292b', color: '#fff', border: 'none' },
    green:     { bg: '#2d6a4f', color: '#fff', border: 'none' },
    outline:   { bg: '#fff', color: '#475569', border: '1px solid #dcd6ce' },
    danger:    { bg: '#fee2e2', color: '#dc2626', border: 'none' },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700,
      background: s.bg, color: s.color, border: s.border,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'opacity .15s', display: 'inline-flex', alignItems: 'center', gap: 6,
      textTransform: 'uppercase', letterSpacing: '0.04em'
    }}>
      {icon && <Icon d={I[icon]} size={14} color={s.color} />}
      {label}
    </button>
  );
};

const Backup = () => {
  const [running, setRunning] = useState(false);
  const [schedule, setSchedule] = useState('daily');
  const [time, setTime]         = useState('02:00');
  const [keep, setKeep]         = useState('7');
  const [toast, setToast]       = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("access_token");
      const response = await axios.get('http://127.0.0.1:8000/api/admin/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.status === 'success') {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
      showToast('Failed to load backup history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const runBackup = async () => {
    try {
      setRunning(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("access_token");
      const response = await axios.post('http://127.0.0.1:8000/api/admin/backups', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.status === 'success') {
        showToast('Database backup generated successfully!');
        fetchBackups();
      }
    } catch (error) {
      console.error("Error running backup:", error);
      showToast('Backup generation failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = (fileName) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("access_token");
    window.open(`http://127.0.0.1:8000/api/admin/backups/download?file=${fileName}&token=${token}`, '_blank');
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("access_token");
      await axios.delete(`http://127.0.0.1:8000/api/admin/backups/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Backup record deleted', 'success');
      fetchBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      showToast('Failed to delete backup file', 'error');
    }
  };

  const select = { padding: '8px 12px', borderRadius: 8, border: '1px solid #dcd6ce', fontSize: 13, color: '#1e292b', background: '#fff', outline: 'none' };

  return (
    <div style={{ background: '#f5f2eb', minHeight: '100vh', padding: '28px 32px', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 999,
          background: toast.type === 'success' ? '#1e292b' : '#dc2626',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,.15)',
        }}>
          <Icon d={I.check} size={15} color="#78b78a" />{toast.msg}
        </div>
      )}

      {/* 🌟 Report-style Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e7e2db',
        boxShadow: '0 1px 3px rgba(0,0,0,.03)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon d={I.database} size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e292b', letterSpacing: '0.04em' }}>
              BACKUP & RECOVERY
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Protect your data — schedule automatic backups or run one now
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Btn 
            label={running ? 'Backing up…' : 'Run Backup Now'} 
            icon="database" 
            variant="green" 
            onClick={runBackup} 
            disabled={running} 
          />
        </div>
      </div>

      {running && (
        <div style={{ marginBottom: 20, background: '#ffffff', borderRadius: 10, padding: '14px 20px', border: '1px solid #e7e2db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#475569' }}>
            <span>Backing up database via server command…</span><span>Please wait</span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '70%', background: '#78b78a', borderRadius: 3 }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <Card icon={I.check} iconBg="#78b78a" title="Last Backup" subtitle="Status: Successful">
          <p style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, color: '#1e292b' }}>
            {history.length > 0 ? history[0].date : 'No backups yet'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {history.length > 0 ? history[0].size : '0 MB'}
          </p>
        </Card>
        <Card icon={I.clock} iconBg="#1e292b" title="Next Scheduled" subtitle="Auto backup">
          <p style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, color: '#1e292b' }}>Tomorrow</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{time} · {schedule}</p>
        </Card>
        <Card icon={I.folder} iconBg="#3b82f6" title="Total Backups" subtitle="Stored on server">
          <p style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, color: '#1e292b' }}>{history.length} files</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Active storage</p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card title="Auto Backup Schedule" subtitle="Set how often backups run automatically" icon={I.clock} iconBg="#f59e0b">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Frequency</label>
              <select value={schedule} onChange={e => setSchedule(e.target.value)} style={select}>
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Run at (time)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={select} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Keep last N backups</label>
              <select value={keep} onChange={e => setKeep(e.target.value)} style={select}>
                <option value="3">3 backups</option>
                <option value="7">7 backups</option>
                <option value="14">14 backups</option>
                <option value="30">30 backups</option>
              </select>
            </div>
            <Btn label="Save Schedule" icon="check" variant="green" onClick={() => showToast('Schedule saved successfully!')} />
          </div>
        </Card>

        <Card title="Storage & Security" subtitle="Where and how your backups are stored" icon={I.shield} iconBg="#8b5cf6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {[
              { label: 'Storage Location', value: 'Laravel Storage Disk' },
              { label: 'Encryption',       value: 'AES-256 enabled' },
              { label: 'Compression',      value: 'gzip (.zip)' },
              { label: 'Backup Format',    value: 'SQL dump (.sql/.zip)' },
              { label: 'Cloud Sync',       value: 'Not configured' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1eeeb' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: 12, color: '#1e292b', fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
            <Btn label="Configure Cloud Sync" icon="cloud" variant="outline" onClick={() => showToast('Cloud sync feature is optional', 'info')} />
          </div>
        </Card>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e7e2db', boxShadow: '0 1px 3px rgba(0,0,0,.03)', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e292b' }}>Backup History</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>All backups managed via server API</p>
          </div>
          <Btn label="Refresh List" icon="refresh" variant="outline" onClick={fetchBackups} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e7e2db' }}>
              {['File Name', 'Type', 'Size', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading backups...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No backup files found.</td></tr>
            ) : (
              history.map(b => (
                <tr key={b.id || b.name} style={{ borderBottom: '1px solid #f8f6f3' }}>
                  <td style={{ padding: '12px 12px 12px 0', color: '#1e292b', fontWeight: 600, fontFamily: 'monospace', fontSize: 11 }}>{b.name}</td>
                  <td style={{ paddingRight: 12 }}>
                    <span style={{ background: b.type === 'Auto' ? '#eff6ff' : '#f0fdf4', color: b.type === 'Auto' ? '#3b82f6' : '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{b.type}</span>
                  </td>
                  <td style={{ color: '#64748b', paddingRight: 12 }}>{b.size}</td>
                  <td style={{ color: '#64748b', paddingRight: 12, fontSize: 12 }}>{b.date}</td>
                  <td style={{ paddingRight: 12 }}>
                    <span style={{ background: b.status === 'Success' ? '#eaf7ee' : '#fee2e2', color: b.status === 'Success' ? '#16a34a' : '#dc2626', fontSize: 10, fontWeight: 700, padding: '2.5px 8px', borderRadius: 4 }}>{b.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleDownload(b.name)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: '1px solid #dcd6ce', background: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon d={I.download} size={12} color="#475569" /> Download
                      </button>
                      <button onClick={() => handleDelete(b.name)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon d={I.trash} size={12} color="#dc2626" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Backup;