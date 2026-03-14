/**
 * QR Scanner Screen for check-in via QR code.
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {Button} from '../components/ui';
import QRScanner from '../components/QRScanner';
import {apiClient} from '../config/api';
import {API} from '../lib/api/endpoints';
import {cacheData, getCached} from '../lib/offlineStorage';

interface QRScannerScreenProps {
  navigation: any;
}

export default function QRScannerScreen({navigation}: QRScannerScreenProps) {
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const extractQrCode = (raw: string): {type: 'qr' | 'otp'; value: string} | null => {
    const s = (raw || '').trim();
    if (!s) return null;

    // OTP (6 digits)
    if (/^\d{6}$/.test(s)) {
      return {type: 'otp', value: s};
    }

    // JSON payload
    try {
      const parsed = JSON.parse(s);
      const qr = (parsed.qr_code || parsed.code || parsed.qr || parsed.value || '').toString().trim();
      const otp = (parsed.otp || '').toString().trim();
      if (otp && /^\d{6}$/.test(otp)) return {type: 'otp', value: otp};
      if (qr) return {type: 'qr', value: qr};
    } catch {
      // ignore
    }

    // URL like https://.../qr/<code> or ...?code=<code>
    if (s.startsWith('http://') || s.startsWith('https://')) {
      try {
        const u = new URL(s);
        const q = (u.searchParams.get('code') || '').trim();
        if (q) return {type: 'qr', value: q};
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.findIndex(p => p === 'qr');
        if (idx >= 0 && parts[idx + 1]) return {type: 'qr', value: decodeURIComponent(parts[idx + 1])};
      } catch {
        // ignore
      }
    }

    // Fallback: treat as raw QR code string (e.g. VMS-XXXX...)
    return {type: 'qr', value: s};
  };

  const storeScan = async (entry: any) => {
    const existing = (await getCached<any[]>('visits')) || [];
    const next = [entry, ...existing].slice(0, 100);
    await cacheData('visits', next);
  };

  const handleScan = async (data: string) => {
    if (processing) return;
    if (!consent) {
      Alert.alert(
        'Consent required',
        'Please confirm the visitor consent to data collection (DPDP Act 2023) before checking in.',
      );
      return;
    }

    setProcessing(true);
    setScanning(false);

    try {
      const extracted = extractQrCode(data);
      if (!extracted) {
        throw new Error('Invalid QR/OTP');
      }

      const startedAt = Date.now();
      const payload =
        extracted.type === 'otp'
          ? {otp: extracted.value, consent_given: true}
          : {qr_code: extracted.value, consent_given: true};

      const endpoint = extracted.type === 'otp' ? API.checkin.otp : API.checkin.qr;
      const response = await apiClient.post(endpoint, payload);
      if (response.error || !response.data) {
        throw new Error(response.error || 'Check-in failed');
      }

      await storeScan({
        kind: extracted.type,
        value: extracted.value,
        at: startedAt,
        response: response.data,
      });

      setResult({
        success: true,
        message: (response.data as any).message || 'Visitor checked in successfully!',
        details: response.data,
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

        {result.success && result.details && (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Visitor</Text>
            <Text style={styles.detailsLine}>
              {(result.details.visitor_name || 'Unknown') as string}
              {result.details.visitor_phone ? ` • ${result.details.visitor_phone}` : ''}
            </Text>
            {!!result.details.purpose && (
              <Text style={styles.detailsLine}>Purpose: {String(result.details.purpose)}</Text>
            )}
            {(result.details.host_name || result.details.host_flat_number || result.details.building_name) && (
              <>
                <Text style={[styles.detailsTitle, styles.detailsTitleSpaced]}>Host</Text>
                <Text style={styles.detailsLine}>
                  {result.details.host_name ? String(result.details.host_name) : 'Resident'}
                </Text>
                {(result.details.building_name || result.details.host_flat_number) && (
                  <Text style={styles.detailsLine}>
                    {result.details.building_name ? String(result.details.building_name) : ''}
                    {result.details.host_flat_number ? ` ${String(result.details.host_flat_number)}` : ''}
                  </Text>
                )}
              </>
            )}
          </View>
        )}

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
            title="View Scan History"
            onPress={() => navigation.navigate('ScanHistory')}
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
        <>
          <QRScanner onScan={handleScan} onClose={() => navigation.goBack()} />
          <View style={styles.consentOverlay}>
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setConsent(!consent)}
              activeOpacity={0.8}>
              <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
                {consent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.consentText}>
                Visitor consented to data collection (DPDP Act 2023)
              </Text>
            </TouchableOpacity>
          </View>
        </>
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
  detailsBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: theme.spacing.lg,
  },
  detailsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  detailsTitleSpaced: {
    marginTop: 10,
  },
  detailsLine: {
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  consentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {color: '#fff', fontSize: 14, fontWeight: '700'},
  consentText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
