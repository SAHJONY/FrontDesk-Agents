'use client'

import { useToast } from '@/components/ToastProvider'

const VERY_LONG_MESSAGE =
  'This is an extremely long toast message that goes on and on. '.repeat(8) +
  'And here is the final sentence to really push it past any reasonable limit for a toast notification that uses line-clamp-2.'

export default function TestToastPage() {
  const toast = useToast()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Toast E2E Test Page</h1>

      <div className="flex flex-wrap gap-4 max-w-2xl">
        {/* Basic toasts */}
        <button
          data-testid="btn-success"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          onClick={() => toast.success('Success title', 'Operation completed successfully')}
        >
          Show Success
        </button>

        <button
          data-testid="btn-error"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          onClick={() => toast.error('Error title', 'Something went wrong')}
        >
          Show Error
        </button>

        <button
          data-testid="btn-info"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          onClick={() => toast.info('Info title', 'For your information')}
        >
          Show Info
        </button>

        <button
          data-testid="btn-loading"
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
          onClick={() => toast.loading('Loading title', 'Processing request...')}
        >
          Show Loading
        </button>

        {/* Title-only toast */}
        <button
          data-testid="btn-title-only"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
          onClick={() => toast.success('Title only — no description')}
        >
          Title Only
        </button>

        {/* Long message */}
        <button
          data-testid="btn-long-message"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
          onClick={() => toast.success('Long message', VERY_LONG_MESSAGE)}
        >
          Long Message
        </button>

        {/* Rapid 10 toasts */}
        <button
          data-testid="btn-rapid"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          onClick={() => {
            for (let i = 0; i < 10; i++) {
              toast.success(`Rapid toast #${i + 1}`, `Item ${i + 1}`)
            }
          }}
        >
          Create 10 Rapid
        </button>

        {/* Cycle all types */}
        <button
          data-testid="btn-cycle"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          onClick={() => {
            toast.success('Success A', 'Success message A')
            toast.error('Error B', 'Error message B')
            toast.info('Info C', 'Info message C')
            toast.loading('Loading D', 'Loading message D')
            toast.success('Success E', 'Success message E')
            toast.error('Error F', 'Error message F')
          }}
        >
          Cycle All Types
        </button>
      </div>
    </div>
  )
}
