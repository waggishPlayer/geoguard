import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';

/**
 * Settings Screen for Alert System Configuration
 * Allows configuration for different device roles:
 * - Main App (runs connectivity server)
 * - Field Worker (connects to server)
 * - Siren Device (connects to server)
 */
export default function AlertSettingsScreen({ navigation }) {
  const [deviceRole, setDeviceRole] = useState('main'); // 'main', 'worker', 'siren'
  const [serverIp, setServerIp] = useState('192.168.1.100');
  const [serverPort, setServerPort] = useState('3000');
  const [workerId, setWorkerId] = useState('WORKER_001');
  const [connectionStatus, setConnectionStatus] = useState('Not configured');
  const [zones, setZones] = useState('Unit-1, Unit-2, Unit-3, Unit-4');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('alertSystemSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setDeviceRole(settings.deviceRole || 'main');
        setServerIp(settings.serverIp || '192.168.1.100');
        setServerPort(settings.serverPort || '3000');
        setWorkerId(settings.workerId || 'WORKER_001');
        setZones(settings.zones || 'Unit-1, Unit-2, Unit-3, Unit-4');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        deviceRole,
        serverIp,
        serverPort,
        workerId,
        zones
      };
      await AsyncStorage.setItem('alertSystemSettings', JSON.stringify(settings));
      Alert.alert('Success', `Settings saved!\n\nDevice Role: ${getRoleLabel(deviceRole)}\nServer: ${serverIp}:${serverPort}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'main':
        return 'Main App (Server Host)';
      case 'worker':
        return 'Field Worker';
      case 'siren':
        return 'Siren Device';
      default:
        return 'Unknown';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'main':
        return '🏠 Runs connectivity server. Connected via USB. Controls risk map and broadcasts alerts.';
      case 'worker':
        return '👷 Field worker device. Connects to hotspot. Receives alerts and can acknowledge.';
      case 'siren':
        return '🚨 Alarm device. Connects to hotspot. Activates siren if no acknowledgment in 15 seconds.';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Alert System Setup</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Device Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Device Role</Text>
          <Text style={styles.sectionDescription}>Select this device's role in the alert network</Text>
          
          {['main', 'worker', 'siren'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleButton, deviceRole === role && styles.roleButtonActive]}
              onPress={() => setDeviceRole(role)}
            >
              <View style={[styles.radioButton, deviceRole === role && styles.radioButtonActive]}>
                {deviceRole === role && <View style={styles.radioButtonDot} />}
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{getRoleLabel(role)}</Text>
                <Text style={styles.roleDesc}>{getRoleDescription(role)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Server Configuration */}
        {deviceRole !== 'main' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Server Configuration</Text>
            <Text style={styles.sectionDescription}>IP address of Phone 1 (main app with hotspot)</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Server IP Address</Text>
              <TextInput
                style={styles.input}
                placeholder="192.168.1.100"
                value={serverIp}
                onChangeText={setServerIp}
                placeholderTextColor="#999"
              />
              <Text style={styles.hint}>Find this in Settings → About Phone → IP Address on Phone 1</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Server Port</Text>
              <TextInput
                style={styles.input}
                placeholder="3000"
                value={serverPort}
                onChangeText={setServerPort}
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        )}

        {/* Worker Settings */}
        {deviceRole === 'worker' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👷 Field Worker Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Worker ID</Text>
              <TextInput
                style={styles.input}
                placeholder="WORKER_001"
                value={workerId}
                onChangeText={setWorkerId}
                placeholderTextColor="#999"
              />
              <Text style={styles.hint}>Unique identifier (name, employee ID, etc.)</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monitored Zones</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Unit-1, Unit-2, Unit-3, Unit-4"
                value={zones}
                onChangeText={setZones}
                placeholderTextColor="#999"
                multiline
              />
              <Text style={styles.hint}>Comma-separated list of zones this worker monitors</Text>
            </View>
          </View>
        )}

        {/* Siren Settings */}
        {deviceRole === 'siren' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Siren Device Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monitored Zones</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Unit-1, Unit-2, Unit-3, Unit-4"
                value={zones}
                onChangeText={setZones}
                placeholderTextColor="#999"
                multiline
              />
              <Text style={styles.hint}>Zones that will trigger siren activation</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ How Siren Works:</Text>
              <Text style={styles.infoText}>
                1. Alert triggered in any monitored zone{'\n'}
                2. Field workers have 15 seconds to acknowledge{'\n'}
                3. If no acknowledgment → Siren activates{'\n'}
                4. Continuous alarm until manually stopped
              </Text>
            </View>
          </View>
        )}

        {/* Main App Settings */}
        {deviceRole === 'main' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏠 Main App Settings</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Setup Instructions:</Text>
              <Text style={styles.infoText}>
                1. Enable WiFi Hotspot on this phone{'\n'}
                2. Share hotspot name and password with other phones{'\n'}
                3. Other phones connect to hotspot{'\n'}
                4. Other phones will connect to server at this IP
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Find Your IP Address:</Text>
              <Text style={styles.infoText}>
                Settings → About Phone → Status → IP Address{'\n'}
                Usually looks like: 192.168.1.100
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Hotspot Setup:</Text>
              <Text style={styles.infoText}>
                Settings → Network & Internet → Hotspot & Tethering{'\n'}
                Turn on WiFi Hotspot{'\n'}
                Share the network name and password with field workers
              </Text>
            </View>
          </View>
        )}

        {/* Test Connection */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.testButton} onPress={() => {
            Alert.alert(
              'Test Connection',
              `Device Role: ${getRoleLabel(deviceRole)}\nServer: ${serverIp}:${serverPort}\n\nThis button will be enabled after configuration.`,
              [{ text: 'OK' }]
            );
          }}>
            <Text style={styles.testButtonText}>🔌 Test Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>💾 Save Settings</Text>
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Settings are saved locally on this device.{'\n'}
            Make sure all devices are on the same WiFi network.
          </Text>
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
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
  },
  radioButtonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#BF360C',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
