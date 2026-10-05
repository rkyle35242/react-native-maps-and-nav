// Adapted from googlemaps/react-native-navigation-sdk (Apache-2.0). Modified for react-native-maps.
/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#ifndef RNMapsNavModule_h
#define RNMapsNavModule_h

#import <GoogleNavigation/GoogleNavigation.h>
#if __has_include(<ReactNativeMaps/generated/RNMapsSpecs.h>)
#import <ReactNativeMaps/generated/RNMapsSpecs.h>
#else
#import "RNMapsSpecs.h"
#endif
#import "INavigationCallback.h"

NS_ASSUME_NONNULL_BEGIN

// Posted by RNMapsNavModule so navigation-enabled map views can follow the shared session.
extern NSString *const RNMapsNavSessionReadyNotification;
extern NSString *const RNMapsNavSessionDestroyedNotification;
// userInfo: @"travelMode" (NSNumber of GMSNavigationTravelMode)
extern NSString *const RNMapsNavTravelModeChangedNotification;
// userInfo: @"enabled" (NSNumber BOOL)
extern NSString *const RNMapsNavShowDestinationMarkersNotification;
// userInfo: @"visible" (NSNumber BOOL)
extern NSString *const RNMapsNavPromptVisibilityNotification;

@interface RNMapsNavModule : NativeRNMapsNavModuleSpecBase <NativeRNMapsNavModuleSpec,
                                                GMSNavigatorListener,
                                                GMSRoadSnappedLocationProviderListener,
                                                INavigationCallback>

typedef void (^NavigationSessionReadyCallback)(void);
typedef void (^NavigationSessionDisposedCallback)(void);

@property BOOL enableUpdateInfo;

- (BOOL)hasSession;
- (BOOL)isNavigatorAvailable;
- (GMSNavigationSession *)getSession;
+ (void)unregisterNavigationSessionReadyCallback;
+ (void)registerNavigationSessionReadyCallback:(NavigationSessionReadyCallback)callback;
+ (void)unregisterNavigationSessionDisposedCallback;
+ (void)registerNavigationSessionDisposedCallback:(NavigationSessionDisposedCallback)callback;

// Class method to access the singleton instance
+ (instancetype)sharedInstance;

@end

NS_ASSUME_NONNULL_END

#endif /* RNMapsNavModule_h */
