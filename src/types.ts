export interface ParticipantData {
    m_aiControlled: number;         // Whether the vehicle is AI (1) or Human (0) controlled
    m_driverId: number;             // Driver id - see appendix, 255 if network human
    m_networkId: number;            // Network id – unique identifier for network players
    m_teamId: number;               // Team id - see appendix
    m_myTeam: number;               // My team flag – 1 = My Team, 0 = otherwise
    m_raceNumber: number;
    m_nationality: number;
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
