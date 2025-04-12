export interface visitorStatusProp {
  status: {
    approved: number,
    checkedIn: number,
    checkedOut: number,
    pending: number,
    rejected: number
  }
}

export interface visitorDataProp {
  totalVisitorsToday: number
  totalVisitorsYesterday: number
} 