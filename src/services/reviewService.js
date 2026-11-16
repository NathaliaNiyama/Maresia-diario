
const API_URL = "http://localhost:3000/products";

const reviewService = {
  // Buscar produto e suas avaliações
  async getProductReviews(productId) {
    const response = await fetch(`${API_URL}/${productId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar avaliações do produto.");
    }

    const product = await response.json();

    return {
      reviews: product.reviews || [],
      reviewStats: product.reviewStats || {
        total: 0,
        averageStars: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    };
  },

  // Criar avaliação de um produto
  async create(productId, { estrelas, comentario }) {
    const response = await fetch(`${API_URL}/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        estrelas,
        comentario,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao cadastrar avaliação.");
    }

    return data.review;
  },
};

export default reviewService;
