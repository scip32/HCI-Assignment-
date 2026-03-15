import { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, Text, View } from "react-native";

type PromptState = "idle" | "biometric" | "sso";

export function ZeroFrictionLogin() {
  const [state, setState] = useState<PromptState>("idle");
  const showSheet = state === "sso";
  const showPrompt = state === "biometric";
  const buttonClasses = showSheet
    ? "h-16 items-center justify-center rounded-full border border-white/10 bg-[#0b1e3c] opacity-20 translate-y-4 shadow-black/30 shadow-xl"
    : "h-16 items-center justify-center rounded-full border border-white/10 bg-[#0b1e3c] opacity-100 shadow-black/30 shadow-xl";

  return (
    <View className="flex-1 bg-[#071325]">
      <SafeAreaView className="flex-1 px-6 pb-8 pt-4">
        <View className="mt-16 items-center">
          <View className="rounded-[28px] bg-white/10 px-5 py-4">
            <Image
              source={require("../logo.png")}
              className="h-[160px] w-[210px]"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="mt-10 px-4">
          <Text className="text-center text-[13px] font-semibold uppercase tracking-[4px] text-[#efd899]/70">
            Zero-Friction Login
          </Text>
          <Text className="mt-4 text-center text-3xl font-semibold leading-10 text-[#fffaf0]">
            Authenticate in under two seconds.
          </Text>
          <Text className="mt-3 text-center text-sm leading-6 text-white/65">
            No keyboard. No password field. Tap once and hand the rest to biometrics.
          </Text>
        </View>

        <View className="flex-1" />

        <View>
          <Pressable className={buttonClasses} onPress={() => setState("biometric")}>
            <Text className="text-base font-bold text-[#efd899]">Log in with Student ID</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal animationType="fade" transparent visible={showPrompt}>
        <View className="flex-1 items-center justify-center bg-black/45 px-6">
          <View className="w-full rounded-[32px] border border-white/15 bg-white/10 p-6">
            <View className="mx-auto h-20 w-20 rounded-full border border-white/30 bg-white/10" />
            <Text className="mt-5 text-center text-xl font-semibold text-white">Face ID</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-white/70">
              Use your device biometrics to continue with campus SSO.
            </Text>
            <Pressable
              className="mt-6 h-12 items-center justify-center rounded-full bg-white"
              onPress={() => setState("idle")}
            >
              <Text className="text-sm font-bold text-[#0b1e3c]">Authenticate</Text>
            </Pressable>
            <Pressable
              className="mt-3 h-12 items-center justify-center rounded-full border border-white/15 bg-white/5"
              onPress={() => setState("sso")}
            >
              <Text className="text-sm font-semibold text-white">Biometrics failed, open SSO</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={showSheet}>
        <View className="flex-1 justify-end bg-black/45">
          <View className="rounded-t-[34px] bg-white px-6 pb-8 pt-3">
            <View className="mx-auto h-1.5 w-14 rounded-full bg-slate-300" />
            <View className="flex-row items-center justify-between pb-4 pt-4">
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-[3px] text-slate-400">
                  Fallback
                </Text>
                <Text className="mt-1 text-2xl font-semibold text-slate-900">Campus SSO</Text>
              </View>
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50"
                onPress={() => setState("idle")}
              >
                <Text className="text-2xl text-slate-700">×</Text>
              </Pressable>
            </View>

            <View className="rounded-[28px] border border-slate-200 p-4">
              <View className="flex-row items-center gap-2 border-b border-slate-200 pb-3">
                <View className="h-3 w-3 rounded-full bg-rose-300" />
                <View className="h-3 w-3 rounded-full bg-amber-300" />
                <View className="h-3 w-3 rounded-full bg-emerald-300" />
                <View className="ml-3 h-8 flex-1 rounded-full bg-slate-100 px-4 justify-center">
                  <Text className="text-xs text-slate-400">sso.university.edu</Text>
                </View>
              </View>
              <View className="space-y-4 py-5">
                <View className="h-14 rounded-2xl bg-slate-100" />
                <View className="h-14 rounded-2xl bg-slate-100" />
                <View className="h-14 rounded-2xl bg-[#0b1e3c]" />
              </View>
              <View className="rounded-2xl bg-amber-50 px-4 py-3">
                <Text className="text-sm leading-6 text-amber-900">
                  This sheet only appears when biometrics fail. The main screen never asks for
                  email or password.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
