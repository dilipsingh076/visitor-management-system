import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {Button, PageHeader, Screen, Text} from '../components/ui';
import {getCachedUser, logout} from '../config/auth';
import {theme} from '../theme';
import {colors} from '../theme/colors';

export default function ProfileScreen({navigation}: {navigation: any}) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { getCachedUser().then(setUser); }, []);

  const handleLogout = async () => {
    await logout();
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="Profile" subtitle="Account and role information." />
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text>{user?.username || '-'}</Text>
          <Text style={styles.label}>Email</Text>
          <Text>{user?.email || '-'}</Text>
          <Text style={styles.label}>Role</Text>
          <Text>{user?.role || user?.roles?.[0] || '-'}</Text>
          <Button title="Change Password" variant="secondary" onPress={() => Alert.alert('Coming soon', 'Change password flow will be added.')} />
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl},
  card: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 8},
  label: {color: colors.muted, marginTop: 8},
});
