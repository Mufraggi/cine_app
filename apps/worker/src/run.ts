import { Effect } from "effect"
import { ApiTaskWorkflow } from "../../../packages/workflow/src/etl_movie_embedding/api_task/ApiTaskWorkflow.js"
import { ClusterLayer } from "./WorkerClient.js"

const program = Effect.gen(function*() {
  const result = yield* ApiTaskWorkflow.execute({ date: new Date().toISOString() })
  return result
}).pipe(Effect.provide(ClusterLayer))

Effect.runPromise(program)
