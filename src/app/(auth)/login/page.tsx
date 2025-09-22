import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const LoginPage = async () => {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow">
        <h1 className="text-2xl font-semibold text-center">Travel Memories Map にログイン</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
