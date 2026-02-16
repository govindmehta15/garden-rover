import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, SpotLight, Line, Html, ContactShadows, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- ASSETS & CONFIG ---
const CELL_SIZE = 2;

// Materials
const materials = {
    robotBody: new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.3, metalness: 0.8 }),
    robotDark: new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.7, metalness: 0.5 }),
    robotJoint: new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.5, metalness: 0.8 }),
    potTerracotta: new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.9 }),
    plantGreen: new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.6 }),
    rock: new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.9, flatShading: true }),
    groundDay: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 }), // Tech Dark Blue/Grey
    gridLine: new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.2 })
};

// 1. Tech Ground
const Ground = ({ isNight }) => (
    <group position={[0, -0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
        </mesh>
        <gridHelper args={[60, 30, "#3b82f6", "#1e293b"]} position={[0, 0.02, 0]} />
    </group>
);

// 2. Obstacle
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

// 3. Plant (Enhanced)
const Plant = ({ position, type, health, id, isSelected, isTarget }) => {
    const color = useMemo(() => {
        const h = health / 100;
        const col = new THREE.Color();
        if (h < 0.4) col.set('#ef4444'); // Critical
        else if (h < 0.7) col.set('#eab308'); // Warn
        else col.set('#22c55e'); // Good
        return col;
    }, [health]);

    return (
        <group position={position}>
            {isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.7, 0.8, 32]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
                </mesh>
            )}

            {/* Target Hologram */}
            {isTarget && (
                <group position={[0, 1.5, 0]}>
                    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                        <mesh rotation={[Math.PI, 0, 0]}>
                            <coneGeometry args={[0.2, 0.4, 4]} />
                            <meshBasicMaterial color="#ef4444" wireframe />
                        </mesh>
                        <Html position={[0, 0.5, 0]} center>
                            <div className="bg-red-500/90 text-white text-[8px] font-mono px-1 rounded backdrop-blur">TARGET</div>
                        </Html>
                    </Float>
                    {/* Laser Line from sky */}
                    <mesh position={[0, 5, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 10]} />
                        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
                    </mesh>
                </group>
            )}

            {/* Pot */}
            <mesh geometry={new THREE.CylinderGeometry(0.3, 0.2, 0.4, 16)} material={materials.potTerracotta} position={[0, 0.2, 0]} castShadow />

            {/* Plant geometry */}
            <group position={[0, 0.4, 0]}>
                <mesh castShadow>
                    <dodecahedronGeometry args={[0.4, 0]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
                <mesh position={[0.2, 0.3, 0]} scale={0.6} castShadow>
                    <dodecahedronGeometry args={[0.4, 0]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
                <mesh position={[-0.2, 0.2, 0.2]} scale={0.5} castShadow>
                    <dodecahedronGeometry args={[0.4, 0]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
            </group>

            {/* Stat Monitor */}
            <Html position={[0, 1, 0]} distanceFactor={10} zIndexRange={[10, 0]}>
                <div className={`text-[8px] font-mono px-1 rounded border backdrop-blur-md ${health < 40 ? 'bg-red-900/80 border-red-500 text-red-200' : 'bg-green-900/80 border-green-500 text-green-200'}`}>
                    H:{health}%
                </div>
            </Html>
        </group>
    );
};

// 4. Advanced Robot with Arms
const Robot = ({ pose, isScanning, isNight }) => {
    const groupRef = useRef();
    const armRef = useRef();
    const forearmRef = useRef();

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Body Movement
        const targetPos = new THREE.Vector3(pose.x, 0, pose.y);
        groupRef.current.position.lerp(targetPos, 5 * delta);

        const targetRot = new THREE.Quaternion();
        targetRot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -pose.theta + Math.PI / 2);
        groupRef.current.quaternion.slerp(targetRot, 5 * delta);

        // Arm Animation
        if (isScanning && armRef.current && forearmRef.current) {
            // Extend Arm
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -0.5, 3 * delta);
            forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, 1.2, 3 * delta);
        } else if (armRef.current && forearmRef.current) {
            // Retract Arm
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 0, 3 * delta);
            forearmRef.current.rotation.x = THREE.MathUtils.lerp(forearmRef.current.rotation.x, 0, 3 * delta);
        }
    });

    return (
        <group ref={groupRef}>
            {/* Chassis */}
            <mesh position={[0, 0.3, 0]} castShadow material={materials.robotBody}>
                <boxGeometry args={[0.7, 0.3, 0.9]} />
            </mesh>

            {/* Wheels */}
            {[[-0.4, 0.2, 0.3], [0.4, 0.2, 0.3], [-0.4, 0.2, -0.3], [0.4, 0.2, -0.3]].map((pos, i) => (
                <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
                    <mesh material={materials.robotDark} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
                    </mesh>
                    <mesh material={new THREE.MeshStandardMaterial({ color: '#ffffff' })} rotation={[0, 0, Math.PI / 2]} position={[0, 0.11, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.02, 6]} />
                    </mesh>
                </group>
            ))}

            {/* Articulated Arm Group */}
            <group position={[0.2, 0.45, 0]}>
                {/* Shoulder */}
                <mesh material={materials.robotJoint}>
                    <sphereGeometry args={[0.15]} />
                </mesh>
                {/* Upper Arm */}
                <group ref={armRef} rotation={[0, 0, 0]}>
                    <mesh position={[0, 0.3, 0]} material={materials.robotDark}>
                        <boxGeometry args={[0.1, 0.6, 0.1]} />
                    </mesh>
                    {/* Elbow */}
                    <group position={[0, 0.6, 0]} ref={forearmRef}>
                        <mesh material={materials.robotJoint}>
                            <sphereGeometry args={[0.12]} />
                        </mesh>
                        <mesh position={[0, 0.25, 0.1]} rotation={[0.5, 0, 0]} material={materials.robotBody}>
                            <boxGeometry args={[0.08, 0.5, 0.08]} />
                        </mesh>
                        {/* Sensor Claw */}
                        <group position={[0, 0.5, 0.2]} rotation={[0.5, 0, 0]}>
                            <mesh material={materials.robotJoint}>
                                <cylinderGeometry args={[0.05, 0.08, 0.1]} />
                            </mesh>
                            {isScanning && (
                                <SpotLight position={[0, 0, 0]} target-position={[0, 2, 0]} color="#00ff00" intensity={10} distance={3} angle={0.5} opacity={0.5} />
                            )}
                        </group>
                    </group>
                </group>
            </group>

            {/* Sensor Dome */}
            <group position={[-0.2, 0.45, 0.3]}>
                <mesh material={materials.robotDark}>
                    <cylinderGeometry args={[0.1, 0.15, 0.2]} />
                </mesh>
                {/* Rotating Lidar */}
                <SpinningLidar />
            </group>

            {/* Headlights */}
            <SpotLight position={[0.2, 0.3, 0.45]} distance={10} angle={0.5} attenuation={5} intensity={5} color="#fff" />
            <SpotLight position={[-0.2, 0.3, 0.45]} distance={10} angle={0.5} attenuation={5} intensity={5} color="#fff" />
        </group>
    );
};

const SpinningLidar = () => {
    const ref = useRef();
    useFrame((state, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 5;
    });
    return (
        <group ref={ref} position={[0, 0.12, 0]}>
            <mesh material={new THREE.MeshBasicMaterial({ color: '#00ff00' })}>
                <boxGeometry args={[0.05, 0.05, 0.1]} />
            </mesh>
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 1, 32, 1, true]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
};

const GardenScene3D = ({
    gridData,
    gridSize = 5, // Dynamic grid size
    viewMode, // 'GOD_MODE' | 'SIMULATION'
    robotPose,
    isScanning,
    onCellClick,
    path,
    targetIndex,
    manualWaypoints = []
}) => {

    // Helper: Convert grid index to world position
    const getPos = (idx) => {
        const r = Math.floor(idx / gridSize);
        const c = idx % gridSize;
        const gridOffset = (gridSize * CELL_SIZE) / 2 - (CELL_SIZE / 2);
        const x = (c * CELL_SIZE) - gridOffset;
        const z = (r * CELL_SIZE) - gridOffset;
        return [x, 0, z];
    };

    // Calculate Path Points
    const pathPoints = useMemo(() => {
        // If Manual Waypoints exist, prioritize showing them
        if (manualWaypoints && manualWaypoints.length > 0) {
            return manualWaypoints.map(idx => {
                const p = getPos(idx);
                return new THREE.Vector3(p[0], 0.3, p[2]);
            });
        }

        // Otherwise show calculated path
        if (!path || path.length === 0) return null;
        const start = new THREE.Vector3(robotPose.x, 0.3, robotPose.y);
        const others = path.map(idx => {
            const p = getPos(idx);
            return new THREE.Vector3(p[0], 0.3, p[2]);
        });
        return [start, ...others];
    }, [path, robotPose, manualWaypoints]);

    return (
        <Canvas shadows className="w-full h-full" dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[-8, 12, 12]} fov={45} />
            <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={40} />

            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} color="#f1f5f9" />
            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" /> {/* Tech Blue Rim */}

            <Ground />

            {/* Grid Cells */}
            {gridData.map((cell, i) => {
                const pos = getPos(i);

                // Interaction Layer (Invisible Hitbox)
                // Essential for "Design Mode" clicking
                const hitbox = (
                    <mesh position={[pos[0], 0.05, pos[2]]} rotation={[-Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onCellClick(i); }} visible={false}>
                        <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
                    </mesh>
                );

                // GOD MODE: Show everything
                // SIMULATION MODE: Use Fog of War logic (if enabled)
                // For now, per user request "Visible", we show truth but maybe dim unexplored

                const isVisible = true; // viewMode === 'GOD_MODE' || cell.explored;

                if (!isVisible) return <group key={`fog-${i}`}>{hitbox}</group>;

                return (
                    <group key={`cell-${i}`}>
                        {hitbox}
                        {/* Visuals */}
                        {cell.type === 'obstacle' && <Obstacle position={pos} />}
                        {cell.type === 'plant' && <Plant position={pos} health={cell.moisture || 50} isTarget={i === targetIndex} />}

                        {/* Waypoint Marker */}
                        {manualWaypoints.includes(i) && (
                            <group position={pos}>
                                <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                    <ringGeometry args={[0.8, 0.9, 32]} />
                                    <meshBasicMaterial color="#ec4899" />
                                </mesh>
                                <Html position={[0, 0.5, 0]} center><div className="text-pink-500 font-bold bg-black/50 px-1 rounded text-[8px]">{manualWaypoints.indexOf(i) + 1}</div></Html>
                            </group>
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
                    color={manualWaypoints.length > 0 ? "#ec4899" : "#3b82f6"}
                    lineWidth={3}
                    dashed
                    dashScale={2}
                />
            )}

            <ContactShadows opacity={0.5} scale={50} blur={2} far={4} color="#000000" />
        </Canvas>
    );
};

export default GardenScene3D;
