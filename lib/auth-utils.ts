export function generateStrongPassword(length = 12): string {
  const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijkmnopqrstuvwxyz"
  const numberChars = "23456789"
  const specialChars = "!@#$%^&*()_+=-"

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars

  // Ensure at least one of each type
  let password =
    getRandomChar(uppercaseChars) +
    getRandomChar(lowercaseChars) +
    getRandomChar(numberChars) +
    getRandomChar(specialChars)

  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars)
  }

  // Shuffle the password
  return shuffleString(password)
}

function getRandomChar(characters: string): string {
  return characters.charAt(Math.floor(Math.random() * characters.length))
}

function shuffleString(str: string): string {
  const array = str.split("")
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join("")
}
