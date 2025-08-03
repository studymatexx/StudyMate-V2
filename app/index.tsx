import { Redirect } from 'expo-router';

export default function Index() {
  // For now, redirect directly to welcome screen
  // In production, this would check authentication state
  return <Redirect href="/welcome" />;
}