/**
 * Adapted from googlemaps/react-native-navigation-sdk (src/native/NativeNavModule.ts).
 *
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { TurboModule } from 'react-native';
import type { Double, EventEmitter, Float, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
type LatLngSpec = Readonly<{
    lat: Float;
    lng: Float;
}>;
type LocationSpec = Readonly<{
    lat: Float;
    lng: Float;
    altitude?: Float;
    bearing?: Float;
    speed: Float;
    accuracy?: Float;
    verticalAccuracy?: Float;
    provider?: string;
    time: Double;
}>;
type WaypointSpec = Readonly<{
    placeId?: string;
    title?: string;
    vehicleStopover?: boolean;
    preferSameSideOfRoad?: boolean;
    position?: LatLngSpec;
    preferredHeading?: Double;
}>;
type RoutingOptionsSpec = Readonly<{
    valid?: WithDefault<boolean, false>;
    travelMode?: Double;
    routingStrategy?: Double;
    alternateRoutesStrategy?: Double;
    avoidFerries?: boolean;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
}>;
type DisplayOptionsSpec = Readonly<{
    valid?: WithDefault<boolean, false>;
    showDestinationMarkers?: boolean;
    showStopSigns?: boolean;
    showTrafficLights?: boolean;
}>;
type RouteTokenOptionsSpec = Readonly<{
    valid?: WithDefault<boolean, false>;
    routeToken: string;
    travelMode?: Double;
}>;
type SpeedAlertOptionsSpec = Readonly<{
    valid?: WithDefault<boolean, false>;
    majorSpeedAlertPercentThreshold: Float;
    minorSpeedAlertPercentThreshold: Float;
    severityUpgradeDurationSeconds: Double;
}>;
type LocationSimulationOptionsSpec = Readonly<{
    speedMultiplier: Float;
}>;
type AudioGuidanceSettingsSpec = Readonly<{
    guidanceMode: Double;
    vibrationEnabled: boolean;
    bluetoothAudioEnabled: boolean;
}>;
type ArrivalEventSpec = Readonly<{
    waypoint: WaypointSpec;
    isFinalDestination?: boolean;
}>;
type ContinueToNextDestinationResponseSpec = Readonly<{
    waypoint: WaypointSpec | null;
    routeStatus?: string;
}>;
type TimeAndDistanceSpec = Readonly<{
    delaySeverity: Double;
    meters: Double;
    seconds: Double;
}>;
type StepInfoSpec = Readonly<{
    instruction: string;
    distanceMeters: Double;
    durationSeconds: Double;
    maneuver: string;
    position: LatLngSpec;
}>;
type TurnByTurnEventSpec = Readonly<{
    navState: Double;
    routeChanged: boolean;
    distanceToCurrentStepMeters?: Double;
    distanceToFinalDestinationMeters?: Double;
    timeToCurrentStepSeconds?: Double;
    distanceToNextDestinationMeters?: Double;
    timeToNextDestinationSeconds?: Double;
    timeToFinalDestinationSeconds?: Double;
    currentStep?: StepInfoSpec;
    getRemainingSteps: ReadonlyArray<StepInfoSpec>;
}>;
declare enum RouteStatusSpec {
    OK = 0,
    NO_ROUTE_FOUND = 1,
    NETWORK_ERROR = 2,
    QUOTA_CHECK_FAILED = 3,
    ROUTE_CANCELED = 4,
    LOCATION_DISABLED = 5,
    LOCATION_UNKNOWN = 6,
    WAYPOINT_ERROR = 7,
    INVALID_PLACE_ID = 8,
    DUPLICATE_WAYPOINTS_ERROR = 9,
    UNKNOWN = 10
}
type TermsAndConditionsUIParamsSpec = Readonly<{
    valid?: WithDefault<boolean, false>;
    backgroundColor?: Double;
    titleColor?: Double;
    mainTextColor?: Double;
    acceptButtonTextColor?: Double;
    cancelButtonTextColor?: Double;
}>;
export interface Spec extends TurboModule {
    areTermsAccepted(): Promise<boolean>;
    showTermsAndConditionsDialog(title: string, companyName: string, showOnlyDisclaimer: boolean, uiParams: TermsAndConditionsUIParamsSpec): Promise<boolean>;
    resetTermsAccepted(): Promise<void>;
    initializeNavigationSession(abnormalTerminationReportingEnabled: boolean, taskRemovedBehavior: Double): Promise<void>;
    cleanup(): Promise<void>;
    setDestinations(waypoints: WaypointSpec[], routingOptions: RoutingOptionsSpec, displayOptions: DisplayOptionsSpec, routeTokenOptions: RouteTokenOptionsSpec): Promise<RouteStatusSpec>;
    continueToNextDestination(): Promise<ContinueToNextDestinationResponseSpec>;
    clearDestinations(): Promise<void>;
    startGuidance(): Promise<void>;
    stopGuidance(): Promise<void>;
    setSpeedAlertOptions(alertOptions: SpeedAlertOptionsSpec): Promise<void>;
    setAbnormalTerminatingReportingEnabled(enabled: boolean): void;
    setAudioGuidanceType(index: Double): Promise<void>;
    setAudioGuidanceSettings(settings: AudioGuidanceSettingsSpec): Promise<void>;
    setBackgroundLocationUpdatesEnabled(isEnabled: boolean): void;
    setTurnByTurnLoggingEnabled(isEnabled: boolean): void;
    getCurrentRouteSegment(): Promise<unknown>;
    getRouteSegments(): Promise<unknown>;
    getCurrentTimeAndDistance(): Promise<TimeAndDistanceSpec>;
    getTraveledPath(): Promise<unknown>;
    getNavSDKVersion(): Promise<string>;
    stopUpdatingLocation(): Promise<void>;
    startUpdatingLocation(): Promise<void>;
    simulateLocation(location: LatLngSpec): Promise<void>;
    resumeLocationSimulation(): Promise<void>;
    pauseLocationSimulation(): Promise<void>;
    simulateLocationsAlongExistingRoute(options: LocationSimulationOptionsSpec): Promise<void>;
    stopLocationSimulation(): Promise<void>;
    onLocationChanged: EventEmitter<{
        location: LocationSpec;
    }>;
    onArrival: EventEmitter<{
        arrivalEvent: ArrivalEventSpec;
    }>;
    onRemainingTimeOrDistanceChanged: EventEmitter<{
        timeAndDistance: TimeAndDistanceSpec;
    }>;
    onRouteChanged: EventEmitter<void>;
    onReroutingRequestedByOffRoute: EventEmitter<void>;
    onStartGuidance: EventEmitter<void>;
    onTurnByTurn: EventEmitter<{
        turnByTurnEvents: ReadonlyArray<TurnByTurnEventSpec>;
    }>;
    onRawLocationChanged: EventEmitter<{
        location: LocationSpec;
    }>;
    onTrafficUpdated: EventEmitter<void>;
    logDebugInfo: EventEmitter<{
        message: string;
    }>;
}
declare const _default: Spec | null;
export default _default;
