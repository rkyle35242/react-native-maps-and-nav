/**
 * Adapted from googlemaps/react-native-navigation-sdk (Apache-2.0).
 */
import { useEffect, useMemo, useRef } from 'react';
import { Platform, processColor, type EventSubscription } from 'react-native';
import NativeRNMapsNavModule, { type Spec as NavModuleSpec } from '../specs/NativeRNMapsNavModule';
import type { LatLng } from '../sharedTypes';
import {
  NavigationSessionStatus,
  TaskRemovedBehavior,
  type ArrivalEvent,
  type NavigationController,
  type NavigationListeners,
  type NavigationLocation,
  type RouteSegment,
  type RouteStatus,
  type SetDestinationsOptions,
  type StepInfo,
  type TermsAndConditionsDialogOptions,
  type TurnByTurnEvent,
  type Waypoint
} from './types';

// The native module speaks the Navigation SDK's {lat, lng} format.
type NativeLatLng = { lat: number; lng: number };
type NativeWaypoint = Omit<Waypoint, 'coordinate'> & { position?: NativeLatLng };

function getNavModule(): NavModuleSpec {
  if (!NativeRNMapsNavModule) {
    throw new Error(
      'react-native-maps: navigation is not enabled. Set reactNativeMapsNavigationEnabled=true ' +
        'in android/gradle.properties and $RNMapsEnableGoogleNavigation = true in the iOS Podfile.'
    );
  }
  return NativeRNMapsNavModule;
}

const toNativeLatLng = ({ latitude, longitude }: LatLng): NativeLatLng => ({
  lat: latitude,
  lng: longitude
});

const fromNativeLatLng = (value: NativeLatLng): LatLng => ({
  latitude: value.lat,
  longitude: value.lng
});

function toNativeWaypoint({ coordinate, ...rest }: Waypoint): NativeWaypoint {
  return coordinate ? { ...rest, position: toNativeLatLng(coordinate) } : rest;
}

function fromNativeWaypoint({ position, ...rest }: NativeWaypoint): Waypoint {
  return position ? { ...rest, coordinate: fromNativeLatLng(position) } : rest;
}

function fromNativeLocation({
  lat,
  lng,
  ...rest
}: NativeLatLng & Omit<NavigationLocation, 'coordinate'>): NavigationLocation {
  return { ...rest, coordinate: { latitude: lat, longitude: lng } };
}

function fromNativeRouteSegment(segment: any): RouteSegment {
  return {
    destinationCoordinate: fromNativeLatLng(segment.destinationLatLng),
    destinationWaypoint: fromNativeWaypoint(segment.destinationWaypoint ?? {}),
    coordinates: (segment.segmentLatLngList ?? []).map(fromNativeLatLng)
  };
}

function fromNativeStep({ position, ...rest }: any): StepInfo {
  return { ...rest, coordinate: fromNativeLatLng(position) };
}

function fromNativeTurnByTurn({ currentStep, getRemainingSteps, ...rest }: any): TurnByTurnEvent {
  return {
    ...rest,
    currentStep: currentStep ? fromNativeStep(currentStep) : undefined,
    remainingSteps: (getRemainingSteps ?? []).map(fromNativeStep)
  };
}

function colorToNumber(color: Parameters<typeof processColor>[0]) {
  const processed = color == null ? null : processColor(color);
  return typeof processed === 'number' ? processed : undefined;
}

const SESSION_ERROR_CODES: Record<string, NavigationSessionStatus> = {
  notAuthorized: NavigationSessionStatus.NOT_AUTHORIZED,
  termsNotAccepted: NavigationSessionStatus.TERMS_NOT_ACCEPTED,
  networkError: NavigationSessionStatus.NETWORK_ERROR,
  locationPermissionMissing: NavigationSessionStatus.LOCATION_PERMISSION_MISSING
};

type ListenerSetter<K extends keyof NavigationListeners> = (
  listener: NavigationListeners[K] | null | undefined
) => void;

export type NavigationListenerSetters = {
  setOnStartGuidance: ListenerSetter<'onStartGuidance'>;
  setOnArrival: ListenerSetter<'onArrival'>;
  setOnLocationChanged: ListenerSetter<'onLocationChanged'>;
  setOnRawLocationChanged: ListenerSetter<'onRawLocationChanged'>;
  setOnNavigationReady: ListenerSetter<'onNavigationReady'>;
  setOnRouteChanged: ListenerSetter<'onRouteChanged'>;
  setOnReroutingRequestedByOffRoute: ListenerSetter<'onReroutingRequestedByOffRoute'>;
  setOnTrafficUpdated: ListenerSetter<'onTrafficUpdated'>;
  setOnRemainingTimeOrDistanceChanged: ListenerSetter<'onRemainingTimeOrDistanceChanged'>;
  setOnTurnByTurn: ListenerSetter<'onTurnByTurn'>;
  setLogDebugInfo: ListenerSetter<'logDebugInfo'>;
};

export interface UseNavigationControllerResult extends NavigationListenerSetters {
  navigationController: NavigationController;
  removeAllListeners: () => void;
}

export function useNavigationController(
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions,
  taskRemovedBehavior: TaskRemovedBehavior = TaskRemovedBehavior.CONTINUE_SERVICE
): UseNavigationControllerResult {
  const listeners = useRef<NavigationListeners>({});

  useEffect(() => {
    const module = NativeRNMapsNavModule;
    if (!module) {
      return;
    }
    const l = listeners.current;
    const subscriptions: EventSubscription[] = [
      module.onStartGuidance(() => l.onStartGuidance?.()),
      module.onArrival(({ arrivalEvent }) =>
        l.onArrival?.({
          ...arrivalEvent,
          waypoint: fromNativeWaypoint(arrivalEvent.waypoint as NativeWaypoint)
        } as ArrivalEvent)
      ),
      module.onLocationChanged(({ location }) => l.onLocationChanged?.(fromNativeLocation(location as any))),
      module.onRawLocationChanged(({ location }) => l.onRawLocationChanged?.(fromNativeLocation(location as any))),
      module.onRouteChanged(() => l.onRouteChanged?.()),
      module.onReroutingRequestedByOffRoute(() => l.onReroutingRequestedByOffRoute?.()),
      module.onTrafficUpdated(() => l.onTrafficUpdated?.()),
      module.onRemainingTimeOrDistanceChanged(({ timeAndDistance }) =>
        l.onRemainingTimeOrDistanceChanged?.(timeAndDistance)
      ),
      module.onTurnByTurn(({ turnByTurnEvents }) => l.onTurnByTurn?.(turnByTurnEvents.map(fromNativeTurnByTurn))),
      module.logDebugInfo(({ message }) => l.logDebugInfo?.(message))
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);

  const setters = useMemo(() => {
    const setter =
      <K extends keyof NavigationListeners>(key: K): ListenerSetter<K> =>
      listener => {
        listeners.current[key] = listener ?? undefined;
      };
    return {
      setOnStartGuidance: setter('onStartGuidance'),
      setOnArrival: setter('onArrival'),
      setOnLocationChanged: setter('onLocationChanged'),
      setOnRawLocationChanged: setter('onRawLocationChanged'),
      setOnNavigationReady: setter('onNavigationReady'),
      setOnRouteChanged: setter('onRouteChanged'),
      setOnReroutingRequestedByOffRoute: setter('onReroutingRequestedByOffRoute'),
      setOnTrafficUpdated: setter('onTrafficUpdated'),
      setOnRemainingTimeOrDistanceChanged: setter('onRemainingTimeOrDistanceChanged'),
      setOnTurnByTurn: setter('onTurnByTurn'),
      setLogDebugInfo: setter('logDebugInfo'),
      removeAllListeners: () => {
        listeners.current = {};
      }
    };
  }, []);

  const navigationController = useMemo<NavigationController>(() => {
    const setDestinations = async (waypoints: Waypoint[], options?: SetDestinationsOptions) => {
      const { routingOptions, displayOptions, routeTokenOptions } = options ?? {};
      if (routingOptions && routeTokenOptions) {
        throw new Error('Only one of routingOptions or routeTokenOptions can be provided.');
      }
      // Native expects every options object, flagged with `valid`.
      const status = await getNavModule().setDestinations(
        waypoints.map(toNativeWaypoint),
        routingOptions ? { ...routingOptions, valid: true } : { valid: false },
        displayOptions ? { ...displayOptions, valid: true } : { valid: false },
        routeTokenOptions ? { ...routeTokenOptions, valid: true } : { valid: false, routeToken: '' }
      );
      return status as unknown as RouteStatus;
    };

    return {
      areTermsAccepted: () => getNavModule().areTermsAccepted(),

      showTermsAndConditionsDialog: optionsOverride => {
        const options = {
          ...termsAndConditionsDialogOptions,
          ...optionsOverride
        };
        const uiParams =
          termsAndConditionsDialogOptions.uiParams || optionsOverride?.uiParams
            ? {
                ...termsAndConditionsDialogOptions.uiParams,
                ...optionsOverride?.uiParams
              }
            : undefined;
        return getNavModule().showTermsAndConditionsDialog(
          options.title,
          options.companyName,
          options.showOnlyDisclaimer ?? false,
          uiParams
            ? {
                valid: true,
                backgroundColor: colorToNumber(uiParams.backgroundColor),
                titleColor: colorToNumber(uiParams.titleColor),
                mainTextColor: colorToNumber(uiParams.mainTextColor),
                acceptButtonTextColor: colorToNumber(uiParams.acceptButtonTextColor),
                cancelButtonTextColor: colorToNumber(uiParams.cancelButtonTextColor)
              }
            : { valid: false }
        );
      },

      resetTermsAccepted: () => getNavModule().resetTermsAccepted(),

      init: async () => {
        try {
          await getNavModule().initializeNavigationSession(true, taskRemovedBehavior);
          listeners.current.onNavigationReady?.();
          return NavigationSessionStatus.OK;
        } catch (error) {
          const code = (error as { code?: string } | null)?.code;
          return (code && SESSION_ERROR_CODES[code]) || NavigationSessionStatus.UNKNOWN_ERROR;
        }
      },

      cleanup: () => getNavModule().cleanup(),

      setDestination: (waypoint, options) => setDestinations([waypoint], options),
      setDestinations,

      continueToNextDestination: async () => {
        const result = await getNavModule().continueToNextDestination();
        return {
          waypoint: result.waypoint ? fromNativeWaypoint(result.waypoint as NativeWaypoint) : null,
          routeStatus: result.routeStatus as RouteStatus | undefined
        };
      },

      clearDestinations: () => getNavModule().clearDestinations(),
      startGuidance: () => getNavModule().startGuidance(),
      stopGuidance: () => getNavModule().stopGuidance(),

      getCurrentRouteSegment: async () => {
        const segment = await getNavModule().getCurrentRouteSegment();
        return segment ? fromNativeRouteSegment(segment) : null;
      },

      getRouteSegments: async () => {
        const segments = (await getNavModule().getRouteSegments()) as any[];
        return (segments ?? []).map(fromNativeRouteSegment);
      },

      getCurrentTimeAndDistance: () => getNavModule().getCurrentTimeAndDistance(),

      getTraveledPath: async () => {
        const path = (await getNavModule().getTraveledPath()) as NativeLatLng[];
        return (path ?? []).map(fromNativeLatLng);
      },

      getNavSDKVersion: () => getNavModule().getNavSDKVersion(),

      setSpeedAlertOptions: options =>
        getNavModule().setSpeedAlertOptions(
          options
            ? { ...options, valid: true }
            : {
                valid: false,
                majorSpeedAlertPercentThreshold: 0,
                minorSpeedAlertPercentThreshold: 0,
                severityUpgradeDurationSeconds: 0
              }
        ),

      setAudioGuidanceSettings: settings => getNavModule().setAudioGuidanceSettings(settings),

      setAbnormalTerminatingReportingEnabled: enabled => getNavModule().setAbnormalTerminatingReportingEnabled(enabled),

      setBackgroundLocationUpdatesEnabled: enabled => {
        if (Platform.OS === 'ios') {
          getNavModule().setBackgroundLocationUpdatesEnabled(enabled);
        }
      },

      setTurnByTurnLoggingEnabled: enabled => getNavModule().setTurnByTurnLoggingEnabled(enabled),

      startUpdatingLocation: () => getNavModule().startUpdatingLocation(),
      stopUpdatingLocation: () => getNavModule().stopUpdatingLocation(),

      simulator: {
        simulateLocation: coordinate => getNavModule().simulateLocation(toNativeLatLng(coordinate)),
        simulateLocationsAlongExistingRoute: ({ speedMultiplier }) =>
          getNavModule().simulateLocationsAlongExistingRoute({ speedMultiplier }),
        pauseLocationSimulation: () => getNavModule().pauseLocationSimulation(),
        resumeLocationSimulation: () => getNavModule().resumeLocationSimulation(),
        stopLocationSimulation: () => getNavModule().stopLocationSimulation()
      }
    };
  }, [termsAndConditionsDialogOptions, taskRemovedBehavior]);

  return { navigationController, ...setters };
}
