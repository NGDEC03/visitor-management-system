import { visitorStatusProp } from "@/types/visitor"
import { Visitor } from "./api"
import axios from "axios"
import { visitorFlowDataProp } from "@/components/visitor-flow-chart"
import { departmentVisitorProp } from "@/types/departmentVisitor"

export class VisitorService {
    public id?:string
    public visitor?:Visitor
constructor(id?:string,visitor?:Visitor){
this.id=id
this.visitor=visitor
}
  async getVisitors(): Promise<Visitor[]> {
    const response = await axios.get<Visitor[]>(`/api/visitors`)
    return response.data
  }
  async getVisitorDetails(id: string): Promise<Visitor> {
    const response = await axios.get<Visitor>(`/api/visitors/getVisitorId?visitorId=${id}`)
    return response.data
  }
  async getFlowData(hostId:string): Promise<visitorFlowDataProp[]> {
    const response = await axios.get<visitorFlowDataProp[]>(`/api/visitors/flow-data?hostId=${hostId}`)
    return response.data
  }
  async createVisitor() {
    console.log("service invoked");
    const response = await axios.post(`/api/visitors`, this.visitor)
    return response.data
  }
  async updateVisitor(visitorId: string,status:string): Promise<Visitor> {
    const response = await axios.put<Visitor>(`/api/visitors/updateVisitor`, {visitorId,status})
    return response.data
  }
  async getDepartmentVisitors(hostId:string): Promise<departmentVisitorProp[]> {
    const response = await axios.get<departmentVisitorProp[]>(`/api/visitors/department-visitor?hostId=${hostId}`)
    return response.data
  }
  async getVisitorsByHost(hostId:string): Promise<Visitor[]> {
    const response = await axios.get<Visitor[]>(`/api/visitors/getByHost?hostId=${hostId}`)
    return response.data
  }
  async getTotalVisitors(hostId:string) {
    const response = await axios.get(`/api/visitors/total-visitor?hostId=${hostId}`)
    return response.data
  }
async getVisitorsStatus(hostId:string): Promise<visitorStatusProp> {
    const response = await axios.get(`/api/visitors/status?hostId=${hostId}`)
    return response.data
}
async getVisitorStatus():Promise<visitorStatusProp>{
  const response = await axios.get(`/api/visitors/status`)
  return response.data
}
}
