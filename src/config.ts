export const FRONTEND_URLS = [
    
    'http://137.184.150.6:5173',
    
    
];

export const API_BASE_URLS = [
    
    'http://137.184.150.6/api',
    
];

// Function to get the appropriate API URL based on the environment
export const getApiBaseUrl = () => {
    // In a production environment, you might want to use environment variables
    // For now, we'll return the first URL for local development
    return API_BASE_URLS[0];
};

// Function to get the appropriate Frontend URL based on the environment
export const getFrontendUrl = () => {
    // In a production environment, you might want to use environment variables
    // For now, we'll return the first URL for local development
    return FRONTEND_URLS[0];
}; 