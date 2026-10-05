/**
 * Types adapted from googlemaps/react-native-navigation-sdk (Apache-2.0).
 * Coordinates use react-native-maps' `LatLng` ({latitude, longitude}).
 */
import type { ColorValue } from 'react-native';
import type { LatLng } from '../sharedTypes';
export declare enum TravelMode {
    DRIVING = 0,
    CYCLING = 1,
    WALKING = 2,
    TWO_WHEELER = 3,
    TAXI = 4
}
export declare enum RoutingStrategy {
    DEFAULT_BEST = 0,
    SHORTER = 1,
    TARGET_DISTANCE = 2
}
export declare enum AlternateRoutingStrategy {
    SHOW_ALL = 0,
    SHOW_NONE = 1,
    SHOW_ONE = 2
}
export declare enum AudioGuidanceMode {
    SILENT = 0,
    VOICE_ALERTS_ONLY = 1,
    VOICE_ALERTS_AND_GUIDANCE = 2
}
/** Android only. */
export declare enum TaskRemovedBehavior {
    CONTINUE_SERVICE = 0,
    QUIT_SERVICE = 1
}
export declare enum DelaySeverity {
    NO_DATA = 0,
    HEAVY = 1,
    MEDIUM = 2,
    LIGHT = 3
}
export declare enum NavState {
    UNKNOWN = 0,
    ENROUTE = 1,
    REROUTING = 2,
    STOPPED = 3
}
export declare enum RouteStatus {
    OK = "OK",
    NO_ROUTE_FOUND = "NO_ROUTE_FOUND",
    NETWORK_ERROR = "NETWORK_ERROR",
    QUOTA_CHECK_FAILED = "QUOTA_CHECK_FAILED",
    ROUTE_CANCELED = "ROUTE_CANCELED",
    LOCATION_DISABLED = "LOCATION_DISABLED",
    LOCATION_UNKNOWN = "LOCATION_UNKNOWN",
    WAYPOINT_ERROR = "WAYPOINT_ERROR",
    INVALID_PLACE_ID = "INVALID_PLACE_ID",
    DUPLICATE_WAYPOINTS_ERROR = "DUPLICATE_WAYPOINTS_ERROR",
    UNKNOWN = "UNKNOWN"
}
export declare enum NavigationSessionStatus {
    OK = "ok",
    NOT_AUTHORIZED = "notAuthorized",
    TERMS_NOT_ACCEPTED = "termsNotAccepted",
    NETWORK_ERROR = "networkError",
    LOCATION_PERMISSION_MISSING = "locationPermissionMissing",
    UNKNOWN_ERROR = "unknownError"
}
export type NavigationUIEnabledPreference = 'automatic' | 'disabled';
export type NavigationNightMode = 'auto' | 'forceDay' | 'forceNight';
export type CameraPerspective = 'tilted' | 'topDownNorthUp' | 'topDownHeadingUp';
export interface Waypoint {
    /** Place ID to route to; use either this or `coordinate`. */
    placeId?: string;
    /** Text shown for the waypoint in the notification tray. */
    title?: string;
    vehicleStopover?: boolean;
    preferSameSideOfRoad?: boolean;
    coordinate?: LatLng;
    /** Degrees in [0, 360], 0 is north. */
    preferredHeading?: number;
}
export interface RoutingOptions {
    travelMode?: TravelMode;
    routingStrategy?: RoutingStrategy;
    alternateRoutesStrategy?: AlternateRoutingStrategy;
    avoidFerries?: boolean;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
}
export interface DisplayOptions {
    showDestinationMarkers?: boolean;
    showStopSigns?: boolean;
    showTrafficLights?: boolean;
}
export interface RouteTokenOptions {
    /** Token from the Routes API; the waypoints must match those used to create it. */
    routeToken: string;
    travelMode?: TravelMode;
}
export interface SetDestinationsOptions {
    /** Mutually exclusive with `routeTokenOptions`. */
    routingOptions?: RoutingOptions;
    displayOptions?: DisplayOptions;
    routeTokenOptions?: RouteTokenOptions;
}
export interface SpeedAlertOptions {
    majorSpeedAlertPercentThreshold: number;
    minorSpeedAlertPercentThreshold: number;
    severityUpgradeDurationSeconds: number;
}
export interface AudioGuidanceSettings {
    guidanceMode: AudioGuidanceMode;
    vibrationEnabled: boolean;
    bluetoothAudioEnabled: boolean;
}
export interface TermsAndConditionsUIParams {
    backgroundColor?: ColorValue;
    titleColor?: ColorValue;
    mainTextColor?: ColorValue;
    acceptButtonTextColor?: ColorValue;
    cancelButtonTextColor?: ColorValue;
}
export interface TermsAndConditionsDialogOptions {
    readonly title: string;
    readonly companyName: string;
    /** Only show the driver awareness disclaimer. */
    readonly showOnlyDisclaimer?: boolean;
    readonly uiParams?: TermsAndConditionsUIParams;
}
export interface NavigationLocation {
    coordinate: LatLng;
    altitude?: number;
    bearing?: number;
    /** Meters per second. */
    speed: number;
    accuracy?: number;
    verticalAccuracy?: number;
    /** Android only. */
    provider?: string;
    /** Milliseconds since the Unix epoch. */
    time: number;
}
export interface TimeAndDistance {
    delaySeverity: DelaySeverity;
    meters: number;
    seconds: number;
}
export interface RouteSegment {
    destinationCoordinate: LatLng;
    destinationWaypoint: Waypoint;
    coordinates: LatLng[];
}
export interface ArrivalEvent {
    waypoint: Waypoint;
    isFinalDestination?: boolean;
}
export interface ContinueToNextDestinationResponse {
    waypoint: Waypoint | null;
    routeStatus?: RouteStatus;
}
export interface StepInfo {
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
    maneuver: string;
    coordinate: LatLng;
}
export interface TurnByTurnEvent {
    navState: NavState;
    routeChanged: boolean;
    distanceToCurrentStepMeters?: number;
    distanceToFinalDestinationMeters?: number;
    timeToCurrentStepSeconds?: number;
    distanceToNextDestinationMeters?: number;
    timeToNextDestinationSeconds?: number;
    timeToFinalDestinationSeconds?: number;
    currentStep?: StepInfo;
    remainingSteps: StepInfo[];
}
export interface Simulator {
    simulateLocation(coordinate: LatLng): Promise<void>;
    simulateLocationsAlongExistingRoute(options: {
        speedMultiplier: number;
    }): Promise<void>;
    pauseLocationSimulation(): Promise<void>;
    resumeLocationSimulation(): Promise<void>;
    stopLocationSimulation(): Promise<void>;
}
export interface NavigationController {
    areTermsAccepted(): Promise<boolean>;
    /** Uses the options passed to `NavigationProvider`, merged with `optionsOverride`. */
    showTermsAndConditionsDialog(optionsOverride?: Partial<TermsAndConditionsDialogOptions>): Promise<boolean>;
    resetTermsAccepted(): Promise<void>;
    /** Resolves with `OK`; rejects with the native initialization error on failure. */
    init(): Promise<NavigationSessionStatus>;
    cleanup(): Promise<void>;
    setDestination(waypoint: Waypoint, options?: SetDestinationsOptions): Promise<RouteStatus>;
    setDestinations(waypoints: Waypoint[], options?: SetDestinationsOptions): Promise<RouteStatus>;
    continueToNextDestination(): Promise<ContinueToNextDestinationResponse>;
    clearDestinations(): Promise<void>;
    startGuidance(): Promise<void>;
    stopGuidance(): Promise<void>;
    getCurrentRouteSegment(): Promise<RouteSegment | null>;
    getRouteSegments(): Promise<RouteSegment[]>;
    getCurrentTimeAndDistance(): Promise<TimeAndDistance>;
    getTraveledPath(): Promise<LatLng[]>;
    getNavSDKVersion(): Promise<string>;
    setSpeedAlertOptions(options: SpeedAlertOptions | null): Promise<void>;
    setAudioGuidanceSettings(settings: AudioGuidanceSettings): Promise<void>;
    setAbnormalTerminatingReportingEnabled(enabled: boolean): void;
    /** iOS only. */
    setBackgroundLocationUpdatesEnabled(enabled: boolean): void;
    setTurnByTurnLoggingEnabled(enabled: boolean): void;
    startUpdatingLocation(): Promise<void>;
    stopUpdatingLocation(): Promise<void>;
    readonly simulator: Simulator;
}
export interface NavigationListeners {
    onStartGuidance?: () => void;
    onArrival?: (event: ArrivalEvent) => void;
    /** Road-snapped location. */
    onLocationChanged?: (location: NavigationLocation) => void;
    /** Android only. */
    onRawLocationChanged?: (location: NavigationLocation) => void;
    onNavigationReady?: () => void;
    onRouteChanged?: () => void;
    onReroutingRequestedByOffRoute?: () => void;
    /** Android only. */
    onTrafficUpdated?: () => void;
    onRemainingTimeOrDistanceChanged?: (timeAndDistance: TimeAndDistance) => void;
    /** Requires `setTurnByTurnLoggingEnabled(true)`. */
    onTurnByTurn?: (events: TurnByTurnEvent[]) => void;
    logDebugInfo?: (message: string) => void;
}
export interface AndroidStylingOptions {
    primaryDayModeThemeColor?: ColorValue;
    secondaryDayModeThemeColor?: ColorValue;
    primaryNightModeThemeColor?: ColorValue;
    secondaryNightModeThemeColor?: ColorValue;
    headerLargeManeuverIconColor?: ColorValue;
    headerSmallManeuverIconColor?: ColorValue;
    headerNextStepTextColor?: ColorValue;
    headerNextStepTextSize?: string;
    headerDistanceValueTextColor?: ColorValue;
    headerDistanceUnitsTextColor?: ColorValue;
    headerDistanceValueTextSize?: string;
    headerDistanceUnitsTextSize?: string;
    headerInstructionsTextColor?: ColorValue;
    headerInstructionsFirstRowTextSize?: string;
    headerInstructionsSecondRowTextSize?: string;
    headerGuidanceRecommendedLaneColor?: ColorValue;
}
export interface IOSStylingOptions {
    navigationHeaderPrimaryBackgroundColor?: ColorValue;
    navigationHeaderSecondaryBackgroundColor?: ColorValue;
    navigationHeaderPrimaryBackgroundColorNightMode?: ColorValue;
    navigationHeaderSecondaryBackgroundColorNightMode?: ColorValue;
    navigationHeaderLargeManeuverIconColor?: ColorValue;
    navigationHeaderSmallManeuverIconColor?: ColorValue;
    navigationHeaderGuidanceRecommendedLaneColor?: ColorValue;
    navigationHeaderNextStepTextColor?: ColorValue;
    navigationHeaderDistanceValueTextColor?: ColorValue;
    navigationHeaderDistanceUnitsTextColor?: ColorValue;
    navigationHeaderInstructionsTextColor?: ColorValue;
}
