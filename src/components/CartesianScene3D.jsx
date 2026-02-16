import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, SpotLight, Line, Html, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import CartesianGrid from '../utils/cartesianGrid';

const CELL_SIZE = 2;

// Materials
const materials = {
    robotBody: new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.3, metalness: 0.8 }),
    robotDark: new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.7, metalness: 0.5 }),
    robotJoint: new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.5, metalness: 0.8 }),
    potTerracotta: new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.9 }),
    plantGreen: new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.6 }),
    rock: new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.9, flatShading: true })
};

const Ground = () => (
    <group position={[0, -0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
        </mesh>
        <gridHelper args={[60, 30, "#3b82f6", "#1e293b"]} position={[0, 0.02, 0]} />
    </group>
);

const Obstacle = ({ position }) => (
    <group position={position}>
        <mesh castShadow receiveShadow position={[0, 0.4, 0]} rotation={[Math.random(), Math.random(), 0]}>
            <dodecahedronGeometry args={[0.6, 0]} />
            <primitive object={materials.rock} />
        </mesh>
        <Html position={[0, 1, 0]} distanceFactor={8}>
            <div className="bg-gray-800 text-[8px] text-white px-1 rounded border border-gray-600">OBSTACLE</div>
        </Html>
    </group>
);

const Plant = ({ position, health }) => {
    const color = useMemo(() => {
        const h = health / 100;
        const col = new THREE.Color();
        if (h < 0.4) col.set('#ef4444');
        else if (h < 0.7) col.set('#eab308');
        else col.set('#22c55e');
        return col;
    }, [health]);

    return (
        <group position={position}>
            <mesh geometry={new THREE.CylinderGeometry(0.3, 0.2, 0.4, 16)} material={materials.potTerracotta} position={[0, 0.2, 0]} castShadow />
            <group position={[0, 0.4, 0]}>
                <mesh castShadow>
                    <dodecahedronGeometry args={[0.4, 0]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
            </group>
            <Html position={[0, 1, 0]} distanceFactor={10} zIndexRange={[10, 0]}>
                <div className={`text-[8px] font-mono px-1 rounded border backdrop-blur-md ${health < 40 ? 'bg-red-900/80 border-red-500 text-red-200' : 'bg-green-900/80 border-green-500 text-green-200'}`}>
                    H:{health}%
                </div>
            </Html>
        </group>
    );
};

const Robot = ({ pose, isScanning }) => {
    const groupRef = useRef();
    const armRef = useRef();
    const forearmRef = useRef();

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const targetPos = new THREE.Vector3(pose.x, 0, pose.z);
        groupRef.current.position.lerp(targetPos, 5 * delta);

        const targetRot = new THREE.Quaternion();
        targetRot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -pose.theta + Math.PI / 2);
        groupRef.current.quaternion.slerp(targetRot, 5 * delta);

        if (isScanning && armRef.current && forearmRef.current) {
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -0.5, 3 * delta);
            forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, 1.2, 3 * delta);
        } else if (armRef.current && forearmRef.current) {
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 0, 3 * delta);
            forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, 0, 3 * delta);
        }
    });

    return (
        <group ref={groupRef}>
            <mesh position={[0, 0.3, 0]} castShadow material={materials.robotBody}>
                <boxGeometry args={[0.7, 0.3, 0.9]} />
            </mesh>
            {[[-0.4, 0.2, 0.3], [0.4, 0.2, 0.3], [-0.4, 0.2, -0.3], [0.4, 0.2, -0.3]].map((pos, i) => (
                <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
                    <mesh material={materials.robotDark} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
                    </mesh>
                </group>
            ))}
            <group position={[0.2, 0.45, 0]}>
                <mesh material={materials.robotJoint}>
                    <sphereGeometry args={[0.15]} />
                </mesh>
                <group ref={armRef} rotation={[0, 0, 0]}>
                    <mesh position={[0, 0.3, 0]} material={materials.robotDark}>
                        <boxGeometry args={[0.1, 0.6, 0.1]} />
                    </mesh>
                    <group position={[0, 0.6, 0]} ref={forearmRef}>
                        <mesh material={materials.robotJoint}>
                            <sphereGeometry args={[0.12]} />
                        </mesh>
                    </group>
                </group>
            </group>
            <SpotLight position={[0.2, 0.3, 0.45]} distance={10} angle={0.5} attenuation={5} intensity={5} color="#fff" />
        </group>
    );
};

const CoordinateAxis = ({ showLabels = true }) => (
    <group>
        {/* X Axis - Red */}
        <Line points={[[-10, 0.1, 0], [10, 0.1, 0]]} color="#ef4444" lineWidth={2} />
        {showLabels && (
            <Text position={[11, 0.5, 0]} fontSize={0.5} color="#ef4444">
                +X
            </Text>
        )}

        {/* Y Axis (Z in Three.js) - Blue */}
        <Line points={[[0, 0.1, -10], [0, 0.1, 10]]} color="#3b82f6" lineWidth={2} />
        {showLabels && (
            <Text position={[0, 0.5, 11]} fontSize={0.5} color="#3b82f6">
                +Y
            </Text>
        )}

        {/* Origin Marker */}
        <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" />
        </mesh>
        {showLabels && (
            <Text position={[0, 0.8, 0]} fontSize={0.4} color="#fbbf24">
                (0,0)
            </Text>
        )}
    </group>
);

const CartesianScene3D = ({
    grid,               // CartesianGrid instance
    robotPose,          // { x, y, z, theta } in world coordinates
    path = [],          // Array of {x, y} coordinates
    targetCoord = null, // {x, y} current target
    isScanning = false,
    showAxis = true,
    showCoordinateLabels = false
}) => {
    // Convert path coordinates to world positions
    const pathPoints = useMemo(() => {
        if (!path || path.length === 0) return null;

        const points = path.map(coord => {
            const worldPos = grid.toWorldPosition(coord.x, coord.y, CELL_SIZE);
            return new THREE.Vector3(worldPos.x, 0.3, worldPos.z);
        });

        // Include robot's current position as start
        if (robotPose) {
            points.unshift(new THREE.Vector3(robotPose.x, 0.3, robotPose.z));
        }

        return points;
    }, [path, robotPose, grid]);

    // Get all cells for rendering
    const cells = grid.getAllCells();

    return (
        <Canvas shadows className="w-full h-full" dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[-8, 12, 12]} fov={45} />
            <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={40} />

            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} color="#f1f5f9" />
            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />

            <Ground />

            {/* Coordinate Axis */}
            {showAxis && <CoordinateAxis showLabels={showCoordinateLabels} />}

            {/* Grid Cells */}
            {cells.map(cell => {
                const worldPos = grid.toWorldPosition(cell.x, cell.y, CELL_SIZE);
                const pos = [worldPos.x, 0, worldPos.z];

                return (
                    <group key={cell.key}>
                        {/* Coordinate Labels */}
                        {showCoordinateLabels && (
                            <Text
                                position={[worldPos.x, 0.05, worldPos.z]}
                                rotation={[-Math.PI / 2, 0, 0]}
                                fontSize={0.3}
                                color="#6b7280"
                            >
                                {cell.x},{cell.y}
                            </Text>
                        )}

                        {/* Objects */}
                        {cell.type === 'obstacle' && <Obstacle position={pos} />}
                        {cell.type === 'plant' && <Plant position={pos} health={cell.moisture || 50} />}

                        {/* Target highlight */}
                        {targetCoord && targetCoord.x === cell.x && targetCoord.y === cell.y && (
                            <mesh position={[worldPos.x, 0.05, worldPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
                                <ringGeometry args={[0.8, 1.0, 32]} />
                                <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
                            </mesh>
                        )}
                    </group>
                );
            })}

            {/* Robot */}
            <Robot pose={robotPose} isScanning={isScanning} />

            {/* Path Visualization */}
            {pathPoints && pathPoints.length > 1 && (
                <Line
                    points={pathPoints}
                    color="#3b82f6"
                    lineWidth={3}
                    dashed
                    dashScale={2}
                />
            )}

            <ContactShadows opacity={0.5} scale={50} blur={2} far={4} color="#000000" />
        </Canvas>
    );
};

export default CartesianScene3D;
