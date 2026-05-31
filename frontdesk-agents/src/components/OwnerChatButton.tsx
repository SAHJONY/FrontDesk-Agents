'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import OwnerChat from './OwnerChat'

export default function OwnerChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110"
          aria-label="Open AI assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 right-0 z-50">
            <OwnerChat />
          </div>
        </>
      )}
    </>
  )
}
