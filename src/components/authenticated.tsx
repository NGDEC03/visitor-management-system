"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginStatusPopup() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => setOpen(true), 300); 
    }
  }, [status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black text-white border border-white animate-pulse shadow-lg shadow-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-cyan-400 glow-text">
            ✅ Access Verified
          </DialogTitle>
        </DialogHeader>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">You're already logged in.</p>
          <p className="text-sm text-teal-400 mt-2">
            Secure session active — continue exploring the system 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
