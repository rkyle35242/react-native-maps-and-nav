/**
 * Adapted from googlemaps/react-native-navigation-sdk (Apache-2.0).
 */
import * as React from 'react';
import { type ReactNode } from 'react';
import type { TaskRemovedBehavior, TermsAndConditionsDialogOptions } from './types';
import { type UseNavigationControllerResult } from './useNavigationController';
export interface NavigationProviderProps {
    /** Default options for `navigationController.showTermsAndConditionsDialog()`. */
    termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions;
    /** Android only. */
    taskRemovedBehavior?: TaskRemovedBehavior;
    children: ReactNode;
}
export declare function NavigationProvider({ termsAndConditionsDialogOptions, taskRemovedBehavior, children }: NavigationProviderProps): React.JSX.Element;
export declare function useNavigation(): UseNavigationControllerResult;
