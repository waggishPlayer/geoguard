import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function LeafletMap({ markers = [], onMarkerPress }) {
  const webViewRef = useRef(null);

  // Generate HTML content for the WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; height: 100%; width: 100%; }
          #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([20.5937, 78.9629], 5);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          var markersData = ${JSON.stringify(markers)};
          var markerLayer = L.layerGroup().addTo(map);

          function updateMarkers(newMarkers) {
            markerLayer.clearLayers();
            var bounds = L.latLngBounds();
            
            newMarkers.forEach(function(m) {
              var marker = L.marker([m.latitude, m.longitude])
                .addTo(markerLayer)
                .bindPopup('<b>' + m.title + '</b><br>' + m.subtitle);
              
              marker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify(m));
              });

              bounds.extend([m.latitude, m.longitude]);
            });

            if (newMarkers.length > 0) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }

          updateMarkers(markersData);
        </script>
      </body>
    </html>
  `;

  // Handle messages from WebView (marker clicks)
  const handleMessage = (event) => {
    try {
      const markerData = JSON.parse(event.nativeEvent.data);
      if (onMarkerPress) {
        onMarkerPress(markerData);
      }
    } catch (error) {
      console.warn('Failed to parse map message', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: 'file:///android_asset/' }}
        style={styles.webview}
        onMessage={handleMessage}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1,
  },
});
