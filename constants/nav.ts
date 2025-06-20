import { Search, Sparkles } from 'lucide-react'

export const NAV_MAIN = [
  {
    title: 'New Chat',
    url: '#',
    icon: Sparkles,
    isActive: true,
    shortcut: '⌘ N',
    hasCommand: false,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
    shortcut: '⌘ K',
    hasCommand: true,
  },
]

export const NAV_DATA = {
  chats: [
    {
      name: 'Project Management & Task Tracking',
      url: '#',
      emoji: '📊',
    },
    {
      name: 'Family Recipe Collection & Meal Planning',
      url: '#',
      emoji: '🍳',
    },
    {
      name: 'Fitness Tracker & Workout Routines',
      url: '#',
      emoji: '💪',
    },
    {
      name: 'Book Notes & Reading List',
      url: '#',
      emoji: '📚',
    },
    {
      name: 'Sustainable Gardening Tips & Plant Care',
      url: '#',
      emoji: '🌱',
    },
    {
      name: 'Language Learning Progress & Resources',
      url: '#',
      emoji: '🗣️',
    },
    {
      name: 'Home Renovation Ideas & Budget Tracker',
      url: '#',
      emoji: '🏠',
    },
    {
      name: 'Personal Finance & Investment Portfolio',
      url: '#',
      emoji: '💰',
    },
    {
      name: 'Movie & TV Show Watchlist with Reviews',
      url: '#',
      emoji: '🎬',
    },
    {
      name: 'Daily Habit Tracker & Goal Setting',
      url: '#',
      emoji: '✅',
    },
  ],
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://github.com/shadcn.png',
  },
}
