import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center w-full mx-auto bg-muted/50 rounded-xl p-10">
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        <ChatHeader />
        <ChatInput />
      </div>
    </div>
  )
}
