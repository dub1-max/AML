export const FRONTEND_URLS = [
    'https://kycsync.com',
    'http://kycsync.com'
];

export const API_BASE_URLS = [
    'https://kycsync.com/api',
    'http://kycsync.com/api'
];

// Function to get the appropriate API URL based on the environment
export const getApiBaseUrl = () => {
    // Check for environment variables
    if (typeof window !== 'undefined') {
        // Use HTTPS by default
        return API_BASE_URLS[0];
    }
    return API_BASE_URLS[0];
};

// Function to get the appropriate Frontend URL based on the environment
export const getFrontendUrl = () => {
    // Check for environment variables
    if (typeof window !== 'undefined') {
        // Use HTTPS by default
        return FRONTEND_URLS[0];
    }
    return FRONTEND_URLS[0];
}; 