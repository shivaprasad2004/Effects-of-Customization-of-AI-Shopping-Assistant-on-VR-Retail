import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

declare global {
    interface Window { ethereum?: any; }
}

/**
 * Custom hook for MetaMask / ethers.js wallet integration.
 * Handles wallet connection, token balance reading, and contract interactions.
 */
export function useBlockchain() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [txPending, setTxPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    /** Connect MetaMask wallet */
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            setError('MetaMask not installed. Please install MetaMask to use blockchain features.');
            return null;
        }
        try {
            setIsConnecting(true);
            const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            setWalletAddress(address);

            // Persist to backend profile
            const { default: api } = await import('../services/api');
            await api.put('/users/profile', { walletAddress: address });

            return address;
        } catch (err: any) {
            setError(err.message || 'Wallet connection failed');
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, []);

    /** Send ETH payment via MetaMask */
    const initiatePayment = useCallback(async (amount: number, orderId: string): Promise<string | null> => {
        if (!walletAddress || !window.ethereum) {
            setError('Wallet not connected');
            return null;
        }
        try {
            setTxPending(true);
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contractAddress = import.meta.env.VITE_CONTRACT_PAYMENT;
            const amountInWei = ethers.parseEther((amount * 0.0003).toFixed(6)); // Mock USD→ETH rate

            // Simple ETH transfer (full smart contract ABI in production)
            const tx = await signer.sendTransaction({
                to: contractAddress || '0x0000000000000000000000000000000000000002',
                value: amountInWei,
            });
            await tx.wait();
            return tx.hash;
        } catch (err: any) {
            setError(err.message || 'Transaction failed');
            return null;
        } finally {
            setTxPending(false);
        }
    }, [walletAddress]);

    /** Verify product authenticity on-chain */
    const verifyProduct = useCallback(async (productId: string) => {
        try {
            const { default: api } = await import('../services/api');
            const res = await api.post(`/blockchain/verify/${productId}`);
            return res.data;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, []);

    return {
        walletAddress: walletAddress || user?.walletAddress,
        isConnecting, txPending, error,
        connectWallet, initiatePayment, verifyProduct,
        isConnected: !!(walletAddress || user?.walletAddress),
    };
}
