"use client"

import { Lock } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function UnAuthorized() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <motion.div
        className="text-center px-6 py-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_30px_#00f2ff44]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mx-auto mb-4 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#00f2ff] border-2 border-white/20"
        >
          <Lock className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className={cn("text-3xl font-bold glitch text-cyan-400 mb-2")}>
          Access Denied
        </h1>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          You don't have permission to view this page. Please contact the administrator or try logging in with the right credentials.
        </p>
        <p className="mt-6 text-xs text-white/40">Error Code: 403_UNAUTHORIZED_PORTAL</p>
      </motion.div>

      {/* Glitch overlay */}
      <div className="absolute top-0 left-0 w-full h-full z-[-1] pointer-events-none">
        <div className="glitch-bg" />
      </div>

      <style jsx>{`
        .glitch {
          position: relative;
        }
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          width: 100%;
          overflow: hidden;
          color: #00f2ff;
          clip: rect(0, 900px, 0, 0);
        }
        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 red;
          animation: glitchTop 2s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 blue;
          animation: glitchBottom 1.5s infinite linear alternate-reverse;
        }

        @keyframes glitchTop {
          0% {
            clip: rect(42px, 9999px, 44px, 0);
          }
          50% {
            clip: rect(10px, 9999px, 13px, 0);
          }
          100% {
            clip: rect(45px, 9999px, 48px, 0);
          }
        }

        @keyframes glitchBottom {
          0% {
            clip: rect(85px, 9999px, 88px, 0);
          }
          50% {
            clip: rect(60px, 9999px, 63px, 0);
          }
          100% {
            clip: rect(90px, 9999px, 93px, 0);
          }
        }
      `}</style>
    </div>
  )
}
