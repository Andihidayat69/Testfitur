import Constants from "expo-constants";

/** "0.2.0 (2)": the version testers quote in bug reports (docs/decisions/0005-versioning.md). */
export function appVersionLabel(): string {
  const config = Constants.expoConfig;
  const version = config?.version ?? "?";
  const build = config?.android?.versionCode ?? config?.ios?.buildNumber;
  return build ? `${version} (${build})` : version;
}
