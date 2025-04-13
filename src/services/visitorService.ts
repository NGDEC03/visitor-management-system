import { Visitor } from "./api"
import { visitorFlowDataProp } from "@/components/visitor-flow-chart"
import { departmentVisitorProp } from "@/types/departmentVisitor"
import { visitorStatusProp, visitorDataProp } from "@/types/visitor"
import { HttpClient, IVisitorReader, IVisitorWriter, IVisitorAnalytics } from "./interfaces"

export class VisitorService implements IVisitorReader, IVisitorWriter, IVisitorAnalytics {
  constructor(private httpClient: HttpClient) {}

  async getVisitors(): Promise<Visitor[]> {
    return this.httpClient.get<Visitor[]>("/api/visitors")
  }

  async getVisitorDetails(email: string): Promise<Visitor> {
    return this.httpClient.get<Visitor>(`/api/visitors/getVisitorByEmail?visitorEmail=${email}`)
  }

  async getFlowData(hostId: string): Promise<visitorFlowDataProp[]> {
    return this.httpClient.get<visitorFlowDataProp[]>(`/api/visitors/flow-data?hostId=${hostId}`)
  }
  async getFlowDataByDate(): Promise<visitorFlowDataProp[]> {
    return this.httpClient.get<visitorFlowDataProp[]>(`/api/visitors/flow-data`)
  }


  async createVisitor(visitor: Visitor): Promise<Visitor> {
    return this.httpClient.post<Visitor>("/api/visitors", visitor)
  }

  async updateVisitor(visitorId: string, status: string): Promise<Visitor> {
    return this.httpClient.put<Visitor>("/api/visitors/updateVisitor", { visitorId, status })
  }

  async getDepartmentVisitors(): Promise<departmentVisitorProp[]> {
    return this.httpClient.get<departmentVisitorProp[]>(`/api/visitors/department-visitor`)
  }

  async getVisitorsByHost(hostId: string): Promise<Visitor[]> {
    return this.httpClient.get<Visitor[]>(`/api/visitors/getByHost?hostId=${hostId}`)
  }

  async getTotalVisitors(hostId: string): Promise<visitorDataProp> {
    return this.httpClient.get<visitorDataProp>(`/api/visitors/total-visitor?hostId=${hostId}`)
  }

  async getVisitorsStatus(hostId: string): Promise<visitorStatusProp> {
    return this.httpClient.get<visitorStatusProp>(`/api/visitors/status?hostId=${hostId}`)
  }

  async getVisitorStatus(): Promise<visitorStatusProp> {
    return this.httpClient.get<visitorStatusProp>("/api/visitors/status")
  }
}
