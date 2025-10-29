'use client'

import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { exportProjectsToExcel, exportProjectsToCSV } from '@/lib/export-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ExportButton({ projects }: { projects: any[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          エクスポート
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportProjectsToExcel(projects)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel形式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportProjectsToCSV(projects)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV形式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
