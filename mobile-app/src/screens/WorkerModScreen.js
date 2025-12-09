import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import AlertTriggerService from '../services/AlertTriggerService';

/**
 * Worker/Siren Mode Screen
 * Simplified UI for field workers and siren devices
 */
export default function WorkerModScreen() {
  const [deviceRole, setDeviceRole] = useState('worker');
  const [workerId, setWorkerId] = useState('WORKER_001');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertActive, setAlertActive] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [serverIp, setServerIp] = useState('192.168.1.100');

  useEffect(() => {
    loadSettings();
    initializeAlert();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('alertSystemSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setDeviceRole(settings.deviceRole || 'worker');
        setWorkerId(settings.workerId || 'WORKER_001');
        setServerIp(settings.serverIp || '192.168.1.100');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const initializeAlert = async () => {
    try {
      const saved = await AsyncStorage.getItem('alertSystemSettings');
      const settings = saved ? JSON.parse(saved) : {};
      
      const serverUrl = `${settings.serverIp || '192.168.1.100'}:3000`;
      
      // Create appropriate service instance
      if (deviceRole === 'worker') {
        await AlertTriggerService.initialize(
          settings.workerId || 'WORKER_001',
          (settings.zones || 'Unit-1, Unit-2, Unit-3, Unit-4').split(',').map(z => z.trim())
        );
      } else if (deviceRole === 'siren') {
        await AlertTriggerService.initialize(
          'SIREN_DEVICE',
          (settings.zones || 'Unit-1, Unit-2, Unit-3, Unit-4').split(',').map(z => z.trim())
        );
      }

      setConnectionStatus('connected');

      // Listen for alerts
      AlertTriggerService.onAlert((alert) => {
        console.log('Alert received:', alert);
        setCurrentAlert(alert);
        setAlertActive(true);
        Vibration.vibrate([200, 100, 200, 100]);
      });

      // Listen for siren activation
      AlertTriggerService.onSirenActivated((data) => {
        console.log('SIREN ACTIVATED');
        setSirenActive(true);
        setCurrentAlert(data);
        // Continuous vibration
        const vibrationPattern = [];
        for (let i = 0; i < 10; i++) {
          vibrationPattern.push(300, 200);
        }
        Vibration.vibrate(vibrationPattern);
      });

      // Listen for siren cancel
      AlertTriggerService.onSirenCancelled(() => {
        setSirenActive(false);
      });

      AlertTriggerService.onConnectionChange((isConnected) => {
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      });
    } catch (error) {
      console.error('Failed to initialize alert system:', error);
      setConnectionStatus('error');
    }
  };

  const handleAcknowledgeAlert = () => {
    if (currentAlert && deviceRole === 'worker') {
      AlertTriggerService.acknowledgeAlert(currentAlert.alertId, workerId);
      setAlertActive(false);
      setCurrentAlert(null);
      Alert.alert('Acknowledged', 'Alert has been acknowledged');
    }
  };

  const handleStopSiren = () => {
    if (sirenActive && deviceRole === 'siren') {
      setSirenActive(false);
      setAlertActive(false);
      setCurrentAlert(null);
      Alert.alert('Siren Stopped', 'Alarm has been manually stopped');
    }
  };

  if (deviceRole === 'worker') {
    return <WorkerView 
      workerId={workerId}
      connectionStatus={connectionStatus}
      currentAlert={currentAlert}
      alertActive={alertActive}
      onAcknowledge={handleAcknowledgeAlert}
    />;
  } else if (deviceRole === 'siren') {
    return <SirenView 
      connectionStatus={connectionStatus}
      currentAlert={currentAlert}
      sirenActive={sirenActive}
      onStopSiren={handleStopSiren}
    />;
  }

  return null;
}

/**
 * Worker View Component
 */
function WorkerView({ workerId, connectionStatus, currentAlert, alertActive, onAcknowledge }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[
          styles.header,
          { backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : '#F44336' }
        ]}>
          <Ionicons 
            name={connectionStatus === 'connected' ? 'wifi' : 'wifi-off'} 
            size={32} 
            color="white" 
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Field Worker Mode</Text>
            <Text style={styles.headerSubtitle}>{workerId}</Text>
            <Text style={styles.headerStatus}>
              {connectionStatus === 'connected' ? '🟢 Connected to Server' : '🔴 Disconnected'}
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[
            styles.statusBox,
            { backgroundColor: connectionStatus === 'connected' ? '#E8F5E9' : '#FFEBEE' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: connectionStatus === 'connected' ? '#2E7D32' : '#C62828' }
            ]}>
              {connectionStatus === 'connected' 
                ? '✅ Connected - Waiting for alerts...'
                : '❌ Disconnected - Check network'
              }
            </Text>
          </View>
        </View>

        {/* Alert Section */}
        {alertActive && currentAlert && (
          <View style={[styles.alertSection, styles.alertActive]}>
            <Text style={styles.sectionTitle}>🚨 ALERT RECEIVED</Text>
            
            <View style={styles.alertBox}>
              <Text style={styles.alertZone}>Zone: {currentAlert.zone}</Text>
              <Text style={styles.alertSeverity}>Severity: {currentAlert.severity}/3</Text>
              <Text style={styles.alertTime}>
                {new Date(currentAlert.timestamp).toLocaleTimeString()}
              </Text>

              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  ⚠️ Rockfall danger detected in {currentAlert.zone}. All workers must be alert. 
                  Acknowledge this alert to prevent siren activation.
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.acknowledgeButton}
                onPress={onAcknowledge}
              >
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text style={styles.acknowledgeButtonText}>Acknowledge Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!alertActive && (
          <View style={styles.waitingSection}>
            <Ionicons name="shield-checkmark" size={64} color="#4CAF50" />
            <Text style={styles.waitingTitle}>All Clear</Text>
            <Text style={styles.waitingText}>No active alerts. Stay safe!</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              1. Keep your phone on and nearby{'\n'}
              2. When alert appears, read immediately{'\n'}
              3. Tap "Acknowledge Alert" to confirm{'\n'}
              4. Wait for all-clear signal{'\n'}
              5. Follow supervisor instructions
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Siren View Component
 */
function SirenView({ connectionStatus, currentAlert, sirenActive, onStopSiren }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[
          styles.header,
          { backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : '#F44336' }
        ]}>
          <Ionicons 
            name={connectionStatus === 'connected' ? 'wifi' : 'wifi-off'} 
            size={32} 
            color="white" 
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Siren Device Mode</Text>
            <Text style={styles.headerSubtitle}>Emergency Alarm</Text>
            <Text style={styles.headerStatus}>
              {connectionStatus === 'connected' ? '🟢 Connected to Server' : '🔴 Disconnected'}
            </Text>
          </View>
        </View>

        {/* Siren Status */}
        {sirenActive ? (
          <View style={[styles.sirenActiveSection]}>
            <View style={styles.pulsingCircle}>
              <Ionicons name="alert" size={80} color="#FF1744" />
            </View>
            
            <Text style={styles.sirenTitle}>🚨 SIREN ACTIVATED 🚨</Text>
            <Text style={styles.sirenSubtitle}>EMERGENCY ALARM ACTIVE</Text>

            {currentAlert && (
              <View style={styles.alertDetailsBox}>
                <Text style={styles.alertDetailsText}>
                  Zone: {currentAlert.zone}
                </Text>
                <Text style={styles.alertDetailsText}>
                  Severity: {currentAlert.severity}/3
                </Text>
                <Text style={styles.alertDetailsText}>
                  Time: {new Date(currentAlert.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.stopButton}
              onPress={onStopSiren}
            >
              <Ionicons name="close" size={32} color="white" />
              <Text style={styles.stopButtonText}>STOP SIREN</Text>
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Siren has been manually stopped.{'\n'}
                Notify supervisor immediately.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.sirenReadySection}>
            <Ionicons name="shield" size={64} color="#FF9800" />
            <Text style={styles.readyTitle}>Siren Ready</Text>
            <Text style={styles.readyText}>Waiting for alert timeout...</Text>
            <Text style={styles.readySubtext}>
              If field workers don't acknowledge an alert within 15 seconds, this siren will activate automatically.
            </Text>
          </View>
        )}

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <View style={[
            styles.statusBox,
            { backgroundColor: connectionStatus === 'connected' ? '#E8F5E9' : '#FFEBEE' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: connectionStatus === 'connected' ? '#2E7D32' : '#C62828' }
            ]}>
              {connectionStatus === 'connected' 
                ? '✅ Connected - Monitoring alerts...'
                : '❌ Disconnected - Check network'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statusSection: {
    marginBottom: 24,
  },
  sirenActiveSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sirenReadySection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  pulsingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FF1744',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  statusBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  alertSection: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  alertActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#FF1744',
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  alertZone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  alertSeverity: {
    fontSize: 14,
    color: COLORS.warning,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  descriptionBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  stopButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  waitingSection: {
    alignItems: 'center',
    marginVertical: 48,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 16,
  },
  readyText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 8,
  },
  readySubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  sirenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF1744',
    marginBottom: 8,
  },
  sirenSubtitle: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
  },
  alertDetailsBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  alertDetailsText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 16,
  },
  instructionBox: {
    backgroundColor: COLORS.background,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
});
