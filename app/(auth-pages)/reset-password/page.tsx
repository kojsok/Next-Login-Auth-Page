import { recoverPassAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <form className="flex flex-col min-w-64 max-w-64 mx-auto">
      <h1 className="text-2xl font-medium">Update password</h1>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Input name="email" type="hidden" value={searchParams?.email} />
        <Label htmlFor="code">One-time password</Label>
        <Input name="code" required />
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          name="new_password"
          placeholder="Your new password"
          minLength={6}
          required
        />
        <Label htmlFor="password">Confirm password</Label>
        <Input
          type="password"
          name="password_confirmation"
          placeholder="Your password confirmation"
          minLength={6}
          required
        />
        <SubmitButton
          formAction={recoverPassAction}
          pendingText="Recovering password..."
        >
          Recover
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}