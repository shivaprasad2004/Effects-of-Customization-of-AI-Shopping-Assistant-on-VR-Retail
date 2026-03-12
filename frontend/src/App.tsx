import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Suspense, lazy } from 'react';
import { RootState } from './store';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LandingPage from './pages/LandingPage';
import ChatWindow from './components/Chatbot/ChatWindow';
import ProductDetailModal from './components/ProductCards/ProductDetailModal';

// Lazy-loaded pages for code splitting
const VRStore = lazy(() => import('./pages/VRStore'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Products = lazy(() => import('./pages/Products'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Product3DExplorer = lazy(() => import('./pages/Product3DExplorer'));

/** Route guard: redirect to /login if not authenticated */
function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useSelector((state: RootState) => state.auth);
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Layout wrapper with Navbar + Chat + Modal */
function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <ChatWindow />
            <ProductDetailModal />
        </>
    );
}

export default function App() {
    const { token } = useSelector((state: RootState) => state.auth);
    const { fontSize } = useSelector((state: RootState) => state.ui);

    return (
        <div className={`page-container font-${fontSize}`}>
            <Suspense fallback={<LoadingSpinner fullscreen />}>
                <Routes>
                    {/* Root: Landing if guest, Home if logged in */}
                    <Route path="/" element={
                        token ? (
                            <PrivateRoute><AppLayout><Home /></AppLayout></PrivateRoute>
                        ) : (
                            <LandingPage />
                        )
                    } />

                    {/* Public */}
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Products */}
                    <Route path="/products" element={<PrivateRoute><AppLayout><Products /></AppLayout></PrivateRoute>} />
                    <Route path="/products/:category" element={<PrivateRoute><AppLayout><Products /></AppLayout></PrivateRoute>} />
                    <Route path="/products/:category/:sub" element={<PrivateRoute><AppLayout><Products /></AppLayout></PrivateRoute>} />

                    {/* VR Store (no navbar - fullscreen) */}
                    <Route path="/vr-store" element={
                        <PrivateRoute>
                            <>
                                <VRStore />
                                <ChatWindow />
                                <ProductDetailModal />
                            </>
                        </PrivateRoute>
                    } />

                    {/* 3D Product Explorer (fullscreen, no navbar) */}
                    <Route path="/product-3d/:id" element={<PrivateRoute><Product3DExplorer /></PrivateRoute>} />

                    {/* Other Protected */}
                    <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
                    <Route path="/analytics" element={<PrivateRoute><AppLayout><Analytics /></AppLayout></PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute><AppLayout><Checkout /></AppLayout></PrivateRoute>} />
                    <Route path="/onboarding" element={<PrivateRoute><><Onboarding /><ChatWindow /></></PrivateRoute>} />
                    <Route path="/documentation" element={<PrivateRoute><AppLayout><Documentation /></AppLayout></PrivateRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </div>
    );
}
