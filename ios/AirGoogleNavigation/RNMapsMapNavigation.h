#import <Foundation/Foundation.h>
#import <GoogleNavigation/GoogleNavigation.h>

NS_ASSUME_NONNULL_BEGIN

/// Attaches a react-native-maps Google map view to the shared navigation session owned by
/// RNMapsNavModule, and applies the navigation UI props of the NavigationView component.
@interface RNMapsMapNavigation : NSObject <GMSMapViewNavigationUIDelegate>

@property (nonatomic, copy, nullable) void (^onRecenterButtonClick)(void);
@property (nonatomic, copy, nullable) void (^onPromptVisibilityChanged)(BOOL visible);

- (instancetype)initWithMapView:(GMSMapView *)mapView;
- (instancetype)init NS_UNAVAILABLE;

/// Attaches to the navigation session once it exists and the map has a non-zero size.
- (void)attachIfNeeded;
- (void)invalidate;

- (void)setNavigationUIEnabledPreference:(NSString *)preference;
- (void)setNightMode:(NSString *)nightMode;
- (void)setStylingOptionsJSON:(NSString *)json;
- (void)setHeaderEnabled:(BOOL)enabled;
- (void)setFooterEnabled:(BOOL)enabled;
- (void)setTripProgressBarEnabled:(BOOL)enabled;
- (void)setSpeedometerEnabled:(BOOL)enabled;
- (void)setSpeedLimitIconEnabled:(BOOL)enabled;
- (void)setRecenterButtonEnabled:(BOOL)enabled;
- (void)setReportIncidentButtonEnabled:(BOOL)enabled;
- (void)setTrafficPromptsEnabled:(BOOL)enabled;
- (void)setTrafficIncidentCardsEnabled:(BOOL)enabled;

- (void)showRouteOverview;
- (void)setNavigationUIEnabled:(BOOL)enabled;
- (void)followMyLocation:(NSString *)perspective zoomLevel:(double)zoomLevel;

@end

NS_ASSUME_NONNULL_END
