/**
 * Society user management — web `/admin/users` parity (GET/POST /users).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Screen,
  StateMessage,
  Text,
} from '../components/ui';
import { apiClient } from '../config/api';
import { theme, useTheme } from '../theme';

type SocietyUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  roles: string[];
  phone?: string | null;
  flat_number?: string | null;
};

const CREATE_ROLES = [
  { key: 'resident', label: 'Resident' },
  { key: 'guard', label: 'Guard' },
  { key: 'chairman', label: 'Chairman' },
  { key: 'secretary', label: 'Secretary' },
  { key: 'treasurer', label: 'Treasurer' },
] as const;

export default function SocietyUsersScreen() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<SocietyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('resident');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SocietyUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<string>('resident');
  const [patching, setPatching] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const res = await apiClient.get<SocietyUser[]>('/users/');
    if (res.error) setError(res.error);
    else setUsers(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!email.trim() || !fullName.trim() || password.length < 6) {
      Alert.alert(
        'Missing fields',
        'Email, full name, and password (min 6 characters) are required.',
      );
      return;
    }
    setSaving(true);
    const res = await apiClient.post<SocietyUser>('/users/', {
      email: email.trim(),
      full_name: fullName.trim(),
      password,
      role,
      phone: phone.trim() || undefined,
    });
    setSaving(false);
    if (res.error) {
      Alert.alert('Could not create user', res.error);
      return;
    }
    setEmail('');
    setFullName('');
    setPassword('');
    setPhone('');
    setRole('resident');
    setShowForm(false);
    await load();
    Alert.alert('Created', 'The user has been added to your society.');
  };

  const openEdit = (u: SocietyUser) => {
    setEditing(u);
    setEditName(u.full_name);
    setEditPhone(u.phone?.trim() || '');
    const r = u.roles?.[0] || u.role || 'resident';
    setEditRole(
      CREATE_ROLES.some((x) => x.key === r) ? r : 'resident',
    );
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editName.trim()) {
      Alert.alert('Name required', 'Enter a full name.');
      return;
    }
    setPatching(true);
    const res = await apiClient.patch<SocietyUser>(`/users/${editing.id}`, {
      full_name: editName.trim(),
      phone: editPhone.trim() || null,
      roles: [editRole],
    });
    setPatching(false);
    if (res.error) {
      Alert.alert('Update failed', res.error);
      return;
    }
    setEditing(null);
    await load();
    Alert.alert('Saved', 'User updated.');
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { paddingBottom: theme.spacing.lg },
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: theme.spacing.md,
        },
        chip: {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        chipOn: {
          borderColor: colors.primary,
          backgroundColor: colors.primary + '18',
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          padding: theme.spacing.lg,
        },
        modalCard: {
          backgroundColor: colors.card,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          maxHeight: '90%',
        },
        rowMeta: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
        pill: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.mutedBg,
        },
      }),
    [colors],
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader
          title="User management"
          subtitle="List and create society members (web admin/users)."
        />
        <StateMessage kind="info" text="Loading…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <PageHeader
          title="User management"
          subtitle="Committee-only. Matches the web Society → Management screen."
        />
        {error ? <StateMessage kind="error" text={error} /> : null}

        <Button
          title={showForm ? 'Hide form' : '+ Add user'}
          variant="secondary"
          onPress={() => setShowForm(!showForm)}
        />

        {showForm ? (
          <Card style={{ marginTop: theme.spacing.md }}>
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label="Temporary password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Input
              label="Phone (optional)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Text variant="caption" muted style={{ marginBottom: 8 }}>
              Role
            </Text>
            <View style={styles.chipRow}>
              {CREATE_ROLES.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.chip, role === r.key && styles.chipOn]}
                  onPress={() => setRole(r.key)}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Create user" onPress={submit} loading={saving} />
          </Card>
        ) : null}

        <Text
          variant="label"
          style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}
        >
          Members ({users.length})
        </Text>
        {users.length === 0 ? (
          <StateMessage
            kind="info"
            text="No users returned. Check society/admin permissions."
          />
        ) : (
          users.map((u) => (
            <TouchableOpacity
              key={u.id}
              activeOpacity={0.85}
              onPress={() => openEdit(u)}
            >
            <Card style={{ marginBottom: theme.spacing.md }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>
                {u.full_name}
              </Text>
              <Text muted style={{ marginTop: 4 }}>
                {u.email}
              </Text>
              <View style={styles.rowMeta}>
                <View style={styles.pill}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                    {u.role}
                  </Text>
                </View>
                {u.flat_number ? (
                  <View style={styles.pill}>
                    <Text style={{ fontSize: 12, color: colors.text }}>Flat {u.flat_number}</Text>
                  </View>
                ) : null}
              </View>
              {u.phone ? (
                <Text variant="caption" muted style={{ marginTop: 6 }}>
                  {u.phone}
                </Text>
              ) : null}
            </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalCard}>
            <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
              Edit user
            </Text>
            {editing ? (
              <Text muted style={{ marginBottom: theme.spacing.md }}>
                {editing.email}
              </Text>
            ) : null}
            <Input
              label="Full name"
              value={editName}
              onChangeText={setEditName}
            />
            <Input
              label="Phone"
              keyboardType="phone-pad"
              value={editPhone}
              onChangeText={setEditPhone}
            />
            <Text variant="caption" muted style={{ marginBottom: 8 }}>
              Role
            </Text>
            <View style={styles.chipRow}>
              {CREATE_ROLES.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.chip, editRole === r.key && styles.chipOn]}
                  onPress={() => setEditRole(r.key)}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: theme.spacing.md }}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setEditing(null)}
              />
              <Button
                title="Save"
                onPress={saveEdit}
                loading={patching}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
