/**
 * QR Scanner Screen for check-in via QR code.
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {Button} from '../components/ui';
import QRScanner from '../components/QRScanner';
import {apiClient} from '../config/api';

interface QRScannerScreenProps {
  navigation: any;
}

const {width} = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

export default function QRScannerScreen({navigation}: QRScannerScreenProps) {
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  const handleScan = async (data: string) => {
    if (processing) return;

    setProcessing(true);
    setScanning(false);

    try {
      // Try to parse QR data
      let visitId = data;
      
      // If QR contains JSON, extract visit_id
      try {
        const parsed = JSON.parse(data);
        visitId = parsed.visit_id || parsed.id || data;
      } catch {
        // Not JSON, use as-is (might be OTP)
      }

      // Attempt check-in
      const response = await apiClient.post(`/checkin/${visitId}`);
      
      setResult({
        success: true,
        message: 'Visitor checked in successfully!',
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Check-in failed. Invalid QR code.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setScanning(true);
  };

  const handleManualEntry = () => {
    navigation.navigate('CheckIn');
  };

  if (result) {
    return (
      <View style={styles.resultContainer}>
        <StatusBar barStyle="light-content" />
        <View
          style={[
            styles.resultIconContainer,
            {backgroundColor: result.success ? colors.success : colors.error},
          ]}>
          <Text style={styles.resultIcon}>{result.success ? '✓' : '✕'}</Text>
        </View>
        <Text style={styles.resultTitle}>
          {result.success ? 'Success!' : 'Failed'}
        </Text>
        <Text style={styles.resultMessage}>{result.message}</Text>

        <View style={styles.resultActions}>
          <Button
            title="Scan Another"
            onPress={handleRetry}
            style={styles.resultButton}
          />
          <Button
            title="Enter OTP Manually"
            onPress={handleManualEntry}
            variant="secondary"
            style={styles.resultButton}
          />
          <Button
            title="Back to Dashboard"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.resultButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {scanning ? (
        <QRScanner
          onScan={handleScan}
          onClose={() => navigation.goBack()}
        />
      ) : (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualEntry}>
          <Text style={styles.manualButtonText}>Enter OTP Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  manualButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  resultIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  resultTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  resultMessage: {
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  resultActions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  resultButton: {
    width: '100%',
  },
});
