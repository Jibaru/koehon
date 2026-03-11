import { ClerkSignIn } from "@/components/elements/clerk-sign-in";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-black">
      <ClerkSignIn
        redirectUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
