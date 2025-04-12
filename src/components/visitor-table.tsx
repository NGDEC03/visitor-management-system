import { useMemo, useState } from "react"
import useSWR from "swr"
import { VisitorService } from "@/services/visitorService"
import { useSession } from "next-auth/react"
import { Loader2, ChevronUp, ChevronDown } from "lucide-react"
import { useVirtual, VirtualItem } from "react-virtual"

interface VisitorTableProps {
  searchQuery?: string
}

interface Visitor {
  id: string
  name: string
  email: string
  phone: string
  status: "approved" | "pending" | "rejected"
  checkInTime?: string
  checkOutTime?: string
}

type SortField = "name" | "email" | "status" | "checkInTime"
type SortOrder = "asc" | "desc"

export function VisitorTable({ searchQuery = "" }: VisitorTableProps) {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("checkInTime")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const pageSize = 20
  
  const { data: visitors, error, isLoading } = useSWR<Visitor[]>(
    session?.user?.id ? ['/api/visitors', session.user.id, searchQuery, page, sortField, sortOrder] : null,
    async ([_, userId, query, page, sortField, sortOrder]) => {
      const visitorService = new VisitorService()
      const data = await (session?.user?.role === "security" || session?.user?.role === "admin"
        ? visitorService.getTotalVisitors(query as string)
        : visitorService.getTotalVisitors(userId as string))
      
      return data.sort((a: Visitor, b: Visitor) => {
        const aValue = a[sortField as keyof Visitor] ?? ""
        const bValue = b[sortField as keyof Visitor] ?? ""
        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1
        }
        return aValue < bValue ? 1 : -1
      })
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  )

  const memoizedVisitors = useMemo(() => visitors || [], [visitors])

  const parentRef = useMemo(() => ({ current: null }), [])
  const rowVirtualizer = useVirtual({
    size: memoizedVisitors.length,
    parentRef,
    estimateSize: useMemo(() => () => 50, []),
    overscan: 5
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">Error loading visitors</p>
      </div>
    )
  }

  if (!memoizedVisitors.length) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-gray-500">No visitors found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  {sortField === "name" && (
                    sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortField === "email" && (
                    sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortField === "status" && (
                    sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("checkInTime")}
              >
                <div className="flex items-center">
                  Check-in Time
                  {sortField === "checkInTime" && (
                    sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody 
            className="bg-white divide-y divide-gray-200 relative"
            ref={parentRef}
            style={{ height: `${rowVirtualizer.totalSize}px` }}
          >
            {rowVirtualizer.virtualItems.map((virtualRow: VirtualItem) => {
              const visitor = memoizedVisitors[virtualRow.index]
              return (
                <tr
                  key={visitor.id}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visitor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visitor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visitor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      visitor.status === "approved" ? "bg-green-100 text-green-800" :
                      visitor.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : "-"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={memoizedVisitors.length < pageSize}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{page}</span> to{' '}
              <span className="font-medium">{Math.ceil(memoizedVisitors.length / pageSize)}</span> of{' '}
              <span className="font-medium">{memoizedVisitors.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={memoizedVisitors.length < pageSize}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 