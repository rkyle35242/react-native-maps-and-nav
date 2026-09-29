import * as React from 'react';
import { Platform, processColor, type ColorValue, type NativeSyntheticEvent } from 'react-native';
import MapView, { type MapViewProps } from './MapView';
import { PROVIDER_GOOGLE } from './ProviderConstants';
import type {
  AndroidStylingOptions,
  IOSStylingOptions,
  NavigationNightMode,
  NavigationUIEnabledPreference
} from './navigation/types';

export type NavigationViewProps = Omit<MapViewProps, 'provider'> & {
  /**
   * `automatic` shows the navigation UI once the navigation session is initialized.
   *
   * @default 'automatic'
   */
  navigationUIEnabledPreference?: NavigationUIEnabledPreference;
  /** @default 'auto' */
  navigationNightMode?: NavigationNightMode;
  androidStylingOptions?: AndroidStylingOptions;
  iOSStylingOptions?: IOSStylingOptions;
  /** @default true */
  headerEnabled?: boolean;
  /** @default true */
  footerEnabled?: boolean;
  /** @default true */
  tripProgressBarEnabled?: boolean;
  /** @default false */
  speedometerEnabled?: boolean;
  /** @default true */
  speedLimitIconEnabled?: boolean;
  /** @default true */
  recenterButtonEnabled?: boolean;
  /** @default true */
  reportIncidentButtonEnabled?: boolean;
  /** @default true */
  trafficPromptsEnabled?: boolean;
  /** @default true */
  trafficIncidentCardsEnabled?: boolean;
  onRecenterButtonClick?: () => void;
  onPromptVisibilityChanged?: (visible: boolean) => void;
};

function toStylingOptionsJSON(options: AndroidStylingOptions | IOSStylingOptions | undefined): string | undefined {
  if (!options) {
    return undefined;
  }
  const processed: Record<string, number | string> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value == null) {
      continue;
    }
    if (key.endsWith('TextSize')) {
      processed[key] = value as string;
      continue;
    }
    const color = processColor(value as ColorValue);
    // Platform colors can't cross the JSON boundary; only plain ARGB values are supported.
    if (typeof color === 'number') {
      processed[key] = color;
    }
  }
  return JSON.stringify(processed);
}

/**
 * A Google map hosted in the Google Navigation SDK view. Accepts every `MapView` prop and
 * child (`Marker`, `Polyline`, ...). Guidance is controlled through `useNavigation()`.
 * The ref is the underlying `MapView`, which adds `showRouteOverview`,
 * `setNavigationUIEnabled` and `followMyLocation`.
 */
export const NavigationView = React.forwardRef<MapView, NavigationViewProps>(function NavigationViewImpl(
  { androidStylingOptions, iOSStylingOptions, onPromptVisibilityChanged, ...props },
  ref
) {
  const navigationStylingOptionsJSON = React.useMemo(
    () => toStylingOptionsJSON(Platform.OS === 'ios' ? iOSStylingOptions : androidStylingOptions),
    [androidStylingOptions, iOSStylingOptions]
  );

  const handlePromptVisibilityChanged = React.useCallback(
    (event: NativeSyntheticEvent<{ visible: boolean }>) => onPromptVisibilityChanged?.(event.nativeEvent.visible),
    [onPromptVisibilityChanged]
  );

  const nativeProps = {
    ...props,
    provider: PROVIDER_GOOGLE,
    navigationEnabled: true,
    navigationStylingOptionsJSON,
    onPromptVisibilityChanged: onPromptVisibilityChanged ? handlePromptVisibilityChanged : undefined
  };

  // MapView forwards props it doesn't know about to the native component.
  return <MapView ref={ref} {...(nativeProps as MapViewProps)} />;
});

export default NavigationView;
