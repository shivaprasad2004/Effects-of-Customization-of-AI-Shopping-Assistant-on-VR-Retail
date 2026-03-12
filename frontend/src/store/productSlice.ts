import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

export interface ConfiguratorOptions {
    colors: { name: string; hex: string; imageUrl?: string }[];
    materials: { name: string; texture: string; roughness: number; metalness: number }[];
    sizes: string[];
}

export interface CRMInsights {
    targetAudience: string;
    conversionRate: number;
    engagementScore: number;
    avgSessionTime: number;
    demographics: string;
}

export interface Product {
    _id: string;
    name: string;
    category: string;
    subcategory?: string;
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
    stock: number;
    lowStock?: boolean;
    liveViewers?: number;
    flashSale?: boolean;
    flashEndsAt?: string;
    specialOffer?: string;
    discountPrice?: number;
    // New tech fields
    arEnabled?: boolean;
    arType?: 'try-on' | 'room-placement' | '360-view' | null;
    displayMode?: 'standard' | 'kiosk' | 'configurator' | null;
    configuratorOptions?: ConfiguratorOptions;
    model3DConfig?: { defaultColor: string; defaultMaterial: string; rotatable: boolean; scalable: boolean };
    crmInsights?: CRMInsights;
    showcase?: boolean;
}

interface ProductState {
    products: Product[];
    showcaseProducts: Product[];
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
    products: [], showcaseProducts: [], selectedProduct: null, compareList: [], cart: [],
    recommendations: [], trending: [], loading: false, error: null,
    filters: { category: '', minPrice: 0, maxPrice: 10000, search: '' },
    total: 0, page: 1,
};

// ── Thunks ────────────────────────────────────────────────────
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

export const fetchShowcase = createAsyncThunk(
    'product/fetchShowcase',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/products/showcase');
            // Fallback to hardcoded data if API returns empty
            if (!res.data.products || res.data.products.length === 0) {
                const { showcaseProducts } = await import('../data/showcaseProducts');
                return showcaseProducts;
            }
            return res.data.products;
        } catch (err: any) {
            const { showcaseProducts } = await import('../data/showcaseProducts');
            return showcaseProducts;
        }
    }
);

export const fetchProducts = createAsyncThunk(
    'product/fetchAll',
    async (params: Record<string, any> = {}, { rejectWithValue }) => {
        try {
            const res = await api.get('/products', { params });
            // If API returns empty, fallback to showcase data with filtering
            if (!res.data.products || res.data.products.length === 0) {
                const { showcaseProducts } = await import('../data/showcaseProducts');
                let filtered = showcaseProducts as Product[];
                if (params.category) filtered = filtered.filter(p => p.category === params.category);
                if (params.subcategory) filtered = filtered.filter(p => (p as any).subcategory === params.subcategory);
                return { products: filtered, total: filtered.length, page: 1, pages: 1 };
            }
            return res.data;
        } catch (err: any) {
            // Fallback on error too
            const { showcaseProducts } = await import('../data/showcaseProducts');
            let filtered = showcaseProducts as Product[];
            if (params.category) filtered = filtered.filter(p => p.category === params.category);
            if (params.subcategory) filtered = filtered.filter(p => (p as any).subcategory === params.subcategory);
            return { products: filtered, total: filtered.length, page: 1, pages: 1 };
        }
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
        builder.addCase(fetchShowcase.fulfilled, (s, a) => { s.showcaseProducts = a.payload || []; });
        builder.addCase(fetchRecommendations.fulfilled, (s, a) => { s.recommendations = a.payload || []; });
    },
});

export const { selectProduct, addToCompare, removeFromCompare, addToCart, removeFromCart, clearCart, setFilters, clearCompare } = productSlice.actions;
export default productSlice.reducer;
