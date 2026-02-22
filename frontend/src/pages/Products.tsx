import { useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts, setFilters } from '../store/productSlice';
import ProductCard from '../components/ProductCards/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LABELS: Record<string, string> = {
  fashion: 'Fashion & Apparel',
  electronics: 'Electronics & Gadgets',
  home: 'Home & Lifestyle',
  beauty: 'Beauty & Personal Care',
  baby_kids: 'Baby & Kids',
  pets: 'Pet Supplies',
  niche: 'Niche & Emerging',
};

const SUBCATS: Record<string, string[]> = {
  fashion: ['men', 'women', 'children', 'accessories'],
  electronics: ['audio-video', 'computers', 'wearables'],
  home: ['living', 'bedroom', 'kitchen', 'decor'],
  beauty: ['skincare', 'haircare', 'makeup', 'fragrance'],
  baby_kids: ['clothing', 'toys', 'nursery'],
  pets: ['dog', 'cat', 'accessories'],
  niche: ['eco', 'indie', 'limited'],
};

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { category, sub } = useParams<{ category?: string; sub?: string }>();
  const { products, loading, total } = useAppSelector((s) => s.product);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const params = useMemo(() => {
    const p: any = {};
    if (category) p.category = category;
    if (sub) p.subcategory = sub;
    return p;
  }, [category, sub]);

  useEffect(() => {
    dispatch(setFilters({ category: category || '' }));
    dispatch<any>(fetchProducts(params));
  }, [category, sub, params, dispatch]);

  const categories = ['fashion', 'electronics', 'home', 'beauty', 'baby_kids', 'pets', 'niche'];
  const subcats = SUBCATS[category || ''] || [];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black font-heading text-white">Products</h1>
        <p className="text-white/40 text-sm">{total} items</p>
      </div>

      {/* Category Nav */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/products/${cat}`}
            className={`px-3 py-1 rounded-full border ${
              category === cat ? 'bg-highlight/20 border-highlight/40 text-white' : 'border-white/10 text-white/60 hover:text-white'
            } text-xs uppercase tracking-wider`}
          >
            {LABELS[cat] || cat}
          </Link>
        ))}
      </div>

      {/* Subcategory Nav */}
      {category && subcats.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link
            to={`/products/${category}`}
            className={`px-2.5 py-1 rounded-lg border ${
              !sub ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-white/60 hover:text-white'
            } text-[11px] uppercase tracking-wider`}
          >
            All
          </Link>
          {subcats.map((s) => (
            <Link
              key={s}
              to={`/products/${category}/${s}`}
              className={`px-2.5 py-1 rounded-lg border ${
                sub === s ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-white/60 hover:text-white'
              } text-[11px] uppercase tracking-wider`}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
