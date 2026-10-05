import type { ConfigPlugin } from '@expo/config-plugins/build/Plugin.types';
import {
  withAppDelegate,
  withInfoPlist,
  withPodfile,
  withXcodeProject
} from '@expo/config-plugins/build/plugins/ios-plugins';

import { mergeContents, removeContents, type MergeResults } from '@expo/config-plugins/build/utils/generateCode';
import type { ConfigPluginProps } from './types';

export const MATCH_INIT = /\bsuper\.application\(\w+?, didFinishLaunchingWithOptions: \w+?\)/g;

export const withMapsIOS: ConfigPlugin<ConfigPluginProps> = (config, props) => {
  const useGoogleNavigation = !!props?.iosGoogleNavigationEnabled;
  if (useGoogleNavigation && !props?.iosGoogleMapsApiKey) {
    throw new Error('iosGoogleNavigationEnabled requires iosGoogleMapsApiKey.');
  }

  // Set in Info.plist
  if (props?.iosGoogleMapsApiKey) {
    config = withInfoPlist(config, async conf => {
      if (!conf.ios) {
        conf.ios = {};
      }
      if (!conf.ios.infoPlist) {
        conf.ios.infoPlist = {};
      }

      conf.ios.infoPlist.GMSApiKey = props?.iosGoogleMapsApiKey;
      return conf;
    });
  }

  // Technically adds react-native-maps (Apple maps) and google maps.
  config = withMapsCocoaPods(config, {
    useGoogleMaps: !!props?.iosGoogleMapsApiKey,
    useGoogleNavigation
  });

  if (useGoogleNavigation) {
    config = withXcodeProject(config, mod => {
      const targets = Object.values(mod.modResults.pbxNativeTargetSection()).filter(
        (target): target is { name: string; productType: string } =>
          typeof target === 'object' && target !== null && 'name' in target && 'productType' in target
      );
      for (const target of targets) {
        if (target.productType.replace(/"/g, '') === 'com.apple.product-type.application') {
          mod.modResults.updateBuildProperty(
            'IPHONEOS_DEPLOYMENT_TARGET',
            '16.0',
            undefined,
            target.name.replace(/"/g, '')
          );
        }
      }
      return mod;
    });
  }

  // Adds/Removes AppDelegate setup for Google Maps API on iOS
  config = withGoogleMapsAppDelegate(config, {
    apiKey: props?.iosGoogleMapsApiKey || null
  });

  return config;
};

export function addGoogleMapsAppDelegateImport(src: string): MergeResults {
  const newSrc = ['#if canImport(GoogleMaps)', 'import GoogleMaps', '#endif'];

  return mergeContents({
    tag: 'react-native-maps-import',
    src,
    newSrc: newSrc.join('\n'),
    anchor: /(@main|@UIApplicationMain)/,
    offset: 0,
    comment: '//'
  });
}

export function removeGoogleMapsAppDelegateImport(src: string): MergeResults {
  return removeContents({
    tag: 'react-native-maps-import',
    src
  });
}

export function addGoogleMapsAppDelegateInit(src: string, apiKey: string): MergeResults {
  const newSrc = ['#if canImport(GoogleMaps)', `GMSServices.provideAPIKey("${apiKey}")`, '#endif'];

  return mergeContents({
    tag: 'react-native-maps-init',
    src,
    newSrc: newSrc.join('\n'),
    anchor: MATCH_INIT,
    offset: 0,
    comment: '//'
  });
}

export function removeGoogleMapsAppDelegateInit(src: string): MergeResults {
  return removeContents({
    tag: 'react-native-maps-init',
    src
  });
}

/**
 * @param src The contents of the Podfile.
 * @param useGoogleMaps if GoogleMaps for iOS is used
 * @returns Podfile with react-native-maps integration configured.
 */
export function addMapsCocoapods(src: string, useGoogleMaps: boolean, useGoogleNavigation = false): MergeResults {
  let newSrc = '';
  const packageName = useGoogleNavigation ? 'react-native-maps-and-nav' : 'react-native-maps';

  if (useGoogleNavigation) {
    const platformLine = /^platform\s+:ios\s*,.*$/m;
    if (!platformLine.test(src)) {
      throw new Error('Google Navigation requires an iOS platform declaration in the Podfile.');
    }
    src = src.replace(platformLine, "platform :ios, '16.0'");
    newSrc += '  $RNMapsEnableGoogleNavigation = true\n';
  }

  newSrc += `  rn_maps_path = File.dirname(\`node --print "require.resolve('${packageName}/package.json')"\`) \n`;

  if (useGoogleNavigation) {
    newSrc += `  pod '${packageName}/GoogleNavigation', :path => rn_maps_path \n`;
  } else if (useGoogleMaps) {
    newSrc += "  pod 'react-native-maps/Google', :path => rn_maps_path \n";
  }

  return mergeContents({
    tag: 'react-native-maps',
    src,
    newSrc,
    anchor: /use_native_modules/,
    offset: 0,
    comment: '#'
  });
}

const withMapsCocoaPods: ConfigPlugin<{ useGoogleMaps: boolean; useGoogleNavigation: boolean }> = (
  config,
  { useGoogleMaps, useGoogleNavigation }
) => {
  return withPodfile(config, async conf => {
    let results: MergeResults;

    try {
      results = addMapsCocoapods(conf.modResults.contents, useGoogleMaps, useGoogleNavigation);
    } catch (error: any) {
      if (error.code === 'ERR_NO_MATCH') {
        throw new Error(
          `Cannot add ${
            useGoogleNavigation ? 'react-native-maps-and-nav' : 'react-native-maps'
          } to the project's ios/Podfile because it's malformed. Please report this with a copy of your project Podfile.`
        );
      }
      throw error;
    }

    if (results.didMerge || results.didClear) {
      conf.modResults.contents = results.contents;
    }

    return conf;
  });
};

const withGoogleMapsAppDelegate: ConfigPlugin<{
  apiKey: string | null | undefined;
}> = (config, { apiKey }) => {
  return withAppDelegate(config, conf => {
    if (!apiKey) {
      conf.modResults.contents = removeGoogleMapsAppDelegateImport(conf.modResults.contents).contents;
      conf.modResults.contents = removeGoogleMapsAppDelegateInit(conf.modResults.contents).contents;
      return conf;
    }

    if (conf.modResults.language !== 'swift') {
      throw new Error(
        `Cannot setup Google Maps because the project AppDelegate is not a supported language: ${conf.modResults.language}`
      );
    }

    try {
      conf.modResults.contents = addGoogleMapsAppDelegateImport(conf.modResults.contents).contents;
      conf.modResults.contents = addGoogleMapsAppDelegateInit(conf.modResults.contents, apiKey).contents;
    } catch (error: any) {
      if (error.code === 'ERR_NO_MATCH') {
        throw new Error(
          "Cannot add Google Maps to the project's AppDelegate because it's malformed. Please report this with a copy of your project AppDelegate."
        );
      }
      throw error;
    }
    return conf;
  });
};
