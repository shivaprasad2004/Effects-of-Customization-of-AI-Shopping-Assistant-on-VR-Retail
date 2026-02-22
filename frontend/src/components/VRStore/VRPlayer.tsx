import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useDispatch } from 'react-redux';
import { setVRZone, setPlayerPose } from '../../store/uiSlice';

const SPEED = 5;
const JUMP_FORCE = 4;
const GRAVITY = 9.8;

/**
 * VRPlayer: First-person camera controller.
 * Handles WASD movement, jumping, collision boundaries, and zone detection.
 */
export default function VRPlayer() {
    const { camera } = useThree();
    const [, getKeys] = useKeyboardControls();
    const dispatch = useDispatch();
    const lastZone = useRef<string>('entrance');

    // Physics refs
    const velocity = useRef(new THREE.Vector3());
    const isGrounded = useRef(true);

    // Movement logic
    useFrame((state, delta) => {
        const { forward, backward, left, right, jump } = getKeys();

        // ── Rotation handled by PointerLockControls automatically ──

        // ── Movement velocity ──
        const direction = new THREE.Vector3();
        const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
        const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0);

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyEuler(camera.rotation);

        velocity.current.x = direction.x;
        velocity.current.z = direction.z;

        // ── Gravity & Jumping ──
        if (isGrounded.current && jump) {
            velocity.current.y = JUMP_FORCE;
            isGrounded.current = false;
        }

        if (!isGrounded.current) {
            velocity.current.y -= GRAVITY * delta;
        }

        // ── Apply position ──
        camera.position.addScaledVector(velocity.current, delta);

        // ── Floor collision (Simple Y = 1.7) ──
        if (camera.position.y < 1.7) {
            camera.position.y = 1.7;
            velocity.current.y = 0;
            isGrounded.current = true;
        }

        // ── Boundaries (100x100 world) ──
        camera.position.x = Math.max(-45, Math.min(45, camera.position.x));
        camera.position.z = Math.max(-45, Math.min(45, camera.position.z));

        // ── Zone Detection ──
        const zone = getZone(camera.position);
        if (zone !== lastZone.current) {
            lastZone.current = zone;
            dispatch(setVRZone(zone as any));
        }

        // ── Publish pose for HUD ──
        dispatch(setPlayerPose({ x: camera.position.x, z: camera.position.z, rotY: camera.rotation.y }));
    });

    const getZone = (pos: THREE.Vector3) => {
        let zone = 'entrance';
        if (pos.z < -10 && pos.x < -10) zone = 'fashion';
        else if (pos.z < -10 && pos.x > 10) zone = 'electronics';
        else if (pos.z > 10 && pos.x < -10) zone = 'furniture';
        else if (pos.z > 10 && pos.x > 10) zone = 'checkout';
        return zone;
    };

    return null; // This component ONLY controls the camera
}
