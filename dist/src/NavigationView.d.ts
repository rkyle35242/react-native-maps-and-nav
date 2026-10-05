import * as React from 'react';
import MapView, { type MapViewProps } from './MapView';
import type { AndroidStylingOptions, IOSStylingOptions, NavigationNightMode, NavigationUIEnabledPreference } from './navigation/types';
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
/**
 * A Google map hosted in the Google Navigation SDK view. Accepts every `MapView` prop and
 * child (`Marker`, `Polyline`, ...). Guidance is controlled through `useNavigation()`.
 * The ref is the underlying `MapView`, which adds `showRouteOverview`,
 * `setNavigationUIEnabled` and `followMyLocation`.
 */
export declare const NavigationView: React.ForwardRefExoticComponent<Omit<MapViewProps, "provider"> & {
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
} & React.RefAttributes<MapView>>;
export default NavigationView;
