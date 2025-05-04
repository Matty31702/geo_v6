import { ReactNode } from "react"

interface TableProps {
  children: ReactNode;
}

const Table: React.FC<TableProps> = ({children}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  )
}

export default Table
