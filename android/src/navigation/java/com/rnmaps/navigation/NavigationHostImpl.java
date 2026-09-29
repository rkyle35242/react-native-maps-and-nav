package com.rnmaps.navigation;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.FollowMyLocationOptions;
import com.google.android.libraries.navigation.ForceNightMode;
import com.google.android.libraries.navigation.NavigationView;
import com.google.android.libraries.navigation.PromptVisibilityChangedListener;
import com.google.android.libraries.navigation.StylingOptions;
import com.rnmaps.maps.NavigationHost;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/** Hosts a Navigation SDK {@link NavigationView} inside react-native-maps' {@link com.rnmaps.maps.MapView}. */
public class NavigationHostImpl implements NavigationHost, NavModule.NavigationReadyListener {
    private static final String TAG = "NavigationHostImpl";

    private final NavigationView navigationView;
    private final ReactApplicationContext reactContext;
    private boolean automaticUI = true;
    private boolean navigatorReady = false;
    private boolean created = false;
    private boolean destroyed = false;
    @Nullable
    private GoogleMap googleMap;
    // Props arrive before the view is attached; NavigationView setters need onCreate first.
    private final List<Runnable> pendingUntilCreated = new ArrayList<>();

    private final NavigationView.OnRecenterButtonClickedListener recenterListener;
    private final PromptVisibilityChangedListener promptListener;

    public NavigationHostImpl(ThemedReactContext context, GoogleMapOptions options, Listener listener) {
        Activity activity = context.getCurrentActivity();
        Context viewContext = activity != null ? activity : context;
        this.navigationView = new NavigationView(viewContext, options);
        this.reactContext = context.getReactApplicationContext();
        this.recenterListener = listener::onRecenterButtonClick;
        this.promptListener = listener::onPromptVisibilityChanged;
        navigationView.addOnRecenterButtonClickedListener(recenterListener);
        navigationView.addPromptVisibilityChangedListener(promptListener);
        navigationView.getMapAsync(map -> googleMap = map);
    }

    @Override
    public View getView() {
        return navigationView;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        // MapView re-runs onCreate when it is re-attached; NavigationView must only be created once.
        if (created || destroyed) {
            return;
        }
        created = true;
        navigationView.onCreate(savedInstanceState);
        for (Runnable op : pendingUntilCreated) {
            op.run();
        }
        pendingUntilCreated.clear();
        NavModule.getInstance(reactContext).registerNavigationReadyListener(this);
        applyNavigationUIEnabled();
    }

    private void runWhenCreated(Runnable op) {
        if (destroyed) {
            return;
        }
        if (created) {
            op.run();
        } else {
            pendingUntilCreated.add(op);
        }
    }

    @Override
    public void onStart() {
        if (created && !destroyed) navigationView.onStart();
    }

    @Override
    public void onResume() {
        if (created && !destroyed) navigationView.onResume();
    }

    @Override
    public void onPause() {
        if (created && !destroyed) navigationView.onPause();
    }

    @Override
    public void onStop() {
        if (created && !destroyed) navigationView.onStop();
    }

    @Override
    public void onDestroy() {
        if (destroyed) {
            return;
        }
        destroyed = true;
        pendingUntilCreated.clear();
        navigationView.removeOnRecenterButtonClickedListener(recenterListener);
        navigationView.removePromptVisibilityChangedListener(promptListener);
        if (NavModule.isInstanceReady()) {
            NavModule.getInstance().unRegisterNavigationReadyListener(this);
        }
        if (created) {
            navigationView.onDestroy();
        }
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        if (created && !destroyed) navigationView.onSaveInstanceState(outState);
    }

    @Override
    public void getMapAsync(OnMapReadyCallback callback) {
        navigationView.getMapAsync(callback);
    }

    @Override
    public void onReady(boolean ready) {
        UiThreadUtil.runOnUiThread(() -> {
            navigatorReady = ready;
            applyNavigationUIEnabled();
        });
    }

    @Override
    public void setNavigationUIEnabledPreference(@Nullable String preference) {
        automaticUI = !"disabled".equals(preference);
        applyNavigationUIEnabled();
    }

    private void applyNavigationUIEnabled() {
        if (!created || destroyed) {
            return;
        }
        navigationView.setNavigationUiEnabled(automaticUI && navigatorReady);
    }

    @Override
    public void setNavigationNightMode(@Nullable String nightMode) {
        int mode = ForceNightMode.AUTO;
        if ("forceDay".equals(nightMode)) {
            mode = ForceNightMode.FORCE_DAY;
        } else if ("forceNight".equals(nightMode)) {
            mode = ForceNightMode.FORCE_NIGHT;
        }
        final int forceNightMode = mode;
        runWhenCreated(() -> navigationView.setForceNightMode(forceNightMode));
    }

    @Override
    public void setStylingOptionsJSON(@Nullable String json) {
        if (json == null || json.isEmpty()) {
            return;
        }
        try {
            JSONObject object = new JSONObject(json);
            Map<String, Object> options = new HashMap<>();
            Iterator<String> keys = object.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                Object value = object.get(key);
                // StylingOptionsBuilder reads colors as Doubles and sizes as Strings.
                options.put(key, value instanceof Number ? ((Number) value).doubleValue() : value);
            }
            StylingOptions stylingOptions = new StylingOptionsBuilder.Builder(options).build();
            runWhenCreated(() -> navigationView.setStylingOptions(stylingOptions));
        } catch (JSONException e) {
            Log.e(TAG, "Invalid navigation styling options", e);
        }
    }

    @Override
    public void setHeaderEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setHeaderEnabled(enabled));
    }

    @Override
    public void setFooterEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setEtaCardEnabled(enabled));
    }

    @Override
    public void setTripProgressBarEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setTripProgressBarEnabled(enabled));
    }

    @Override
    public void setSpeedometerEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setSpeedometerEnabled(enabled));
    }

    @Override
    public void setSpeedLimitIconEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setSpeedLimitIconEnabled(enabled));
    }

    @Override
    public void setRecenterButtonEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setRecenterButtonEnabled(enabled));
    }

    @Override
    public void setReportIncidentButtonEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setReportIncidentButtonEnabled(enabled));
    }

    @Override
    public void setTrafficPromptsEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setTrafficPromptsEnabled(enabled));
    }

    @Override
    public void setTrafficIncidentCardsEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setTrafficIncidentCardsEnabled(enabled));
    }

    @Override
    public void showRouteOverview() {
        runWhenCreated(navigationView::showRouteOverview);
    }

    @Override
    public void setNavigationUIEnabled(boolean enabled) {
        runWhenCreated(() -> navigationView.setNavigationUiEnabled(enabled));
    }

    @SuppressLint("MissingPermission")
    @Override
    public void followMyLocation(String perspective, double zoomLevel) {
        if (googleMap == null) {
            return;
        }
        int cameraPerspective = GoogleMap.CameraPerspective.TILTED;
        if ("topDownNorthUp".equals(perspective)) {
            cameraPerspective = GoogleMap.CameraPerspective.TOP_DOWN_NORTH_UP;
        } else if ("topDownHeadingUp".equals(perspective)) {
            cameraPerspective = GoogleMap.CameraPerspective.TOP_DOWN_HEADING_UP;
        }
        if (zoomLevel > 0) {
            googleMap.followMyLocation(
                    cameraPerspective,
                    FollowMyLocationOptions.builder().setZoomLevel((float) zoomLevel).build());
        } else {
            googleMap.followMyLocation(cameraPerspective);
        }
    }
}
