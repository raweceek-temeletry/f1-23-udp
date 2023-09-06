# F1 23 UDP 
**Data Output from F1® 23 Game**


# Found the code helpful? ⭐ Show your support by starring the repo on GitHub!


## how to use?

```js

import { F123UDP } from "f1-23-udp";
/*
*   'port' is optional, defaults to 20777
*   'address' is optional, defaults to localhost, in certain cases you may need to set address explicitly
*/

const f123: F123UDP = new F123UDP();
f123.start();
// motion 0
f123.on('motion',function(data) {
    console.log(data);
})


```


![](cover.jpg)	







#**Overview**

The F1® 23 Game supports the output of certain game data across UDP connections. This data can be used supply race information to external applications, or to drive certain hardware (e.g. motion platforms, force feedback steering wheels and LED devices).

The following information summarise these data structures so that developers of supporting hardware or software can configure these to work correctly with the F1® 23 Game. 

***Note:** To ensure that you are using the latest specification for this game, please check our official forum page `https://answers.ea.com/t5/General-Discussion/F1-23-UDP-Specification/td-p/12632888`

If you cannot find the information that you require then please contact the team via the official forum thread listed above. For any bugs with the UDP system, please post a new bug report on the F1® 23 Game forum. 

**DISCLAIMER: “This information is being provided under license from EA for reference purposes only and we do not make any representations or warranties about the accuracy or reliability of the information for any specific purpose.”**


#**Packet Information**

## **Packet Types**

Each packet carries different types of data rather than having one packet which contains everything. The header in each packet describes the packet type and versioning info so it will be easier for applications to check they are interpreting the incoming data in the correct way. Please note that all values are encoded using Little Endian format. All data is packed.

The following data types are used in the structures:


|**Type**|**Description**|
| - | - |
|uint8|Unsigned 8-bit integer|
|int8|Signed 8-bit integer|
|uint16|Unsigned 16-bit integer|
|int16|Signed 16-bit integer|
|uint32|Unsigned 32-bit integer|
|float|Floating point (32-bit)|
|Double|Double-precision floating point (64-bit)|
|uint64|Unsigned 64-bit integer|
|char|Character|


## **Packet Header**

Each packet has the following header:

struct PacketHeader


```rust

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

```


## **Packet IDs**

The packets IDs are as follows:


|**Packet Name**|**Value**|**Description**|
| - | - | - |
|Motion|0|Contains all motion data for player’s car – only sent while player is in control|
|Session|1|Data about the session – track, time left|
|Lap Data|2|Data about all the lap times of cars in the session|
|Event|3|Various notable events that happen during a session|
|Participants|4|List of participants in the session, mostly relevant for multiplayer|
|Car Setups|5|Packet detailing car setups for cars in the race|
|Car Telemetry|6|Telemetry data for all cars|
|Car Status|7|Status data for all cars|
|Final Classification|8|Final classification confirmation at the end of a race|
|Lobby Info|9|Information about players in a multiplayer lobby|
|Car Damage|10|Damage status for all cars|
|Session History|11|Lap and tyre data for session|
|Tyre Sets|12|Extended tyre set data|
|Motion Ex|13|Extended motion data for player car|


## **Motion Packet**

The motion packet gives physics data for all the cars being driven.

*N.B. For the normalised vectors below, to convert to float values divide by 32767.0f – 16-bit signed values are used to pack the data and on the assumption that direction values are always between -1.0f and 1.0f.*

Frequency: Rate as specified in menus

Size: 1349 bytes

Version: 1

struct CarMotionData

```rust
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

```


## **Session Packet**

The session packet includes details about the current session in progress.

Frequency: 2 per second

Size: 644 bytes

Version: 1

```rust
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


```


## **Lap Data Packet**

The lap data packet gives details of all the cars in the session.

Frequency: Rate as specified in menus

Size: 1131 bytes

Version: 1

```rust

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

```


## **Event Packet**

This packet gives details of events that happen during the course of a session.

Frequency: When the event occurs

Size: 45 bytes

Version: 1

// The event details packet is different for each type of event.

// Make sure only the correct type is interpreted.


```rust
#[repr(C)]
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

```

## **Event String Codes**

|**Event**|**Code**|**Description**|
| - | - | - |
|Session Started|“SSTA”|Sent when the session starts|
|Session Ended|“SEND”|Sent when the session ends|
|Fastest Lap|“FTLP”|When a driver achieves the fastest lap|
|Retirement|“RTMT”|When a driver retires|
|DRS enabled|“DRSE”|Race control have enabled DRS|
|DRS disabled|“DRSD”|Race control have disabled DRS|
|Team mate in pits|“TMPT”|Your team mate has entered the pits|
|Chequered flag|“CHQF”|The chequered flag has been waved|
|Race Winner|“RCWN”|The race winner is announced|
|Penalty Issued|“PENA”|A penalty has been issued – details in event|
|Speed Trap Triggered|“SPTP”|Speed trap has been triggered by fastest speed|
|Start lights|“STLG”|Start lights – number shown|
|Lights out|“LGOT”|Lights out|
|Drive through served|“DTSV”|Drive through penalty served|
|Stop go served|“SGSV”|Stop go penalty served|
|Flashback|“FLBK”|Flashback activated|
|Button status|“BUTN”|Button status changed|
|Red Flag|“RDFL”|Red flag shown|
|Overtake|“OVTK”|Overtake occurred|

## **Participants Packet**

This is a list of participants in the race. If the vehicle is controlled by AI, then the name will be the driver name. If this is a multiplayer game, the names will be the Steam Id on PC, or the LAN name if appropriate.

N.B. on Xbox One, the names will always be the driver name, on PS4 the name will be the LAN name if playing a LAN game, otherwise it will be the driver name. 

The array should be indexed by vehicle index.

Frequency: Every 5 seconds

Size: 1306 bytes

Version: 1


```rust
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

```

## **Car Setups Packet**

This packet details the car setups for each vehicle in the session. Note that in multiplayer games, other player cars will appear as blank, you will only be able to see your own car setup, regardless of the “Your Telemetry” setting. Spectators will also not be able to see any car setups.

Frequency: 2 per second

Size: 1107 bytes

Version: 1

```rust
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


```


##
## **Car Telemetry Packet**
###
This packet details telemetry for all the cars in the race. It details various values that would be recorded on the car such as speed, throttle application, DRS etc. Note that the rev light configurations are presented separately as well and will mimic real life driver preferences.

Frequency: Rate as specified in menus

Size: 1352 bytes

Version: 1

```rust
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

```


## **Car Status Packet**
###
This packet details car statuses for all the cars in the race.



Frequency: Rate as specified in menus

Size: 1239 bytes

Version: 1

```rust
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


```



## **Final Classification Packet**
###
This packet details the final classification at the end of the race, and the data will match with the post race results screen. This is especially useful for multiplayer games where it is not always possible to send lap times on the final frame because of network delay.

Frequency: Once at the end of a race

Size: 1020 bytes

Version: 1

```rust
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



```

##
## **Lobby Info Packet**
###
This packet details the players currently in a multiplayer lobby. It details each player’s selected car, any AI involved in the game and also the ready status of each of the participants.

Frequency: Two every second when in the lobby

Size: 1218 bytes

Version: 1

```rust
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


```



## **Car Damage Packet**


This packet details car damage parameters for all the cars in the race.



Frequency: 10 per second

Size: 953 bytes

Version: 1

```rust
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

```



## **Session History Packet**
###
This packet contains lap times and tyre usage for the session. **This packet works slightly differently to other packets. To reduce CPU and bandwidth, each packet relates to a specific vehicle and is sent every 1/20 s, and the vehicle being sent is cycled through. Therefore in a 20 car race you should receive an update for each vehicle at least once per second.**

Note that at the end of the race, after the final classification packet has been sent, a final bulk update of all the session histories for the vehicles in that session will be sent.



Frequency: 20 per second but cycling through cars

Size: 1460 bytes

Version: 1

```rust
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


```



## **Tyre Sets Packet**

This packets gives a more in-depth details about tyre sets assigned to a vehicle during the session.

Frequency: 20 per second but cycling through cars

Size: 231 bytes

Version: 1

```rust
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


```

## **Motion Ex Packet**

The motion packet gives extended data for the car being driven with the goal of being able to drive a motion platform setup.

Frequency: Rate as specified in menus

Size: 217 bytes

Version: 1

```rust

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


```



## **Restricted data (Your Telemetry setting)**

There is some data in the UDP that you may not want other players seeing if you are in a multiplayer game. This is controlled by the “Your Telemetry” setting in the Telemetry options. The options are:

- Restricted (Default) – other players viewing the UDP data will not see values for your car
- Public – all other players can see all the data for your car
- Show online ID – this additional option allows other players to view your online ID / gamertag in their UDP output.

Note: You can always see the data for the car you are driving regardless of the setting.

The following data items are set to zero if the player driving the car in question has their “Your Telemetry” set to “Restricted”:

### ***Car status packet***

- m_fuelInTank
- m_fuelCapacity
- m_fuelMix
- m_fuelRemainingLaps
- m_frontBrakeBias
- m_ersDeployMode
- m_ersStoreEnergy
- m_ersDeployedThisLap
- m_ersHarvestedThisLapMGUK
- m_ersHarvestedThisLapMGUH
- m_enginePowerICE
- m_enginePowerMGUK

### ***Car damage packet***

- m_frontLeftWingDamage
- m_frontRightWingDamage
- m_rearWingDamage
- m_floorDamage
- m_diffuserDamage
- m_sidepodDamage
- m_engineDamage
- m_gearBoxDamage
- m_tyresWear (All four wheels)
- m_tyresDamage (All four wheels)
- m_brakesDamage (All four wheels)
- m_drsFault
- m_engineMGUHWear
- m_engineESWear
- m_engineCEWear
- m_engineICEWear
- m_engineMGUKWear
- m_engineTCWear

### ***Tyre set packet***
- All data within this packet for player car

To allow other players to view your online ID in their UDP output during an online session, you must enable the “Show online ID / gamertags” option. Selecting this will bring up a confirmation box that must be confirmed before this option is enabled. 

Please note that all options can be changed during a game session and will take immediate effect.


#**FAQS**

## **How do I enable the UDP Telemetry Output?**
In F1 23, UDP telemetry output is controlled via the in-game menus. To enable this, enter the options menu from the main menu (triangle / Y), then enter the settings menu - the UDP option will be at the bottom of the list. From there you will be able to enable / disable the UDP output, configure the IP address and port for the receiving application, toggle broadcast mode and set the send rate. Broadcast mode transmits the data across the network subnet to allow multiple devices on the same subnet to be able to receive this information. When using broadcast mode it is not necessary to set a target IP address, just a target port for applications to listen on.

*Advanced PC Users*: You can additionally edit the game’s configuration XML file to configure UDP output. The file is located here (after an initial boot of the game):

...\Documents\My Games\<game_folder>\hardwaresettings\hardware_settings_config.xml

You should see the tag:

<motion>

...

  <udp enabled="false" broadcast=”false” ip="127.0.0.1" port="20777" sendRate=”20” format=”2023” yourTelemetry=”restricted” onlineNames="off" />

...

</motion>

Here you can set the values manually. Note that any changes made within the game when it is running will overwrite any changes made manually. Note the enabled flag is now a state.


## **What has changed since last year?**
F1® 23 sees the following changes to the UDP specification:

- Added game year to packet header – apps can identify which F1 game data is coming from
- Temperature and speed units choice for players sent in session packet
- Platform of players added to lobby info and participants packets
- Added flag to say whether a player has their “Show online names” flag set in participants packet
- Added whole minute part to sector times in lap data and session history packets
- Damage packet now updates at 10/s
- Separated corner cutting warnings in the lap data packet
- Added new tyre sets packet to give more detail about tyre sets for each car
- Added time deltas for cars in the lap data packet
- Added overall frame identifier to packet header to help deal with flashbacks
- Red flag event added
- Added Safety car, VSC and Red Flag counts to session data
- Added more physics data in the motion packet
- Added Overtake event
- Added power outputs readings for the engine
- Added C0 tyre type
- Added a new Motion Ex packet and moved player car settings from Motion packet to stop it getting too large, added vertical wheel forces


## **What is the order of the wheel arrays?**
All wheel arrays are in the following order:

   0 – Rear Left (RL)

   1 – Rear Right (RR)

   2 – Front Left (FL)

   3 – Front Right (FR)


## **Do the vehicle indices change?**
During a session, each car is assigned a vehicle index. This will not change throughout the session and all the arrays that are sent use this vehicle index to dereference the correct piece of data.

## **What are the co-ordinate systems used?**

Here is a visual representation of the co-ordinate system used with the F1 telemetry data.

![Diagram

Description automatically generated](Aspose.Words.01edf42c-17a2-49a2-965c-e50b14328043.002.png) ![Logo

Description automatically generated with low confidence](Aspose.Words.01edf42c-17a2-49a2-965c-e50b14328043.003.png)

## **What encoding format is used?**
All values are encoded using Little Endian format.



## **Are the data structures packed?**
Yes, all data is packed, there is no padding used.


## **How many cars are in the data structures?**
The maximum number of cars in the data structures is 22, to allow for certain game modes, although the data is not always filled in.

You should always check the data item called m_numActiveCars in the participants packet which tells you how many cars are active in the race. However, you should check the individual result status of each car in the lap data to see if that car is actively providing data. If it is not “Invalid” or “Inactive” then the corresponding vehicle index has valid data.


## **How often are updated packets sent?**
For the packets which get updated at “Rate as specified in the menus” you can be guaranteed that on the frame that these get sent they will all get sent together and will never be separated across frames. This of course relies on the reliability of your network as to whether they are received correctly as everything is sent via UDP. Other packets that get sent at specific rates can arrive on any frame.

If you are connected to the game when it starts transmitting the first frame will contain the following information to help initialise data structures on the receiving application:

**Packets sent on Frame 1: (All packets sent on this frame have “Session timestamp” 0.000)**

- Session
- Participants
- Car Setups
- Lap Data
- Motion Data
- Car Telemetry 
- Car Status
- Car Damage
- Motion Ex Data

As an example, assuming that you are running at 60Hz with 60Hz update rate selected in the menus then you would expect to see the following packets and timestamps:

**Packets sent on Frame 2: (All packets sent on this frame have “Session timestamp” 0.016)**

- Lap Data
- Motion Data
- Car Telemetry
- Car Status
- Motion Ex Data

…

**Packets sent on Frame 31: (All packets sent on this frame have “Session timestamp” 0.5)**

- Session (since 2 updates per second)
- Car Setups (since 2 updates per second)
- Lap Data
- Motion Data
- Car Telemetry
- Car Status
- Car Damage (since 2 updates per second)
- Motion Ex Data

## **Will my old app still work with F1 23?**
**Please note that from F1 23 the game will only support the previous 2 UDP formats.**

F1 23 uses a new format for the UDP data. However, some earlier formats of the data are still supported so that most older apps implemented using the previous data formats should work with little or no change from the developer. To use the old formats, please enter the UDP options menu and set “UDP Format” to either “2022” or “2021”. 

Specifications for the older formats can be seen here:

- F1 2021 - `https://forums.codemasters.com/topic/80231-f1-2021-udp-specification`
- F1 22 - `https://answers.ea.com/t5/General-Discussion/F1-22-UDP-Specification/td-p/11551274`

## **How do I enable D-BOX output?**
D-BOX output is currently supported on the PC platform. In F1 23, the D-BOX activation can be controlled via the menus. Navigate to Game Options->Settings->UDP Telemetry Settings->D-BOX to activate this on your system.

*Advanced PC Users:* It is possible to control D-BOX by editing the games’ configuration XML file. The file is located here (after an initial boot of the game):

...\Documents\My Games\<game_folder>\hardwaresettings\hardware_settings_config.xml

You should see the tag:

  <motion>

    <dbox enabled="false" />

...

  </motion>

Set the “enabled” value to “true” to allow the game to output to your D-BOX motion platform. Note that any changes made within the game when it is running will overwrite any changes made manually.


## **How can I disable in-game support for LED device?**
The F1 game has native support for some of the basic features supported by some external LED devices, such as the *Leo Bodnar SLI Pro* and the *Fanatec* steering wheels. To avoid conflicts between the game’s implementation and any third-party device managers on the PC platform it may be necessary to disable the native support. This is done using the following led_display flags in the hardware_settings_config.xml. The file is located here (after an initial boot of the game):

...\Documents\My Games\<game_folder>\hardwaresettings\hardware_settings_config.xml

The flags to enabled/disable LED output are:

<led_display fanatecNativeSupport="true" sliProNativeSupport="true" />

The sliProNativeSupport flag controls the output to SLI Pro devices. The fanatecNativeSupport flag controls the output to Fanatec (and some related) steering wheel LEDs. Set the values for any of these to “false” to disable them and avoid conflicts with your own device manager.

Please note there is an additional flag to manually control the LED brightness on the SLI Pro:

<led_display sliProForceBrightness="127" />

This option (using value in the range 0-255) will be ignored when setting the sliProNativeSupport flag to “false”.
##
Also note it is now possible to edit these values on the fly via the Game Options->Settings->UDP Telemetry Settings menu.


## **Can I configure the UDP output using an XML File?**
PC users can edit the game’s configuration XML file to configure UDP output. The file is located here (after an initial boot of the game):

...\Documents\My Games\<game_folder>\hardwaresettings\hardware_settings_config.xml

You should see the tag:

   <motion>

...

     <udp enabled="false" broadcast=”false” ip="127.0.0.1" port="20777" sendRate=”20” format=”2023” yourTelemetry="restricted" onlineNames="off" />

...

   </motion>

Here you can set the values manually. Note that any changes made within the game when it is running will overwrite any changes made manually.


#**Appendices**

Here are the values used for some of the parameters in the UDP data output.

## **Team IDs**


|**ID**|**Team**|**ID**|**Team**|**ID**|**Team**|
| :-: | :- | :-: | :- | :-: | :-: |
|0|Mercedes|106|Prema ‘21|136|Campos ‘22|
|1|Ferrari|107|Uni-Virtuosi ‘21|137|Van Amersfoort Racing ‘22|
|2|Red Bull Racing|108|Carlin ‘21|138|Trident ‘22|
|3|Williams|109|Hitech ‘21|139|Hitech ‘22|
|4|Aston Martin|110|Art GP ‘21|140|Art GP ‘22|
|5|Alpine|111|MP Motorsport ‘21|||
|6|Alpha Tauri|112|Charouz ‘21|||
|7|Haas|113|Dams ‘21|||
|8|McLaren|114|Campos ‘21|||
|9|Alfa Romeo|115|BWT ‘21|||
|85|Mercedes 2020|116|Trident ‘21|||
|86|Ferrari 2020|117|Mercedes AMG GT Black Series|||
|87|Red Bull 2020|118|Mercedes ‘22|||
|88|Williams 2020|119|Ferrari ‘22|||
|89|Racing Point 2020|120|Red Bull Racing ‘22|||
|90|Renault 2020|121|Williams ‘22|||
|91|Alpha Tauri 2020|122|Aston Martin ‘22|||
|92|Haas 2020|123|Alpine ‘22|||
|93|McLaren 2020|124|Alpha Tauri ‘22|||
|94|Alfa Romeo 2020|125|Haas ‘22|||
|95|Aston Martin DB11 V12|126|McLaren ‘22|||
|96|Aston Martin Vantage F1 Edition|127|Alfa Romeo ‘22|||
|97|Aston Martin Vantage Safety Car|128|Konnersport ‘22|||
|98|Ferrari F8 Tributo|129|Konnersport|||
|99|Ferrari Roma|130|Prema ‘22|||
|100|McLaren 720S|131|Virtuosi ‘22|||
|101|McLaren Artura|132|Carlin ‘22|||
|102|Mercedes AMG GT Black Series Safety Car|133|MP Motorsport ‘22|||
|103|Mercedes AMG GTR Pro|134|Charouz ‘22|||
|104|F1 Custom Team|135|Dams ‘22|||


## **Driver IDs**


|**ID**|**Driver**|**ID**|**Driver**|**ID**|**Driver**|
| :-: | :- | :-: | :- | :-: | :- |
|0|Carlos Sainz|56|Louis Delétraz|115|Theo Pourchaire|
|1|Daniil Kvyat|57|Antonio Fuoco|116|Richard Verschoor|
|2|Daniel Ricciardo|58|Charles Leclerc|117|Lirim Zendeli|
|3|Fernando Alonso|59|Pierre Gasly|118|David Beckmann|
|4|Felipe Massa|62|Alexander Albon|121|Alessio Deledda|
|6|Kimi Räikkönen|63|Nicholas Latifi|122|Bent Viscaal|
|7|Lewis Hamilton|64|Dorian Boccolacci|123|Enzo Fittipaldi|
|9|Max Verstappen|65|Niko Kari|125|Mark Webber|
|10|Nico Hulkenburg|66|Roberto Merhi|126|Jacques Villeneuve|
|11|Kevin Magnussen|67|Arjun Maini|127|Callie Mayer|
|12|Romain Grosjean|68|Alessio Lorandi|128|Noah Bell|
|13|Sebastian Vettel|69|Ruben Meijer|129|Jake Hughes|
|14|Sergio Perez|70|Rashid Nair|130|Frederik Vesti|
|15|Valtteri Bottas|71|Jack Tremblay|131|Olli Caldwell|
|17|Esteban Ocon|72|Devon Butler|132|Logan Sargeant|
|19|Lance Stroll|73|Lukas Weber|133|Cem Bolukbasi|
|20|Arron Barnes|74|Antonio Giovinazzi|134|Ayumu Iwasa|
|21|Martin Giles|75|Robert Kubica|135|Clement Novalak|
|22|Alex Murray|76|Alain Prost|136|Jack Doohan|
|23|Lucas Roth|77|Ayrton Senna|137|Amaury Cordeel|
|24|Igor Correia|78|Nobuharu Matsushita|138|Dennis Hauger|
|25|Sophie Levasseur|79|Nikita Mazepin|139|Calan Williams|
|26|Jonas Schiffer|80|Guanya Zhou|140|Jamie Chadwick|
|27|Alain Forest|81|Mick Schumacher|141|Kamui Kobayashi|
|28|Jay Letourneau|82|Callum Ilott|142|Pastor Maldonado|
|29|Esto Saari|83|Juan Manuel Correa|143|Mika Hakkinen|
|30|Yasar Atiyeh|84|Jordan King|144|Nigel Mansell|
|31|Callisto Calabresi|85|Mahaveer Raghunathan|||
|32|Naota Izum|86|Tatiana Calderon|||
|33|Howard Clarke|87|Anthoine Hubert|||
|34|Wilheim Kaufmann|88|Guiliano Alesi|||
|35|Marie Laursen|89|Ralph Boschung|||
|36|Flavio Nieves|90|Michael Schumacher|||
|37|Peter Belousov|91|Dan Ticktum|||
|38|Klimek Michalski|92 |Marcus Armstrong|||
|39|Santiago Moreno|93 |Christian Lundgaard|||
|40|Benjamin Coppens|94 |Yuki Tsunoda|||
|41|Noah Visser|95 |Jehan Daruvala|||
|42|Gert Waldmuller|96 |Gulherme Samaia|||
|43|Julian Quesada|97 |Pedro Piquet|||
|44|Daniel Jones|98 |Felipe Drugovich|||
|45|Artem Markelov|99 |Robert Schwartzman|||
|46|Tadasuke Makino|100 |Roy Nissany|||
|47|Sean Gelael|101 |Marino Sato|||
|48|Nyck De Vries|102|Aidan Jackson|||
|49|Jack Aitken|103|Casper Akkerman|||
|50|George Russell|109|Jenson Button|||
|51|Maximilian Günther|110|David Coulthard|||
|52|Nirei Fukuzumi|111|Nico Rosberg|||
|53|Luca Ghiotto|112|Oscar Piastri|||
|54|Lando Norris|113|Liam Lawson|||
|55|Sérgio Sette Câmara|114|Juri Vips|||



## **Track IDs**


|**ID**|**Track**|
| :-: | :- |
|0|Melbourne|
|1|Paul Ricard|
|2|Shanghai|
|3|Sakhir (Bahrain)|
|4|Catalunya|
|5|Monaco|
|6|Montreal|
|7|Silverstone|
|8|Hockenheim|
|9|Hungaroring|
|10|Spa|
|11|Monza|
|12|Singapore|
|13|Suzuka|
|14|Abu Dhabi|
|15|Texas|
|16|Brazil|
|17|Austria|
|18|Sochi|
|19|Mexico|
|20|Baku (Azerbaijan)|
|21|Sakhir Short|
|22|Silverstone Short|
|23|Texas Short|
|24|Suzuka Short|
|25|Hanoi|
|26|Zandvoort|
|27|Imola|
|28|Portimão|
|29|Jeddah|
|30|Miami|
|31|Las Vegas|
|32|Losail|



## **Nationality IDs**


|**ID**|**Nationality**|**ID**|**Nationality**|**ID**|**Nationality**|
| :-: | :- | :-: | :- | :-: | :- |
|1|American|31|Greek|61|Paraguayan|
|2|Argentinean|32|Guatemalan|62|Peruvian|
|3|Australian|33|Honduran|63|Polish|
|4|Austrian|34|Hong Konger|64|Portuguese|
|5|Azerbaijani|35|Hungarian|65|Qatari|
|6|Bahraini|36|Icelander|66|Romanian|
|7|Belgian|37|Indian|67|Russian|
|8|Bolivian|38|Indonesian|68|Salvadoran|
|9|Brazilian|39|Irish|69|Saudi|
|10|British|40|Israeli|70|Scottish|
|11|Bulgarian|41|Italian|71|Serbian|
|12|Cameroonian|42|Jamaican|72|Singaporean|
|13|Canadian|43|Japanese|73|Slovakian|
|14|Chilean|44|Jordanian|74|Slovenian|
|15|Chinese|45|Kuwaiti|75|South Korean|
|16|Colombian|46|Latvian|76|South African|
|17|Costa Rican|47|Lebanese|77|Spanish|
|18|Croatian|48|Lithuanian|78|Swedish|
|19|Cypriot|49|Luxembourger|79|Swiss|
|20|Czech|50|Malaysian|80|Thai|
|21|Danish|51|Maltese|81|Turkish|
|22|Dutch|52|Mexican|82|Uruguayan|
|23|Ecuadorian|53|Monegasque|83|Ukrainian|
|24|English|54|New Zealander|84|Venezuelan|
|25|Emirian|55|Nicaraguan|85|Barbadian|
|26|Estonian|56|Northern Irish|86|Welsh|
|27|Finnish|57|Norwegian|87|Vietnamese|
|28|French|58|Omani|||
|29|German|59|Pakistani| | |
|30|Ghanaian|60|Panamanian| | |



## **Game Mode IDs**


|**ID**|**Mode**|
| :-: | :- |
|0|Event Mode|
|3|Grand Prix|
|4|Grand Prix ‘23|
|5|Time Trial|
|6|Splitscreen|
|7|Online Custom|
|8|Online League|
|11|Career Invitational|
|12|Championship Invitational|
|13|Championship|
|14|Online Championship|
|15|Online Weekly Event|
|17|Story Mode|
|19|Career ‘22|
|20|Career ’22 Online|
|21|Career ‘23|
|22|Career ’23 Online|
|127|Benchmark|


## **Ruleset IDs**


|**ID**|**Ruleset**|
| :-: | :- |
|0|Practice & Qualifying|
|1|Race|
|2|Time Trial|
|4|Time Attack|
|6|Checkpoint Challenge|
|8|Autocross|
|9|Drift|
|10|Average Speed Zone|
|11|Rival Duel|


## **Surface types**

These types are from physics data and show what type of contact each wheel is experiencing.


|**ID**|**Surface**|
| :-: | :- |
|0|Tarmac|
|1|Rumble strip|
|2|Concrete|
|3|Rock|
|4|Gravel|
|5|Mud|
|6|Sand|
|7|Grass|
|8|Water|
|9|Cobblestone|
|10|Metal|
|11|Ridged|

# **Button flags**

These flags are used in the telemetry packet to determine if any buttons are being held on the controlling device. If the value below logical ANDed with the button status is set then the corresponding button is being held.


|**Bit Flag**|**Button**|
| :- | :- |
|0x00000001|Cross or A|
|0x00000002|Triangle or Y|
|0x00000004|Circle or B|
|0x00000008|Square or X|
|0x00000010|D-pad Left|
|0x00000020|D-pad Right|
|0x00000040|D-pad Up|
|0x00000080|D-pad Down|
|0x00000100|Options or Menu|
|0x00000200|L1 or LB|
|0x00000400|R1 or RB|
|0x00000800|L2 or LT|
|0x00001000|R2 or RT|
|0x00002000|Left Stick Click|
|0x00004000|Right Stick Click|
|0x00008000|Right Stick Left|
|0x00010000|Right Stick Right|
|0x00020000|Right Stick Up|
|0x00040000|Right Stick Down|
|0x00080000|Special|
|0x00100000|UDP Action 1|
|0x00200000|UDP Action 2|
|0x00400000|UDP Action 3|
|0x00800000|UDP Action 4|
|0x01000000|UDP Action 5|
|0x02000000|UDP Action 6|
|0x04000000|UDP Action 7|
|0x08000000|UDP Action 8|
|0x10000000|UDP Action 9|
|0x20000000|UDP Action 10|
|0x40000000|UDP Action 11|
|0x80000000|UDP Action 12|


## **Penalty types**


|**ID**|**Penalty meaning**|
| :- | :- |
|0|Drive through|
|1|Stop Go|
|2|Grid penalty|
|3|Penalty reminder|
|4|Time penalty|
|5|Warning|
|6|Disqualified|
|7|Removed from formation lap|
|8|Parked too long timer|
|9|Tyre regulations|
|10|This lap invalidated|
|11|This and next lap invalidated|
|12|This lap invalidated without reason|
|13|This and next lap invalidated without reason|
|14|This and previous lap invalidated|
|15|This and previous lap invalidated without reason|
|16|Retired|
|17|Black flag timer|


## **Infringement types**


|**ID**|**Infringement meaning**|
| :- | :- |
|0|Blocking by slow driving|
|1|Blocking by wrong way driving|
|2|Reversing off the start line|
|3|Big Collision|
|4|Small Collision|
|5|Collision failed to hand back position single|
|6|Collision failed to hand back position multiple|
|7|Corner cutting gained time|
|8|Corner cutting overtake single|
|9|Corner cutting overtake multiple|
|10|Crossed pit exit lane|
|11|Ignoring blue flags|
|12|Ignoring yellow flags|
|13|Ignoring drive through|
|14|Too many drive throughs|
|15|Drive through reminder serve within n laps|
|16|Drive through reminder serve this lap|
|17|Pit lane speeding|
|18|Parked for too long|
|19|Ignoring tyre regulations|
|20|Too many penalties|
|21|Multiple warnings|
|22|Approaching disqualification|
|23|Tyre regulations select single|
|24|Tyre regulations select multiple|
|25|Lap invalidated corner cutting|
|26|Lap invalidated running wide|
|27|Corner cutting ran wide gained time minor|
|28|Corner cutting ran wide gained time significant|
|29|Corner cutting ran wide gained time extreme|
|30|Lap invalidated wall riding|
|31|Lap invalidated flashback used|
|32|Lap invalidated reset to track|
|33|Blocking the pitlane|
|34|Jump start|
|35|Safety car to car collision|
|36|Safety car illegal overtake|
|37|Safety car exceeding allowed pace|
|38|Virtual safety car exceeding allowed pace|
|39|Formation lap below allowed speed|
|40|Formation lap parking|
|41|Retired mechanical failure|
|42|Retired terminally damaged|
|43|Safety car falling too far back|
|44|Black flag timer|
|45|Unserved stop go penalty|
|46|Unserved drive through penalty|
|47|Engine component change|
|48|Gearbox change|
|49|Parc Fermé change|
|50|League grid penalty|
|51|Retry penalty|
|52|Illegal time gain|
|53|Mandatory pitstop|
|54|Attribute assigned|




# **Legal Notice**

F1® 23 Game - an official product of the FIA Formula One World Championship™.

The F1 Formula 1 logo, F1 logo, Formula 1, F1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trademarks of Formula One Licensing BV, a Formula 1 company. © 2023 Cover images Formula One World Championship Limited, a Formula 1 company. Licensed by Formula One World Championship Limited. The F2 FIA Formula 2 CHAMPIONSHIP logo, FIA Formula 2 CHAMPIONSHIP, FIA Formula 2, Formula 2, F2 and related marks are trademarks of the Federation Internationale de l’Automobile and used exclusively under licence.  All rights reserved. The FIA and FIA AfRS logos are trademarks of Federation Internationale de l’Automobile. All rights reserved.


**---===END OF DOCUMENT===---**

