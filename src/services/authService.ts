import { HttpClient, IAuthService } from "./interfaces";

export class AuthService implements IAuthService {
    constructor(private httpClient: HttpClient) {}

    async forgotPassword(email: string): Promise<any> {
        return this.httpClient.post("/api/auth/forgot-password", { email });
    }

    async resetPassword(token: string, password: string): Promise<any> {
        return this.httpClient.post("/api/auth/reset-password", { token, password });
    }
}

