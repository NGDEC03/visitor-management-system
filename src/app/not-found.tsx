export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-4">
          The page you are looking for doesn't exist or you don't have permission to access it.
        </p>
      </div>
    </div>
  )
} 