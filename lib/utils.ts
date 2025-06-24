import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Unique ID generator to prevent duplicate keys
let idCounter = 0
export function generateUniqueId(prefix?: string): string {
  const timestamp = Date.now()
  const counter = ++idCounter
  const uniqueId = `${timestamp}-${counter}`
  return prefix ? `${prefix}-${uniqueId}` : uniqueId
}

export function formatChatTime(date: Date) {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

  if (diffHours <= 1) {
    return 'Just now'
  } else if (diffDays === 1) {
    return 'Today'
  } else if (diffDays === 2) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffHours}h ago`
  } else if (diffDays < 30) {
    return `${diffDays}d ago`
  } else if (diffDays < 365) {
    return `${diffDays}w ago`
  } else {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
}

export const formatSalary = (salary?: number) => {
  if (!salary) return 'Not specified'
  return `$${salary.toLocaleString()}`
}

export const getExperienceColor = (years: number) => {
  if (years >= 15) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  if (years >= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (years >= 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (years >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const generateChatTitle = (firstMessage?: string): string => {
  if (!firstMessage) return 'New Chat'

  const words = firstMessage.split(' ').slice(0, 6)
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
}
