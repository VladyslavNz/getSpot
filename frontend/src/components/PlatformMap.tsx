// Native variant — react-native-maps with Apple-style styling
// Enhanced to support dual marker types (Events + Places) for the community map
import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { MAP_STYLE } from "../theme";

export type MarkerData = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  type: "event" | "place";
  onPress?: () => void;
};

type Props = {
  initialLatitude: number;
  initialLongitude: number;
  markers?: MarkerData[];
  renderCustomMarker?: (m: MarkerData) => React.ReactNode;
  children?: React.ReactNode;
  style?: any;
  onMapPress?: () => void;
};

export default function PlatformMap(props: Props) {
  return (
    <View style={[{ flex: 1 }, props.style]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: props.initialLatitude,
          longitude: props.initialLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={props.onMapPress}
      >
        {props.markers?.map((m) =>
          props.renderCustomMarker ? (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              onPress={m.onPress}
              tracksViewChanges={false}
            >
              {props.renderCustomMarker(m)}
            </Marker>
          ) : (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.title}
              onPress={m.onPress}
            />
          )
        )}
      </MapView>
      {props.children}
    </View>
  );
}
