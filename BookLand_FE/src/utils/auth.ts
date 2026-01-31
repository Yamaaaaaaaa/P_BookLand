// Mock authentication utilities

// Token keys
export const CUSTOMER_TOKEN_KEY = 'customerToken';
export const CUSTOMER_REFRESH_TOKEN_KEY = 'customerRefreshToken';
export const ADMIN_TOKEN_KEY = 'adminToken';
export const ADMIN_REFRESH_TOKEN_KEY = 'adminRefreshToken';

// Check if user is authenticated (shop)
export const isCustomerAuthenticated = (): boolean => {
  return !!localStorage.getItem(CUSTOMER_TOKEN_KEY);
};

// Check if admin is authenticated
export const isAdminAuthenticated = (): boolean => {
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
};

// Get customer token
export const getCustomerToken = (): string | null => {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
};

// Get customer refresh token
export const getCustomerRefreshToken = (): string | null => {
  return localStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY);
};

// Get admin token
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

// Set customer token
export const setCustomerToken = (token: string): void => {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
};

// Set customer refresh token
export const setCustomerRefreshToken = (token: string): void => {
  localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, token);
};

// Set admin token
export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

// Set admin refresh token
export const setAdminRefreshToken = (token: string): void => {
  localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, token);
};

// Get admin refresh token
export const getAdminRefreshToken = (): string | null => {
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
};

// Remove customer token
export const removeCustomerToken = (): void => {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
};

// Remove admin token
export const removeAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

// Mock login for customer
export const mockCustomerLogin = (email: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        const mockToken = `customer_token_${Date.now()}`;
        setCustomerToken(mockToken);
        resolve(mockToken);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

// Mock login for admin
export const mockAdminLogin = (email: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        const mockToken = `admin_token_${Date.now()}`;
        setAdminToken(mockToken);
        resolve(mockToken);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

// Logout customer
export const logoutCustomer = (): void => {
  removeCustomerToken();
};

// Logout admin
export const logoutAdmin = (): void => {
  removeAdminToken();
};
