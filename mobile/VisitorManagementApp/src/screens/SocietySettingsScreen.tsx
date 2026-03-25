import React, {useState} from 'react';
import {ScrollView, StyleSheet, Switch, View} from 'react-native';
import {Button, PageHeader, Screen, StateMessage, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';
import {canAccessCommitteeFeatures, getCachedUser} from '../config/auth';

export default function SocietySettingsScreen() {
  const [allowWalkins, setAllowWalkins] = useState(true);
  const [otpRequired, setOtpRequired] = useState(true);
  const [notifyResidents, setNotifyResidents] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getCachedUser().then((u) => {
      setAllowed(canAccessCommitteeFeatures(u));
      setLoading(false);
    });
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Society Settings" subtitle="Configure visitor and security preferences." />
        {!allowed ? <StateMessage kind="error" text="Committee access required." /> : null}
        {loading ? <StateMessage text="Loading settings..." /> : null}
        {!allowed || loading ? null : (
          <View style={styles.card}>
          <View style={styles.row}><Text>Allow Walk-ins</Text><Switch value={allowWalkins} onValueChange={setAllowWalkins} /></View>
          <View style={styles.row}><Text>Require OTP</Text><Switch value={otpRequired} onValueChange={setOtpRequired} /></View>
          <View style={styles.row}><Text>Notify Residents</Text><Switch value={notifyResidents} onValueChange={setNotifyResidents} /></View>
          <Button title="Save Settings" onPress={() => {}} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl},
  card: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 10},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
});
