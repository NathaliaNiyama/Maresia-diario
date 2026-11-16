// src/services/searchService.js

const API_URL = "http://localhost:3000";

export const searchService = {
  /**
   * Busca completa com filtros
   * @param {Object} params - Parâmetros de busca
   * @returns {Promise<Object>} Resultado da busca
   */
  async search(params) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/products/search?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro no searchService.search:', error);
      throw error;
    }
  },

  /**
   * Sugestões para autocomplete
   * @param {string} query - Termo de busca
   * @param {number} limit - Limite de sugestões
   * @returns {Promise<Object>} Sugestões
   */
  async getSuggestions(query, limit = 5) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const response = await fetch(
        `${API_URL}/products/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar sugestões');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro no searchService.getSuggestions:', error);
      throw error;
    }
  }
};

export default searchService;