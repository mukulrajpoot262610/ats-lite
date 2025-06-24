import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
