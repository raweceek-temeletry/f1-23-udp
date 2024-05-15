import { Parser } from "binary-parser";

export const PacketHeaderParser = new Parser().endianess('little')
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

export const CarMotionDataParser = new Parser().endianess('little')
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

export const MarshalZoneParser = new Parser().endianess('little')
.floatle('m_zoneStart')
.int8('m_zoneFlag');

export const WeatherForecastSampleParser = new Parser().endianess('little')
.uint8('m_sessionType')
.uint8('m_timeOffset')
.uint8('m_weather')
.int8('m_trackTemperature')
.int8('m_trackTemperatureChange')
.int8('m_airTemperature')
.int8('m_airTemperatureChange')
.uint8('m_rainPercentage');

export const PacketSessionDataParser = new Parser().endianess('little')
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

export const LapDataParser = new Parser().endianess('little')
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

export const PacketLapDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.array('m_lapData', {
  type: LapDataParser,
  length: 22
})
.uint8('m_timeTrialPBCarIdx')
.uint8('m_timeTrialRivalCarIdx');

export const FastestLapDataParser = new Parser().endianess('little')
.uint8('vehicleIdx')
.floatle('lapTime');

export const RetirementDataParser = new Parser().endianess('little')
.uint8('vehicleIdx');

export const TeamMateInPitsDataParser = new Parser().endianess('little')
.uint8('vehicleIdx');

export const RaceWinnerDataParser = new Parser().endianess('little')
.uint8('vehicleIdx');

export const PenaltyDataParser = new Parser().endianess('little')
.uint8('penaltyType')
.uint8('infringementType')
.uint8('vehicleIdx')
.uint8('otherVehicleIdx')
.uint8('time')
.uint8('lapNum')
.uint8('placesGained');

export const SpeedTrapDataParser = new Parser().endianess('little')
.uint8('vehicleIdx')
.floatle('speed')
.uint8('isOverallFastestInSession')
.uint8('isDriverFastestInSession')
.uint8('fastestVehicleIdxInSession')
.floatle('fastestSpeedInSession');

export const StartLightsDataParser = new Parser().endianess('little')
.uint8('numLights');

export const DriveThroughPenaltyServedDataParser = new Parser().endianess('little')
.uint8('vehicleIdx');

export const StopGoPenaltyServedDataParser = new Parser().endianess('little')
.uint8('vehicleIdx');

export const FlashbackDataParser = new Parser().endianess('little')
.uint32le('flashbackFrameIdentifier')
.floatle('flashbackSessionTime');

export const ButtonsDataParser = new Parser().endianess('little')
.uint32le('buttonStatus');

export const OvertakeDataParser = new Parser().endianess('little')
.uint8('overtakingVehicleIdx')
.uint8('beingOvertakenVehicleIdx');

export const ParticipantDataParser = new Parser().endianess('little')
.uint8('m_aiControlled')
.uint8('m_driverId')
.uint8('m_networkId')
.uint8('m_teamId')
.uint8('m_myTeam')
.uint8('m_raceNumber')
.uint8('m_nationality')
.string('m_name', { length: 48 })
.uint8('m_yourTelemetry')
.uint8('m_showOnlineNames')
.uint8('m_platform');

export const PacketParticipantsDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.uint8('m_numActiveCars')
.array('m_participants', {
  type: ParticipantDataParser,
  length: 22
});

export const CarSetupDataParser = new Parser().endianess('little')
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

export const PacketCarSetupDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.array('m_carSetups', {
  type: CarSetupDataParser,
  length: 22
});

export const CarTelemetryDataParser = new Parser().endianess('little')
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

export const PacketCarTelemetryDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.array('m_carTelemetryData', {
type: CarTelemetryDataParser,
length: 22
})

.uint8('m_mfdPanelIndex')
.uint8('m_mfdPanelIndexSecondaryPlayer')
.int8('m_suggestedGear');

export const CarStatusDataParser = new Parser().endianess('little')
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


export const PacketCarStatusDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.array('m_car_status_data', {
type: CarStatusDataParser,
length: 22
});

export const FinalClassificationDataParser = new Parser().endianess('little')
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


export const PacketFinalClassificationDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.uint8('m_numCars')
.array('m_classificationData', {
type: FinalClassificationDataParser,
length: 22
});

export const LobbyInfoDataParser = new Parser().endianess('little')
.uint8('m_aiControlled')
.uint8('m_teamId')
.uint8('m_nationality')
.uint8('m_platform')
.string('m_name', { length: 48 })
.uint8('m_carNumber')
.uint8('m_readyStatus');


export const PacketLobbyInfoDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.uint8('m_numPlayers')
.array('m_lobbyPlayers', {
type: LobbyInfoDataParser,
length: 22
});

export const CarDamageDataParser = new Parser().endianess('little')
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


export const PacketCarDamageDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.array('m_car_damage_data', {
type: CarDamageDataParser,
length: 22
});

export const LapHistoryDataParser = new Parser().endianess('little')
.uint32le('m_lapTimeInMS')
.uint16le('m_sector1TimeInMS')
.uint8('m_sector1TimeMinutes')
.uint16le('m_sector2TimeInMS')
.uint8('m_sector2TimeMinutes')
.uint16le('m_sector3TimeInMS')
.uint8('m_sector3TimeMinutes')
.uint8('m_lapValidBitFlags');

export const TyreStintHistoryDataParser = new Parser().endianess('little')
.uint8('m_endLap')
.uint8('m_tyreActualCompound')
.uint8('m_tyreVisualCompound');


export const PacketSessionHistoryDataParser = new Parser().endianess('little')
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

export const TyreSetDataParser = new Parser().endianess('little')
.uint8('m_actualTyreCompound')
.uint8('m_visualTyreCompound')
.uint8('m_wear')
.uint8('m_available')
.uint8('m_recommendedSession')
.uint8('m_lifeSpan')
.uint8('m_usableLife')
.int16le('m_lapDeltaTime')
.uint8('m_fitted');


export const PacketTyreSetsDataParser = new Parser().endianess('little')
.nest('m_header', { type: PacketHeaderParser })
.uint8('m_carIdx')
.array('m_tyreSetData', {
type: TyreSetDataParser,
length: 20
})

.uint8('m_fittedIdx');

export const PacketMotionExDataParser = new Parser().endianess('little')
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
