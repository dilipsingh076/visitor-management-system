import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {PageHeader, Screen, Text} from '../components/ui';
import {theme} from '../theme';
import {colors} from '../theme/colors';

const LINKS = [
  {route: 'VisitorsList', label: 'Visitors'},
  {route: 'Notifications', label: 'Notifications'},
  {route: 'MyFlat', label: 'My Flat'},
  {route: 'FrequentVisitors', label: 'Frequent Visitors'},
  {route: 'Amenities', label: 'Amenities'},
  {route: 'ComplaintsAdmin', label: 'Admin Complaints'},
  {route: 'StaffDirectory', label: 'Staff Directory'},
  {route: 'Buildings', label: 'Buildings'},
  {route: 'NearbyPlaces', label: 'Nearby Places'},
  {route: 'Meetings', label: 'Meetings'},
  {route: 'SocietySettings', label: 'Society Settings'},
  {route: 'NoticeCreation', label: 'Create Notice'},
  {route: 'Profile', label: 'Profile'},
];

export default function MoreScreen({navigation}: {navigation: any}) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHeader title="All Features" subtitle="Quick access to every mobile module." />
        {LINKS.map((link) => (
          <TouchableOpacity key={link.route} onPress={() => navigation.navigate(link.route)} style={styles.item}>
            <View>
              <Text style={styles.itemText}>{link.label}</Text>
              <Text muted>{link.route}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: 10},
  item: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  itemText: {color: colors.foreground, fontWeight: '700'},
  arrow: {color: colors.primary, fontSize: 24},
});
