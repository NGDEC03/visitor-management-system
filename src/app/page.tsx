'use client'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"

export default function LandingPage() {
  const [loadingButton, setLoadingButton] = useState<null | string>(null);
  const router = useRouter();

  const handleButtonClick = (url: string, buttonKey: string) => {
    console.log(buttonKey);
    
    setLoadingButton(buttonKey);
    setTimeout(() => {
      router.push(url);
    }, 300); 
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        className="max-w-4xl w-full text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Welcome to SecurePass – Smart Visitor Management System
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Streamline workplace security with real-time approvals, pre-scheduled visits, and photo verification. Manage all visitor touchpoints from one powerful platform.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <FeatureCard title="Authentication & Security" description="Secure access with photo capture and visitor ID validation." />
          <FeatureCard title="Real-Time Approval Workflow" description="Instant notifications and quick approvals via app or web." />
          <FeatureCard title="Pre-Approval & Scheduling" description="Schedule and approve visitors ahead of time with QR pass." />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="secondary"
            className="px-6 py-2"
            onClick={() => handleButtonClick("/admin", "admin")}
            disabled={loadingButton === "admin"}
          >
            {loadingButton === "admin" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Admin Panel
          </Button>

          <Button
            variant="default"
            className="px-6 py-2"
            onClick={() => handleButtonClick("/auth/signin", "employee")}
            disabled={loadingButton === "employee"}
          >
            {loadingButton === "employee" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Employee Login
          </Button>

          <Button
            variant="secondary"
            className="px-6 py-2"
            onClick={() => handleButtonClick("/security", "security")}
            disabled={loadingButton === "security"}
          >
            {loadingButton === "security" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Security Desk
          </Button>
        </div>
      </motion.div>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-md p-6 rounded-2xl border"
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </motion.div>
  )
}
