import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ProductDisplay from './ProductDisplay';
import { RotatingDisplayShelf, PromotionalBanner } from './AnimatedDecorations';

/**
 * ElectronicsZone: Renders products in the electronics category.
 * Layout: Linear formation in the back-right corner of the store.
 */
export default function ElectronicsZone({ active }: { active: boolean }) {
    const { products } = useSelector((state: RootState) => state.product);
    const electronicsProducts = products.filter(p => p.category === 'electronics');

    if (!active && electronicsProducts.length === 0) return null;

    return (
        <group position={[25, 0, -25]}>
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[-5, 0.02, 5]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial color="#0F3460" transparent opacity={0.05} />
            </mesh>

            {/* Centerpiece rotating display shelf */}
            <RotatingDisplayShelf position={[-5, 0, 5]} color="#0F3460" />

            {/* Promotional Banner */}
            <PromotionalBanner position={[-5, 5, 5]} text="TECH HUB" color="#4FC3F7" />

            {electronicsProducts.map((p, i) => {
                const x = (i % 3) * -5;
                const z = Math.floor(i / 3) * 5;
                return (
                    <ProductDisplay
                        key={p._id}
                        product={p}
                        position={[x, 1, z]}
                    />
                );
            })}
        </group>
    );
}
