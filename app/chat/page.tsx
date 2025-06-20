import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'

export default async function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-4">
      <ChatHeader />
      <ChatInput />
    </div>
  )
}
