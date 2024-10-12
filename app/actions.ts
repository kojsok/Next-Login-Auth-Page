// "use server";

// import { encodedRedirect } from "@/utils/utils";
// import { createClient } from "@/utils/supabase/server";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";

// export const signUpAction = async (formData: FormData) => {
//   const email = formData.get("email")?.toString();
//   const password = formData.get("password")?.toString();
//   const supabase = createClient();
//   const origin = headers().get("origin");

//   if (!email || !password) {
//     return { error: "Email and password are required" };
//   }

//   const { error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       emailRedirectTo: `${origin}/auth/callback`,
//     },
//   });

//   if (error) {
//     console.error(error.code + " " + error.message);
//     return encodedRedirect("error", "/sign-up", error.message);
//   } else {
//     return encodedRedirect(
//       "success",
//       "/sign-up",
//       "Thanks for signing up! Please check your email for a verification link.",
//     );
//   }
// };

// export const signInAction = async (formData: FormData) => {
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const supabase = createClient();

//   const { error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     return encodedRedirect("error", "/sign-in", error.message);
//   }

//   return redirect("/protected");
// };


"use server";

import { encodedRedirect, validateEmail } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Действие для регистрации пользователя
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("password_confirmation") as string;
  const supabase = createClient();
  const origin = headers().get("origin");

  // Проверка на наличие обязательных полей
  if (!email || !password || !passwordConfirmation) {
    return encodedRedirect("error", "/sign-up", "Email and password are required");
  }

  // Валидация email
  if (!validateEmail(email)) {
    return encodedRedirect("error", "/sign-up", "Email is not valid");
  }

  // Проверка совпадения пароля и его подтверждения
  if (password !== passwordConfirmation) {
    return encodedRedirect("error", "/sign-up", "Incorrect password confirmation");
  }

  // Регистрация пользователя через Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`, // Перенаправление после подтверждения
    },
  });

  // Обработка ошибок при регистрации
  if (error) {
    console.error(`${error.code} ${error.message}`);
    return encodedRedirect("error", "/sign-up", error.message);
  } 

  // Успешная регистрация, отправка уведомления
  return encodedRedirect("success", "/sign-up", "Thanks for signing up! Please check your email for a verification link.");
};

// Действие для входа пользователя
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  // Проверка на наличие email и пароля
  if (!email || !password) {
    return encodedRedirect("error", "/sign-in", "Email and password are required");
  }

  // Вход пользователя через Supabase
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Обработка ошибок при входе
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Успешный вход, перенаправление в защищенную зону
  return redirect("/protected");
};

// Действие для запроса одноразового пароля (OTP) на email
export const requestOTPAction = async (formData: FormData) => {
  // Извлечение email из данных формы
  const email = formData.get("email") as string;
  // Создание клиента Supabase для взаимодействия с сервисами Supabase
  const supabase = createClient();

  // Проверка на наличие email
  if (!email) {
    return encodedRedirect("error", "/recover-password", "Email is required");
  }

  // Валидация email
  if (!validateEmail(email)) {
    return encodedRedirect("error", "/recover-password", "Email is not valid");
  }

  // Отправка одноразового пароля (OTP) на email
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Убеждаемся, что пользователь не будет создан
    },
  });

  // Обработка ошибок при отправке OTP
  if (error) {
    console.error(`${error.code} ${error.message}`);
    return encodedRedirect("error", "/recover-password", error.message);
  }

  // Успешная отправка OTP, уведомление пользователя
  return encodedRedirect("success", "/reset-password", "One time password has been sent to email, please check", { email });
};

// Действие для восстановления пароля
export const recoverPassAction = async (formData: FormData) => {
  // Извлечение code, email, newPassword, passwordConfirmation и кода из данных формы
  const code = formData.get("code") as string;
  const email = formData.get("email") as string;
  const newPassword = formData.get("new_password") as string;
  const passwordConfirmation = formData.get("password_confirmation") as string;
  const supabase = createClient();

  // Проверка на наличие обязательных полей
  if (!email || !code || !newPassword || !passwordConfirmation) {
    return encodedRedirect("error", "/reset-password", "Email, password and code are required");
  }

  // Проверка совпадения пароля и его подтверждения
  if (newPassword !== passwordConfirmation) {
    return encodedRedirect("error", "/reset-password", "Incorrect password confirmation");
  }

  // Проверка длины нового пароля
  if (newPassword.length < 6) {
    return encodedRedirect("error", "/reset-password", "New password should be of 6 minimum characters");
  }

  // Верификация OTP (одноразового пароля) через Supabase
  const { data: { session }, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email", // Тип верификации по email
  });

  // Проверка на успешную верификацию
  if (!session?.user?.email === email || !session?.user?.aud === "authenticated") {
    return encodedRedirect("error", "/sign-in", "Could not verify OTP");
  }
  // if (session?.user?.email !== email || session?.user?.aud !== "authenticated") {
  //   return encodedRedirect("error", "/sign-in", "Could not verify OTP");
  // }

  // Обработка ошибок при верификации OTP
  if (error) {
    return encodedRedirect("error", "/reset-password", error.message);
  }

  // Обновление пароля пользователя
  const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });

  // Проверка на успешное обновление пароля
  // if (passwordError) {
  //   return encodedRedirect("error", "/reset-password", passwordError.message);
  // }

  // Обработка ошибок при обновлении пароля
  if (passwordError) {
    return encodedRedirect("error", "/reset-password", passwordError.message);
  }

  // Успешное восстановление пароля, перенаправление
  return redirect("/protected");
};

// Действие для выхода пользователя
export const signOutAction = async () => {
  const supabase = createClient();
  
  // Выход из аккаунта через Supabase
  await supabase.auth.signOut();
  
  // Перенаправление на страницу входа
  return redirect("/sign-in");
};