import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

export interface Product {
    _id: string;
    name: string;
    category: 'fashion' | 'electronics' | 'furniture' | 'accessories';
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    model3DUrl?: string;
    thumbnailUrl?: string;
    specifications: Record<string, any>;
    sizes: string[];
    colors: { name: string; hex: string; imageUrl?: string }[];
    rating: number;
    reviewCount: number;
    brand?: string;
    tags: string[];
    vrZone?: string;
    vrPosition?: { x: number; y: number; z: number };
    isAuthenticated: boolean;
    blockchainCertificateHash?: string;
    ipfsCertificateUrl?: string;
    featured: boolean;
    newArrival: boolean;
}

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    compareList: Product[];
    cart: { product: Product; quantity: number; selectedSize?: string; selectedColor?: string }[];
    recommendations: Product[];
    trending: Product[];
    loading: boolean;
    error: string | null;
    filters: { category: string; minPrice: number; maxPrice: number; search: string };
    total: number;
    page: number;
}

const initialState: ProductState = {
    products: [], selectedProduct: null, compareList: [], cart: [],
    recommendations: [], trending: [], loading: false, error: null,
    filters: { category: '', minPrice: 0, maxPrice: 10000, search: '' },
    total: 0, page: 1,
};

// ── Thunks ────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk(
    'product/fetchAll',
    async (params: Record<string, any> = {}, { rejectWithValue }) => {
        try {
            const res = await api.get('/products', { params });
            return res.data;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

export const fetchProductById = createAsyncThunk(
    'product/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/products/${id}`);
            return res.data.product;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

export const fetchTrending = createAsyncThunk(
    'product/trending',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/recommend/trending');
            return res.data.products;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

export const fetchRecommendations = createAsyncThunk(
    'product/recommendations',
    async (data: { currentProductId?: string; sessionData?: any }, { rejectWithValue }) => {
        try {
            const res = await api.post('/recommend', data);
            return res.data.recommended_products;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

// ── Slice ─────────────────────────────────────────────────────
const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        selectProduct: (s, a: PayloadAction<Product | null>) => { s.selectedProduct = a.payload; },
        addToCompare: (s, a: PayloadAction<Product>) => {
            if (s.compareList.length < 2 && !s.compareList.find(p => p._id === a.payload._id))
                s.compareList.push(a.payload);
        },
        removeFromCompare: (s, a: PayloadAction<string>) => {
            s.compareList = s.compareList.filter(p => p._id !== a.payload);
        },
        addToCart: (s, a: PayloadAction<{ product: Product; selectedSize?: string; selectedColor?: string }>) => {
            const existing = s.cart.find(i => i.product._id === a.payload.product._id);
            if (existing) existing.quantity += 1;
            else s.cart.push({ ...a.payload, quantity: 1 });
        },
        removeFromCart: (s, a: PayloadAction<string>) => {
            s.cart = s.cart.filter(i => i.product._id !== a.payload);
        },
        clearCart: (s) => { s.cart = []; },
        setFilters: (s, a: PayloadAction<Partial<ProductState['filters']>>) => {
            s.filters = { ...s.filters, ...a.payload };
        },
        clearCompare: (s) => { s.compareList = []; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.pending, (s) => { s.loading = true; });
        builder.addCase(fetchProducts.fulfilled, (s, a) => {
            s.loading = false; s.products = a.payload.products;
            s.total = a.payload.total; s.page = a.payload.page;
        });
        builder.addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
        builder.addCase(fetchProductById.fulfilled, (s, a) => { s.selectedProduct = a.payload; });
        builder.addCase(fetchTrending.fulfilled, (s, a) => { s.trending = a.payload || []; });
        builder.addCase(fetchRecommendations.fulfilled, (s, a) => { s.recommendations = a.payload || []; });
    },
});

export const { selectProduct, addToCompare, removeFromCompare, addToCart, removeFromCart, clearCart, setFilters, clearCompare } = productSlice.actions;
export default productSlice.reducer;
