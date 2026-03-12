import hre from "hardhat";

async function main() {
    console.log("🚀 Deploying AI-Powered VR Retail Smart Contracts...");

    // 1. Deploy LoyaltyToken
    const LoyaltyToken = await hre.ethers.getContractFactory("LoyaltyToken");
    const token = await LoyaltyToken.deploy();
    await token.waitForDeployment();
    console.log(`✅ LoyaltyToken ($SHOP) deployed to: ${await token.getAddress()}`);

    // 2. Deploy ProductAuthenticity
    const ProductAuthenticity = await hre.ethers.getContractFactory("ProductAuthenticity");
    const authenticity = await ProductAuthenticity.deploy();
    await authenticity.waitForDeployment();
    console.log(`✅ ProductAuthenticity deployed to: ${await authenticity.getAddress()}`);

    // 3. Deploy VRPayment (requires token address)
    const VRPayment = await hre.ethers.getContractFactory("VRPayment");
    const payment = await VRPayment.deploy(await token.getAddress());
    await payment.waitForDeployment();
    console.log(`✅ VRPayment deployed to: ${await payment.getAddress()}`);

    // 4. Transfer ownership of token to Payment contract for minting rewards
    const transferTx = await token.transferOwnership(await payment.getAddress());
    await transferTx.wait();
    console.log("⚡ Ownership of LoyaltyToken transferred to VRPayment for auto-rewards.");

    console.log("\n📦 Contract addresses for .env:");
    console.log(`VITE_CONTRACT_LOYALTY=${await token.getAddress()}`);
    console.log(`VITE_CONTRACT_AUTHENTICITY=${await authenticity.getAddress()}`);
    console.log(`VITE_CONTRACT_PAYMENT=${await payment.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});