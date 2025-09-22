"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { useSupabase } from "@/components/providers/supabase-provider";

export const LoginForm = () => {
  const { supabase } = useSupabase();

  return (
    <Auth
      supabaseClient={supabase}
      view="sign_in"
      localization={{
        variables: {
          sign_in: {
            email_label: "メールアドレス",
            password_label: "パスワード",
            button_label: "ログイン",
          },
        },
      }}
      appearance={{
        theme: ThemeSupa,
        style: {
          button: { borderRadius: "0.75rem" },
          anchor: { color: "#0ea5e9" },
        },
      }}
      providers={[]}
    />
  );
};
