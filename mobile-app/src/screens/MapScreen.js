
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { COLORS } from '../utils/constants';
import { StatusBadge } from '../components/StatusBadge';
import { calculateRiskGrid, setManualWeatherMode, updateManualWeather, generateRiskExplanation } from '../services/RiskEngine';
import AlertTriggerService from '../services/AlertTriggerService';
import AlertModal from '../components/AlertModal';

// Theme mapping
const Colors = {
  background: COLORS.background,
  surface: COLORS.surface,
  primary: COLORS.primary,
  textPrimary: COLORS.text,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  borderLight: COLORS.divider,
  riskImminent: COLORS.danger,
  riskHigh: COLORS.high || '#FF5722', // Fallback if not directly in COLORS root
  riskMedium: COLORS.warning,
  riskLow: COLORS.success,
  emergency: COLORS.danger,
  surfaceNeutral: COLORS.surfaceNeutral || COLORS.surface,
};

const Spacing = { sm: 8, md: 16, lg: 24 };
const Typography = {
  h3: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  body: { fontSize: 14, color: Colors.textPrimary },
  caption: { fontSize: 12, color: Colors.textSecondary },
  small: { fontSize: 10, color: Colors.textSecondary },
};

// Helper functions for risk assessment
const getRiskColor = (score) => {
  if (score >= 0.9) return Colors.riskImminent; // Critical
  if (score >= 0.75) return Colors.riskHigh;    // High
  if (score >= 0.60) return Colors.riskMedium;  // Medium
  return Colors.riskLow;                        // Low
};

const getRiskLevel = (score) => {
  if (score >= 0.9) return 'Critical';
  if (score >= 0.75) return 'High';
  if (score >= 0.60) return 'Medium';
  return 'Low';
};

import { weatherService } from '../services/weather'

export default function MapScreen({ navigation }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [weather, setWeather] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [showWeatherControls, setShowWeatherControls] = useState(false);
  const [manualWeather, setManualWeather] = useState({
    wind_speed: 10.0,
    sun: 0.5,
    rain_mm: 0.0,
    humidity: 60.0,
    temperature: 28.0
  });
  const [weatherData, setWeatherData] = useState(null);
  
  // Alert system state
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertStatus, setAlertStatus] = useState('disconnected');
  const [activeDangerZones, setActiveDangerZones] = useState([]);
  const [testAlertTriggered, setTestAlertTriggered] = useState(false);
  const [mlEnabled, setMlEnabled] = useState(false);

  const webviewRef = React.useRef(null);

  const filteredCells = React.useMemo(() => {
    return heatmapData.filter(cell => {
      if (filterLevel === 'all') return true;
      return getRiskLevel(cell.risk_score) === filterLevel;
    });
  }, [heatmapData, filterLevel]);

  React.useEffect(() => {
    loadData();
    loadWeather();
    initializeAlertSystem();
    const interval = setInterval(loadData, 5000); // Sync with backend every 5s
    return () => {
      clearInterval(interval);
      AlertTriggerService.disconnect();
    };
  }, []);

  const loadWeather = async () => {
    const data = await weatherService.getCurrentWeather()
    setWeather(data)
  }

  // Initialize alert system
  const initializeAlertSystem = async () => {
    try {
      await AlertTriggerService.initialize('site_admin_dev', ['Unit-1', 'Unit-2', 'Unit-3', 'Unit-4']);
      setAlertStatus('connected');
      console.log('✅ Alert system initialized');

      // Listen for incoming alerts
      AlertTriggerService.onAlert((alert) => {
        console.log('Alert received:', alert);
        setCurrentAlert(alert);
        setAlertVisible(true);
      });

      // Listen for siren activation
      AlertTriggerService.onSirenActivated((data) => {
        console.log('🚨 SIREN ACTIVATED:', data);
        // In a real app, would trigger actual siren device
        setCurrentAlert({
          ...data,
          isSiren: true,
          message: 'SIREN ACTIVATED - All field workers must evacuate immediately!'
        });
        setAlertVisible(true);
      });

      // Listen for siren cancellation
      AlertTriggerService.onSirenCancelled((data) => {
        console.log('Siren cancelled:', data);
        setAlertVisible(false);
      });

      // Listen for connection changes
      AlertTriggerService.onConnectionChange((isConnected) => {
        setAlertStatus(isConnected ? 'connected' : 'disconnected');
      });
    } catch (error) {
      console.error('Failed to initialize alert system:', error);
      setAlertStatus('error');
    }
  };

  // Check risk data for danger zones and trigger alerts
  React.useEffect(() => {
    if (heatmapData.length > 0 && alertStatus === 'connected') {
      AlertTriggerService.checkAndTriggerAlerts(heatmapData, weatherData);
      const status = AlertTriggerService.getStatus();
      setActiveDangerZones(status.activeDangerZones);
    }
  }, [heatmapData, alertStatus]);

  // Handle alert acknowledgment
  const handleAlertAcknowledge = (alertId, workerId) => {
    AlertTriggerService.acknowledgeAlert(alertId, workerId);
  };

  // Handle manual alert trigger (for testing)
  const triggerTestAlert = (zone = 'Unit-3', severity = 3) => {
    AlertTriggerService.triggerManualAlert(zone, severity);
  };
  React.useEffect(() => {
    if (webviewRef.current && heatmapData.length > 0) {
      const jsonCells = JSON.stringify(filteredCells);
      const script = 'if (window.updateMap) { window.updateMap(' + jsonCells + '); }';
      webviewRef.current.injectJavaScript(script);
    }
  }, [filteredCells]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading risk grid data...');
      // Fetch the robust grid from the local engine
      const data = await calculateRiskGrid();
      console.log(`✅ Risk grid calculated: ${data?.grid?.length || 0} cells, max risk: ${data?.stats?.max_risk?.toFixed(2) || 'N/A'}, ML: ${data?.ml_enabled ? 'ON' : 'OFF'}`);
      if (data && data.grid) {
        setHeatmapData(data.grid);
        setWeatherData(data.weather_data);
        setMlEnabled(data.ml_enabled || false);
        console.log(`📊 Heatmap updated with ${data.grid.length} cells`);
      } else {
        console.warn("Received empty grid data");
      }
    } catch (error) {
      console.error("Failed to load map grid:", error);
    }
  };

  const handleWeatherChange = (key, value) => {
    const updated = { ...manualWeather, [key]: value };
    setManualWeather(updated);
    updateManualWeather(updated);
    // Trigger immediate recalculation
    setTimeout(loadData, 300);
  };

  const adjustWeather = (key, delta, min, max) => {
    const next = Math.min(max, Math.max(min, manualWeather[key] + delta));
    handleWeatherChange(key, next);
  };

  const toggleManualMode = () => {
    const newMode = !manualMode;
    setManualMode(newMode);
    setManualWeatherMode(newMode);
    if (newMode) {
      updateManualWeather(manualWeather);
      setShowWeatherControls(true);
      setTimeout(loadData, 200);
    } else {
      setShowWeatherControls(false);
      loadData(); // Reload with live data
    }
  };

  // Generate HTML with Leaflet map and satellite imagery
  const mapHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { margin: 0; padding: 0; background-color: ${COLORS.background}; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-control-attribution { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { 
      zoomControl: false, // Cleaner look
      attributionControl: false 
    }).setView([11.1053, 79.1506], 17); // Zoomed in closer

    // Satellite imagery layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      attribution: 'Esri'
    }).addTo(map);

    let gridLayer = L.layerGroup().addTo(map);

    function getRiskColor(score) {
      if (score >= 0.9) return '${COLORS.danger}'; // Critical
      if (score >= 0.75) return '${COLORS.high || '#FF5722'}'; // High
      if (score >= 0.60) return '${COLORS.warning}'; // Moderate
      return '${COLORS.success}';                 // Low
    }

    // Function to update map data
    window.updateMap = function(cells) {
      gridLayer.clearLayers(); // Clear existing cells

      cells.forEach(cell => {
        // Cell size matches backend generation (0.0005 deg)
        // We add a tiny buffer to overlap and remove gaps
        const halfSize = 0.00026; 
        const bounds = [
          [cell.lat - halfSize, cell.lon - halfSize],
          [cell.lat + halfSize, cell.lon + halfSize]
        ];

        const rectangle = L.rectangle(bounds, {
          color: 'transparent', // No border for seamless look
          fillColor: getRiskColor(cell.risk_score),
          fillOpacity: 0.6, // Transparent as requested
          weight: 0,
          interactive: true
        }).addTo(gridLayer);

        rectangle.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify(cell));
        });
      });
    };

    // Add mine boundary marker (Visual Anchor)
    L.circle([11.1053, 79.1506], {
      color: '${COLORS.mapSlopeBoundary || '#2B9CEF'}',
      fillColor: 'transparent',
      radius: 400,
      weight: 2,
      dashArray: '10, 10',
      opacity: 0.8
    }).addTo(map);
  </script>
</body>
</html>
`;

  const stats = {
    total: heatmapData.length,
    imminent: heatmapData.filter(c => c.risk_score >= 0.75).length,
    high: heatmapData.filter(c => c.risk_score >= 0.60 && c.risk_score < 0.75).length,
    medium: heatmapData.filter(c => c.risk_score >= 0.35 && c.risk_score < 0.60).length,
    low: heatmapData.filter(c => c.risk_score < 0.35).length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Risk Heatmap</Text>
          <Text style={styles.subtitle}>Limestone Mine • 11°06'19"N 79°09'02"E</Text>
          {weather && (
            <Text style={styles.weatherBadge}>{weather.temp} • {weather.rain}</Text>
          )}
        </View>

        <View style={styles.backBtn} />
      </View>

      {/* Statistics Bar */}
      <View style={styles.statsBar}>
        <TouchableOpacity 
          style={[styles.manualModeBtn, manualMode && styles.manualModeBtnActive]}
          onPress={toggleManualMode}
        >
          <Text style={[styles.manualModeBtnText, manualMode && styles.manualModeBtnTextActive]}>
            {manualMode ? '🎮 Manual' : '🌐 Live'}
          </Text>
        </TouchableOpacity>
        {manualMode && (
          <TouchableOpacity 
            style={styles.weatherControlBtn}
            onPress={() => setShowWeatherControls(!showWeatherControls)}
          >
            <Text style={styles.weatherControlBtnText}>
              ⚙️ Weather
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Manual Weather Controls */}
      {manualMode && showWeatherControls && (
        <View style={styles.weatherControls}>
          <Text style={styles.weatherControlsTitle}>Manual Weather Conditions</Text>
  
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>💨 Wind Speed: {manualWeather.wind_speed.toFixed(1)} km/h</Text>
            <View style={styles.stepRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('wind_speed', -2, 0, 60)}><Text style={styles.stepText}>-</Text></TouchableOpacity>
              <Text style={styles.stepValue}>{manualWeather.wind_speed.toFixed(1)}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('wind_speed', 2, 0, 60)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>☀️ Sun Intensity: {(manualWeather.sun * 100).toFixed(0)}%</Text>
            <View style={styles.stepRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('sun', -0.05, 0, 1)}><Text style={styles.stepText}>-</Text></TouchableOpacity>
              <Text style={styles.stepValue}>{(manualWeather.sun * 100).toFixed(0)}%</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('sun', 0.05, 0, 1)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>🌧️ Rain: {manualWeather.rain_mm.toFixed(1)} mm/h</Text>
            <View style={styles.stepRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('rain_mm', -2, 0, 50)}><Text style={styles.stepText}>-</Text></TouchableOpacity>
              <Text style={styles.stepValue}>{manualWeather.rain_mm.toFixed(1)} mm</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('rain_mm', 2, 0, 50)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>💧 Humidity: {manualWeather.humidity.toFixed(0)}%</Text>
            <View style={styles.stepRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('humidity', -5, 0, 100)}><Text style={styles.stepText}>-</Text></TouchableOpacity>
              <Text style={styles.stepValue}>{manualWeather.humidity.toFixed(0)}%</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustWeather('humidity', 5, 0, 100)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.presetButtons}>
            <TouchableOpacity style={styles.presetBtn} onPress={() => {
              const preset = { wind_speed: 5, sun: 0.9, rain_mm: 0, humidity: 40, temperature: 32 };
              setManualWeather(preset);
              updateManualWeather(preset);
              setTimeout(loadData, 300);
            }}>
              <Text style={styles.presetBtnText}>☀️ Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => {
              const preset = { wind_speed: 15, sun: 0.3, rain_mm: 15, humidity: 75, temperature: 26 };
              setManualWeather(preset);
              updateManualWeather(preset);
              setTimeout(loadData, 300);
            }}>
              <Text style={styles.presetBtnText}>🌧️ Rainy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => {
              const preset = { wind_speed: 45, sun: 0.1, rain_mm: 35, humidity: 90, temperature: 24 };
              setManualWeather(preset);
              updateManualWeather(preset);
              setTimeout(loadData, 300);
            }}>
              <Text style={styles.presetBtnText}>⛈️ Storm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Risk Stats Bar */}
      <View style={styles.riskStatsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Cells</Text>
        </View>
        <View style={[styles.statItem, styles.statDivider]}>
          <Text style={[styles.statValue, { color: Colors.riskImminent }]}>{stats.imminent}</Text>
          <Text style={styles.statLabel}>🔴 Danger</Text>
        </View>
        <View style={[styles.statItem, styles.statDivider]}>
          <Text style={[styles.statValue, { color: Colors.riskHigh }]}>{stats.high}</Text>
          <Text style={styles.statLabel}>🟠 High</Text>
        </View>
        <View style={[styles.statItem, styles.statDivider]}>
          <Text style={[styles.statValue, { color: Colors.riskMedium }]}>{stats.medium}</Text>
          <Text style={styles.statLabel}>🟡 Med</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.riskLow }]}>{stats.low}</Text>
          <Text style={styles.statLabel}>🟢 Low</Text>
        </View>
      </View>

      {/* Map with Satellite Imagery */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: mapHTML, baseUrl: 'https://google.com' }} // Hack for Android
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            try {
              const cell = JSON.parse(event.nativeEvent.data);
              setSelectedCell(cell);
            } catch (e) { console.warn(e); }
          }}
          onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
          androidLayerType="hardware"
        />
        {loadingProgress < 1 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading Map... {Math.round(loadingProgress * 100)}%</Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Risk Levels</Text>
        <View style={styles.legendItems}>
          {[
            { label: 'Imminent', color: Colors.riskImminent, count: stats.imminent },
            { label: 'High', color: Colors.riskHigh, count: stats.high },
            { label: 'Medium', color: Colors.riskMedium, count: stats.medium },
            { label: 'Low', color: Colors.riskLow, count: stats.low },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label} ({item.count})</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cell Details Modal */}
      <Modal
        visible={selectedCell !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCell(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCell(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedCell && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Cell {selectedCell.id}</Text>
                    <Text style={styles.modalCoords}>
                      {selectedCell.lat.toFixed(5)}°N, {selectedCell.lon.toFixed(5)}°E
                    </Text>
                  </View>
                  <StatusBadge
                    status={getRiskLevel(selectedCell.risk_score).toLowerCase()}
                    label={getRiskLevel(selectedCell.risk_score)}
                  />
                </View>

                <ScrollView style={styles.detailsScroll}>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Live Risk Score</Text>
                      <Text style={[styles.detailValue, { color: getRiskColor(selectedCell.risk_score) }]}>
                        {(selectedCell.risk_score * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Explainable AI Section */}
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>🤖 AI Analysis</Text>
                    <Text style={styles.explanationText}>
                      {generateRiskExplanation(selectedCell, weatherData)}
                    </Text>
                  </View>

                  {selectedCell.risk_score >= 0.60 && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningTitle}>⚠️ Recommended Actions</Text>
                      <Text style={styles.warningText}>
                        • Restrict access to this zone{'\n'}
                        • Increase monitoring frequency{'\n'}
                        • Prepare evacuation protocols{'\n'}
                        • Alert on-site personnel
                      </Text>
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedCell(null)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        alert={currentAlert}
        workerId="site_admin_dev"
        onAcknowledge={handleAlertAcknowledge}
        onDismiss={() => setAlertVisible(false)}
      />

      {/* Alert Status Badge */}
      {alertStatus === 'connected' && activeDangerZones.length > 0 && (
        <View style={styles.alertStatusBadge}>
          <Text style={styles.alertStatusText}>
            🚨 {activeDangerZones.length} danger zone(s) active
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 9,
    marginTop: 1,
    color: Colors.textSecondary,
  },
  weatherBadge: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    paddingLeft: 8,
  },
  statValue: {
    ...Typography.h3,
    fontSize: 14,
  },
  statLabel: {
    ...Typography.small,
    fontSize: 9,
    marginTop: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendTitle: {
    ...Typography.caption,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    ...Typography.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
  },
  modalCoords: {
    ...Typography.small,
    marginTop: 4,
  },
  detailsScroll: {
    maxHeight: 400,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  detailItem: {
    width: '48%',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  detailLabel: {
    ...Typography.small,
    marginBottom: 4,
  },
  detailValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontSize: 16,
  },
  warningBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.emergency,
  },
  warningTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.emergency,
    marginBottom: 8,
  },
  warningText: {
    ...Typography.caption,
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  manualModeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceNeutral,
    marginRight: 8,
  },
  manualModeBtnActive: {
    backgroundColor: Colors.primary,
  },
  manualModeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  manualModeBtnTextActive: {
    color: '#fff',
  },
  weatherControlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceNeutral,
  },
  weatherControlBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weatherControls: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weatherControlsTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    color: Colors.primary,
  },
  controlRow: {
    marginBottom: Spacing.md,
  },
  controlLabel: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceNeutral,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  stepText: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  stepValue: {
    ...Typography.body,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    marginHorizontal: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  presetBtnText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  explanationBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  explanationTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  explanationText: {
    ...Typography.caption,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  alertStatusBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF1744',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mlStatusBadge: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#6B7280',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    opacity: 0.9,
  },
  mlStatusBadgeActive: {
    backgroundColor: '#10B981',
  },
  mlStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  alertBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
  },
  alertBtnActive: {
    backgroundColor: Colors.danger,
    transform: [{ scale: 0.95 }],
  },
  alertBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  riskStatsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});


