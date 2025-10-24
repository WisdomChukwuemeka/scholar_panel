// utils/SecureStorage.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'mySecretKey@123';

export const SecureStorage = {
  set(key, value) {
    if (typeof window === 'undefined') return; // Prevent SSR access

    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
      window.dispatchEvent(new Event('authChange')); // Trigger auth updates
    } catch (err) {
      console.error('Storage set error:', err);
    }
  },

  get(key) {
    if (typeof window === 'undefined') return null; // Prevent SSR mismatch

    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        console.warn(`Decryption failed for key: ${key}`);
        return null;
      }

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (err) {
      console.error('Storage get error:', err);
      return null;
    }
  },

  remove(key) {
    if (typeof window === 'undefined') return; // Prevent SSR crash
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new Event('authChange'));
    } catch (err) {
      console.error('Storage remove error:', err);
    }
  },
};