/**
 * Configuration constants for MCP (Multi-step Candidate Processing) operations
 * This file centralizes all configurable values to avoid hardcoding
 */

import { BrainIcon, FileTextIcon, MailIcon, PencilIcon, Sparkles } from 'lucide-react'

/**
 * LLM Configuration
 */
export const LLM_CONFIG = {
  DEFAULT_PROVIDER: 'openai',
  DEFAULT_MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.1,
  MAX_TOKENS: 1000,
} as const

/**
 * Candidate Processing Configuration
 */
export const CANDIDATE_CONFIG = {
  // Number of top skills to show in statistics
  TOP_SKILLS_COUNT: 5,

  // Number of top candidates to show in summary
  TOP_CANDIDATES_COUNT: 5,

  // Number of skills to display per candidate in summary
  SKILLS_DISPLAY_COUNT: 5,

  // Default sort order for ranking
  DEFAULT_SORT_ORDER: 'desc' as const,

  // Statistics rounding precision (decimal places)
  EXPERIENCE_PRECISION: 1,
} as const

/**
 * CSV Configuration
 */
export const CSV_CONFIG = {
  // Default CSV file path (relative to public directory)
  DEFAULT_CSV_PATH: 'candidates.csv',

  // CSV parsing options
  PARSE_OPTIONS: {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  },

  // Default headers for fallback
  DEFAULT_HEADERS: [
    'id',
    'full_name',
    'title',
    'location',
    'timezone',
    'years_experience',
    'skills',
    'languages',
    'education_level',
    'degree_major',
    'availability_weeks',
    'willing_to_relocate',
    'work_preference',
    'notice_period_weeks',
    'desired_salary_usd',
    'open_to_contract',
    'remote_experience_years',
    'visa_status',
    'citizenships',
    'summary',
    'tags',
    'last_active',
    'linkedin_url',
  ] as const,
} as const

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Request timeouts (in milliseconds)
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const

/**
 * Navigation Configuration
 */
export const NAV_CONFIG = {
  DEFAULT_USER_NAME: 'John Doe',
  DEFAULT_USER_EMAIL: 'john.doe@example.com',
  DEFAULT_USER_AVATAR: 'https://github.com/shadcn.png',

  NAV_DATA: [
    {
      NAV_TITLE: 'New Chat',
      NAV_URL: '#',
      NAV_ICON: Sparkles,
      NAV_IS_ACTIVE: true,
      NAV_SHORTCUT: '⌘ + M',
      NAV_HAS_COMMAND: false,
    },
  ],
} as const

/**
 * Suggestions Configuration
 */
export const SUGGESTIONS_CONFIG = {
  SUGGESTIONS: [
    {
      SUGGESTION_ICON: PencilIcon,
      SUGGESTION_TITLE: 'Frontend engineers, sort by experience, most experience first',
    },
    {
      SUGGESTION_ICON: MailIcon,
      SUGGESTION_TITLE: 'Remote Python developers with salary below 150k',
    },
    {
      SUGGESTION_ICON: FileTextIcon,
      SUGGESTION_TITLE: 'Data engineers in Berlin with less than 2 weeks notice',
    },
    {
      SUGGESTION_ICON: BrainIcon,
      SUGGESTION_TITLE: 'React developers in India, most experience first',
    },
  ],
} as const

/**
 * Theme Configuration
 */
export const THEME_CONFIG = {
  DEFAULT_THEME: 'system',
  ENABLE_SYSTEM: true,
} as const

/**
 * App Configuration
 */
export const APP_CONFIG = {
  APP_NAME: 'ATS Lite',
  APP_DESCRIPTION: 'AI Agents for ATS',
} as const

/**
 * MCP Configuration
 */
export const MCP_CONFIG = {
  DEFAULT_PHASE: 'idle',
  DEFAULT_PLAN: null,
} as const

/**
 * Type-safe configuration access
 */
export type LLMConfig = typeof LLM_CONFIG
export type CandidateConfig = typeof CANDIDATE_CONFIG
export type CSVConfig = typeof CSV_CONFIG
export type APIConfig = typeof API_CONFIG
export type NAVConfig = typeof NAV_CONFIG
export type SuggestionsConfig = typeof SUGGESTIONS_CONFIG
