import { TaskRemovedBehavior, type NavigationController, type NavigationListeners, type TermsAndConditionsDialogOptions } from './types';
type ListenerSetter<K extends keyof NavigationListeners> = (listener: NavigationListeners[K] | null | undefined) => void;
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
export declare function useNavigationController(termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions, taskRemovedBehavior?: TaskRemovedBehavior): UseNavigationControllerResult;
export {};
