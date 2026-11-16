
const API_URL = 'http://localhost:3000/api';

export const cartService = {

  // Adicionar item à sacola
  async addItem(userId, productId, quantidade = 1, tamanho = null, cor = null) {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        productId,
        quantidade,
        tamanho,
        cor
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao adicionar item');
    }

    return response.json();
  },

  // Buscar itens da sacola
  async getCart(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/cart`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar sacola');
    }

    return response.json();
  },

  // Atualizar quantidade
  async updateQuantity(cartItemId, quantidade) {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantidade }),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar quantidade');
    }

    return response.json();
  },

  // Remover item
  async removeItem(cartItemId) {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erro ao remover item');
    }

    return response.json();
  },

  // Limpar sacola
  async clearCart(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/cart`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erro ao limpar sacola');
    }

    return response.json();
  },

  // Finalizar compra
  async checkout(userId, pagamento, enderecoId, cartItemIds, parcelas = 1) {
    const response = await fetch(`${API_URL}/users/${userId}/cart/checkout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pagamento,
        enderecoId,
        parcelas,
        cartItemIds
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao finalizar compra');
    }

    return response.json();
  },

};
