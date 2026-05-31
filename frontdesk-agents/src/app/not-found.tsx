import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
