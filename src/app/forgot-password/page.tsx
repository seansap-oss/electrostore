import { ToastForm } from "@/components/ToastForm";
export const metadata = { title: "Forgot Password" };
export default function ForgotPage() {
  return (
    <div className="container-es max-w-md py-12">
      <h1 className="text-3xl font-extrabold">Reset your password</h1>
      <ToastForm toast="If that email exists, a reset link is on its way." className="card mt-4 space-y-3 p-6">
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" placeholder="you@example.com" /></div>
        <button className="btn-dark w-full">Send reset link</button>
      </ToastForm>
    </div>
  );
}
