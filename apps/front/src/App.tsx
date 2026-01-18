import { Button } from "@/components/ui/button"
import { Effect } from "effect"
import { useCallback, useMemo, useState } from "react"

function App() {
  const [count, setCount] = useState(0)

  const task = useMemo(
    () => Effect.sync(() => setCount((current) => current + 1)),
    [setCount]
  )

  const increment = useCallback(() => Effect.runSync(task), [task])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Cine App</h1>
      <div className="flex flex-col items-center gap-4">
        <Button onClick={increment}>count is {count}</Button>
        <p className="text-muted-foreground">
          Edit <code className="rounded bg-muted px-1">src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App
