package com.rnmaps.maps;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.OnMapReadyCallback;

/**
 * A Google Navigation SDK view that {@link MapView} can embed in place of the plain Google map.
 * The implementation lives in the optional `navigation` source set, which is only compiled when
 * the app opts in with `reactNativeMapsNavigationEnabled=true`.
 */
public interface NavigationHost {

    interface Listener {
        void onRecenterButtonClick();

        void onPromptVisibilityChanged(boolean visible);
    }

    String IMPLEMENTATION_CLASS = "com.rnmaps.navigation.NavigationHostImpl";

    View getView();

    void onCreate(@Nullable Bundle savedInstanceState);

    void onStart();

    void onResume();

    void onPause();

    void onStop();

    void onDestroy();

    void onSaveInstanceState(Bundle outState);

    void getMapAsync(OnMapReadyCallback callback);

    void setNavigationUIEnabledPreference(@Nullable String preference);

    void setNavigationNightMode(@Nullable String nightMode);

    void setStylingOptionsJSON(@Nullable String json);

    void setHeaderEnabled(boolean enabled);

    void setFooterEnabled(boolean enabled);

    void setTripProgressBarEnabled(boolean enabled);

    void setSpeedometerEnabled(boolean enabled);

    void setSpeedLimitIconEnabled(boolean enabled);

    void setRecenterButtonEnabled(boolean enabled);

    void setReportIncidentButtonEnabled(boolean enabled);

    void setTrafficPromptsEnabled(boolean enabled);

    void setTrafficIncidentCardsEnabled(boolean enabled);

    void showRouteOverview();

    void setNavigationUIEnabled(boolean enabled);

    void followMyLocation(String perspective, double zoomLevel);

    static boolean isAvailable() {
        try {
            Class.forName(IMPLEMENTATION_CLASS);
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }

    @Nullable
    static NavigationHost create(ThemedReactContext context, GoogleMapOptions options, Listener listener) {
        try {
            return (NavigationHost) Class.forName(IMPLEMENTATION_CLASS)
                    .getConstructor(ThemedReactContext.class, GoogleMapOptions.class, Listener.class)
                    .newInstance(context, options, listener);
        } catch (ClassNotFoundException e) {
            Log.e("NavigationHost", "navigationEnabled requires reactNativeMapsNavigationEnabled=true in gradle.properties");
            return null;
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException("Failed to create the navigation view", e);
        }
    }
}
