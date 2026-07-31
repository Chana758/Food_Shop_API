import axios from '../api/axios';

const favoriteService = {
  // GET /api/favorites — get all favorites for current user
  getAll: async () => {
    const res = await axios.get('/favorites');
    return res.data.data; // array of { id, user_id, product_id, product: {...} }
  },

  // POST /api/favorites — add product to favorites
  add: async (productId) => {
    const res = await axios.post('/favorites', { product_id: productId });
    return res.data.data;
  },

  // DELETE /api/favorites/:product_id — remove from favorites
  remove: async (productId) => {
    const res = await axios.delete(`/favorites/${productId}`);
    return res.data;
  },

  // GET /api/favorites/check/:product_id
  check: async (productId) => {
    const res = await axios.get(`/favorites/check/${productId}`);
    return res.data.data.is_favorite;
  },
};

export default favoriteService;