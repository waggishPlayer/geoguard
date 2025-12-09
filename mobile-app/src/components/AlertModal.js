import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Vibration, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

/**
 * Modal component for displaying rockfall alerts
 * Shows visual and haptic feedback when danger is detected
 */
export default function AlertModal({ 
  visible, 
  alert, 
  onAcknowledge, 
  onDismiss,
  workerId 
}) {
  const [timeRemaining, setTimeRemaining] = useState(15); // ACK timeout
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!visible || acknowledged) return;

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Vibrate continuously during alert
    const vibrationInterval = setInterval(() => {
      Vibration.vibrate([200, 100, 200, 100]);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(vibrationInterval);
    };
  }, [visible, acknowledged]);

  const handleAcknowledge = () => {
    setAcknowledged(true);
    Vibration.vibrate(100);
    if (onAcknowledge && alert?.alertId && workerId) {
      onAcknowledge(alert.alertId, workerId);
    }
    setTimeout(() => {
      setTimeRemaining(15);
      setAcknowledged(false);
      if (onDismiss) onDismiss();
    }, 1000);
  };

  if (!alert) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 3:
        return '#FF1744'; // Critical - Red
      case 2:
        return '#FF9100'; // High - Orange
      case 1:
        return '#FFEB3B'; // Medium - Yellow
      default:
        return COLORS.secondary;
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 3:
        return '🔴 CRITICAL - EVACUATE NOW';
      case 2:
        return '🟠 HIGH RISK - STAY ALERT';
      case 1:
        return '🟡 MEDIUM RISK - BE CAREFUL';
      default:
        return 'ALERT';
    }
  };

  const severityColor = getSeverityColor(alert.severity);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View 
          style={[
            styles.alertContainer,
            { borderLeftColor: severityColor, borderLeftWidth: 6 }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: severityColor }]}>
            <Ionicons name="alert-circle" size={32} color="white" />
            <Text style={styles.headerText}>{getSeverityLabel(alert.severity)}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Zone Info */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Zone:</Text>
              <Text style={styles.value}>{alert.zone}</Text>
            </View>

            {/* Time Remaining */}
            {!acknowledged && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Acknowledge in:</Text>
                <Text 
                  style={[
                    styles.timerValue,
                    { color: timeRemaining <= 5 ? '#FF1744' : '#FFA500' }
                  ]}
                >
                  {timeRemaining}s
                </Text>
              </View>
            )}

            {/* Message */}
            <View style={styles.messageBox}>
              <Text style={styles.messageTitle}>⚠️ Rockfall Danger Detected</Text>
              <Text style={styles.messageText}>
                High seismic activity and unstable rock formations detected in {alert.zone}. 
                All field workers must be alerted immediately.
              </Text>
              <Text style={styles.messageSubtext}>
                If no acknowledgment is received in {timeRemaining}s, alarm sirens will activate.
              </Text>
            </View>

            {/* Status */}
            {acknowledged ? (
              <View style={styles.acknowledgedBox}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.acknowledgedText}>Alert acknowledged</Text>
              </View>
            ) : (
              <View style={styles.alertingBox}>
                <View style={styles.pulsingDot} />
                <Text style={styles.alertingText}>Waiting for acknowledgments from field workers...</Text>
              </View>
            )}
          </View>

          {/* Footer Actions */}
          {!acknowledged && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.acknowledgeButton]}
                onPress={handleAcknowledge}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.buttonText}>Acknowledge Alert</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dismissButton]}
                onPress={onDismiss}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '90%',
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  content: {
    padding: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  timerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500'
  },
  messageBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9100'
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4
  },
  messageText: {
    fontSize: 12,
    color: '#BF360C',
    lineHeight: 16,
    marginBottom: 8
  },
  messageSubtext: {
    fontSize: 11,
    color: '#D84315',
    fontStyle: 'italic'
  },
  alertingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF1744'
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF1744',
    marginRight: 10,
    opacity: 0.5
  },
  alertingText: {
    flex: 1,
    fontSize: 12,
    color: '#C62828',
    fontWeight: '500'
  },
  acknowledgedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    justifyContent: 'center',
    gap: 8
  },
  acknowledgedText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8
  },
  acknowledgeButton: {
    backgroundColor: '#4CAF50'
  },
  dismissButton: {
    backgroundColor: '#e0e0e0'
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  dismissButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600'
  }
});
