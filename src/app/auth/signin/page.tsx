import { Suspense } from "react"
import SignInForm from "./sign-in"

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}


