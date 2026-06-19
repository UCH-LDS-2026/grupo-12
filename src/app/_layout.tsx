import "@/global.css";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
      <Toaster
        duration={3000}
        position="top-center"
        theme="light"
        richColors
        allowFontScaling
      />
    </GestureHandlerRootView>
  );
}
