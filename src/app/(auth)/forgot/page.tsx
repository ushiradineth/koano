import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background p-24">
      <div className="w-full max-w-5xl items-center justify-between text-sm lg:flex">
        forget
      </div>
    </main>
  );
}
