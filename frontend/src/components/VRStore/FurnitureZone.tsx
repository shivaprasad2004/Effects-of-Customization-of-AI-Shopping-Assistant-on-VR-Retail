import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ProductDisplay from './ProductDisplay';
import { PromotionalBanner } from './AnimatedDecorations';

/**
 * FurnitureZone: Renders products in the furniture category.
 * Layout: Large spacing for big items in the front-left corner.
 */
export default function FurnitureZone({ active }: { active: boolean }) {
    const { products } = useSelector((state: RootState) => state.product);
    const furnitureProducts = products.filter(p => p.category === 'furniture');

    if (!active && furnitureProducts.length === 0) return null;

    return (
        <group position={[-25, 0, 25]}>
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[5, 0.02, -5]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial color="#34D399" transparent opacity={0.05} />
            </mesh>

            {/* Promotional Banner */}
            <PromotionalBanner position={[5, 5, -5]} text="HOME & LIVING" color="#81C784" />

            {furnitureProducts.map((p, i) => {
                const x = (i % 2) * 8;
                const z = Math.floor(i / 2) * -8;
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
