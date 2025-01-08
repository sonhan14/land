import { jwtDecode } from 'jwt-decode';

export const decodeJWT = (token) => {
    try {
        if (token) {
            const decoded = jwtDecode(token);
            return decoded;
        }
    } catch (error) {
        console.error('Lỗi khi giải mã JWT:', error);
        return null;
    }
};
