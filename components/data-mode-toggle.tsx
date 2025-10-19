"use client"

import { useData } from "@/lib/data-provider"
import { Button } from "@/components/ui/button"
import { Database, TestTube } from "lucide-react"

export function DataModeToggle() {
  const { mode, setMode } = useData()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
      <Button
        variant={mode === "mock" ? "default" : "ghost"}
        size="sm"
        onClick={() => setMode("mock")}
        className="gap-2"
      >
        <TestTube className="h-4 w-4" />
        Mock
      </Button>
      <Button
        variant={mode === "firebase" ? "default" : "ghost"}
        size="sm"
        onClick={() => setMode("firebase")}
        className="gap-2"
      >
        <Database className="h-4 w-4" />
        Firebase
      </Button>
    </div>
  )
}
