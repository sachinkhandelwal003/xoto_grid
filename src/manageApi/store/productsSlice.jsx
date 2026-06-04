import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../utils/custom.apiservice';

const baseURL = 'http://localhost:5000/';

// Fetch all active and approved products with optional filters
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (filters = {}) => {
  const queryParams = new URLSearchParams({
    status: 'active',
    verification_status: 'approved',
    limit: filters.limit || 10,
    ...filters,
  });
  const response = await apiService.get(`/products?${queryParams.toString()}`);
  return response.products || [];
});

// Fetch a single product
export const fetchSingleProduct = createAsyncThunk('products/fetchSingleProduct', async (id) => {
  const response = await apiService.get(`/products?product_id=${id}`);
  return response.products[0] || null;
});

// Fetch a single product with similar products
export const fetchProductAndSimilar = createAsyncThunk(
  'products/fetchProductAndSimilar',
  async (id) => {
    const response = await apiService.get(`/products?product_id=${id}&similar=true`);
    const product = response.products[0] || null;
    const similar = response.similar_products || [];
    return { product, similar };
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    similarProducts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchSingleProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchSingleProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductAndSimilar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductAndSimilar.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.similarProducts = action.payload.similar;
      })
      .addCase(fetchProductAndSimilar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;