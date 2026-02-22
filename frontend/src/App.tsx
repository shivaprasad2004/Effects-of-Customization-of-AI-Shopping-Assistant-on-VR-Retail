import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { RootState } from './store';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded pages for code splitting
const VRStore = lazy(() => import('./pages/VRStore'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Products = lazy(() => import('./pages/Products'));

/** Route guard: redirect to /login if not authenticated */
function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useSelector((state: RootState) => state.auth);
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
    const { fontSize } = useSelector((state: RootState) => state.ui);

    return (
        <div className={`page-container font-${fontSize}`}>
            <Suspense fallback={<LoadingSpinner fullscreen />}>
                <AnimatePresence mode="wait">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route path="/" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Products />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/products" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Products />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/products/:category" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Products />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/products/:category/:sub" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Products />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/vr-store" element={
                            <PrivateRoute>
                                {/* VR Store uses full-screen canvas — no Navbar */}
                                <VRStore />
                            </PrivateRoute>
                        } />
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Profile />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/analytics" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Analytics />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/checkout" element={
                            <PrivateRoute>
                                <>
                                    <Navbar />
                                    <Checkout />
                                </>
                            </PrivateRoute>
                        } />
                        <Route path="/onboarding" element={
                            <PrivateRoute>
                                <Onboarding />
                            </PrivateRoute>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
            </Suspense>
        </div>
    );
}
