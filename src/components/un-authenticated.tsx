import Link from "next/link"
export default function UnauthenticatedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff9a9e] via-[#fad0c4] to-[#fad0c4] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg animate-pulse">
        🚫 Access Denied
      </h1>
      <p className="mt-4 text-lg text-white/90">
        Whoops! Looks like you're not logged in.
      </p>
      <div className="mt-10">
        <Link href="/auth/signin">
          <button className="bg-black hover:bg-white hover:text-black text-white font-bold py-3 px-8 rounded-full shadow-2xl transition-all duration-300 ease-in-out text-lg border-2 border-white">
            🔐 Let Me In!
          </button>
        </Link>
      </div>
      <p className="mt-6 text-sm text-white/70">
        We promise we won't spam your inbox 🤞
      </p>
    </div>
  )
}
