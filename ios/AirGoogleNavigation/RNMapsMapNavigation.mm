#import "RNMapsMapNavigation.h"
#import "RNMapsNavModule.h"
#import "UIColor+ColorInt.h"

// iOS styling keys accepted by NavigationView; each maps to the GMSUISettings property of the same name.
static NSArray<NSString *> *RNMapsNavigationStylingKeys(void) {
  static NSArray<NSString *> *keys;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    keys = @[
      @"navigationHeaderPrimaryBackgroundColor",
      @"navigationHeaderSecondaryBackgroundColor",
      @"navigationHeaderPrimaryBackgroundColorNightMode",
      @"navigationHeaderSecondaryBackgroundColorNightMode",
      @"navigationHeaderLargeManeuverIconColor",
      @"navigationHeaderSmallManeuverIconColor",
      @"navigationHeaderGuidanceRecommendedLaneColor",
      @"navigationHeaderNextStepTextColor",
      @"navigationHeaderDistanceValueTextColor",
      @"navigationHeaderDistanceUnitsTextColor",
      @"navigationHeaderInstructionsTextColor",
    ];
  });
  return keys;
}

@implementation RNMapsMapNavigation {
  __weak GMSMapView *_mapView;
  BOOL _attached;
  BOOL _automaticUI;
  NSNumber *_explicitUIEnabled;
  NSNumber *_trafficPromptsEnabled;
  NSDictionary *_stylingOptions;
}

- (instancetype)initWithMapView:(GMSMapView *)mapView {
  if (self = [super init]) {
    _mapView = mapView;
    _automaticUI = YES;
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:self
               selector:@selector(sessionReady:)
                   name:RNMapsNavSessionReadyNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(sessionDestroyed:)
                   name:RNMapsNavSessionDestroyedNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(travelModeChanged:)
                   name:RNMapsNavTravelModeChangedNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(showDestinationMarkersChanged:)
                   name:RNMapsNavShowDestinationMarkersNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(promptVisibilityChanged:)
                   name:RNMapsNavPromptVisibilityNotification
                 object:nil];
  }
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
  [self detach];
}

#pragma mark - Session

- (void)attachIfNeeded {
  GMSMapView *mapView = _mapView;
  if (_attached || mapView == nil || CGRectIsEmpty(mapView.bounds)) {
    return;
  }
  RNMapsNavModule *navModule = [RNMapsNavModule sharedInstance];
  if (navModule == nil || ![navModule hasSession]) {
    return;
  }
  GMSNavigationSession *session = [navModule getSession];
  // Returns NO when the terms have not been accepted.
  if (session == nil || ![mapView enableNavigationWithSession:session]) {
    return;
  }
  _attached = YES;
  mapView.navigationUIDelegate = self;
  [mapView setTravelMode:session.travelMode];
  [self applyStylingOptions];
  [self applyTrafficPrompts];
  [self applyNavigationUIEnabled];
}

- (void)detach {
  _attached = NO;
  GMSMapView *mapView = _mapView;
  if (mapView != nil) {
    mapView.navigationUIDelegate = nil;
    mapView.navigationEnabled = NO;
  }
}

- (void)sessionReady:(NSNotification *)notification {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self attachIfNeeded];
  });
}

- (void)sessionDestroyed:(NSNotification *)notification {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self detach];
  });
}

- (void)travelModeChanged:(NSNotification *)notification {
  NSNumber *travelMode = notification.userInfo[@"travelMode"];
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_attached && travelMode != nil) {
      [self->_mapView setTravelMode:(GMSNavigationTravelMode)travelMode.integerValue];
    }
  });
}

- (void)showDestinationMarkersChanged:(NSNotification *)notification {
  BOOL enabled = [notification.userInfo[@"enabled"] boolValue];
  dispatch_async(dispatch_get_main_queue(), ^{
    self->_mapView.settings.showsDestinationMarkers = enabled;
  });
}

- (void)promptVisibilityChanged:(NSNotification *)notification {
  BOOL visible = [notification.userInfo[@"visible"] boolValue];
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_attached && self.onPromptVisibilityChanged) {
      self.onPromptVisibilityChanged(visible);
    }
  });
}

#pragma mark - GMSMapViewNavigationUIDelegate

- (void)mapViewDidTapRecenterButton:(GMSMapView *)mapView {
  if (self.onRecenterButtonClick) {
    self.onRecenterButtonClick();
  }
}

#pragma mark - Props

- (void)applyNavigationUIEnabled {
  GMSMapView *mapView = _mapView;
  if (!_attached || mapView == nil) {
    return;
  }
  if (_explicitUIEnabled != nil) {
    mapView.navigationEnabled = _explicitUIEnabled.boolValue;
  } else {
    mapView.navigationEnabled = _automaticUI;
  }
}

- (void)setNavigationUIEnabledPreference:(NSString *)preference {
  _automaticUI = ![preference isEqualToString:@"disabled"];
  [self applyNavigationUIEnabled];
}

- (void)setNightMode:(NSString *)nightMode {
  GMSMapView *mapView = _mapView;
  if ([nightMode isEqualToString:@"forceDay"]) {
    [mapView setLightingMode:GMSNavigationLightingModeNormal];
  } else if ([nightMode isEqualToString:@"forceNight"]) {
    [mapView setLightingMode:GMSNavigationLightingModeLowLight];
  } else if ([mapView respondsToSelector:@selector(setLightingMode:)]) {
    // Mirrors the Navigation SDK plugin: passing nil hands lighting back to the SDK.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    [mapView performSelector:@selector(setLightingMode:) withObject:nil];
#pragma clang diagnostic pop
  }
}

- (void)setStylingOptionsJSON:(NSString *)json {
  if (json.length == 0) {
    _stylingOptions = nil;
    return;
  }
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  id parsed = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  _stylingOptions = [parsed isKindOfClass:[NSDictionary class]] ? parsed : nil;
  [self applyStylingOptions];
}

- (void)applyStylingOptions {
  GMSMapView *mapView = _mapView;
  if (!_attached || mapView == nil || _stylingOptions == nil) {
    return;
  }
  for (NSString *key in RNMapsNavigationStylingKeys()) {
    id value = _stylingOptions[key];
    if ([value isKindOfClass:[NSNumber class]]) {
      [mapView.settings setValue:[UIColor colorWithColorInt:value] forKey:key];
    }
  }
}

- (void)applyTrafficPrompts {
  GMSNavigator *navigator = _mapView.navigator;
  if (_trafficPromptsEnabled != nil && navigator != nil) {
    navigator.shouldDisplayPrompts = _trafficPromptsEnabled.boolValue;
  }
}

- (void)setHeaderEnabled:(BOOL)enabled {
  _mapView.settings.navigationHeaderEnabled = enabled;
}

- (void)setFooterEnabled:(BOOL)enabled {
  _mapView.settings.navigationFooterEnabled = enabled;
}

- (void)setTripProgressBarEnabled:(BOOL)enabled {
  _mapView.settings.navigationTripProgressBarEnabled = enabled;
}

- (void)setSpeedometerEnabled:(BOOL)enabled {
  _mapView.shouldDisplaySpeedometer = enabled;
}

- (void)setSpeedLimitIconEnabled:(BOOL)enabled {
  _mapView.shouldDisplaySpeedLimit = enabled;
}

- (void)setRecenterButtonEnabled:(BOOL)enabled {
  _mapView.settings.recenterButtonEnabled = enabled;
}

- (void)setReportIncidentButtonEnabled:(BOOL)enabled {
  _mapView.settings.navigationReportIncidentButtonEnabled = enabled;
}

- (void)setTrafficPromptsEnabled:(BOOL)enabled {
  _trafficPromptsEnabled = @(enabled);
  [self applyTrafficPrompts];
}

- (void)setTrafficIncidentCardsEnabled:(BOOL)enabled {
  _mapView.settings.showsIncidentCards = enabled;
}

#pragma mark - Commands

- (void)showRouteOverview {
  _mapView.cameraMode = GMSNavigationCameraModeOverview;
}

- (void)setNavigationUIEnabled:(BOOL)enabled {
  _explicitUIEnabled = @(enabled);
  [self applyNavigationUIEnabled];
}

- (void)followMyLocation:(NSString *)perspective zoomLevel:(double)zoomLevel {
  GMSMapView *mapView = _mapView;
  mapView.cameraMode = GMSNavigationCameraModeFollowing;
  if ([perspective isEqualToString:@"topDownNorthUp"]) {
    mapView.followingPerspective = GMSNavigationCameraPerspectiveTopDownNorthUp;
  } else if ([perspective isEqualToString:@"topDownHeadingUp"]) {
    mapView.followingPerspective = GMSNavigationCameraPerspectiveTopDownHeadingUp;
  } else {
    mapView.followingPerspective = GMSNavigationCameraPerspectiveTilted;
  }
  mapView.followingZoomLevel = zoomLevel > 0 ? (float)zoomLevel : GMSNavigationNoFollowingZoomLevel;
}

@end
