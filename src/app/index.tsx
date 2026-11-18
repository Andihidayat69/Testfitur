import { Redirect } from "expo-router";

import { useProfile } from "@/state/profile-context";

/** Start route: onboarding until the jajan budget is saved, otherwise Beranda. */
export default function Index() {
  const { profile } = useProfile();
  return <Redirect href={profile ? "/beranda" : "/welcome"} />;
}
