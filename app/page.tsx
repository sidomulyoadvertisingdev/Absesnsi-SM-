import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  const hasSession = cookies().get("laravel_session");

  if (!hasSession) {
    redirect("/login");
  }

  redirect("/dashboard");
}
