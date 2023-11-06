/// <reference types="node" />
import { EventEmitter } from 'node:stream';
export interface ParticipantData {
    m_aiControlled: number;
    m_driverId: number;
    m_networkId: number;
    m_teamId: number;
    m_myTeam: number;
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
    m_frontWing: number;
    m_rearWing: number;
    m_onThrottle: number;
    m_offThrottle: number;
    m_frontCamber: number;
    m_rearCamber: number;
    m_frontToe: number;
    m_rearToe: number;
    m_frontSuspension: number;
    m_rearSuspension: number;
    m_frontAntiRollBar: number;
    m_rearAntiRollBar: number;
    m_frontSuspensionHeight: number;
    m_rearSuspensionHeight: number;
    m_brakePressure: number;
    m_brakeBias: number;
    m_rearLeftTyrePressure: number;
    m_rearRightTyrePressure: number;
    m_frontLeftTyrePressure: number;
    m_frontRightTyrePressure: number;
    m_ballast: number;
    m_fuelLoad: number;
}
export interface PacketCarSetupData {
    m_header: PacketHeader;
    m_carSetups: CarSetupData[];
}
export interface CarTelemetryData {
    m_speed: number;
    m_throttle: number;
    m_steer: number;
    m_brake: number;
    m_clutch: number;
    m_gear: number;
    m_engineRPM: number;
    m_drs: number;
    m_revLightsPercent: number;
    m_revLightsBitValue: number;
    m_brakesTemperature: number[];
    m_tyresSurfaceTemperature: number[];
    m_tyresInnerTemperature: number[];
    m_engineTemperature: number;
    m_tyresPressure: number[];
    m_surfaceType: number[];
}
export interface PacketCarTelemetryData {
    m_header: PacketHeader;
    m_carTelemetryData: CarTelemetryData[];
    m_mfdPanelIndex: number;
    m_mfdPanelIndexSecondaryPlayer: number;
    m_suggestedGear: number;
}
export interface CarStatusData {
    m_traction_control: number;
    m_anti_lock_brakes: number;
    m_fuel_mix: number;
    m_front_brake_bias: number;
    m_pit_limiter_status: number;
    m_fuel_in_tank: number;
    m_fuel_capacity: number;
    m_fuel_remaining_laps: number;
    m_max_rpm: number;
    m_idle_rpm: number;
    m_max_gears: number;
    m_drs_allowed: number;
    m_drs_activation_distance: number;
    m_actual_tyre_compound: number;
    m_visual_tyre_compound: number;
    m_tyres_age_laps: number;
    m_vehicle_fia_flags: number;
    m_engine_power_ice: number;
    m_engine_power_mguk: number;
    m_ers_store_energy: number;
    m_ers_deploy_mode: number;
    m_ers_harvested_this_lap_mguk: number;
    m_ers_harvested_this_lap_mguh: number;
    m_ers_deployed_this_lap: number;
    m_network_paused: number;
}
export interface PacketCarStatusData {
    m_header: PacketHeader;
    m_car_status_data: CarStatusData[];
}
export interface FinalClassificationData {
    m_position: number;
    m_numLaps: number;
    m_gridPosition: number;
    m_points: number;
    m_numPitStops: number;
    m_resultStatus: number;
    m_bestLapTimeInMS: number;
    m_totalRaceTime: number;
    m_penaltiesTime: number;
    m_numPenalties: number;
    m_numTyreStints: number;
    m_tyreStintsActual: number[];
    m_tyreStintsVisual: number[];
    m_tyreStintsEndLaps: number[];
}
export interface PacketFinalClassificationData {
    m_header: PacketHeader;
    m_numCars: number;
    m_classificationData: FinalClassificationData[];
}
export interface LobbyInfoData {
    m_aiControlled: number;
    m_teamId: number;
    m_nationality: number;
    m_platform: number;
    m_name: string;
    m_carNumber: number;
    m_readyStatus: number;
}
export interface PacketLobbyInfoData {
    m_header: PacketHeader;
    m_numPlayers: number;
    m_lobbyPlayers: LobbyInfoData[];
}
export interface CarDamageData {
    m_tyres_wear: number[];
    m_tyres_damage: number[];
    m_brakes_damage: number[];
    m_front_left_wing_damage: number;
    m_front_right_wing_damage: number;
    m_rear_wing_damage: number;
    m_floor_damage: number;
    m_diffuser_damage: number;
    m_sidepod_damage: number;
    m_drs_fault: number;
    m_ers_fault: number;
    m_gear_box_damage: number;
    m_engine_damage: number;
    m_engine_mguh_wear: number;
    m_engine_es_wear: number;
    m_engine_ce_wear: number;
    m_engine_ice_wear: number;
    m_engine_mguk_wear: number;
    m_engine_tc_wear: number;
    m_engine_blown: number;
    m_engine_seized: number;
}
export interface PacketCarDamageData {
    m_header: PacketHeader;
    m_car_damage_data: CarDamageData[];
}
export interface LapHistoryData {
    m_lapTimeInMS: number;
    m_sector1TimeInMS: number;
    m_sector1TimeMinutes: number;
    m_sector2TimeInMS: number;
    m_sector2TimeMinutes: number;
    m_sector3TimeInMS: number;
    m_sector3TimeMinutes: number;
    m_lapValidBitFlags: number;
}
export interface TyreStintHistoryData {
    m_endLap: number;
    m_tyreActualCompound: number;
    m_tyreVisualCompound: number;
}
export interface PacketSessionHistoryData {
    m_header: PacketHeader;
    m_carIdx: number;
    m_numLaps: number;
    m_numTyreStints: number;
    m_bestLapTimeLapNum: number;
    m_bestSector1LapNum: number;
    m_bestSector2LapNum: number;
    m_bestSector3LapNum: number;
    m_lapHistoryData: LapHistoryData[];
    m_tyreStintsHistoryData: TyreStintHistoryData[];
}
export interface TyreSetData {
    m_actualTyreCompound: number;
    m_visualTyreCompound: number;
    m_wear: number;
    m_available: number;
    m_recommendedSession: number;
    m_lifeSpan: number;
    m_usableLife: number;
    m_lapDeltaTime: number;
    m_fitted: number;
}
export interface PacketTyreSetsData {
    m_header: PacketHeader;
    m_carIdx: number;
    m_tyreSetData: TyreSetData[];
    m_fittedIdx: number;
}
export interface PacketMotionExData {
    m_header: PacketHeader;
    m_suspensionPosition: number[];
    m_suspensionVelocity: number[];
    m_suspensionAcceleration: number[];
    m_wheelSpeed: number[];
    m_wheelSlipRatio: number[];
    m_wheelSlipAngle: number[];
    m_wheelLatForce: number[];
    m_wheelLongForce: number[];
    m_heightOfCOGAboveGround: number;
    m_localVelocityX: number;
    m_localVelocityY: number;
    m_localVelocityZ: number;
    m_angularVelocityX: number;
    m_angularVelocityY: number;
    m_angularVelocityZ: number;
    m_angularAccelerationX: number;
    m_angularAccelerationY: number;
    m_angularAccelerationZ: number;
    m_frontWheelsAngle: number;
    m_wheelVertForce: number[];
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
    packet_format: number;
    game_year: number;
    game_major_version: number;
    game_minor_version: number;
    packet_version: number;
    packet_id: number;
    session_uid: bigint;
    session_time: number;
    frame_identifier: number;
    overall_frame_identifier: number;
    player_car_index: number;
    secondary_player_car_index: number;
}
export interface CarMotionData {
    m_worldPositionX: number;
    m_worldPositionY: number;
    m_worldPositionZ: number;
    m_worldVelocityX: number;
    m_worldVelocityY: number;
    m_worldVelocityZ: number;
    m_worldForwardDirX: number;
    m_worldForwardDirY: number;
    m_worldForwardDirZ: number;
    m_worldRightDirX: number;
    m_worldRightDirY: number;
    m_worldRightDirZ: number;
    m_gForceLateral: number;
    m_gForceLongitudinal: number;
    m_gForceVertical: number;
    m_yaw: number;
    m_pitch: number;
    m_roll: number;
}
export interface PacketMotionData {
    m_header: PacketHeader;
    m_carMotionData: CarMotionData[];
}
export interface MarshalZone {
    m_zoneStart: number;
    m_zoneFlag: number;
}
export interface WeatherForecastSample {
    m_sessionType: number;
    m_timeOffset: number;
    m_weather: number;
    m_trackTemperature: number;
    m_trackTemperatureChange: number;
    m_airTemperature: number;
    m_airTemperatureChange: number;
    m_rainPercentage: number;
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
    m_lastLapTimeInMS: number;
    m_currentLapTimeInMS: number;
    m_sector1TimeInMS: number;
    m_sector1TimeMinutes: number;
    m_sector2TimeInMS: number;
    m_sector2TimeMinutes: number;
    m_deltaToCarInFrontInMS: number;
    m_deltaToRaceLeaderInMS: number;
    m_lapDistance: number;
    m_totalDistance: number;
    m_safetyCarDelta: number;
    m_carPosition: number;
    m_currentLapNum: number;
    m_pitStatus: number;
    m_numPitStops: number;
    m_sector: number;
    m_currentLapInvalid: number;
    m_penalties: number;
    m_totalWarnings: number;
    m_cornerCuttingWarnings: number;
    m_numUnservedDriveThroughPens: number;
    m_numUnservedStopGoPens: number;
    m_gridPosition: number;
    m_driverStatus: number;
    m_resultStatus: number;
    m_pitLaneTimerActive: number;
    m_pitLaneTimeInLaneInMS: number;
    m_pitStopTimerInMS: number;
    m_pitStopShouldServePen: number;
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
export declare class F123UDP extends EventEmitter {
    private socket;
    port: number;
    address: string;
    constructor(options?: Options);
}
