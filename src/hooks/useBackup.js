import { useState, useEffect, useCallback } from 'react';
import backupService from '../service/backupService';
import settingService from '../service/settingService';

const DEFAULT_SCHEDULE = { frequency: 'daily', time: '02:00', keep: 7 };

export default function useBackup() {
    const [history, setHistory]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [running, setRunning]       = useState(false);
    const [schedule, setSchedule]     = useState(DEFAULT_SCHEDULE);
    const [savingSchedule, setSaving] = useState(false);

    const fetchBackups = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await backupService.getBackups();
            if (data?.status === 'success') setHistory(data.data);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSchedule = useCallback(async () => {
        try {
            const { data } = await settingService.getSettings();
            if (data?.status === 'success') {
                const s = data.data;
                setSchedule({
                    frequency: s.backup_frequency ?? DEFAULT_SCHEDULE.frequency,
                    time:      s.backup_time ?? DEFAULT_SCHEDULE.time,
                    keep:      Number(s.backup_keep ?? DEFAULT_SCHEDULE.keep),
                });
            }
        } catch (e) {
            console.error('Failed to fetch schedule:', e);
        }
    }, []);

    const runBackup = useCallback(async () => {
        setRunning(true);
        try {
            const { data } = await backupService.runBackup();
            await fetchBackups();
            return data;
        } finally {
            setRunning(false);
        }
    }, [fetchBackups]);

    const saveSchedule = useCallback(async (payload) => {
        setSaving(true);
        try {
            const { data } = await settingService.updateSettings({
                backup_frequency: payload.frequency,
                backup_time:      payload.time,
                backup_keep:      payload.keep,
            });
            setSchedule(payload);
            return data;
        } finally {
            setSaving(false);
        }
    }, []);

    const downloadBackup = useCallback(async (fileName) => {
        const response = await backupService.downloadBackup(fileName);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }, []);

    const deleteBackup = useCallback(async (fileName) => {
        await backupService.deleteBackup(fileName);
        await fetchBackups();
    }, [fetchBackups]);

    useEffect(() => {
        fetchBackups();
        fetchSchedule();
    }, [fetchBackups, fetchSchedule]);

    return {
        history, loading, running,
        schedule, savingSchedule,
        fetchBackups, runBackup, saveSchedule,
        downloadBackup, deleteBackup,
    };
}