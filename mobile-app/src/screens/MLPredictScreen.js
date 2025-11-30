import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { mlService } from '../services/ml'
import { slopesService } from '../services/slopes'
import { COLORS, getRiskLevel } from '../utils/constants'

export default function MLPredictScreen() {
  const [slopes, setSlopes] = useState([])
  const [selectedSlope, setSelectedSlope] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSlopes()
  }, [])

  const loadSlopes = async () => {
    try {
      const data = await slopesService.getAll()
      setSlopes(data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load slopes')
    }
  }

  const handlePredict = async () => {
    if (!selectedSlope) {
      Alert.alert('Validation', 'Please select a slope')
      return
    }

    setLoading(true)
    try {
      const result = await mlService.predict(selectedSlope, {})
      if (result.ok && result.implemented) {
        setPrediction(result.data)
      } else {
        Alert.alert('Info', result.message || 'ML service not available')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction')
    } finally {
      setLoading(false)
    }
  }

  const riskLevel = prediction ? getRiskLevel(prediction.risk_score) : null

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ML Risk Prediction</Text>
        <Text style={styles.subtitle}>Get AI-powered risk assessment</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Select Slope</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSlope}
              onValueChange={setSelectedSlope}
              style={styles.picker}
            >
              <Picker.Item label="Choose a slope..." value="" />
              {slopes.map((slope) => (
                <Picker.Item key={slope.id} label={slope.name} value={slope.id} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePredict}
            disabled={loading || !selectedSlope}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>Get Risk Prediction</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {prediction && (
        <View style={styles.card}>
          <Text style={styles.title}>Prediction Results</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Risk Score</Text>
              <Text style={styles.resultValue}>
                {(prediction.risk_score * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Risk Level</Text>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: riskLevel?.color || COLORS.warning },
                ]}
              >
                <Text style={styles.riskText}>{riskLevel?.label || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          {prediction.explainability?.top_features && (
            <View style={styles.featuresContainer}>
              <Text style={styles.sectionTitle}>Top Contributing Features</Text>
              {Object.entries(prediction.explainability.top_features)
                .slice(0, 5)
                .map(([key, value]) => (
                  <View key={key} style={styles.featureItem}>
                    <Text style={styles.featureName}>{key}</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(value * 100, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.featureValue}>{(value * 100).toFixed(1)}%</Text>
                  </View>
                ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  picker: {
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  resultItem: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  riskText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  progressBar: {
    flex: 2,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  featureValue: {
    width: 50,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
})

