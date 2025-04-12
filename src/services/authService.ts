interface AuthResponse {
    message: string;
    [key: string]: any;
}

class AuthService{
    async forgotPassword(email:string): Promise<AuthResponse>{
        const res=await fetch("/api/auth/forgot-password",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email})
        })
        const data: AuthResponse = await res.json()
        if(!res.ok) throw new Error(data.message || "Failed to send reset email")
        return data
    }
    async resetPassword(token:string,password:string): Promise<AuthResponse>{
        const res=await fetch("/api/auth/reset-password",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({token,password})
        })
        const data: AuthResponse = await res.json()
        if(!res.ok) throw new Error(data.message || "Failed to reset password")
        return data
    }
}
export default AuthService

