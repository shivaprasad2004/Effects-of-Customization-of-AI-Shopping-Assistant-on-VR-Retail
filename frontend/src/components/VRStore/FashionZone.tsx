import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ProductDisplay from './ProductDisplay';

/**
 * FashionZone: Renders products in the fashion category.
 * Layout: Grid-like formation in the back-left corner of the store.
 */
export default function FashionZone({ active }: { active: boolean }) {
    const { products } = useSelector((state: RootState) => state.product);
    const fashionProducts = products.filter(p => p.category === 'fashion');

    if (!active && fashionProducts.length === 0) return null;

    return (
        <group position={[-25, 0, -25]}>
            {/* Decorative environment for fashion */}
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[5, 0.02, 5]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial color="#E94560" transparent opacity={0.05} />
            </mesh>

            {/* Map products to 3D grid */}
            {fashionProducts.map((p, i) => {
                const x = (i % 3) * 5;
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
