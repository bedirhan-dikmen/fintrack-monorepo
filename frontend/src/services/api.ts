// frontend/src/services/api.ts
import axios from 'axios';

// Backend konteynerimizin dışarıya açılan kapısına bağlanıyoruz
const api = axios.create({
    baseURL: 'http://localhost:8020/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;