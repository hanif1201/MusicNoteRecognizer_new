import { Stack } from "expo-router";
import { THEME } from "../constants/theme";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: THEME.colors.primary,
        },
        headerTintColor: THEME.colors.background,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
  );
}
