/**
 * Adapted from googlemaps/react-native-navigation-sdk (Apache-2.0).
 */
import * as React from 'react';
import { createContext, useContext, type ReactNode } from 'react';
import type { TaskRemovedBehavior, TermsAndConditionsDialogOptions } from './types';
import { useNavigationController, type UseNavigationControllerResult } from './useNavigationController';

const NavigationContext = createContext<UseNavigationControllerResult | undefined>(undefined);

export interface NavigationProviderProps {
  /** Default options for `navigationController.showTermsAndConditionsDialog()`. */
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions;
  /** Android only. */
  taskRemovedBehavior?: TaskRemovedBehavior;
  children: ReactNode;
}

export function NavigationProvider({
  termsAndConditionsDialogOptions,
  taskRemovedBehavior,
  children
}: NavigationProviderProps): React.JSX.Element {
  const value = useNavigationController(termsAndConditionsDialogOptions, taskRemovedBehavior);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): UseNavigationControllerResult {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
