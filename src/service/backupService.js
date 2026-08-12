import axiosInstance from '../api/axios';

const backupService = {
    getBackups: () => axiosInstance.get('/admin/backups'),
    runBackup: () => axiosInstance.post('/admin/backups'),
    deleteBackup: (fileName) => axiosInstance.delete(`/admin/backups/${fileName}`),
    downloadBackup: (fileName) =>
        axiosInstance.get(`/admin/backups/${fileName}/download`, { responseType: 'blob' }),
};

export default backupService;