import { requestOTPAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RecoverPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Recover password</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link
          className="text-foreground font-medium underline"
          href="/sign-up"
        >
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          minLength={6}
          required
        />
        <SubmitButton
          pendingText="Recovering In..."
          formAction={requestOTPAction}
        >
          Recover password
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
