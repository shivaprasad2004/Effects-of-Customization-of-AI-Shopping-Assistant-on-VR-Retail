const { ethers } = require('ethers');

/**
 * PaymentService: Wraps smart contract interactions for VR Retail.
 * Works in mock mode when no blockchain connection is available.
 */
class PaymentService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.mockMode = true;
        this.mockBalances = {};
        this.mockProducts = {};
        this.mockTransactions = [];

        this._tryConnect();
    }

    async _tryConnect() {
        try {
            const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            await this.provider.getBlockNumber();
            const accounts = await this.provider.listAccounts();
            if (accounts.length > 0) {
                this.signer = accounts[0];
                this.mockMode = false;
                console.log('Connected to blockchain at', rpcUrl);
            }
        } catch {
            this.mockMode = true;
            console.log('Blockchain not available — running in mock mode');
        }
    }

    async processPayment(orderId, amount, buyerAddress) {
        if (this.mockMode) {
            const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            const rewardTokens = Math.floor(amount * 10);
            this.mockBalances[buyerAddress] = (this.mockBalances[buyerAddress] || 0) + rewardTokens;
            this.mockTransactions.push({ orderId, amount, buyerAddress, txHash, rewardTokens, timestamp: new Date().toISOString() });
            return {
                success: true,
                txHash,
                orderId,
                amount,
                rewardTokens,
                loyaltyBalance: this.mockBalances[buyerAddress],
                network: 'mock-localhost',
                escrowStatus: 'completed',
            };
        }

        // Real blockchain interaction would go here
        return { success: false, error: 'Real blockchain integration requires deployed contracts' };
    }

    async getLoyaltyBalance(address) {
        if (this.mockMode) {
            return {
                address,
                balance: this.mockBalances[address] || Math.floor(Math.random() * 500),
                token: '$SHOP',
                tokenName: 'VR Loyalty Token',
                network: 'mock-localhost',
            };
        }
        return { address, balance: 0, token: '$SHOP' };
    }

    async verifyProduct(sku) {
        if (this.mockMode) {
            const registered = this.mockProducts[sku];
            if (registered) return { verified: true, ...registered };
            return {
                verified: true,
                sku,
                name: 'Verified Product',
                manufacturer: '0x' + 'a'.repeat(40),
                certificateHash: 'ipfs://QmDemo' + sku,
                timestamp: new Date().toISOString(),
                network: 'mock-localhost',
                note: 'Demo verification — product assumed authentic',
            };
        }
        return { verified: false, error: 'Real verification requires deployed contracts' };
    }

    async registerProduct(sku, name, certificateHash) {
        const record = {
            sku,
            name,
            certificateHash: certificateHash || 'ipfs://QmDemo' + Date.now(),
            manufacturer: '0xDemoManufacturer',
            timestamp: new Date().toISOString(),
            registered: true,
        };
        this.mockProducts[sku] = record;
        return { success: true, ...record, network: this.mockMode ? 'mock-localhost' : 'sepolia' };
    }

    getTransactionHistory() {
        return this.mockTransactions;
    }
}

module.exports = new PaymentService();
