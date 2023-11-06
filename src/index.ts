import { Parser } from "binary-parser";
import { EventEmitter } from 'node:stream';
import { createSocket, RemoteInfo, Socket } from 'node:dgram';

const DEFAULT_PORT = 20777;
const ADDRESS = 'localhost';

export interface ParticipantData {
  m_aiControlled: number;         // Whether the vehicle is AI (1) or Human (0) controlled
  m_driverId: number;             // Driver id - see appendix, 255 if network human
  m_networkId: number;            // Network id – unique identifier for network players
  m_teamId: number;               // Team id - see appendix
  m_myTeam: number;               // My team flag – 1 = My Team, 0 = otherwise
  m_raceNumber: number;
  m_nationalty: number;
  m_name: string;
  m_yourTelemetry: number;
  m_showOnlineNames: number;
  m_platform: number;

}

export interface PacketParticipantsData {
  m_header: PacketHeader;
  m_numActiveCars: number;
  m_participants: ParticipantData[];
}

export interface CarSetupData {
  m_frontWing: number;                // Front wing aero
  m_rearWing: number;                 // Rear wing aero
  m_onThrottle: number;               // Differential adjustment on throttle (percentage)
  m_offThrottle: number;              // Differential adjustment off throttle (percentage)
  m_frontCamber: number;             // Front camber angle (suspension geometry)
  m_rearCamber: number;              // Rear camber angle (suspension geometry)
  m_frontToe: number;                // Front toe angle (suspension geometry)
  m_rearToe: number;                 // Rear toe angle (suspension geometry)
  m_frontSuspension: number;          // Front suspension
  m_rearSuspension: number;           // Rear suspension
  m_frontAntiRollBar: number;         // Front anti-roll bar
  m_rearAntiRollBar: number;          // Front anti-roll bar
  m_frontSuspensionHeight: number;    // Front ride height
  m_rearSuspensionHeight: number;     // Rear ride height
  m_brakePressure: number;            // Brake pressure (percentage)
  m_brakeBias: number;                // Brake bias (percentage)
  m_rearLeftTyrePressure: number;    // Rear left tyre pressure (PSI)
  m_rearRightTyrePressure: number;   // Rear right tyre pressure (PSI)
  m_frontLeftTyrePressure: number;   // Front left tyre pressure (PSI)
  m_frontRightTyrePressure: number;  // Front right tyre pressure (PSI)
  m_ballast: number;                  // Ballast
  m_fuelLoad: number;                // Fuel load
}

export interface PacketCarSetupData {
  m_header: PacketHeader;  // Header
  m_carSetups: CarSetupData[];
}


export interface CarTelemetryData {
  m_speed: number;                              // Speed of car in kilometres per hour
  m_throttle: number;                           // Amount of throttle applied (0.0 to 1.0)
  m_steer: number;                              // Steering (-1.0 (full lock left) to 1.0 (full lock right))
  m_brake: number;                              // Amount of brake applied (0.0 to 1.0)
  m_clutch: number;                              // Amount of clutch applied (0 to 100)
  m_gear: number;                                // Gear selected (1-8, N=0, R=-1)
  m_engineRPM: number;                          // Engine RPM
  m_drs: number;                                 // 0 = off, 1 = on
  m_revLightsPercent: number;                    // Rev lights indicator (percentage)
  m_revLightsBitValue: number;                  // Rev lights (bit 0 = leftmost LED, bit 14 = rightmost LED)
  m_brakesTemperature: number[];             // Brakes temperature (celsius)
  m_tyresSurfaceTemperature: number[];        // Tyres surface temperature (celsius)
  m_tyresInnerTemperature: number[];          // Tyres inner temperature (celsius)
  m_engineTemperature: number;                  // Engine temperature (celsius)
  m_tyresPressure: number[];                 // Tyres pressure (PSI)
  m_surfaceType: number[];                    // Driving surface, see appendices
}

export interface PacketCarTelemetryData {
  m_header: PacketHeader;                                      // Header
  m_carTelemetryData: CarTelemetryData[];
  m_mfdPanelIndex: number;                                         // Index of MFD panel open - 255 = MFD closed

  m_mfdPanelIndexSecondaryPlayer: number;                          // See above
  m_suggestedGear: number;                                         // Suggested gear for the player (1-8)
  // 0 if no gear suggested
}
export interface CarStatusData {
  m_traction_control: number;             // Traction control - 0 = off, 1 = medium, 2 = full
  m_anti_lock_brakes: number;             // 0 (off) - 1 (on)
  m_fuel_mix: number;                     // Fuel mix - 0 = lean, 1 = standard, 2 = rich, 3 = max
  m_front_brake_bias: number;             // Front brake bias (percentage)
  m_pit_limiter_status: number;           // Pit limiter status - 0 = off, 1 = on
  m_fuel_in_tank: number;                // Current fuel mass
  m_fuel_capacity: number;               // Fuel capacity
  m_fuel_remaining_laps: number;         // Fuel remaining in terms of laps (value on MFD)
  m_max_rpm: number;                     // Car's max RPM, point of rev limiter
  m_idle_rpm: number;                    // Car's idle RPM
  m_max_gears: number;                    // Maximum number of gears
  m_drs_allowed: number;                  // 0 = not allowed, 1 = allowed
  m_drs_activation_distance: number;     // 0 = DRS not available, non-zero - DRS will be available in [X] meters
  m_actual_tyre_compound: number;         // F1 Modern - 16 = C5, 17 = C4, 18 = C3, 19 = C2, 20 = C1
  // 21 = C0, 7 = inter, 8 = wet
  // F1 Classic - 9 = dry, 10 = wet
  // F2 – 11 = super soft, 12 = soft, 13 = medium, 14 = hard
  // 15 = wet
  m_visual_tyre_compound: number;         // F1 visual (can be different from actual compound)
  // 16 = soft, 17 = medium, 18 = hard, 7 = inter, 8 = wet
  // F1 Classic – same as above
  // F2 ‘19, 15 = wet, 19 – super soft, 20 = soft
  // 21 = medium, 22 = hard
  m_tyres_age_laps: number;               // Age in laps of the current set of tyres
  m_vehicle_fia_flags: number;            // -1 = invalid/unknown, 0 = none, 1 = green
  // 2 = blue, 3 = yellow
  m_engine_power_ice: number;            // Engine power output of ICE (W)
  m_engine_power_mguk: number;           // Engine power output of MGU-K (W)
  m_ers_store_energy: number;            // ERS energy store in Joules
  m_ers_deploy_mode: number;              // ERS deployment mode, 0 = none, 1 = medium
  // 2 = hotlap, 3 = overtake
  m_ers_harvested_this_lap_mguk: number; // ERS energy harvested this lap by MGU-K
  m_ers_harvested_this_lap_mguh: number; // ERS energy harvested this lap by MGU-H
  m_ers_deployed_this_lap: number;       // ERS energy deployed this lap
  m_network_paused: number;               // Whether the car is paused in a network game
}

export interface PacketCarStatusData {
  m_header: PacketHeader;             // Header
  m_car_status_data: CarStatusData[];
}

export interface FinalClassificationData {
  m_position: number;             // Finishing position
  m_numLaps: number;              // Number of laps completed
  m_gridPosition: number;         // Grid position of the car
  m_points: number;               // Number of points scored
  m_numPitStops: number;          // Number of pit stops made
  m_resultStatus: number;         // Result status - 0 = invalid, 1 = inactive, 2 = active
  // 3 = finished, 4 = didnotfinish, 5 = disqualified
  // 6 = not classified, 7 = retired
  m_bestLapTimeInMS: number;     // Best lap time of the session in milliseconds
  m_totalRaceTime: number;
  m_penaltiesTime: number;        // Total penalties accumulated in seconds
  m_numPenalties: number;         // Number of penalties applied to this driver
  m_numTyreStints: number;        // Number of tyre stints up to maximum
  m_tyreStintsActual: number[];    // Actual tyres used by this driver
  m_tyreStintsVisual: number[];    // Visual tyres used by this driver
  m_tyreStintsEndLaps: number[];   // The lap number stints end on
}

export interface PacketFinalClassificationData {
  m_header: PacketHeader;                     // Header
  m_numCars: number;                               // Number of cars in the final classification
  m_classificationData: FinalClassificationData[];
}
export interface LobbyInfoData {
  m_aiControlled: number;      // Whether the vehicle is AI (1) or Human (0) controlled
  m_teamId: number;            // Team id - see appendix (255 if no team currently selected)
  m_nationality: number;
  m_platform: number;          // 1 = Steam, 3 = PlayStation, 4 = Xbox, 6 = Origin, 255 = unknown
  m_name: string;        // Name of participant in UTF-8 format – null terminated
  // Will be truncated with ... (U+2026) if too long
  m_carNumber: number;         // Car number of the player
  m_readyStatus: number;       // 0 = not ready, 1 = ready, 2 = spectating
}

export interface PacketLobbyInfoData {
  m_header: PacketHeader;               // Header 
  m_numPlayers: number;                     // Number of players in the lobby data
  m_lobbyPlayers: LobbyInfoData[];
}

export interface CarDamageData {
  m_tyres_wear: number[];              // Tyre wear (percentage)
  m_tyres_damage: number[];             // Tyre damage (percentage)
  m_brakes_damage: number[];            // Brakes damage (percentage)
  m_front_left_wing_damage: number;        // Front left wing damage (percentage)
  m_front_right_wing_damage: number;       // Front right wing damage (percentage)
  m_rear_wing_damage: number;              // Rear wing damage (percentage)
  m_floor_damage: number;                  // Floor damage (percentage)
  m_diffuser_damage: number;               // Diffuser damage (percentage)
  m_sidepod_damage: number;                // Sidepod damage (percentage)
  m_drs_fault: number;                     // Indicator for DRS fault, 0 = OK, 1 = fault
  m_ers_fault: number;                     // Indicator for ERS fault, 0 = OK, 1 = fault
  m_gear_box_damage: number;               // Gear box damage (percentage)
  m_engine_damage: number;                 // Engine damage (percentage)
  m_engine_mguh_wear: number;              // Engine wear MGU-H (percentage)
  m_engine_es_wear: number;                // Engine wear ES (percentage)
  m_engine_ce_wear: number;                // Engine wear CE (percentage)
  m_engine_ice_wear: number;               // Engine wear ICE (percentage)
  m_engine_mguk_wear: number;              // Engine wear MGU-K (percentage)
  m_engine_tc_wear: number;                // Engine wear TC (percentage)
  m_engine_blown: number;                  // Engine blown, 0 = OK, 1 = fault
  m_engine_seized: number;                 // Engine seized, 0 = OK, 1 = fault
}

export interface PacketCarDamageData {
  m_header: PacketHeader;                      // Header
  m_car_damage_data: CarDamageData[];
}
export interface LapHistoryData {
  m_lapTimeInMS: number;          // Lap time in milliseconds
  m_sector1TimeInMS: number;      // Sector 1 time in milliseconds
  m_sector1TimeMinutes: number;    // Sector 1 whole minute part
  m_sector2TimeInMS: number;      // Sector 2 time in milliseconds
  m_sector2TimeMinutes: number;    // Sector 2 whole minute part
  m_sector3TimeInMS: number;      // Sector 3 time in milliseconds
  m_sector3TimeMinutes: number;    // Sector 3 whole minute part
  m_lapValidBitFlags: number;      // 0x01 bit set-lap valid, 0x02 bit set-sector 1 valid
  // 0x04 bit set-sector 2 valid, 0x08 bit set-sector 3 valid
}

export interface TyreStintHistoryData {
  m_endLap: number;                // Lap the tyre usage ends on (255 of current tyre)
  m_tyreActualCompound: number;    // Actual tyres used by this driver
  m_tyreVisualCompound: number;    // Visual tyres used by this driver
}

export interface PacketSessionHistoryData {
  m_header: PacketHeader;              // Header
  m_carIdx: number;                        // Index of the car this lap data relates to
  m_numLaps: number;                       // Num laps in the data (including current partial lap)
  m_numTyreStints: number;                 // Number of tyre stints in the data
  m_bestLapTimeLapNum: number;             // Lap the best lap time was achieved on
  m_bestSector1LapNum: number;             // Lap the best Sector 1 time was achieved on
  m_bestSector2LapNum: number;             // Lap the best Sector 2 time was achieved on
  m_bestSector3LapNum: number;             // Lap the best Sector 3 time was achieved on
  m_lapHistoryData: LapHistoryData[];    // 100 laps of data max
  m_tyreStintsHistoryData: TyreStintHistoryData[];
}
export interface TyreSetData {
  m_actualTyreCompound: number;     // Actual tyre compound used
  m_visualTyreCompound: number;     // Visual tyre compound used
  m_wear: number;                   // Tyre wear (percentage)
  m_available: number;              // Whether this set is currently available
  m_recommendedSession: number;     // Recommended session for tyre set
  m_lifeSpan: number;               // Laps left in this tyre set
  m_usableLife: number;             // Max number of laps recommended for this compound
  m_lapDeltaTime: number;          // Lap delta time in milliseconds compared to fitted set
  m_fitted: number;                 // Whether the set is fitted or not
}

export interface PacketTyreSetsData {
  m_header: PacketHeader;             // Header
  m_carIdx: number;                        // Index of the car this data relates to
  m_tyreSetData: TyreSetData[];    // 13 (dry) + 7 (wet)
  m_fittedIdx: number;                     // Index into array of fitted tyre
}

export interface PacketMotionExData {
  m_header: PacketHeader;                // Header
  m_suspensionPosition: number[];        // Note: All wheel arrays have the following order: RL, RR, FL, FR
  m_suspensionVelocity: number[];        // RL, RR, FL, FR
  m_suspensionAcceleration: number[];    // RL, RR, FL, FR
  m_wheelSpeed: number[];                // Speed of each wheel
  m_wheelSlipRatio: number[];            // Slip ratio for each wheel
  m_wheelSlipAngle: number[];            // Slip angles for each wheel
  m_wheelLatForce: number[];             // Lateral forces for each wheel
  m_wheelLongForce: number[];            // Longitudinal forces for each wheel
  m_heightOfCOGAboveGround: number;         // Height of centre of gravity above ground
  m_localVelocityX: number;                 // Velocity in local space – metres/s
  m_localVelocityY: number;                 // Velocity in local space
  m_localVelocityZ: number;                 // Velocity in local space
  m_angularVelocityX: number;               // Angular velocity x-component – radians/s
  m_angularVelocityY: number;               // Angular velocity y-component
  m_angularVelocityZ: number;               // Angular velocity z-component
  m_angularAccelerationX: number;           // Angular acceleration x-component – radians/s/s
  m_angularAccelerationY: number;           // Angular acceleration y-component
  m_angularAccelerationZ: number;           // Angular acceleration z-component
  m_frontWheelsAngle: number;               // Current front wheels angle in radians
  m_wheelVertForce: number[];            // Vertical forces for each wheel
}

export interface Options {
  port?: number;
  address?: string;
}

export interface FastestLapData {
  vehicleIdx: number;
  lapTime: number;
}
export interface RetirementData {
  vehicleIdx: number;
}

export interface TeamMateInPitsData {
  vehicleIdx: number;
}
export interface RaceWinnerData {
  vehicleIdx: number;
}
export interface PenaltyData {
  penaltyType: number;
  infringementType: number;
  vehicleIdx: number;
  otherVehicleIdx: number;
  time: number;
  lapNum: number;
  placesGained: number;
}

export interface SpeedTrapData {
  vehicleIdx: number;
  speed: number;
  isOverallFastestInSession: number;
  isDriverFastestInSession: number;
  fastestVehicleIdxInSession: number;
  fastestSpeedInSession: number;
}

export interface StartLightsData {
  numLights: number;
}


export interface DriveThroughPenaltyServedData {
  vehicleIdx: number;
}


export interface StopGoPenaltyServedData {
  vehicleIdx: number;
}

export interface FlashbackData {
  flashbackFrameIdentifier: number;
  flashbackSessionTime: number;
}

export interface ButtonsData {
  buttonStatus: number;
}

export interface OvertakeData {
  overtakingVehicleIdx: number;
  beingOvertakenVehicleIdx: number;
}

export interface PacketEventData {
  m_header: PacketHeader;
  m_eventStringCode: string;

  m_eventDetails: FastestLapData | RetirementData | TeamMateInPitsData | RaceWinnerData | PenaltyData | SpeedTrapData | StartLightsData | DriveThroughPenaltyServedData | StopGoPenaltyServedData | FlashbackData | ButtonsData | OvertakeData;
}

export interface PacketHeader {
  packet_format: number;           // u16
  game_year: number;               // u8
  game_major_version: number;      // u8
  game_minor_version: number;      // u8
  packet_version: number;          // u8
  packet_id: number;               // u8
  session_uid: bigint;             // u64, BigInt in JavaScript/TypeScript/ convert to string for use with JSON
  session_time: number;            // f32
  frame_identifier: number;        // u32
  overall_frame_identifier: number;// u32
  player_car_index: number;        // u8
  secondary_player_car_index: number; // u8
}

export interface CarMotionData {
  m_worldPositionX: number;          // f32
  m_worldPositionY: number;          // f32
  m_worldPositionZ: number;          // f32
  m_worldVelocityX: number;          // f32
  m_worldVelocityY: number;          // f32
  m_worldVelocityZ: number;          // f32
  m_worldForwardDirX: number;        // i16
  m_worldForwardDirY: number;        // i16
  m_worldForwardDirZ: number;        // i16
  m_worldRightDirX: number;          // i16
  m_worldRightDirY: number;          // i16
  m_worldRightDirZ: number;          // i16
  m_gForceLateral: number;           // f32
  m_gForceLongitudinal: number;      // f32
  m_gForceVertical: number;          // f32
  m_yaw: number;                     // f32
  m_pitch: number;                   // f32
  m_roll: number;                    // f32
}


export interface PacketMotionData {
  m_header: PacketHeader;
  m_carMotionData: CarMotionData[];
}

export interface MarshalZone {
  m_zoneStart: number;   // f32
  m_zoneFlag: number;    // i8
}

export interface WeatherForecastSample {
  m_sessionType: number;              // u8
  m_timeOffset: number;               // u8
  m_weather: number;                  // u8
  m_trackTemperature: number;         // i8
  m_trackTemperatureChange: number;   // i8
  m_airTemperature: number;           // i8
  m_airTemperatureChange: number;     // i8
  m_rainPercentage: number;           // u8
}
export interface PacketSessionData {
  m_header: PacketHeader;
  m_weather: number;
  m_trackTemperature: number;
  m_airTemperature: number;
  m_totalLaps: number;
  m_trackLength: number;
  m_sessionType: number;
  m_trackId: number;
  m_formula: number;
  m_sessionTimeLeft: number;
  m_sessionDuration: number;
  m_pitSpeedLimit: number;
  m_gamePaused: number;
  m_isSpectating: number;
  m_spectatorCarIndex: number;
  m_sliProNativeSupport: number;
  m_numMarshalZones: number;
  m_marshalZones: MarshalZone[];
  m_safetyCarStatus: number;
  m_networkGame: number;
  m_numWeatherForecastSamples: number;
  m_weatherForecastSamples: WeatherForecastSample[];
  m_forecastAccuracy: number;
  m_aiDifficulty: number;
  m_seasonLinkIdentifier: number;
  m_weekendLinkIdentifier: number;
  m_sessionLinkIdentifier: number;
  m_pitStopWindowIdealLap: number;
  m_pitStopWindowLatestLap: number;
  m_pitStopRejoinPosition: number;
  m_steeringAssist: number;
  m_brakingAssist: number;
  m_gearboxAssist: number;
  m_pitAssist: number;
  m_pitReleaseAssist: number;
  m_ERSAssist: number;
  m_DRSAssist: number;
  m_dynamicRacingLine: number;
  m_dynamicRacingLineType: number;
  m_gameMode: number;
  m_ruleSet: number;
  m_timeOfDay: number;
  m_sessionLength: number;
  m_speedUnitsLeadPlayer: number;
  m_temperatureUnitsLeadPlayer: number;
  m_speedUnitsSecondaryPlayer: number;
  m_temperatureUnitsSecondaryPlayer: number;
  m_numSafetyCarPeriods: number;
  m_numVirtualSafetyCarPeriods: number;
  m_numRedFlagPeriods: number;
}


export interface LapData {
  m_lastLapTimeInMS: number;                   // u32
  m_currentLapTimeInMS: number;                // u32
  m_sector1TimeInMS: number;                   // u16
  m_sector1TimeMinutes: number;                 // u8
  m_sector2TimeInMS: number;                   // u16
  m_sector2TimeMinutes: number;                 // u8
  m_deltaToCarInFrontInMS: number;             // u16
  m_deltaToRaceLeaderInMS: number;             // u16
  m_lapDistance: number;                       // f32
  m_totalDistance: number;                     // f32
  m_safetyCarDelta: number;                    // f32
  m_carPosition: number;                        // u8
  m_currentLapNum: number;                      // u8
  m_pitStatus: number;                          // u8
  m_numPitStops: number;                        // u8
  m_sector: number;                             // u8
  m_currentLapInvalid: number;                  // u8
  m_penalties: number;                          // u8
  m_totalWarnings: number;                      // u8
  m_cornerCuttingWarnings: number;              // u8
  m_numUnservedDriveThroughPens: number;         // u8
  m_numUnservedStopGoPens: number;               // u8
  m_gridPosition: number;                       // u8
  m_driverStatus: number;                       // u8
  m_resultStatus: number;                       // u8
  m_pitLaneTimerActive: number;                 // u8
  m_pitLaneTimeInLaneInMS: number;             // u16
  m_pitStopTimerInMS: number;                  // u16
  m_pitStopShouldServePen: number;              // u8
}

export interface PacketLapData {
  m_header: PacketHeader;
  m_lapData: LapData[];
  m_timeTrialPBCarIdx: number;
  m_timeTrialRivalCarIdx: number;
}


export interface F123UDP {
  on(event: 'event', listener: (data: PacketEventData) => void): this;
  on(event: 'motion', listener: (data: PacketMotionData) => void): this;
  on(event: 'session', listener: (data: PacketSessionData) => void): this;
  on(event: 'lapData', listener: (data: PacketLapData) => void): this;
  on(event: 'participants', listener: (data: PacketParticipantsData) => void): this;
  on(event: 'carSetups', listener: (data: PacketCarSetupData) => void): this;
  on(event: 'carTelemetry', listener: (data: PacketCarTelemetryData) => void): this;
  on(event: 'carStatus', listener: (data: PacketCarStatusData) => void): this;
  on(event: 'finalClassification', listener: (data: PacketFinalClassificationData) => void): this;
  on(event: 'lobbyInfo', listener: (data: PacketLobbyInfoData) => void): this;
  on(event: 'carDamage', listener: (data: PacketCarDamageData) => void): this;
  on(event: 'sessionHistory', listener: (data: PacketSessionHistoryData) => void): this;
  on(event: 'tyreSets', listener: (data: PacketTyreSetsData) => void): this;
  on(event: 'motionEx', listener: (data: PacketMotionExData) => void): this;
  start(): void;
  stop(): void;
}

export class F123UDP extends EventEmitter {
  private socket: Socket;

  port: number;
  address: string;
  constructor(options: Options = {}) {
    super();

    const { port = DEFAULT_PORT, address = ADDRESS } = options;

    this.port = port;
    this.address = address;
    this.socket = createSocket('udp4');
  }




  start() {

    if (!this.socket) {
      this.socket = createSocket('udp4');
    }
    this.socket.bind({ port: this.port, address: this.address });
    this.socket.on('listening', (): void => {
      this.socket.on('message', (msg: Buffer, rinfo: RemoteInfo): void => {

        const PACKET_SIZES = {

          motion: 1349,
          session: 644,
          lapData: 1131,
          event: 45,
          participants: 1306,
          carSetups: 1107,
          carTelemetry: 1352,
          carStatus: 1239,
          finalClassification: 1020,
          lobbyInfo: 1218,
          carDamage: 953,
          sessionHistory: 1460,
          tyreSets: 231,
          motionEx: 217
        };


        /**
         * 
        pub struct PacketHeader {
          pub packet_format: u16, // 2023
          pub game_year: u8, // Game year - last two digits e.g. 23
          pub game_major_version: u8, // Game major version - "X.00"
          pub game_minor_version: u8, // Game minor version - "1.XX"
          pub packet_version: u8, // Version of this packet type, all start from 1
          pub packet_id: u8, // Identifier for the packet type, see below
          pub session_uid: u64, // Unique identifier for the session
          pub session_time: f32, // Session timestamp
          pub frame_identifier: u32, // Identifier for the frame the data was retrieved on
          pub overall_frame_identifier: u32,
          // Overall identifier for the frame the data was retrieved
          // on, doesn't go back after flashbacks
          pub player_car_index: u8, // Index of player's car in the array
          pub secondary_player_car_index: u8, // Index of secondary player's car in the array (splitscreen)
          // 255 if no second player
        }
        */


        const PacketHeaderParser = new Parser().endianess('little')
          .uint16('packet_format')
          .uint8('game_year')
          .uint8('game_major_version')
          .uint8('game_minor_version')
          .uint8('packet_version')
          .uint8('packet_id')
          .uint64('session_uid')
          .floatle('session_time')
          .uint32('frame_identifier')
          .uint32('overall_frame_identifier')
          .uint8('player_car_index')
          .uint8('secondary_player_car_index');


        const packet_format = msg.readUInt16LE(0);


        function getEventStringCode(buffer: Buffer) {
          const headerParser = new Parser().endianess('little').nest('m_header', { type: PacketHeaderParser }).string('m_eventStringCode', { length: 4 });
          const { m_eventStringCode } = headerParser.parse(buffer);
          return m_eventStringCode;
        };

        switch (rinfo.size) {
          case PACKET_SIZES.motion: {


            /**
             * 
            struct CarMotionData {
              m_worldPositionX: f32,      // World space X position - meters
              m_worldPositionY: f32,      // World space Y position
              m_worldPositionZ: f32,      // World space Z position
              m_worldVelocityX: f32,      // Velocity in world space X - meters/s
              m_worldVelocityY: f32,      // Velocity in world space Y
              m_worldVelocityZ: f32,      // Velocity in world space Z
              m_worldForwardDirX: i16,    // World space forward X direction (normalized)
              m_worldForwardDirY: i16,    // World space forward Y direction (normalized)
              m_worldForwardDirZ: i16,    // World space forward Z direction (normalized)
              m_worldRightDirX: i16,      // World space right X direction (normalized)
              m_worldRightDirY: i16,      // World space right Y direction (normalized)
              m_worldRightDirZ: i16,      // World space right Z direction (normalized)
              m_gForceLateral: f32,       // Lateral G-Force component
              m_gForceLongitudinal: f32,  // Longitudinal G-Force component
              m_gForceVertical: f32,      // Vertical G-Force component
              m_yaw: f32,                 // Yaw angle in radians
              m_pitch: f32,               // Pitch angle in radians
              m_roll: f32,                // Roll angle in radians
            }
            
            struct PacketMotionData {
              m_header: PacketHeader,             // Header
              m_carMotionData: [CarMotionData; 22], // Data for all cars on track
            }
            */




            const CarMotionDataParser = new Parser().endianess('little')
              .floatle('m_worldPositionX')
              .floatle('m_worldPositionY')
              .floatle('m_worldPositionZ')
              .floatle('m_worldVelocityX')
              .floatle('m_worldVelocityY')
              .floatle('m_worldVelocityZ')
              .int16le('m_worldForwardDirX')
              .int16le('m_worldForwardDirY')
              .int16le('m_worldForwardDirZ')
              .int16le('m_worldRightDirX')
              .int16le('m_worldRightDirY')
              .int16le('m_worldRightDirZ')
              .floatle('m_gForceLateral')
              .floatle('m_gForceLongitudinal')
              .floatle('m_gForceVertical')
              .floatle('m_yaw')
              .floatle('m_pitch')
              .floatle('m_roll');



            const PacketMotionDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_carMotionData', {
                type: CarMotionDataParser,
                length: 22
              });

            const data: PacketMotionData = PacketMotionDataParser.parse(msg);

            this.emit('motion', data);
            break;
          }
          case PACKET_SIZES.session: {
            /**
             * 
            struct MarshalZone {
                m_zoneStart: f32,   // Fraction (0..1) of way through the lap the marshal zone starts
                m_zoneFlag: i8,    // -1 = invalid/unknown, 0 = none, 1 = green, 2 = blue, 3 = yellow
            }
            
            struct WeatherForecastSample {
                m_sessionType: u8,              // 0 = unknown, 1 = P1, 2 = P2, 3 = P3, 4 = Short P, 5 = Q1
                                               // 6 = Q2, 7 = Q3, 8 = Short Q, 9 = OSQ, 10 = R, 11 = R2
                                               // 12 = R3, 13 = Time Trial
                m_timeOffset: u8,               // Time in minutes the forecast is for
                m_weather: u8,                  // Weather - 0 = clear, 1 = light cloud, 2 = overcast
                                               // 3 = light rain, 4 = heavy rain, 5 = storm
                m_trackTemperature: i8,         // Track temp. in degrees Celsius
                m_trackTemperatureChange: i8,   // Track temp. change – 0 = up, 1 = down, 2 = no change
                m_airTemperature: i8,           // Air temp. in degrees Celsius
                m_airTemperatureChange: i8,     // Air temp. change – 0 = up, 1 = down, 2 = no change
                m_rainPercentage: u8,           // Rain percentage (0-100)
            }
            
            struct PacketSessionData {
                m_header: PacketHeader,                // Header
                m_weather: u8,               // Weather - 0 = clear, 1 = light cloud, 2 = overcast
                                              // 3 = light rain, 4 = heavy rain, 5 = storm
                m_trackTemperature: i8,     // Track temp. in degrees celsius
                m_airTemperature: i8,       // Air temp. in degrees celsius
                m_totalLaps: u8,            // Total number of laps in this race
                m_trackLength: u16,         // Track length in metres
                m_sessionType: u8,          // 0 = unknown, 1 = P1, 2 = P2, 3 = P3, 4 = Short P
                                            // 5 = Q1, 6 = Q2, 7 = Q3, 8 = Short Q, 9 = OSQ
                                            // 10 = R, 11 = R2, 12 = R3, 13 = Time Trial
                m_trackId: i8,              // -1 for unknown, see appendix
                m_formula: u8,                   // Formula, 0 = F1 Modern, 1 = F1 Classic, 2 = F2,
                                                   // 3 = F1 Generic, 4 = Beta, 5 = Supercars
                                                   // 6 = Esports, 7 = F2 2021
                m_sessionTimeLeft: u16,     // Time left in session in seconds
                m_sessionDuration: u16,     // Session duration in seconds
                m_pitSpeedLimit: u8,       // Pit speed limit in kilometres per hour
                m_gamePaused: u8,                // Whether the game is paused – network game only
                m_isSpectating: u8,         // Whether the player is spectating
                m_spectatorCarIndex: u8,   // Index of the car being spectated
                m_sliProNativeSupport: u8, // SLI Pro support, 0 = inactive, 1 = active
                m_numMarshalZones: u8,          // Number of marshal zones to follow
                m_marshalZones: [MarshalZone; 21],          // List of marshal zones – max 21
                m_safetyCarStatus: u8,           // 0 = no safety car, 1 = full
                                                   // 2 = virtual, 3 = formation lap
                m_networkGame: u8,               // 0 = offline, 1 = online
                m_numWeatherForecastSamples: u8, // Number of weather samples to follow
                m_weatherForecastSamples: [WeatherForecastSample; 56],   // Array of weather forecast samples
                m_forecastAccuracy: u8,          // 0 = Perfect, 1 = Approximate
                m_aiDifficulty: u8,              // AI Difficulty rating – 0-110
                m_seasonLinkIdentifier: u32,      // Identifier for season - persists across saves
                m_weekendLinkIdentifier: u32,     // Identifier for weekend - persists across saves
                m_sessionLinkIdentifier: u32,     // Identifier for session - persists across saves
                m_pitStopWindowIdealLap: u8,     // Ideal lap to pit on for current strategy (player)
                m_pitStopWindowLatestLap: u8,    // Latest lap to pit on for current strategy (player)
                m_pitStopRejoinPosition: u8,     // Predicted position to rejoin at (player)
                m_steeringAssist: u8,            // 0 = off, 1 = on
                m_brakingAssist: u8,             // 0 = off, 1 = low, 2 = medium, 3 = high
                m_gearboxAssist: u8,             // 1 = manual, 2 = manual & suggested gear, 3 = auto
                m_pitAssist: u8,                 // 0 = off, 1 = on
                m_pitReleaseAssist: u8,          // 0 = off, 1 = on
                m_ERSAssist: u8,                 // 0 = off, 1 = on
                m_DRSAssist: u8,                 // 0 = off, 1 = on
                m_dynamicRacingLine: u8,         // 0 = off, 1 = corners only, 2 = full
                m_dynamicRacingLineType: u8,     // 0 = 2D, 1 = 3D
                m_gameMode: u8,                  // Game mode id - see appendix
                m_ruleSet: u8,                   // Ruleset - see appendix
                m_timeOfDay: u32,                // Local time of day - minutes since midnight
                m_sessionLength: u8,             // 0 = None, 2 = Very Short, 3 = Short, 4 = Medium
                                                 // 5 = Medium Long, 6 = Long, 7 = Full
                m_speedUnitsLeadPlayer: u8,             // 0 = MPH, 1 = KPH
                m_temperatureUnitsLeadPlayer: u8,       // 0 = Celsius, 1 = Fahrenheit
                m_speedUnitsSecondaryPlayer: u8,        // 0 = MPH, 1 = KPH
                m_temperatureUnitsSecondaryPlayer: u8,  // 0 = Celsius, 1 = Fahrenheit
                m_numSafetyCarPeriods: u8,              // Number of safety cars called during session
                m_numVirtualSafetyCarPeriods: u8,       // Number of virtual safety cars called
                m_numRedFlagPeriods: u8,                // Number of red flags called during session
            }
            */


            const MarshalZoneParser = new Parser().endianess('little')
              .floatle('m_zoneStart')
              .int8('m_zoneFlag');


            const WeatherForecastSampleParser = new Parser().endianess('little')
              .uint8('m_sessionType')
              .uint8('m_timeOffset')
              .uint8('m_weather')
              .int8('m_trackTemperature')
              .int8('m_trackTemperatureChange')
              .int8('m_airTemperature')
              .int8('m_airTemperatureChange')
              .uint8('m_rainPercentage');


            const PacketSessionDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .uint8('m_weather')
              .int8('m_trackTemperature')
              .int8('m_airTemperature')
              .uint8('m_totalLaps')
              .uint16le('m_trackLength')
              .uint8('m_sessionType')
              .int8('m_trackId')
              .uint8('m_formula')
              .uint16le('m_sessionTimeLeft')
              .uint16le('m_sessionDuration')
              .uint8('m_pitSpeedLimit')
              .uint8('m_gamePaused')
              .uint8('m_isSpectating')
              .uint8('m_spectatorCarIndex')
              .uint8('m_sliProNativeSupport')
              .uint8('m_numMarshalZones')
              .array('m_marshalZones', {
                type: MarshalZoneParser,
                length: 21
              })
              .uint8('m_safetyCarStatus')
              .uint8('m_networkGame')
              .uint8('m_numWeatherForecastSamples')
              .array('m_weatherForecastSamples', {
                type: WeatherForecastSampleParser,
                length: 56
              })
              .uint8('m_forecastAccuracy')
              .uint8('m_aiDifficulty')
              .uint32le('m_seasonLinkIdentifier')
              .uint32le('m_weekendLinkIdentifier')
              .uint32le('m_sessionLinkIdentifier')
              .uint8('m_pitStopWindowIdealLap')
              .uint8('m_pitStopWindowLatestLap')
              .uint8('m_pitStopRejoinPosition')
              .uint8('m_steeringAssist')
              .uint8('m_brakingAssist')
              .uint8('m_gearboxAssist')
              .uint8('m_pitAssist')
              .uint8('m_pitReleaseAssist')
              .uint8('m_ERSAssist')
              .uint8('m_DRSAssist')
              .uint8('m_dynamicRacingLine')
              .uint8('m_dynamicRacingLineType')
              .uint8('m_gameMode')
              .uint8('m_ruleSet')
              .uint32le('m_timeOfDay')
              .uint8('m_sessionLength')
              .uint8('m_speedUnitsLeadPlayer')
              .uint8('m_temperatureUnitsLeadPlayer')
              .uint8('m_speedUnitsSecondaryPlayer')
              .uint8('m_temperatureUnitsSecondaryPlayer')
              .uint8('m_numSafetyCarPeriods')
              .uint8('m_numVirtualSafetyCarPeriods')
              .uint8('m_numRedFlagPeriods');

            const data: PacketSessionData = PacketSessionDataParser.parse(msg);

            this.emit('session', data);
            break;
          }

          case PACKET_SIZES.lapData: {
            /**
             *  
            
            struct LapData {
                m_lastLapTimeInMS: u32,                   // Last lap time in milliseconds
                m_currentLapTimeInMS: u32,                // Current time around the lap in milliseconds
                m_sector1TimeInMS: u16,                   // Sector 1 time in milliseconds
                m_sector1TimeMinutes: u8,                 // Sector 1 whole minute part
                m_sector2TimeInMS: u16,                   // Sector 2 time in milliseconds
                m_sector2TimeMinutes: u8,                 // Sector 2 whole minute part
                m_deltaToCarInFrontInMS: u16,             // Time delta to car in front in milliseconds
                m_deltaToRaceLeaderInMS: u16,             // Time delta to race leader in milliseconds
                m_lapDistance: f32,                       // Distance vehicle is around current lap in metres – could be negative if line hasn't been crossed yet
                m_totalDistance: f32,                     // Total distance travelled in session in metres – could be negative if line hasn't been crossed yet
                m_safetyCarDelta: f32,                    // Delta in seconds for safety car
                m_carPosition: u8,                        // Car race position
                m_currentLapNum: u8,                      // Current lap number
                m_pitStatus: u8,                          // 0 = none, 1 = pitting, 2 = in pit area
                m_numPitStops: u8,                        // Number of pit stops taken in this race
                m_sector: u8,                             // 0 = sector1, 1 = sector2, 2 = sector3
                m_currentLapInvalid: u8,                  // Current lap invalid - 0 = valid, 1 = invalid
                m_penalties: u8,                          // Accumulated time penalties in seconds to be added
                m_totalWarnings: u8,                      // Accumulated number of warnings issued
                m_cornerCuttingWarnings: u8,              // Accumulated number of corner cutting warnings issued
                m_numUnservedDriveThroughPens: u8,         // Num drive-through pens left to serve
                m_numUnservedStopGoPens: u8,               // Num stop-go pens left to serve
                m_gridPosition: u8,                       // Grid position the vehicle started the race in
                m_driverStatus: u8,                       // Status of driver - 0 = in garage, 1 = flying lap, 2 = in lap, 3 = out lap, 4 = on track
                m_resultStatus: u8,                       // Result status - 0 = invalid, 1 = inactive, 2 = active, 3 = finished, 4 = did not finish, 5 = disqualified, 6 = not classified, 7 = retired
                m_pitLaneTimerActive: u8,                 // Pit lane timing, 0 = inactive, 1 = active
                m_pitLaneTimeInLaneInMS: u16,             // If active, the current time spent in the pit lane in ms
                m_pitStopTimerInMS: u16,                  // Time of the actual pit stop in ms
                m_pitStopShouldServePen: u8,              // Whether the car should serve a penalty at this stop
            }
            
            struct PacketLapData {
                m_header: PacketHeader,                   // Header
                m_lapData: [LapData; 22],                  // Lap data for all cars on track
                m_timeTrialPBCarIdx: u8,                   // Index of Personal Best car in time trial (255 if invalid)
                m_timeTrialRivalCarIdx: u8,                // Index of Rival car in time trial (255 if invalid)
            }
            */



            const LapDataParser = new Parser().endianess('little')
              .uint32le('m_lastLapTimeInMS')
              .uint32le('m_currentLapTimeInMS')
              .uint16le('m_sector1TimeInMS')
              .uint8('m_sector1TimeMinutes')
              .uint16le('m_sector2TimeInMS')
              .uint8('m_sector2TimeMinutes')
              .uint16le('m_deltaToCarInFrontInMS')
              .uint16le('m_deltaToRaceLeaderInMS')
              .floatle('m_lapDistance')
              .floatle('m_totalDistance')
              .floatle('m_safetyCarDelta')
              .uint8('m_carPosition')
              .uint8('m_currentLapNum')
              .uint8('m_pitStatus')
              .uint8('m_numPitStops')
              .uint8('m_sector')
              .uint8('m_currentLapInvalid')
              .uint8('m_penalties')
              .uint8('m_totalWarnings')
              .uint8('m_cornerCuttingWarnings')
              .uint8('m_numUnservedDriveThroughPens')
              .uint8('m_numUnservedStopGoPens')
              .uint8('m_gridPosition')
              .uint8('m_driverStatus')
              .uint8('m_resultStatus')
              .uint8('m_pitLaneTimerActive')
              .uint16le('m_pitLaneTimeInLaneInMS')
              .uint16le('m_pitStopTimerInMS')
              .uint8('m_pitStopShouldServePen');


            const PacketLapDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_lapData', {
                type: LapDataParser,
                length: 22
              })
              .uint8('m_timeTrialPBCarIdx')
              .uint8('m_timeTrialRivalCarIdx');

            const data: PacketLapData = PacketLapDataParser.parse(msg);

            this.emit('lapData', data);
            break;
          }
          case PACKET_SIZES.event: {
            /**
                         * #[repr(C)]
            union EventDataDetails {
                FastestLap: FastestLapData,
                Retirement: RetirementData,
                TeamMateInPits: TeamMateInPitsData,
                RaceWinner: RaceWinnerData,
                Penalty: PenaltyData,
                SpeedTrap: SpeedTrapData,
                StartLights: StartLightsData,
                DriveThroughPenaltyServed: DriveThroughPenaltyServedData,
                StopGoPenaltyServed: StopGoPenaltyServedData,
                Flashback: FlashbackData,
                Buttons: ButtonsData,
                Overtake: OvertakeData,
            }
            
            #[repr(C)]
            struct PacketEventData {
                m_header: PacketHeader,
                m_eventStringCode: [u8; 4],
                m_eventDetails: EventDataDetails,
            }
            
            #[repr(C)]
            struct FastestLapData {
                vehicleIdx: u8,
                lapTime: f32,
            }
            
            #[repr(C)]
            struct RetirementData {
                vehicleIdx: u8,
            }
            
            #[repr(C)]
            struct TeamMateInPitsData {
                vehicleIdx: u8,
            }
            
            #[repr(C)]
            struct RaceWinnerData {
                vehicleIdx: u8,
            }
            
            #[repr(C)]
            struct PenaltyData {
                penaltyType: u8,
                infringementType: u8,
                vehicleIdx: u8,
                otherVehicleIdx: u8,
                time: u8,
                lapNum: u8,
                placesGained: u8,
            }
            
            #[repr(C)]
            struct SpeedTrapData {
                vehicleIdx: u8,
                speed: f32,
                isOverallFastestInSession: u8,
                isDriverFastestInSession: u8,
                fastestVehicleIdxInSession: u8,
                fastestSpeedInSession: f32,
            }
            
            #[repr(C)]
            struct StartLightsData {
                numLights: u8,
            }
            
            #[repr(C)]
            struct DriveThroughPenaltyServedData {
                vehicleIdx: u8,
            }
            
            #[repr(C)]
            struct StopGoPenaltyServedData {
                vehicleIdx: u8,
            }
            
            #[repr(C)]
            struct FlashbackData {
                flashbackFrameIdentifier: u32,
                flashbackSessionTime: f32,
            }
            
            #[repr(C)]
            struct ButtonsData {
                buttonStatus: u32,
            }
            
            #[repr(C)]
            struct OvertakeData {
                overtakingVehicleIdx: u8,
                beingOvertakenVehicleIdx: u8,
            }
            
            enum EventStringCode {
                SessionStarted,
                SessionEnded,
                FastestLap,
                Retirement,
                DRSEnabled,
                DRSDisabled,
                TeamMateInPits,
                ChequeredFlag,
                RaceWinner,
                PenaltyIssued,
                SpeedTrapTriggered,
                StartLights,
                LightsOut,
                DriveThroughServed,
                StopGoServed,
                Flashback,
                ButtonStatus,
                RedFlag,
                Overtake,
            }
            
            impl From<[u8; 4]> for EventStringCode {
                fn from(code: [u8; 4]) -> Self {
                    match code {
                        [83, 83, 84, 65] => EventStringCode::SessionStarted,
                        [83, 69, 78, 68] => EventStringCode::SessionEnded,
                        [70, 84, 76, 80] => EventStringCode::FastestLap,
                        [82, 84, 77, 84] => EventStringCode::Retirement,
                        [68, 82, 83, 69] => EventStringCode::DRSEnabled,
                        [68, 82, 83, 68] => EventStringCode::DRSDisabled,
                        [84, 77, 80, 84] => EventStringCode::TeamMateInPits,
                        [67, 72, 81, 70] => EventStringCode::ChequeredFlag,
                        [82, 67, 87, 78] => EventStringCode::RaceWinner,
                        [80, 69, 78, 65] => EventStringCode::PenaltyIssued,
                        [83, 80, 84, 80] => EventStringCode::SpeedTrapTriggered,
                        [83, 84, 76, 71] => EventStringCode::StartLights,
                        [76, 71, 79, 84] => EventStringCode::LightsOut,
                        [68, 84, 83, 86] => EventStringCode::DriveThroughServed,
                        [83, 71, 83, 86] => EventStringCode::StopGoServed,
                        [70, 76, 66, 75] => EventStringCode::Flashback,
                        [66, 85, 84, 78] => EventStringCode::ButtonStatus,
                        [82, 68, 70, 76] => EventStringCode::RedFlag,
                        [79, 86, 84, 75] => EventStringCode::Overtake,
                        _ => panic!("Unknown event string code: {:?}", code),
                    }
                }
            }
            */


            const FastestLapDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx')
              .floatle('lapTime');


            const RetirementDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx');


            const TeamMateInPitsDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx');


            const RaceWinnerDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx');


            const PenaltyDataParser = new Parser().endianess('little')
              .uint8('penaltyType')
              .uint8('infringementType')
              .uint8('vehicleIdx')
              .uint8('otherVehicleIdx')
              .uint8('time')
              .uint8('lapNum')
              .uint8('placesGained');


            const SpeedTrapDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx')
              .floatle('speed')
              .uint8('isOverallFastestInSession')
              .uint8('isDriverFastestInSession')
              .uint8('fastestVehicleIdxInSession')
              .floatle('fastestSpeedInSession');


            const StartLightsDataParser = new Parser().endianess('little')
              .uint8('numLights');


            const DriveThroughPenaltyServedDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx');



            const StopGoPenaltyServedDataParser = new Parser().endianess('little')
              .uint8('vehicleIdx');



            const FlashbackDataParser = new Parser().endianess('little')
              .uint32le('flashbackFrameIdentifier')
              .floatle('flashbackSessionTime');



            const ButtonsDataParser = new Parser().endianess('little')
              .uint32le('buttonStatus');



            const OvertakeDataParser = new Parser().endianess('little')
              .uint8('overtakingVehicleIdx')
              .uint8('beingOvertakenVehicleIdx');



            const EventStringCode = getEventStringCode(msg);
            let data

            if (EventStringCode === 'FTLP') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: FastestLapDataParser })
                .parse(msg);

            } else if (EventStringCode === 'RTMT') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: RetirementDataParser })
                .parse(msg);
            } else if (EventStringCode === 'TMPT') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: TeamMateInPitsDataParser })
                .parse(msg);
            } else if (EventStringCode === 'RCWN') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: RaceWinnerDataParser })
                .parse(msg);
            } else if (EventStringCode === 'PENA') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: PenaltyDataParser })
                .parse(msg);
            } else if (EventStringCode === 'SPTP') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: SpeedTrapDataParser })
                .parse(msg);
            } else if (EventStringCode === 'STLG') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: StartLightsDataParser })
                .parse(msg);
            } else if (EventStringCode === 'DTSV') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: DriveThroughPenaltyServedDataParser })
                .parse(msg);
            } else if (EventStringCode === 'SGSV') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: StopGoPenaltyServedDataParser })
                .parse(msg);
            } else if (EventStringCode === 'FLBK') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: FlashbackDataParser })
                .parse(msg);
            } else if (EventStringCode === 'BUTN') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: ButtonsDataParser })
                .parse(msg);
            } else if (EventStringCode === 'OVTK') {
              data = new Parser().endianess('little')
                .nest('m_header', { type: PacketHeaderParser })
                .string('m_eventStringCode', { length: 4 })
                .nest('m_eventDetails', { type: OvertakeDataParser })
                .parse(msg);
            } else {
              console.log('Unknown event string code: ', EventStringCode);
            }





            this.emit('event', data);
            break;
          }
          case PACKET_SIZES.participants: {
            /**
             *
            struct ParticipantData {
                m_aiControlled: u8,         // Whether the vehicle is AI (1) or Human (0) controlled
                m_driverId: u8,             // Driver id - see appendix, 255 if network human
                m_networkId: u8,            // Network id – unique identifier for network players
                m_teamId: u8,               // Team id - see appendix
                m_myTeam: u8,               // My team flag – 1 = My Team, 0 = otherwise
                m_raceNumber: u8,           // Race number of the car
                m_nationality: u8,          // Nationality of the driver
                m_name: [u8; 48],           // Name of participant in UTF-8 format – null terminated
                                            // Will be truncated with … (U+2026) if too long
                m_yourTelemetry: u8,        // The player's UDP setting, 0 = restricted, 1 = public
                m_showOnlineNames: u8,      // The player's show online names setting, 0 = off, 1 = on
                m_platform: u8,             // 1 = Steam, 3 = PlayStation, 4 = Xbox, 6 = Origin, 255 = unknown
            }
            
            struct PacketParticipantsData {
                m_header: PacketHeader,                     // Header
                m_numActiveCars: u8,                         // Number of active cars in the data – should match number of cars on HUD
                m_participants: [ParticipantData; 22],
            }
            */


            const ParticipantDataParser = new Parser().endianess('little')
              .uint8('m_aiControlled')
              .uint8('m_driverId')
              .uint8('m_networkId')
              .uint8('m_teamId')
              .uint8('m_myTeam')
              .uint8('m_raceNumber')
              .uint8('m_nationalty')
              .string('m_name', { length: 48 })
              .uint8('m_yourTelemetry')
              .uint8('m_showOnlineNames')
              .uint8('m_platform');


            const PacketParticipantsDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .uint8('m_numActiveCars')
              .array('m_participants', {
                type: ParticipantDataParser,
                length: 22
              });


            const data: PacketParticipantsData = PacketParticipantsDataParser.parse(msg);

            this.emit('participants', data);

          }
            break;
          case PACKET_SIZES.carSetups: {
            /**
             * 
            struct CarSetupData {
                m_frontWing: u8,                // Front wing aero
                m_rearWing: u8,                 // Rear wing aero
                m_onThrottle: u8,               // Differential adjustment on throttle (percentage)
                m_offThrottle: u8,              // Differential adjustment off throttle (percentage)
                m_frontCamber: f32,             // Front camber angle (suspension geometry)
                m_rearCamber: f32,              // Rear camber angle (suspension geometry)
                m_frontToe: f32,                // Front toe angle (suspension geometry)
                m_rearToe: f32,                 // Rear toe angle (suspension geometry)
                m_frontSuspension: u8,          // Front suspension
                m_rearSuspension: u8,           // Rear suspension
                m_frontAntiRollBar: u8,         // Front anti-roll bar
                m_rearAntiRollBar: u8,          // Front anti-roll bar
                m_frontSuspensionHeight: u8,    // Front ride height
                m_rearSuspensionHeight: u8,     // Rear ride height
                m_brakePressure: u8,            // Brake pressure (percentage)
                m_brakeBias: u8,                // Brake bias (percentage)
                m_rearLeftTyrePressure: f32,    // Rear left tyre pressure (PSI)
                m_rearRightTyrePressure: f32,   // Rear right tyre pressure (PSI)
                m_frontLeftTyrePressure: f32,   // Front left tyre pressure (PSI)
                m_frontRightTyrePressure: f32,  // Front right tyre pressure (PSI)
                m_ballast: u8,                  // Ballast
                m_fuelLoad: f32,                // Fuel load
            }
            
            struct PacketCarSetupData {
                m_header: PacketHeader,  // Header
                m_carSetups: [CarSetupData; 22],
            }
            */

            const CarSetupDataParser = new Parser().endianess('little')
              .uint8('m_frontWing')
              .uint8('m_rearWing')
              .uint8('m_onThrottle')
              .uint8('m_offThrottle')
              .floatle('m_frontCamber')
              .floatle('m_rearCamber')
              .floatle('m_frontToe')
              .floatle('m_rearToe')
              .uint8('m_frontSuspension')
              .uint8('m_rearSuspension')
              .uint8('m_frontAntiRollBar')
              .uint8('m_rearAntiRollBar')
              .uint8('m_frontSuspensionHeight')
              .uint8('m_rearSuspensionHeight')
              .uint8('m_brakePressure')
              .uint8('m_brakeBias')
              .floatle('m_rearLeftTyrePressure')
              .floatle('m_rearRightTyrePressure')
              .floatle('m_frontLeftTyrePressure')
              .floatle('m_frontRightTyrePressure')
              .uint8('m_ballast')
              .floatle('m_fuelLoad');


            const PacketCarSetupDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_carSetups', {
                type: CarSetupDataParser,
                length: 22
              });

            const data: PacketCarSetupData = PacketCarSetupDataParser.parse(msg);

            this.emit('carSetup', data);
          }
            break;
          case PACKET_SIZES.carTelemetry: {
            /**
             * 
            struct CarTelemetryData {
                m_speed: u16,                              // Speed of car in kilometres per hour
                m_throttle: f32,                           // Amount of throttle applied (0.0 to 1.0)
                m_steer: f32,                              // Steering (-1.0 (full lock left) to 1.0 (full lock right))
                m_brake: f32,                              // Amount of brake applied (0.0 to 1.0)
                m_clutch: u8,                              // Amount of clutch applied (0 to 100)
                m_gear: i8,                                // Gear selected (1-8, N=0, R=-1)
                m_engineRPM: u16,                          // Engine RPM
                m_drs: u8,                                 // 0 = off, 1 = on
                m_revLightsPercent: u8,                    // Rev lights indicator (percentage)
                m_revLightsBitValue: u16,                  // Rev lights (bit 0 = leftmost LED, bit 14 = rightmost LED)
                m_brakesTemperature: [u16; 4],             // Brakes temperature (celsius)
                m_tyresSurfaceTemperature: [u8; 4],        // Tyres surface temperature (celsius)
                m_tyresInnerTemperature: [u8; 4],          // Tyres inner temperature (celsius)
                m_engineTemperature: u16,                  // Engine temperature (celsius)
                m_tyresPressure: [f32; 4],                 // Tyres pressure (PSI)
                m_surfaceType: [u8; 4],                    // Driving surface, see appendices
            }
            
            struct PacketCarTelemetryData {
                m_header: PacketHeader,                                      // Header
                m_carTelemetryData: [CarTelemetryData; 22],
                m_mfdPanelIndex: u8,                                         // Index of MFD panel open - 255 = MFD closed
                                                                             // Single player, race – 0 = Car setup, 1 = Pits
                                                                             // 2 = Damage, 3 = Engine, 4 = Temperatures
                                                                             // May vary depending on game mode
                m_mfdPanelIndexSecondaryPlayer: u8,                          // See above
                m_suggestedGear: i8,                                         // Suggested gear for the player (1-8)
                                                                             // 0 if no gear suggested
            }
            */


            const CarTelemetryDataParser = new Parser().endianess('little')
              .uint16le('m_speed')
              .floatle('m_throttle')
              .floatle('m_steer')
              .floatle('m_brake')
              .uint8('m_clutch')
              .int8('m_gear')
              .uint16le('m_engineRPM')
              .uint8('m_drs')
              .uint8('m_revLightsPercent')
              .uint16le('m_revLightsBitValue')
              .array('m_brakesTemperature', {
                type: 'uint16le',
                length: 4
              })

              .array('m_tyresSurfaceTemperature', {
                type: 'uint8',
                length: 4
              })

              .array('m_tyresInnerTemperature', {
                type: 'uint8',
                length: 4
              })

              .uint16le('m_engineTemperature')

              .array('m_tyresPressure', {
                type: 'floatle',
                length: 4
              })

              .array('m_surfaceType', {
                type: 'uint8',
                length: 4
              });


            const PacketCarTelemetryDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_carTelemetryData', {
                type: CarTelemetryDataParser,
                length: 22
              })

              .uint8('m_mfdPanelIndex')
              .uint8('m_mfdPanelIndexSecondaryPlayer')
              .int8('m_suggestedGear');

            const data: PacketCarTelemetryData = PacketCarTelemetryDataParser.parse(msg);

            this.emit('carTelemetry', data);
          }
            break;
          case PACKET_SIZES.carStatus: {
            /**
             * 
            struct CarStatusData {
                m_traction_control: u8,             // Traction control - 0 = off, 1 = medium, 2 = full
                m_anti_lock_brakes: u8,             // 0 (off) - 1 (on)
                m_fuel_mix: u8,                     // Fuel mix - 0 = lean, 1 = standard, 2 = rich, 3 = max
                m_front_brake_bias: u8,             // Front brake bias (percentage)
                m_pit_limiter_status: u8,           // Pit limiter status - 0 = off, 1 = on
                m_fuel_in_tank: f32,                // Current fuel mass
                m_fuel_capacity: f32,               // Fuel capacity
                m_fuel_remaining_laps: f32,         // Fuel remaining in terms of laps (value on MFD)
                m_max_rpm: u16,                     // Car's max RPM, point of rev limiter
                m_idle_rpm: u16,                    // Car's idle RPM
                m_max_gears: u8,                    // Maximum number of gears
                m_drs_allowed: u8,                  // 0 = not allowed, 1 = allowed
                m_drs_activation_distance: u16,     // 0 = DRS not available, non-zero - DRS will be available in [X] meters
                m_actual_tyre_compound: u8,         // F1 Modern - 16 = C5, 17 = C4, 18 = C3, 19 = C2, 20 = C1
                                                    // 21 = C0, 7 = inter, 8 = wet
                                                    // F1 Classic - 9 = dry, 10 = wet
                                                    // F2 – 11 = super soft, 12 = soft, 13 = medium, 14 = hard
                                                    // 15 = wet
                m_visual_tyre_compound: u8,         // F1 visual (can be different from actual compound)
                                                    // 16 = soft, 17 = medium, 18 = hard, 7 = inter, 8 = wet
                                                    // F1 Classic – same as above
                                                    // F2 ‘19, 15 = wet, 19 – super soft, 20 = soft
                                                    // 21 = medium, 22 = hard
                m_tyres_age_laps: u8,               // Age in laps of the current set of tyres
                m_vehicle_fia_flags: i8,            // -1 = invalid/unknown, 0 = none, 1 = green
                                                    // 2 = blue, 3 = yellow
                m_engine_power_ice: f32,            // Engine power output of ICE (W)
                m_engine_power_mguk: f32,           // Engine power output of MGU-K (W)
                m_ers_store_energy: f32,            // ERS energy store in Joules
                m_ers_deploy_mode: u8,              // ERS deployment mode, 0 = none, 1 = medium
                                                    // 2 = hotlap, 3 = overtake
                m_ers_harvested_this_lap_mguk: f32, // ERS energy harvested this lap by MGU-K
                m_ers_harvested_this_lap_mguh: f32, // ERS energy harvested this lap by MGU-H
                m_ers_deployed_this_lap: f32,       // ERS energy deployed this lap
                m_network_paused: u8,               // Whether the car is paused in a network game
            }
            
            struct PacketCarStatusData {
                m_header: PacketHeader,             // Header
                m_car_status_data: [CarStatusData; 22],
            }
            
            */


            const CarStatusDataParser = new Parser().endianess('little')
              .uint8('m_traction_control')
              .uint8('m_anti_lock_brakes')
              .uint8('m_fuel_mix')
              .uint8('m_front_brake_bias')
              .uint8('m_pit_limiter_status')
              .floatle('m_fuel_in_tank')
              .floatle('m_fuel_capacity')
              .floatle('m_fuel_remaining_laps')
              .uint16le('m_max_rpm')
              .uint16le('m_idle_rpm')
              .uint8('m_max_gears')
              .uint8('m_drs_allowed')
              .uint16le('m_drs_activation_distance')
              .uint8('m_actual_tyre_compound')
              .uint8('m_visual_tyre_compound')
              .uint8('m_tyres_age_laps')
              .int8('m_vehicle_fia_flags')
              .floatle('m_engine_power_ice')
              .floatle('m_engine_power_mguk')
              .floatle('m_ers_store_energy')
              .uint8('m_ers_deploy_mode')
              .floatle('m_ers_harvested_this_lap_mguk')
              .floatle('m_ers_harvested_this_lap_mguh')
              .floatle('m_ers_deployed_this_lap')
              .uint8('m_network_paused');


            const PacketCarStatusDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_car_status_data', {
                type: CarStatusDataParser,
                length: 22
              });

            const data: PacketCarStatusData = PacketCarStatusDataParser.parse(msg);

            this.emit('carStatus', data);
          }
            break;
          case PACKET_SIZES.finalClassification: {
            /**
             * 
            struct FinalClassificationData {
                m_position: u8,             // Finishing position
                m_numLaps: u8,              // Number of laps completed
                m_gridPosition: u8,         // Grid position of the car
                m_points: u8,               // Number of points scored
                m_numPitStops: u8,          // Number of pit stops made
                m_resultStatus: u8,         // Result status - 0 = invalid, 1 = inactive, 2 = active
                                            // 3 = finished, 4 = didnotfinish, 5 = disqualified
                                            // 6 = not classified, 7 = retired
                m_bestLapTimeInMS: u32,     // Best lap time of the session in milliseconds
                m_totalRaceTime: f64,       // Total race time in seconds without penalties
                m_penaltiesTime: u8,        // Total penalties accumulated in seconds
                m_numPenalties: u8,         // Number of penalties applied to this driver
                m_numTyreStints: u8,        // Number of tyre stints up to maximum
                m_tyreStintsActual: [u8; 8],    // Actual tyres used by this driver
                m_tyreStintsVisual: [u8; 8],    // Visual tyres used by this driver
                m_tyreStintsEndLaps: [u8; 8],   // The lap number stints end on
            }
            
            struct PacketFinalClassificationData {
                m_header: PacketHeader,                     // Header
                m_numCars: u8,                               // Number of cars in the final classification
                m_classificationData: [FinalClassificationData; 22],
            }
            
            
            */


            const FinalClassificationDataParser = new Parser().endianess('little')
              .uint8('m_position')
              .uint8('m_numLaps')
              .uint8('m_gridPosition')
              .uint8('m_points')
              .uint8('m_numPitStops')
              .uint8('m_resultStatus')
              .uint32le('m_bestLapTimeInMS')
              .floatle('m_totalRaceTime')
              .uint8('m_penaltiesTime')
              .uint8('m_numPenalties')
              .uint8('m_numTyreStints')
              .array('m_tyreStintsActual', {
                type: 'uint8',
                length: 8
              })

              .array('m_tyreStintsVisual', {
                type: 'uint8',
                length: 8
              })

              .array('m_tyreStintsEndLaps', {
                type: 'uint8',
                length: 8
              });


            const PacketFinalClassificationDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .uint8('m_numCars')
              .array('m_classificationData', {
                type: FinalClassificationDataParser,
                length: 22
              });

            const data: PacketFinalClassificationData = PacketFinalClassificationDataParser.parse(msg);

            this.emit('finalClassification', data);
          }
            break;
          case PACKET_SIZES.lobbyInfo: {
            /**
             * 
            struct LobbyInfoData {
                m_aiControlled: u8,      // Whether the vehicle is AI (1) or Human (0) controlled
                m_teamId: u8,            // Team id - see appendix (255 if no team currently selected)
                m_nationality: u8,       // Nationality of the driver
                m_platform: u8,          // 1 = Steam, 3 = PlayStation, 4 = Xbox, 6 = Origin, 255 = unknown
                m_name: [u8; 48],        // Name of participant in UTF-8 format – null terminated
                                         // Will be truncated with ... (U+2026) if too long
                m_carNumber: u8,         // Car number of the player
                m_readyStatus: u8,       // 0 = not ready, 1 = ready, 2 = spectating
            }
            
            struct PacketLobbyInfoData {
                m_header: PacketHeader,               // Header
                // Packet specific data
                m_numPlayers: u8,                     // Number of players in the lobby data
                m_lobbyPlayers: [LobbyInfoData; 22],
            }
            
            */


            const LobbyInfoDataParser = new Parser().endianess('little')
              .uint8('m_aiControlled')
              .uint8('m_teamId')
              .uint8('m_nationality')
              .uint8('m_platform')
              .string('m_name', { length: 48 })
              .uint8('m_carNumber')
              .uint8('m_readyStatus');


            const PacketLobbyInfoDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .uint8('m_numPlayers')
              .array('m_lobbyPlayers', {
                type: LobbyInfoDataParser,
                length: 22
              });

            const data: PacketLobbyInfoData = PacketLobbyInfoDataParser.parse(msg);

            this.emit('lobbyInfo', data);
          }
            break;
          case PACKET_SIZES.carDamage: {
            /**
             * 
            struct CarDamageData {
                m_tyres_wear: [f32; 4],              // Tyre wear (percentage)
                m_tyres_damage: [u8; 4],             // Tyre damage (percentage)
                m_brakes_damage: [u8; 4],            // Brakes damage (percentage)
                m_front_left_wing_damage: u8,        // Front left wing damage (percentage)
                m_front_right_wing_damage: u8,       // Front right wing damage (percentage)
                m_rear_wing_damage: u8,              // Rear wing damage (percentage)
                m_floor_damage: u8,                  // Floor damage (percentage)
                m_diffuser_damage: u8,               // Diffuser damage (percentage)
                m_sidepod_damage: u8,                // Sidepod damage (percentage)
                m_drs_fault: u8,                     // Indicator for DRS fault, 0 = OK, 1 = fault
                m_ers_fault: u8,                     // Indicator for ERS fault, 0 = OK, 1 = fault
                m_gear_box_damage: u8,               // Gear box damage (percentage)
                m_engine_damage: u8,                 // Engine damage (percentage)
                m_engine_mguh_wear: u8,              // Engine wear MGU-H (percentage)
                m_engine_es_wear: u8,                // Engine wear ES (percentage)
                m_engine_ce_wear: u8,                // Engine wear CE (percentage)
                m_engine_ice_wear: u8,               // Engine wear ICE (percentage)
                m_engine_mguk_wear: u8,              // Engine wear MGU-K (percentage)
                m_engine_tc_wear: u8,                // Engine wear TC (percentage)
                m_engine_blown: u8,                  // Engine blown, 0 = OK, 1 = fault
                m_engine_seized: u8,                 // Engine seized, 0 = OK, 1 = fault
            }
            
            struct PacketCarDamageData {
                m_header: PacketHeader,                      // Header
                m_car_damage_data: [CarDamageData; 22],
            }
            */


            const CarDamageDataParser = new Parser().endianess('little')
              .array('m_tyres_wear', {
                type: 'floatle',
                length: 4
              })

              .array('m_tyres_damage', {
                type: 'uint8',
                length: 4
              })

              .array('m_brakes_damage', {
                type: 'uint8',
                length: 4
              })

              .uint8('m_front_left_wing_damage')
              .uint8('m_front_right_wing_damage')
              .uint8('m_rear_wing_damage')
              .uint8('m_floor_damage')
              .uint8('m_diffuser_damage')
              .uint8('m_sidepod_damage')
              .uint8('m_drs_fault')
              .uint8('m_ers_fault')
              .uint8('m_gear_box_damage')
              .uint8('m_engine_damage')
              .uint8('m_engine_mguh_wear')
              .uint8('m_engine_es_wear')
              .uint8('m_engine_ce_wear')
              .uint8('m_engine_ice_wear')
              .uint8('m_engine_mguk_wear')
              .uint8('m_engine_tc_wear')
              .uint8('m_engine_blown')
              .uint8('m_engine_seized');


            const PacketCarDamageDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_car_damage_data', {
                type: CarDamageDataParser,
                length: 22
              });

            const data: PacketCarDamageData = PacketCarDamageDataParser.parse(msg);

            this.emit('carDamage', data);
          }
            break;

          case PACKET_SIZES.sessionHistory: {
            /**
             * 
            struct LapHistoryData {
                m_lapTimeInMS: u32,          // Lap time in milliseconds
                m_sector1TimeInMS: u16,      // Sector 1 time in milliseconds
                m_sector1TimeMinutes: u8,    // Sector 1 whole minute part
                m_sector2TimeInMS: u16,      // Sector 2 time in milliseconds
                m_sector2TimeMinutes: u8,    // Sector 2 whole minute part
                m_sector3TimeInMS: u16,      // Sector 3 time in milliseconds
                m_sector3TimeMinutes: u8,    // Sector 3 whole minute part
                m_lapValidBitFlags: u8,      // 0x01 bit set-lap valid, 0x02 bit set-sector 1 valid
                                              // 0x04 bit set-sector 2 valid, 0x08 bit set-sector 3 valid
            }
            
            struct TyreStintHistoryData {
                m_endLap: u8,                // Lap the tyre usage ends on (255 of current tyre)
                m_tyreActualCompound: u8,    // Actual tyres used by this driver
                m_tyreVisualCompound: u8,    // Visual tyres used by this driver
            }
            
            struct PacketSessionHistoryData {
                m_header: PacketHeader,              // Header
                m_carIdx: u8,                        // Index of the car this lap data relates to
                m_numLaps: u8,                       // Num laps in the data (including current partial lap)
                m_numTyreStints: u8,                 // Number of tyre stints in the data
                m_bestLapTimeLapNum: u8,             // Lap the best lap time was achieved on
                m_bestSector1LapNum: u8,             // Lap the best Sector 1 time was achieved on
                m_bestSector2LapNum: u8,             // Lap the best Sector 2 time was achieved on
                m_bestSector3LapNum: u8,             // Lap the best Sector 3 time was achieved on
                m_lapHistoryData: [LapHistoryData; 100],    // 100 laps of data max
                m_tyreStintsHistoryData: [TyreStintHistoryData; 8],
            }
            */


            const LapHistoryDataParser = new Parser().endianess('little')
              .uint32le('m_lapTimeInMS')
              .uint16le('m_sector1TimeInMS')
              .uint8('m_sector1TimeMinutes')
              .uint16le('m_sector2TimeInMS')
              .uint8('m_sector2TimeMinutes')
              .uint16le('m_sector3TimeInMS')
              .uint8('m_sector3TimeMinutes')
              .uint8('m_lapValidBitFlags');

            const TyreStintHistoryDataParser = new Parser().endianess('little')
              .uint8('m_endLap')
              .uint8('m_tyreActualCompound')
              .uint8('m_tyreVisualCompound');


            const PacketSessionHistoryDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .uint8('m_carIdx')
              .uint8('m_numLaps')
              .uint8('m_numTyreStints')
              .uint8('m_bestLapTimeLapNum')
              .uint8('m_bestSector1LapNum')
              .uint8('m_bestSector2LapNum')
              .uint8('m_bestSector3LapNum')
              .array('m_lapHistoryData', {
                type: LapHistoryDataParser,
                length: 100
              })

              .array('m_tyreStintsHistoryData', {
                type: TyreStintHistoryDataParser,
                length: 8
              });

            const data: PacketSessionHistoryData = PacketSessionHistoryDataParser.parse(msg);

            this.emit('sessionHistory', data);
          }
            break;
          case PACKET_SIZES.tyreSets: {
            /**
             * 
            struct TyreSetData {
                m_actualTyreCompound: u8,     // Actual tyre compound used
                m_visualTyreCompound: u8,     // Visual tyre compound used
                m_wear: u8,                   // Tyre wear (percentage)
                m_available: u8,              // Whether this set is currently available
                m_recommendedSession: u8,     // Recommended session for tyre set
                m_lifeSpan: u8,               // Laps left in this tyre set
                m_usableLife: u8,             // Max number of laps recommended for this compound
                m_lapDeltaTime: i16,          // Lap delta time in milliseconds compared to fitted set
                m_fitted: u8,                 // Whether the set is fitted or not
            }
            
            struct PacketTyreSetsData {
                m_header: PacketHeader,             // Header
                m_carIdx: u8,                        // Index of the car this data relates to
                m_tyreSetData: [TyreSetData; 20],    // 13 (dry) + 7 (wet)
                m_fittedIdx: u8,                     // Index into array of fitted tyre
            }
            */


            const TyreSetDataParser = new Parser().endianess('little')
              .uint8('m_actualTyreCompound')
              .uint8('m_visualTyreCompound')
              .uint8('m_wear')
              .uint8('m_available')
              .uint8('m_recommendedSession')
              .uint8('m_lifeSpan')
              .uint8('m_usableLife')
              .int16le('m_lapDeltaTime')
              .uint8('m_fitted');


            const PacketTyreSetsDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .uint8('m_carIdx')
              .array('m_tyreSetData', {
                type: TyreSetDataParser,
                length: 20
              })

              .uint8('m_fittedIdx');

            const data: PacketTyreSetsData = PacketTyreSetsDataParser.parse(msg);

            this.emit('tyreSets', data);
          }
            break;
          case PACKET_SIZES.motionEx: {
            /**
             * 
                        
            struct PacketMotionExData {
                m_header: PacketHeader,                // Header
                m_suspensionPosition: [f32; 4],        // Note: All wheel arrays have the following order: RL, RR, FL, FR
                m_suspensionVelocity: [f32; 4],        // RL, RR, FL, FR
                m_suspensionAcceleration: [f32; 4],    // RL, RR, FL, FR
                m_wheelSpeed: [f32; 4],                // Speed of each wheel
                m_wheelSlipRatio: [f32; 4],            // Slip ratio for each wheel
                m_wheelSlipAngle: [f32; 4],            // Slip angles for each wheel
                m_wheelLatForce: [f32; 4],             // Lateral forces for each wheel
                m_wheelLongForce: [f32; 4],            // Longitudinal forces for each wheel
                m_heightOfCOGAboveGround: f32,         // Height of centre of gravity above ground
                m_localVelocityX: f32,                 // Velocity in local space – metres/s
                m_localVelocityY: f32,                 // Velocity in local space
                m_localVelocityZ: f32,                 // Velocity in local space
                m_angularVelocityX: f32,               // Angular velocity x-component – radians/s
                m_angularVelocityY: f32,               // Angular velocity y-component
                m_angularVelocityZ: f32,               // Angular velocity z-component
                m_angularAccelerationX: f32,           // Angular acceleration x-component – radians/s/s
                m_angularAccelerationY: f32,           // Angular acceleration y-component
                m_angularAccelerationZ: f32,           // Angular acceleration z-component
                m_frontWheelsAngle: f32,               // Current front wheels angle in radians
                m_wheelVertForce: [f32; 4],            // Vertical forces for each wheel
            }
            */



            const PacketMotionExDataParser = new Parser().endianess('little')
              .nest('m_header', { type: PacketHeaderParser })
              .array('m_suspensionPosition', {
                type: 'floatle',
                length: 4
              })

              .array('m_suspensionVelocity', {
                type: 'floatle',
                length: 4
              })

              .array('m_suspensionAcceleration', {
                type: 'floatle',
                length: 4
              })

              .array('m_wheelSpeed', {
                type: 'floatle',
                length: 4
              })

              .array('m_wheelSlipRatio', {
                type: 'floatle',
                length: 4
              })

              .array('m_wheelSlipAngle', {
                type: 'floatle',
                length: 4
              })

              .array('m_wheelLatForce', {
                type: 'floatle',
                length: 4
              })

              .array('m_wheelLongForce', {
                type: 'floatle',
                length: 4
              })

              .floatle('m_heightOfCOGAboveGround')
              .floatle('m_localVelocityX')
              .floatle('m_localVelocityY')
              .floatle('m_localVelocityZ')
              .floatle('m_angularVelocityX')
              .floatle('m_angularVelocityY')
              .floatle('m_angularVelocityZ')
              .floatle('m_angularAccelerationX')
              .floatle('m_angularAccelerationY')
              .floatle('m_angularAccelerationZ')
              .floatle('m_frontWheelsAngle')

              .array('m_wheelVertForce', {
                type: 'floatle',
                length: 4
              });

            const data: PacketMotionExData = PacketMotionExDataParser.parse(msg);

            this.emit('motionEx', data);
          }
            break;
          default:
            break;
        }
      });
    });
  }

  stop() {
    this.socket.close();
  }
}
