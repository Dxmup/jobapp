/**
 * Utility functions for handling forms consistently across the application
 */

import { zodResolver } from "@hookform/resolvers/zod"
import type { UseFormProps } from "react-hook-form"
import type * as z from "zod"

/**
 * Creates a properly configured form with zod validation
 * This helps prevent the "r is not a function" error that can occur with react-hook-form
 */
export function createZodForm<T extends z.ZodType>(
  schema: T,
  defaultValues?: z.infer<T>,
  options?: Omit<UseFormProps<z.infer<T>>, "resolver" | "defaultValues">,
) {
  return {
    schema,
    defaultValues,
    resolver: zodResolver(schema),
    ...options,
  }
}

/**
 * Safely handles form submission to prevent unhandled promise rejections
 */
export async function safeFormSubmit<T>(
  handler: (data: T) => Promise<void>,
  data: T,
  onError?: (error: unknown) => void,
) {
  try {
    await handler(data)
  } catch (error) {
    console.error("Form submission error:", error)
    if (onError) {
      onError(error)
    }
  }
}
