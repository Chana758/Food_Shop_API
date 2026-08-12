import axiosInstance from '../api/axios'; 

const settingService = {
    getSettings: () => axiosInstance.get('/admin/settings'),
    updateSettings: (payload) => axiosInstance.put('/admin/settings', payload),
};

export default settingService;