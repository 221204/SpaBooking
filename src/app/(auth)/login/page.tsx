import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function getLoginFeedback(params: { error?: string; message?: string }) {
  if (params.error === "auth_callback_failed") {
    return {
      error: "Xác thực email thất bại. Vui lòng thử đăng nhập lại.",
      message: null,
    };
  }

  if (params.message === "register_success") {
    return {
      error: null,
      message: "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
    };
  }

  return { error: null, message: null };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};
  const feedback = getLoginFeedback(params);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <LoginForm
        initialError={feedback.error}
        initialMessage={feedback.message}
      />
    </div>
  );
}
