import { Parser } from "binary-parser";
import { EventEmitter } from 'node:stream';
import { createSocket, RemoteInfo, Socket } from 'node:dgram';
import { ButtonsDataParser, CarMotionDataParser, DriveThroughPenaltyServedDataParser, FastestLapDataParser, FlashbackDataParser, OvertakeDataParser, PacketCarDamageDataParser, PacketCarSetupDataParser, PacketCarStatusDataParser, PacketCarTelemetryDataParser, PacketFinalClassificationDataParser, PacketHeaderParser, PacketLapDataParser, PacketLobbyInfoDataParser, PacketMotionExDataParser, PacketParticipantsDataParser, PacketSessionDataParser, PacketSessionHistoryDataParser, PacketTyreSetsDataParser, PenaltyDataParser, RaceWinnerDataParser, RetirementDataParser, SpeedTrapDataParser, StartLightsDataParser, StopGoPenaltyServedDataParser, TeamMateInPitsDataParser } from "./utils/parsers";
import { Options, PacketCarDamageData, PacketCarSetupData, PacketCarStatusData, PacketCarTelemetryData, PacketFinalClassificationData, PacketLapData, PacketLobbyInfoData, PacketMotionData, PacketMotionExData, PacketParticipantsData, PacketSessionData, PacketSessionHistoryData, PacketTyreSetsData } from "./types";

const DEFAULT_PORT = 20777;
const ADDRESS = 'localhost';

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
    // Error event handler
    this.socket.on('error', (error: Error) => {
      this.emit('error', error) // Emit the error event for external handling
    });
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
