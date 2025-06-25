/**
 * API Client utility with error handling and retry logic
 */
const apiClient = {
  /**
   * Makes an API request with retry and timeout handling
   * @param {string} endpoint - API endpoint to call (without base URL)
   * @param {Object} options - Fetch options
   * @param {number} retries - Number of retries on failure
   * @returns {Promise<Object>} - API response
   */
  async fetch(endpoint, options = {}, retries = 2) {
    const baseUrl = process.env.REACT_APP_MANGADX_API || 'https://api.mangadex.org';
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    console.log('🔗 API Request:', url);
    
    // Tăng timeout lên 25 giây cho MangaDx
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'eManga/1.0',
      'Cache-Control': 'no-cache',
      'Referer': 'https://mangadex.org/', // Sửa lại referer
      'Origin': 'https://mangadex.org',   // Sửa lại origin
      ...(options.headers || {})
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeout);
      
      console.log('📡 API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ API Error Response:', errorText);
        
        // Specific error handling cho MangaDx
        if (response.status === 429) {
          throw new Error('Rate limited by MangaDx API. Please wait and try again.');
        } else if (response.status === 404) {
          throw new Error('Content not found on MangaDx.');
        } else if (response.status >= 500) {
          throw new Error('MangaDx server error. Please try again later.');
        }
        
        throw new Error(`MangaDx API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ MangaDx API Response successful:', {
        hasData: !!data,
        dataType: typeof data,
        keys: data ? Object.keys(data) : [],
        dataLength: data && data.data ? data.data.length : 'N/A'
      });
      
      return data;
    } catch (error) {
      clearTimeout(timeout);
      
      console.error('💥 MangaDx API Error:', {
        name: error.name,
        message: error.message,
        url: url,
        retries: retries
      });
      
      if (error.name === 'AbortError') {
        throw new Error('MangaDx request timed out after 25 seconds');
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error - Cannot reach MangaDx API');
      }
      
      // Retry với exponential backoff
      if (retries > 0) {
        console.log(`🔄 Retrying MangaDx API call, ${retries} attempts left`);
        const waitTime = (3 - retries) * 2000; // 2s, 4s delay
        await new Promise(r => setTimeout(r, waitTime));
        return this.fetch(endpoint, options, retries - 1);
      }
      
      throw error;
    }
  },
  
  // Convenience methods
  async get(endpoint, options = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },
  
  async post(endpoint, data, options = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  }
};

export default apiClient;
