"use client"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login } from "@/app/actions/auth-actions"
import { useSearchParams } from "next/navigation"

const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function SimpleLoginForm() {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    // values is an object
    setError("")
    setSuccess("")
    startTransition(async () => {
      // Now compatible with the updated login action signature
      const result = await login(values)
      if (result?.error) {
        setError(result.error)
      }
      // Ensure result.user exists before trying to access redirectUrl from it.
      // The redirectUrl is on the top-level result from signIn.
      if (result?.success && result.redirectUrl) {
        window.location.href = result.redirectUrl
      } else if (result?.success) {
        // Fallback if redirectUrl isn't set, though it should be.
        window.location.href = "/dashboard"
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-red-500 bg-red-100 border border-red-400 p-2 rounded-md">{error}</p>}
          {success && (
            <p className="text-sm text-green-500 bg-green-100 border border-green-400 p-2 rounded-md">{success}</p>
          )}
          <Button disabled={isPending} type="submit">
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
