import io from 'socket.io-client';
import { Alert } from 'react-native';

/**
 * Service to integrate RiskEngine with the Alert System
 * Monitors risk map and triggers alerts when danger zones are detected
 * 
 * Multi-phone setup support:
 * - Phone 1 (USB): Main app + Server (runs connectivity server)
 * - Phone 2 (Hotspot): Field worker (connects to server)
 * - Phone 3 (Hotspot): Siren device (connects to server)
 */
class AlertTriggerService {
  constructor(serverUrl = null) {
    // Auto-detect server URL based on environment
    this.serverUrl = serverUrl || this._getServerUrl();
    this.socket = null;
    this.isConnected = false;
    this.dangerZones = new Map(); // Track active danger zones
    this.riskThreshold = 0.7; // Risk score threshold for danger (0-1)
    this.listeners = {
      onAlert: null,
      onSirenActivated: null,
      onSirenCancelled: null,
      onConnectionChange: null
    };
  }

  /**
   * Auto-detect server URL based on environment
   * For multi-phone setup on hotspot, use device's local IP
   */
  _getServerUrl() {
    // Default for physical hotspot (common Android hotspot gateway)
    // If you need a different IP, change this string to your Phone 1 hotspot IP.
    return '192.168.43.1:3000';
  }

  /**
   * Set server URL for multi-phone deployment
   * @param {string} ip - Local network IP (e.g., '192.168.1.100')
   * @param {number} port - Server port (default 3000)
   */
  setServerUrl(ip, port = 3000) {
    this.serverUrl = `${ip}:${port}`;
    console.log(`Alert server URL set to: ${this.serverUrl}`);
  }

  /**
   * Initialize connection to alert system
   * @param {string} workerId - Unique worker identifier
   * @param {string[]} zones - Mine zones this worker monitors
   */
  async initialize(workerId, zones = ['Unit-1', 'Unit-2', 'Unit-3']) {
    return new Promise((resolve, reject) => {
      try {
        // Connect to alert system server
        this.socket = io(`http://${this.serverUrl}`, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling']
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('✅ Connected to Alert System');
          this.isConnected = true;

          // Register as worker band
          this.socket.emit('register', {
            role: 'band',
            zones,
            workerId
          });

          if (this.listeners.onConnectionChange) {
            this.listeners.onConnectionChange(true);
          }
          resolve(true);
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Disconnected from Alert System');
          this.isConnected = false;
          if (this.listeners.onConnectionChange) {
            this.listeners.onConnectionChange(false);
          }
        });

        // Alert received
        this.socket.on('alert', (alert) => {
          console.log('🚨 Alert received:', alert);
          this._handleAlert(alert);
        });

        // Siren activated
        this.socket.on('siren', (data) => {
          console.log('📢 Siren activated:', data);
          this._handleSirenActivated(data);
        });

        // Siren cancelled
        this.socket.on('sirenCancel', (data) => {
          console.log('🔕 Siren cancelled:', data);
          this._handleSirenCancelled(data);
        });

        this.socket.on('error', (error) => {
          console.error('Alert system error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Failed to initialize AlertTriggerService:', error);
        reject(error);
      }
    });
  }

  /**
   * Monitor risk map and trigger alerts automatically
   * Called from MapScreen when risk data updates
   * @param {Array} riskGrid - Grid of risk cells from RiskEngine
   * @param {number} weatherData - Current weather data
   */
  checkAndTriggerAlerts(riskGrid, weatherData = {}) {
    if (!this.isConnected) {
      console.warn('Alert system not connected, cannot trigger alerts');
      return;
    }

    // Define danger zones based on mine structure
    const dangerZones = {
      'Unit-1': { row_min: 0, row_max: 2, col_min: 0, col_max: 2 },
      'Unit-2': { row_min: 0, row_max: 2, col_min: 3, col_max: 5 },
      'Unit-3': { row_min: 3, row_max: 5, col_min: 0, col_max: 2 },
      'Unit-4': { row_min: 3, row_max: 5, col_min: 3, col_max: 5 }
    };

    // Check each zone for danger
    Object.entries(dangerZones).forEach(([zoneName, bounds]) => {
      const maxRiskInZone = this._getMaxRiskInZone(riskGrid, bounds);
      const isCurrentlyDanger = maxRiskInZone >= this.riskThreshold;
      const wasPreviousDanger = this.dangerZones.has(zoneName);

      // Trigger alert if zone entered danger state
      if (isCurrentlyDanger && !wasPreviousDanger) {
        this._triggerAlertForZone(zoneName, maxRiskInZone);
        this.dangerZones.set(zoneName, {
          riskScore: maxRiskInZone,
          triggeredAt: Date.now(),
          weatherData
        });
      }
      // Update existing danger zone
      else if (isCurrentlyDanger && wasPreviousDanger) {
        this.dangerZones.set(zoneName, {
          riskScore: maxRiskInZone,
          triggeredAt: this.dangerZones.get(zoneName).triggeredAt,
          weatherData
        });
      }
      // Clear zone if risk lowered
      else if (!isCurrentlyDanger && wasPreviousDanger) {
        console.log(`✅ Zone ${zoneName} cleared (risk: ${maxRiskInZone.toFixed(2)})`);
        this.dangerZones.delete(zoneName);
      }
    });
  }

  /**
   * Manually trigger alert for testing
   * @param {string} zone - Zone name (e.g., 'Unit-3')
   * @param {number} severity - Severity 1-3
   */
  triggerManualAlert(zone, severity = 3) {
    if (!this.isConnected) {
      Alert.alert('Error', 'Alert system not connected');
      return;
    }

    this.socket.emit('createAlert', {
      zone,
      severity
    });

    console.log(`Manual alert triggered for ${zone}`);
  }

  /**
   * Send acknowledgment that worker received alert
   * @param {string} alertId - Alert identifier
   * @param {string} workerId - Worker ID
   */
  acknowledgeAlert(alertId, workerId) {
    if (!this.isConnected) {
      console.warn('Cannot acknowledge - not connected');
      return;
    }

    this.socket.emit('ack', {
      alertId,
      workerId
    });

    console.log(`✅ Alert acknowledged by ${workerId}`);
  }

  /**
   * Register listener for alerts
   */
  onAlert(callback) {
    this.listeners.onAlert = callback;
  }

  /**
   * Register listener for siren activation
   */
  onSirenActivated(callback) {
    this.listeners.onSirenActivated = callback;
  }

  /**
   * Register listener for siren cancellation
   */
  onSirenCancelled(callback) {
    this.listeners.onSirenCancelled = callback;
  }

  /**
   * Register listener for connection changes
   */
  onConnectionChange(callback) {
    this.listeners.onConnectionChange = callback;
  }

  /**
   * Disconnect from alert system
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Private methods

  _getMaxRiskInZone(riskGrid, bounds) {
    let maxRisk = 0;
    for (let row = bounds.row_min; row <= bounds.row_max && row < riskGrid.length; row++) {
      for (let col = bounds.col_min; col <= bounds.col_max && col < riskGrid[row].length; col++) {
        const cell = riskGrid[row][col];
        const risk = (cell.static_risk + cell.dynamic_risk) / 2;
        maxRisk = Math.max(maxRisk, risk);
      }
    }
    return maxRisk;
  }

  _triggerAlertForZone(zone, riskScore) {
    const severity = this._calculateSeverity(riskScore);
    console.log(`🚨 DANGER ZONE ALERT: ${zone} (Risk: ${riskScore.toFixed(2)}, Severity: ${severity})`);

    this.socket.emit('createAlert', {
      zone,
      severity,
      metadata: {
        source: 'RISK_MAP',
        riskScore,
        timestamp: Date.now(),
        autoTriggered: true
      }
    });
  }

  _calculateSeverity(riskScore) {
    if (riskScore >= 0.9) return 3; // Critical
    if (riskScore >= 0.8) return 2; // High
    return 1; // Medium
  }

  _handleAlert(alert) {
    if (this.listeners.onAlert) {
      this.listeners.onAlert(alert);
    }
  }

  _handleSirenActivated(data) {
    console.log('🔔 SIREN ACTIVATED - Field workers must be alerted!');
    if (this.listeners.onSirenActivated) {
      this.listeners.onSirenActivated(data);
    }
  }

  _handleSirenCancelled(data) {
    console.log('🔕 Siren cancelled');
    if (this.listeners.onSirenCancelled) {
      this.listeners.onSirenCancelled(data);
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      activeDangerZones: Array.from(this.dangerZones.entries()).map(([zone, data]) => ({
        zone,
        ...data
      }))
    };
  }
}

export default new AlertTriggerService();
