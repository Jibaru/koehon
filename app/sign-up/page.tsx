import { ClerkSignUp } from "@/components/elements/clerk-sign-up";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-black">
      <ClerkSignUp
        redirectUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  );
}
