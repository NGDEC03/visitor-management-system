import { AxiosHttpClient } from "./httpClient";
import { VisitorService } from "./visitorService";
import { AuthService } from "./authService";

class ServiceProvider {
  private static instance: ServiceProvider;
  private httpClient: AxiosHttpClient;
  private visitorService: VisitorService;
  private authService: AuthService;

  private constructor() {
    this.httpClient = new AxiosHttpClient();
    this.visitorService = new VisitorService(this.httpClient);
    this.authService = new AuthService(this.httpClient);
  }

  public static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }

  public getVisitorService(): VisitorService {
    return this.visitorService;
  }

  public getAuthService(): AuthService {
    return this.authService;
  }
}

export const serviceProvider = ServiceProvider.getInstance(); 