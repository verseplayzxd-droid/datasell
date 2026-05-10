import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/settings');
        setSettings(res.data);
      } catch(e) {} finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.put('/settings', settings);
      toast.success('Settings saved');
    } catch(e) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const fields = [
    { key: 'min_withdrawal', label: 'Minimum Withdrawal Amount (₹)', type: 'number' },
    { key: 'rate_per_gb', label: 'Rate Per GB (₹)', type: 'number' },
    { key: 'sell_hours_per_gb', label: 'Sell Completion Time Per GB (hours)', type: 'number' },
    { key: 'app_name', label: 'App Name', type: 'text' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-headline-lg text-on-surface font-bold">Settings</h1>

      <div className="admin-glass-card rounded-xl p-6 flex flex-col gap-6">
        {fields.map(f => (
          <div key={f.key} className="flex flex-col gap-2">
            <label className="text-label-md text-on-surface-variant font-semibold">{f.label}</label>
            <input
              type={f.type}
              value={settings[f.key] || ''}
              onChange={e => update(f.key, e.target.value)}
              className="glass-input rounded-lg px-4 py-3 text-body-md"
            />
          </div>
        ))}

        {/* Maintenance Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
          <div>
            <h3 className="text-body-md text-on-surface font-semibold">Maintenance Mode</h3>
            <p className="text-body-sm text-on-surface-variant">Disable all user access temporarily</p>
          </div>
          <button
            onClick={() => update('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
            className={`w-14 h-7 rounded-full relative transition-colors ${settings.maintenance_mode === 'true' ? 'bg-admin-red' : 'bg-surface-variant'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${settings.maintenance_mode === 'true' ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <button onClick={save} disabled={saving} className="w-full py-3 rounded-full bg-admin-red text-white font-semibold text-headline-sm hover:shadow-[0_0_20px_rgba(255,68,68,0.4)] transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
