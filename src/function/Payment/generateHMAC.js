import CryptoJS from 'crypto-js';

export const generateHMAC = (data) => {
    const secretKey = process.env.REACT_APP_PAY_OS_CHECKSUM_KEY;

    const signature = CryptoJS.HmacSHA256(data, secretKey).toString(CryptoJS.enc.Hex);

    return signature.toString();
};
