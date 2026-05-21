// Native variant — react-native-maps with Apple-style styling
import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { MAP_STYLE } from "../theme";

type MarkerT = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  onPress?: () => void;
};

type Props = {
  initialLatitude: number;
  initialLongitude: number;
  markers?: MarkerT[];
  renderCustomMarker?: (m: MarkerT) => React.ReactNode;
  children?: React.ReactNode;
  style?: any;
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
      >
        {props.markers?.map((m) =>
          props.renderCustomMarker ? (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              onPress={m.onPress}
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
