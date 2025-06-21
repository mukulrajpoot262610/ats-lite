'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useChatStore } from '@/store/useChatStore'
import { ChevronDownIcon, RefreshCwIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ModelSelector() {
  const { selectedModel, availableModels, setSelectedModel, loadOllamaModels } = useChatStore()

  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Load Ollama models on component mount
    loadOllamaModels()
  }, [loadOllamaModels])

  const handleRefreshOllama = async () => {
    setIsRefreshing(true)
    try {
      await loadOllamaModels()
    } finally {
      setIsRefreshing(false)
    }
  }

  const openaiModels = availableModels.filter(m => m.provider === 'openai')
  const ollamaModels = availableModels.filter(m => m.provider === 'ollama')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">{selectedModel.name}</span>
          <ChevronDownIcon className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>OpenAI Models</DropdownMenuLabel>
        {openaiModels.map(model => (
          <DropdownMenuItem
            key={`${model.provider}-${model.model}`}
            onClick={() => setSelectedModel(model)}
            className={selectedModel.model === model.model ? 'bg-accent' : ''}
          >
            {model.name}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center justify-between">
          Ollama Models (Local)
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefreshOllama}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
          >
            <RefreshCwIcon className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </DropdownMenuLabel>

        {ollamaModels.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-sm text-muted-foreground">No models found. Make sure Ollama is running.</div>
          </DropdownMenuItem>
        ) : (
          ollamaModels.map(model => (
            <DropdownMenuItem
              key={`${model.provider}-${model.model}`}
              onClick={() => setSelectedModel(model)}
              className={selectedModel.model === model.model ? 'bg-accent' : ''}
            >
              {model.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
