import { BehaviorSubject } from 'rxjs';

// Simulation Constants
const BATTERY_DRAIN_RATE = 0.05; // % per tick
const MQTT_LATENCY_MS = 1500; // Simulated cloud latency
const SERIAL_LATENCY_MS = 50; // Local serial latency

// Initial State
const initialState = {
    // Mobile App State
    app: {
        connected: false,
        activeTab: 'DASHBOARD', // DASHBOARD | CONFIG | REPORT
        config: {
            gardenBoundary: { w: 5, h: 5 },
            plantCoordinates: [{ id: 'p1', x: 2, y: 3, type: 'Tomato' }],
            homeCoordinate: { x: 0, y: 0 },
            obstacles: [{ x: 1, y: 1 }],
            testInterval: 24, // hours
            configured: false
        },
        report: null // { soilMoisture, waterUsed, health, alerts }
    },
    // Cloud Server State
    cloud: {
        db: {
            logs: [],
            plants: [],
            commands: []
        },
        mqttBroker: {
            topics: {
                'rover/telemetry': null,
                'rover/command': null
            },
            clients: [] // 'app', 'rover'
        },
        aiEngine: {
            processing: false,
            lastAnalysis: null // { soilData, decision, confidence }
        }
    },
    // Rover Hardware State
    rover: {
        esp32: {
            wifiConnected: false,
            mqttConnected: false,
            cameraActive: false,
            ipAddress: '192.168.1.42'
        },
        arduino: {
            motors: { fl: 0, fr: 0, bl: 0, br: 0 }, // PWM values -255 to 255
            sensors: {
                ultrasonic: 150, // cm
                ir: 0, // 0 or 1
                moisture: 0, // 0-1023 analog
                battery: 12.4, // Volts
                imu: { pitch: 0, roll: 0, yaw: 0 },
                flowRate: 0 // L/min (New Sensor)
            },
            actuators: {
                servoArmAngle: 0,
                waterPump: false
            }
        },
        mission: {
            status: 'IDLE', // IDLE, NAVIGATING, SAMPLING, ANALYZING, WATERING, RETURNING
            target: null,
            log: [] // Step-by-step mission log
        }
    }
};

class RealRoverService {
    constructor() {
        this.state$ = new BehaviorSubject(initialState);
        this.logs$ = new BehaviorSubject([]);
        this.timer = null;
    }

    // Initialize Simulation
    start() {
        if (this.timer) return;

        this.log('SYSTEM', 'Simulation Engine Started');

        // Connect devices
        setTimeout(() => {
            this.updateState(s => ({
                ...s,
                rover: { ...s.rover, esp32: { ...s.rover.esp32, wifiConnected: true } }
            }));
            this.log('ESP32', 'Connected to WiFi (SSID: Garden_Net)');
        }, 1000);

        setTimeout(() => {
            this.updateState(s => ({
                ...s,
                rover: { ...s.rover, esp32: { ...s.rover.esp32, mqttConnected: true } },
                cloud: { ...s.cloud, mqttBroker: { ...s.cloud.mqttBroker, clients: [...s.cloud.mqttBroker.clients, 'rover'] } }
            }));
            this.log('MQTT', 'Client connected: rover-esp32');
            this.log('ESP32', 'Subscribed to topic: rover/command');
        }, 2000);

        // Main Loop (10Hz)
        this.timer = setInterval(() => this.tick(), 100);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Main Simulation Tick
    tick() {
        const currentState = this.state$.value;

        // 1. Simulate Battery Drain
        const newVoltage = Math.max(10.5, currentState.rover.arduino.sensors.battery - 0.0005);

        // 2. Simulate Sensor Noise
        const noise = (Math.random() - 0.5) * 2;
        const newSonic = Math.max(0, Math.min(400, currentState.rover.arduino.sensors.ultrasonic + noise));

        // 3. Update State
        this.updateState(s => ({
            ...s,
            rover: {
                ...s.rover,
                arduino: {
                    ...s.rover.arduino,
                    sensors: {
                        ...s.rover.arduino.sensors,
                        battery: newVoltage,
                        ultrasonic: newSonic
                    }
                }
            }
        }));

        // 4. Mission Logic
        this.processMissionLogic(currentState);

        // 5. Telemetry Heartbeat (every 1s)
        if (Date.now() % 1000 < 100 && currentState.rover.esp32.mqttConnected) {
            this.sendTelemetry(currentState);
        }
    }

    processMissionLogic(state) {
        const { status } = state.rover.mission;

        if (status === 'NAVIGATING') {
            if (Math.random() > 0.8) {
                this.updateState(s => ({
                    ...s,
                    rover: {
                        ...s.rover,
                        arduino: {
                            ...s.rover.arduino,
                            sensors: {
                                ...s.rover.arduino.sensors,
                                imu: { ...s.rover.arduino.sensors.imu, yaw: s.rover.arduino.sensors.imu.yaw + (Math.random() - 0.5) * 5 }
                            },
                            motors: { fl: 150, fr: 150, bl: 150, br: 150 }
                        }
                    }
                }));
            }
        }
    }

    // Actions
    connectApp() {
        this.log('APP', 'Connecting to Cloud Server...');
        setTimeout(() => {
            this.updateState(s => ({
                ...s,
                app: { ...s.app, connected: true },
                cloud: { ...s.cloud, mqttBroker: { ...s.cloud.mqttBroker, clients: [...s.cloud.mqttBroker.clients, 'app'] } }
            }));
            this.log('CLOUD', 'Auth Success: User logged in');
        }, 500);
    }

    saveConfiguration(config) {
        this.log('APP', 'Saving System Configuration...');
        setTimeout(() => {
            this.updateState(s => ({
                ...s,
                app: { ...s.app, config: { ...config, configured: true }, activeTab: 'DASHBOARD' },
                cloud: { ...s.cloud, db: { ...s.cloud.db, plants: config.plantCoordinates } }
            }));
            this.log('CLOUD', 'Configuration Synced. Scheduler Active.');
        }, 1000);
    }

    startMission() {
        if (!this.state$.value.app.connected) return;
        if (!this.state$.value.app.config.configured) {
            this.log('APP', 'Error: System not configured. Please set up Garden boundary.');
            return;
        }

        this.log('APP', 'Initiating Test Cycle (Manual Trigger)...');

        // 1. Scheduler/App triggers mission
        setTimeout(() => {
            const target = this.state$.value.app.config.plantCoordinates[0];
            this.log('CLOUD', `Scheduler: Triggering check for ${target.type} at (${target.x}, ${target.y})`);

            this.updateState(s => ({
                ...s,
                rover: { ...s.rover, mission: { status: 'NAVIGATING', target, log: ['Mission Started'] } }
            }));
            this.log('ROVER', `Mission Received: NAVIGATE to (${target.x}, ${target.y})`);

            // Simulate Navigation (3s delay)
            setTimeout(() => {
                this.log('ROVER', 'Target Reached. Obstacle Avoidance: CLEAR.');
                this.updateState(s => ({
                    ...s,
                    rover: {
                        ...s.rover,
                        mission: { status: 'SAMPLING', target: null, log: [...s.rover.mission.log, 'Reached Target'] },
                        arduino: { ...s.rover.arduino, motors: { fl: 0, fr: 0, bl: 0, br: 0 } }
                    }
                }));
                this.executeSamplingSequence(target.type);
            }, 3000);

        }, 500);
    }

    executeSamplingSequence(plantType) {
        // 1. Lower Arm
        this.log('ARDUINO', 'Servo Arm: Lowering (90°)');
        this.updateState(s => ({
            ...s,
            rover: { ...s.rover, arduino: { ...s.rover.arduino, actuators: { ...s.rover.arduino.actuators, servoArmAngle: 90 } } }
        }));

        // 2. Read Moisture
        setTimeout(() => {
            const moisture = Math.floor(Math.random() * 300 + 100); // Low moisture (dry)
            this.log('ARDUINO', `Analog Read A0 (Moisture): ${moisture} (DRY)`);
            this.updateState(s => ({
                ...s,
                rover: { ...s.rover, arduino: { ...s.rover.arduino, sensors: { ...s.rover.arduino.sensors, moisture } } }
            }));

            // 3. Send to Cloud
            setTimeout(() => {
                this.log('ESP32', `Publishing Soil Data: ${moisture} | Plant: ${plantType}`);
                this.triggerAIAnalysis(moisture, plantType);
            }, 1000);

        }, 1500);
    }

    triggerAIAnalysis(moisture, plantType) {
        this.updateState(s => ({
            ...s,
            rover: { ...s.rover, mission: { ...s.rover.mission, status: 'ANALYZING' } },
            cloud: { ...s.cloud, aiEngine: { processing: true, lastAnalysis: null } }
        }));
        this.log('CLOUD', `AI Engine: Analyzing data for ${plantType}...`);

        setTimeout(() => {
            // AI Logic: Different thresholds for different plants simulation
            const threshold = plantType === 'Tomato' ? 400 : 300;
            const decision = moisture < threshold ? 'WATER' : 'SKIP';
            const duration = decision === 'WATER' ? 5 : 0; // seconds
            const confidence = 0.98;

            this.updateState(s => ({
                ...s,
                cloud: {
                    ...s.cloud,
                    aiEngine: {
                        processing: false,
                        lastAnalysis: { soilData: moisture, decision, confidence }
                    }
                }
            }));
            this.log('AI', `Analysis Complete. Decision: ${decision} (${duration}s)`);

            if (decision === 'WATER') {
                this.executeWatering(duration);
            } else {
                this.returnHome();
            }
        }, 2000);
    }

    executeWatering(duration) {
        this.log('CLOUD', `Sending Command: ACTIVATE_PUMP (${duration}s)`);
        this.updateState(s => ({
            ...s,
            rover: { ...s.rover, mission: { ...s.rover.mission, status: 'WATERING' } }
        }));

        // Simulate Network Latency
        setTimeout(() => {
            this.log('ESP32', 'Command Received: ACTIVATE_PUMP');
            this.log('ARDUINO', 'Relay ON: Water Pump Active');

            // Start Pump & Flow Sensor
            this.updateState(s => ({
                ...s,
                rover: {
                    ...s.rover,
                    arduino: {
                        ...s.rover.arduino,
                        actuators: { ...s.rover.arduino.actuators, waterPump: true },
                        sensors: { ...s.rover.arduino.sensors, flowRate: 2.5 } // 2.5 L/min
                    }
                }
            }));

            // Water for duration
            setTimeout(() => {
                this.log('ARDUINO', 'Relay OFF: Water Pump Stopped');
                this.log('ARDUINO', 'Flow Sensor: Verified 0.2L Dispensed');

                this.updateState(s => ({
                    ...s,
                    app: { ...s.app, report: { soilMoisture: 'Improved (650)', waterUsed: '0.2L', health: 'Optimal', alerts: [] } },
                    rover: {
                        ...s.rover,
                        arduino: {
                            ...s.rover.arduino,
                            actuators: { ...s.rover.arduino.actuators, waterPump: false },
                            sensors: { ...s.rover.arduino.sensors, moisture: 650, flowRate: 0 } // Now wet
                        }
                    }
                }));
                this.returnHome();
            }, duration * 1000);

        }, 500);
    }

    returnHome() {
        this.log('ROVER', 'Mission Complete. Returning Home.');
        this.updateState(s => ({
            ...s,
            rover: { ...s.rover, mission: { ...s.rover.mission, status: 'RETURNING' } }
        }));

        // Raise Arm
        this.updateState(s => ({
            ...s,
            rover: { ...s.rover, arduino: { ...s.rover.arduino, actuators: { ...s.rover.arduino.actuators, servoArmAngle: 0 } } }
        }));

        setTimeout(() => {
            this.log('ROVER', 'Arrived Home. State: IDLE');
            this.updateState(s => ({
                ...s,
                app: { ...s.app, activeTab: 'REPORT' },
                rover: {
                    ...s.rover,
                    mission: { status: 'IDLE', target: null },
                    arduino: { ...s.rover.arduino, motors: { fl: 0, fr: 0, bl: 0, br: 0 } }
                }
            }));

            // Notify User
            this.log('APP', 'Notification: "Mission Report Ready: Plant 3 Watered"');
        }, 2000);
    }

    sendJoystickCommand(x, y) {
        if (!this.state$.value.app.connected) return;
        const command = { type: 'MOVE', x, y };

        // 1. App sends command
        // this.log('APP', `Sent Request: POST /api/rover/move {x:${x}, y:${y}}`);

        // 2. Cloud processes and publishes MQTT
        setTimeout(() => {
            this.updateState(s => ({
                ...s,
                cloud: {
                    ...s.cloud,
                    mqttBroker: {
                        ...s.cloud.mqttBroker,
                        topics: { ...s.cloud.mqttBroker.topics, 'rover/command': command }
                    }
                }
            }));
        }, 200);

        // 3. Rover receives MQTT
        setTimeout(() => {
            this.processRoverCommand(command);
        }, 200 + MQTT_LATENCY_MS / 10);
    }

    processRoverCommand(cmd) {
        const speed = cmd.y * 255;
        const turn = cmd.x * 255;
        const left = speed + turn;
        const right = speed - turn;
        const clamp = (v) => Math.max(-255, Math.min(255, Math.round(v)));

        this.updateState(s => ({
            ...s,
            rover: {
                ...s.rover,
                arduino: {
                    ...s.rover.arduino,
                    motors: {
                        fl: clamp(left),
                        fr: clamp(right),
                        bl: clamp(left),
                        br: clamp(right)
                    }
                }
            }
        }));
    }

    sendTelemetry(state) {
        const telemetry = {
            batt: state.rover.arduino.sensors.battery.toFixed(1),
            sonic: state.rover.arduino.sensors.ultrasonic.toFixed(0),
            flow: state.rover.arduino.sensors.flowRate,
            wifi: -45
        };

        this.updateState(s => {
            const newLogs = [{ time: new Date().toISOString(), ...telemetry }, ...s.cloud.db.logs].slice(0, 50);
            return {
                ...s,
                cloud: {
                    ...s.cloud,
                    db: { ...s.cloud.db, logs: newLogs }
                }
            };
        });
    }

    // Helper: Update State
    updateState(updater) {
        const newState = updater(this.state$.value);
        this.state$.next(newState);
    }

    // Helper: Log
    log(source, message) {
        const entry = { id: Math.random(), time: new Date().toLocaleTimeString(), source, message };
        this.logs$.next([entry, ...this.logs$.value].slice(0, 100));
    }
}

export default new RealRoverService();
