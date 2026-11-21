
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { Button, Pad, Screen } from "@/components";
import { signIn, signUp } from "@/lib/auth";
import { setEntryChoice } from "@/lib/entry-state";
import { useProfile } from "@/state/profile-context";
import { colors, layout } from "@/theme";

type Mode = "login" | "register";
type MessageType = "error" | "success";

export default function AuthScreen() {
  const { profile } = useProfile();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("error");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  function showFeedback(text: string, type: MessageType = "error") {
    setMessage(text);
    setMessageType(type);
  }

  function changeMode(nextMode: Mode) {
    setMessage("");
    setPassword("");
    setShowPassword(false);
    setMode(nextMode);
  }

  async function continueAsGuest() {
    if (loading) return;

    try {
      await setEntryChoice("guest");
      router.replace(profile ? "/beranda" : "/welcome");
    } catch {
      showFeedback("Tidak dapat menyimpan pilihan. Silakan coba lagi.");
    }
  }

  async function submitAuth() {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      showFeedback("Email dan password harus diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showFeedback("Format email belum benar.");
      return;
    }

    if (!isLogin && password.length < 6) {
      showFeedback("Password minimal terdiri dari 6 karakter.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { data, error } = await signIn(cleanEmail, password);

        if (error) throw error;

        if (!data.session) {
          throw new Error("Sesi login belum tersedia.");
        }

        await setEntryChoice("account");
        router.replace(profile ? "/beranda" : "/welcome");
      } else {
        const { data, error } = await signUp(cleanEmail, password);

        if (error) throw error;

        if (data.session) {
          await setEntryChoice("account");
          router.replace(profile ? "/beranda" : "/welcome");
        } else {
          showFeedback(
            "Pendaftaran berhasil. Periksa email untuk verifikasi akun, kemudian login.",
            "success",
          );
          setPassword("");
          setMode("login");
        }
      }
    } catch (error) {
      showFeedback(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    Alert.alert(
      "Lupa Password",
      "Fitur pemulihan password melalui email akan kita aktifkan pada tahap berikutnya.",
    );
  }

  return (
    <Screen>
      <Pad gap={16}>
        <View style={styles.topBar}>
          <Image
            source={require("../../../assets/brand/logo-horizontal.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Pressable
            onPress={continueAsGuest}
            disabled={loading}
            hitSlop={10}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Lewati →</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heading}>Selamat Datang!</Text>
            <Text style={styles.subtitle}>
              Kelola uang jajanmu dengan lebih sadar dan tenang.
            </Text>
          </View>

          <Image
            source={require("../../../assets/mascot/sapa.webp")}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isLogin ? "Masuk ke Akunmu" : "Buat Akun Baru"}
          </Text>

          <Text style={styles.formSubtitle}>
            {isLogin
              ? "Senang melihatmu kembali!"
              : "Mulai perjalanan keuanganmu bersama Jajan Tenang."}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Masukkan email kamu"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="next"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={submitAuth}
                style={styles.passwordInput}
              />

              <Pressable
                onPress={() => setShowPassword((value) => !value)}
                hitSlop={10}
                disabled={loading}
                style={styles.showPasswordButton}
              >
                {showPassword ? (
                  <EyeOff size={21} color="#718096" />
                ) : (
                  <Eye size={21} color="#718096" />
                )}
              </Pressable>
            </View>
          </View>

          {isLogin && (
            <View style={styles.optionsRow}>
              <Text style={styles.rememberText}>
                Sesi login tersimpan otomatis
              </Text>

              <Pressable onPress={handleForgotPassword} hitSlop={8}>
                <Text style={styles.linkText}>Lupa password?</Text>
              </Pressable>
            </View>
          )}

          {!!message && (
            <View
              style={[
                styles.message,
                messageType === "success"
                  ? styles.successMessage
                  : styles.errorMessage,
              ]}
            >
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          <Button
            label={
              loading
                ? "Memproses..."
                : isLogin
                  ? "Masuk"
                  : "Daftar"
            }
            onPress={submitAuth}
            disabled={loading}
          />

          <View style={styles.switchMode}>
            <Text style={styles.switchText}>
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            </Text>

            <Pressable
              onPress={() => changeMode(isLogin ? "register" : "login")}
              disabled={loading}
              hitSlop={8}
            >
              <Text style={styles.linkText}>
                {isLogin ? "Daftar sekarang" : "Login di sini"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Jajan Tenang — Play, Connect & Grow
        </Text>
      </Pad>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },

  logo: {
    width: 145,
    height: 58,
  },

  skipButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: colors.bg1,
  },

  skipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  hero: {
    minHeight: 190,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  heroText: {
    flex: 1,
    gap: 9,
    paddingRight: 2,
  },

  heading: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 34,
  },

  subtitle: {
    color: "#526681",
    fontSize: 13,
    lineHeight: 20,
  },

  mascot: {
    width: 155,
    height: 190,
  },

  formCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 15,
    borderWidth: 1,
    borderColor: "#E5EDF8",
  },

  formTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },

  formSubtitle: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 19,
    marginTop: -9,
  },

  field: {
    gap: 7,
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  input: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F9FBFF",
    color: colors.text,
    fontSize: 14,
  },

  passwordContainer: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    backgroundColor: "#F9FBFF",
  },

  passwordInput: {
    flex: 1,
    minHeight: 49,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
  },

  showPasswordButton: {
    minWidth: 44,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },

  rememberText: {
    color: "#718096",
    fontSize: 11,
  },

  linkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  message: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
  },

  errorMessage: {
    backgroundColor: colors.bg1,
    borderLeftColor: colors.dangerSoft,
  },

  successMessage: {
    backgroundColor: colors.bg1,
    borderLeftColor: colors.success,
  },

  messageText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },

  switchMode: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    paddingTop: 2,
  },

  switchText: {
    color: "#718096",
    fontSize: 12,
  },

  footer: {
    textAlign: "center",
    color: "#8A9BB2",
    fontSize: 10,
    paddingVertical: 4,
  },
});
