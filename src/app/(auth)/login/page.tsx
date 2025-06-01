"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Logo from "@/components/atoms/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/lib/validators";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { status } = useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof LoginSchema>) => {
      setLoading(true);

      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error !== null) {
        if (res?.code === "404") {
          toast.error("Server not found");
        }

        if (res?.code === "401") {
          toast.error("Invalid credentials");
        }
      } else {
        router.push("/");
      }

      setLoading(false);
    },
    [router],
  );

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [status]);

  if (status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Logo />
      </div>
    );

  return (
    <div className="flex h-screen w-screen items-center justify-center px-4">
      <Card className="mx-auto min-w-[320px] max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials below to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl className="flex items-center">
                      <Input
                        className="w-full"
                        placeholder="user@email.com"
                        autoComplete="email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <p>Password</p>
                      {
                        //<Link
                        //  href="/forgot"
                        //  className="ml-auto text-sm underline-offset-4 hover:underline">
                        //  Forgot your password?
                        //</Link>
                      }
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex w-full max-w-sm items-center">
                        <Input
                          className="w-full"
                          placeholder="********"
                          autoComplete="current-password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-0 p-2 text-primary-foreground"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={loading}>
                {loading ? <LoaderCircle className="animate-spin" /> : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
