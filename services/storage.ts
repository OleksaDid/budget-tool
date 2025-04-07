/**
 * Storage service to handle all localStorage operations
 */

/**
 * Save data to localStorage
 * @param key The key to store data under
 * @param value The data to store
 */
export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    if (typeof window === 'undefined') {
      // We're on the server, don't use localStorage
      return;
    }
    
    if (value === null) {
      localStorage.removeItem(key);
      return;
    }
    
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    
    // Verify that data was saved correctly
    const savedValue = localStorage.getItem(key);
    if (!savedValue) {
      console.warn(`Failed to save data for key: ${key}`);
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Load data from localStorage
 * @param key The key to retrieve data from
 * @param defaultValue Default value to return if key doesn't exist
 * @returns The stored data or default value
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') {
      // We're on the server, return the default value
      return defaultValue;
    }
    
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    
    try {
      return JSON.parse(serializedValue) as T;
    } catch (parseError) {
      console.error(`Error parsing JSON for key ${key}:`, parseError);
      // If parsing fails, remove the corrupted value
      localStorage.removeItem(key);
      return defaultValue;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param key The key to remove
 */
export const removeFromStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Clear all data from localStorage
 */
export const clearStorage = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Check if localStorage is available
 * @returns boolean indicating if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // We're on the server
  }
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}; 