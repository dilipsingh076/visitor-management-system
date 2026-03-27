import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Input, Screen, Text} from '../components/ui';
import {AppIcon} from '../components/icons/AppIcon';
import {getCachedUser, logout, updateProfile} from '../config/auth';
import {theme, useTheme} from '../theme';

export default function ProfileScreen({navigation}: {navigation: any}) {
  const {colors} = useTheme();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  useEffect(() => {
    getCachedUser().then(setUser);
  }, []);

  const openEdit = () => {
    setFormError(undefined);
    setDraftName(user?.username || '');
    setDraftEmail(user?.email || '');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormError(undefined);
  };

  const saveProfile = async () => {
    const name = draftName.trim();
    const email = draftEmail.trim().toLowerCase();
    if (!name) {
      setFormError('Name is required');
      return;
    }
    if (!email) {
      setFormError('Email is required');
      return;
    }
    setSaving(true);
    setFormError(undefined);
    const {user: next, error} = await updateProfile({
      full_name: name,
      email: email,
    });
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    if (next) {
      setUser(next);
    }
    setEditing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        },
        subtitle: {
          color: colors.textSecondary,
          fontSize: theme.fontSize.sm,
          marginBottom: 16,
        },
        avatarSection: {
          alignItems: 'center',
          marginBottom: 24,
        },
        avatarCircle: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        },
        avatarText: {
          color: '#FFFFFF',
          fontSize: 28,
          fontWeight: '700',
        },
        avatarName: {
          fontSize: theme.fontSize.xl,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 2,
        },
        avatarEmail: {
          fontSize: theme.fontSize.sm,
          color: colors.textSecondary,
        },
        sectionLabel: {
          fontSize: theme.fontSize.xs,
          fontWeight: '600',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 8,
          marginTop: 8,
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: 24,
        },
        fieldRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        fieldSeparator: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginLeft: 52,
        },
        fieldIcon: {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.mutedBg,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        fieldContent: {
          flex: 1,
        },
        fieldLabel: {
          fontSize: theme.fontSize.xs,
          color: colors.textSecondary,
          marginBottom: 2,
        },
        fieldValue: {
          fontSize: theme.fontSize.md,
          fontWeight: '500',
          color: colors.text,
        },
        actionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        actionIcon: {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.mutedBg,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        actionText: {
          flex: 1,
          fontSize: theme.fontSize.md,
          fontWeight: '500',
          color: colors.text,
        },
        chevron: {
          marginLeft: 8,
        },
        logoutButton: {
          marginTop: 8,
        },
        editActions: {
          flexDirection: 'row',
          gap: 12,
          marginTop: 12,
        },
        editButton: {
          flex: 1,
        },
      }),
    [colors],
  );

  const fields = [
    {icon: 'account-outline', label: 'Name', value: user?.username || '-'},
    {icon: 'email-outline', label: 'Email', value: user?.email || '-'},
    {icon: 'shield-account-outline', label: 'Role', value: user?.role || user?.roles?.[0] || '-'},
    ...(user?.flat_number
      ? [{icon: 'home-outline', label: 'Flat', value: user.flat_number}]
      : []),
    ...(user?.society?.name
      ? [{icon: 'office-building-outline', label: 'Society', value: user.society.name}]
      : []),
  ];

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'ios'
          ? {contentInsetAdjustmentBehavior: 'never' as const}
          : {})}
      >
        <Text variant="title" style={{color: colors.foreground}}>Profile</Text>
        <Text style={styles.subtitle}>Account and role information.</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.username)}</Text>
          </View>
          <Text style={styles.avatarName}>{user?.username || '-'}</Text>
          <Text style={styles.avatarEmail}>{user?.email || '-'}</Text>
        </View>

        {/* Info card */}
        <Text style={styles.sectionLabel}>Personal info</Text>
        {editing ? (
          <View style={styles.card}>
            <View style={{paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8}}>
              <Input
                label="Name"
                value={draftName}
                onChangeText={setDraftName}
                autoCapitalize="words"
                editable={!saving}
              />
              <Input
                label="Email"
                value={draftEmail}
                onChangeText={setDraftEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!saving}
              />
              {formError ? (
                <Text style={{color: colors.error, fontSize: 13, marginBottom: 8}}>
                  {formError}
                </Text>
              ) : null}
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={cancelEdit}
                  disabled={saving}
                  style={styles.editButton}
                />
                <Button
                  title="Save"
                  onPress={saveProfile}
                  disabled={saving}
                  style={styles.editButton}
                />
              </View>
              {saving ? (
                <ActivityIndicator style={{marginTop: 12}} color={colors.primary} />
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            {fields.map((f, i) => (
              <React.Fragment key={f.label}>
                {i > 0 && <View style={styles.fieldSeparator} />}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIcon}>
                    <AppIcon name={f.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <Text style={styles.fieldValue}>{f.value}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Actions card */}
        <Text style={styles.sectionLabel}>Actions</Text>
        <View style={styles.card}>
          {!editing && (
            <>
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={openEdit}
              >
                <View style={styles.actionIcon}>
                  <AppIcon name="account-edit-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Edit profile</Text>
                <AppIcon name="chevron-right" size={20} color={colors.muted} />
              </TouchableOpacity>
              <View style={styles.fieldSeparator} />
            </>
          )}
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Coming soon',
                'Change password flow will be added.',
              )
            }
          >
            <View style={styles.actionIcon}>
              <AppIcon name="lock-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Change Password</Text>
            <AppIcon
              name="chevron-right"
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
          <View style={styles.fieldSeparator} />
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.actionIcon}>
              <AppIcon name="cog-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Settings</Text>
            <AppIcon
              name="chevron-right"
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </Screen>
  );
}
