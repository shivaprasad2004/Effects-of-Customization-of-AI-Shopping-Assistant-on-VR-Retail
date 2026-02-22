import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { removeFromCart, clearCart } from '../store/productSlice';
import { useBlockchain } from '../hooks/useBlockchain';
import { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';

export default function Checkout() {
    const dispatch = useDispatch();
    const { cart } = useSelector((state: RootState) => state.product);
    const { currentSessionId } = useSelector((state: RootState) => state.session);
    const { initiatePayment, txPending, isConnected, connectWallet } = useBlockchain();
    const [step, setStep] = useState(1); // 1: Cart, 2: Payment, 3: Success

    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!isConnected) {
            await connectWallet();
            return;
        }

        try {
            // 1. Initiate blockchain payment
            const txHash = await initiatePayment(total, `VR-${Date.now()}`);
            if (!txHash) return;

            // 2. Record purchase in backend
            await api.post(`/sessions/${currentSessionId}/purchase`, {
                productIds: cart.map(i => i.product._id),
                totalAmount: total,
                transactionHash: txHash
            });

            dispatch(clearCart());
            setStep(3);
        } catch (err) {
            console.error('Checkout failed:', err);
        }
    };

    if (step === 3) return (
        <div className="page-container flex items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 max-w-md">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-5xl text-green-400 mx-auto mb-6">✓</div>
                <h1 className="heading-lg mb-4">Transaction Verified</h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                    Your order has been recorded on the blockchain. Loyalty tokens have been added to your profile.
                </p>
                <button onClick={() => window.location.href = '/'} className="btn-primary w-full">Return Home</button>
            </motion.div>
        </div>
    );

    return (
        <div className="page-container p-6 md:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <h1 className="heading-xl text-3xl mb-12">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {cart.length === 0 ? (
                            <div className="glass-card p-12 text-center">
                                <p className="text-white/30 font-heading mb-6 tracking-widest uppercase">Your cart is empty</p>
                                <button onClick={() => window.location.href = '/vr-store'} className="btn-secondary">Explore Products</button>
                            </div>
                        ) : (
                            cart.map(item => (
                                <motion.div key={item.product._id} layout className="glass-card p-4 flex gap-4 items-center">
                                    <img src={item.product.thumbnailUrl} className="w-20 h-20 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold">{item.product.name}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.product.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-black">${item.product.price}</p>
                                        <p className="text-[10px] text-white/30">Qty: {item.quantity}</p>
                                        <button
                                            onClick={() => dispatch(removeFromCart(item.product._id))}
                                            className="text-xs text-highlight hover:underline mt-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-96 space-y-6">
                        <div className="glass-card p-8 bg-accent/10 border-accent/20">
                            <h2 className="heading-lg text-lg mb-6">Order Summary</h2>
                            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10">
                                <div className="flex justify-between">
                                    <span className="text-white/40">Subtotal</span>
                                    <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">VR Platform Tax (8%)</span>
                                    <span className="text-white font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Shipping</span>
                                    <span className="text-green-400 font-bold">FREE (DEX)</span>
                                </div>
                            </div>
                            <div className="flex justify-between mb-8 items-end">
                                <span className="text-white/60 font-heading text-xs tracking-widest">TOTAL</span>
                                <span className="text-4xl font-black text-white">${total.toFixed(2)}</span>
                            </div>

                            <div className="space-y-3">
                                {!isConnected && (
                                    <button onClick={connectWallet} className="btn-secondary w-full">Connect MetaMask</button>
                                )}
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || txPending}
                                    className="btn-primary w-full py-4 text-base"
                                >
                                    {txPending ? <LoadingSpinner size="sm" /> : isConnected ? 'Confirm Order (ETH) ⛓️' : 'Checkout'}
                                </button>
                            </div>

                            <div className="mt-6 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-xl">🛡️</div>
                                <p className="text-[9px] text-white/40 uppercase leading-relaxed">
                                    SECURE CRYPTO PAYMENT VIA SEPULIA TESTNET. LOYALTY TOKENS WILL BE MINTED UPON CONFIRMATION.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
