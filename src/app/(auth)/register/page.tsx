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
import { ErrorResponse, Status } from "@/lib/api/types";
import { post as CreateUser } from "@/lib/api/user";
import { RegisterSchema } from "@/lib/validators";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export default function Register() {
  const { status } = useSession();
  const router = useRouter();

  const { mutateAsync: register, isPending: isRegistering } = useMutation({
    mutationFn: (formData: z.infer<typeof RegisterSchema>) => {
      return CreateUser(formData);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async function onSubmit(data: z.infer<typeof RegisterSchema>) {
      const res = await register(data);

      if (res.status === Status.Success) {
        toast.success("You have registered successfully");
        router.push("/login");
      } else {
        toast.error((res as any as ErrorResponse).error);
      }
    },
    [register, router],
  );

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [status]);

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Logo />
      </div>
    );

  return (
    <div className="flex h-screen w-screen items-center justify-center px-4">
      <Card className="mx-auto max-w-sm min-w-[320px]">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Enter your details below to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl className="flex items-center">
                      <Input
                        className="w-full"
                        placeholder="John Doe"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    </FormLabel>
                    <FormControl className="flex items-center">
                      <Input
                        className="w-full"
                        placeholder="********"
                        autoComplete="current-password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Register"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
