/**
 * Utility functions for handling user names
 */

export function extractFirstName(fullName: string): string {
  if (!fullName || typeof fullName !== "string") {
    return ""
  }

  const trimmedName = fullName.trim()
  if (!trimmedName) {
    return ""
  }

  // Split by space and take the first part
  const nameParts = trimmedName.split(/\s+/)
  return nameParts[0] || ""
}

export function extractLastName(fullName: string): string {
  if (!fullName || typeof fullName !== "string") {
    return ""
  }

  const trimmedName = fullName.trim()
  if (!trimmedName) {
    return ""
  }

  // Split by space and take everything after the first part
  const nameParts = trimmedName.split(/\s+/)
  if (nameParts.length <= 1) {
    return ""
  }

  return nameParts.slice(1).join(" ")
}

export function formatDisplayName(firstName: string, lastName?: string): string {
  if (!firstName) {
    return ""
  }

  if (!lastName) {
    return firstName
  }

  return `${firstName} ${lastName}`
}

export function getInitials(fullName: string): string {
  if (!fullName || typeof fullName !== "string") {
    return ""
  }

  const nameParts = fullName.trim().split(/\s+/)
  if (nameParts.length === 0) {
    return ""
  }

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase()
  }

  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
}
