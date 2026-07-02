import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';
import { Loading } from '../components/ui';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import PartiesScreen from '../screens/PartiesScreen';
import ItemsScreen from '../screens/ItemsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import PartyFormScreen from '../screens/PartyFormScreen';
import ItemFormScreen from '../screens/ItemFormScreen';
import CollectionScreen from '../screens/CollectionScreen';
import OutstandingEntryScreen from '../screens/OutstandingEntryScreen';
import PaymentEntryScreen from '../screens/PaymentEntryScreen';
import FollowupsScreen from '../screens/FollowupsScreen';
import FollowupFormScreen from '../screens/FollowupFormScreen';
import PartyLedgerScreen from '../screens/PartyLedgerScreen';
import OutstandingReportScreen from '../screens/OutstandingReportScreen';
import AgingReportScreen from '../screens/AgingReportScreen';
import OverdueReportScreen from '../screens/OverdueReportScreen';
import CollectionReportScreen from '../screens/CollectionReportScreen';
import SummaryScreen from '../screens/SummaryScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import type { RootStackParamList, TabParamList } from './types';

type AuthStackParamList = { Login: undefined; Register: undefined };

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const tabIcon: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Invoices: 'document-text-outline',
  Parties: 'people-outline',
  Items: 'pricetags-outline',
  Collection: 'cash-outline',
  Settings: 'settings-outline',
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcon[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Invoices" component={InvoicesScreen} />
      <Tabs.Screen name="Parties" component={PartiesScreen} />
      <Tabs.Screen name="Items" component={ItemsScreen} />
      <Tabs.Screen name="Collection" component={CollectionScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

const headerStyle = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <Loading text="Loading..." />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <RootStack.Navigator screenOptions={headerStyle}>
          <RootStack.Screen
            name="Tabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="CreateInvoice"
            component={CreateInvoiceScreen}
            options={{ title: 'New Bill' }}
          />
          <RootStack.Screen
            name="InvoiceDetail"
            component={InvoiceDetailScreen}
            options={{ title: 'Invoice' }}
          />
          <RootStack.Screen
            name="PartyForm"
            component={PartyFormScreen}
            options={{ title: 'Party' }}
          />
          <RootStack.Screen
            name="ItemForm"
            component={ItemFormScreen}
            options={{ title: 'Item' }}
          />
          <RootStack.Screen name="OutstandingEntry" component={OutstandingEntryScreen} options={{ title: 'Outstanding Entry' }} />
          <RootStack.Screen name="PaymentEntry" component={PaymentEntryScreen} options={{ title: 'Payment Entry' }} />
          <RootStack.Screen name="Followups" component={FollowupsScreen} options={{ title: 'Follow-ups' }} />
          <RootStack.Screen name="FollowupForm" component={FollowupFormScreen} options={{ title: 'Follow-up' }} />
          <RootStack.Screen name="PartyLedger" component={PartyLedgerScreen} options={{ title: 'Party Ledger' }} />
          <RootStack.Screen name="OutstandingReport" component={OutstandingReportScreen} options={{ title: 'Outstanding' }} />
          <RootStack.Screen name="AgingReport" component={AgingReportScreen} options={{ title: 'Aging Report' }} />
          <RootStack.Screen name="OverdueReport" component={OverdueReportScreen} options={{ title: 'Overdue Report' }} />
          <RootStack.Screen name="CollectionReport" component={CollectionReportScreen} options={{ title: 'Collection Report' }} />
          <RootStack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Summary' }} />
          <RootStack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'User Management' }} />
        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
