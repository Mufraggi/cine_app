import { Workflow } from "@effect/workflow"
import { Effect, Schema } from "effect"
import { VectorTaskWorkflow } from "../vector_task/VectorTaskWorkflow.js"
import { ApiTaskWorkFlowService } from "./ApiTaskWorkflowService.js"

export class ApiTaskWorkflowError
  extends Schema.TaggedError<ApiTaskWorkflowError>("ApiTaskWorkflowError")("ApiTaskWorkflowError", {
    message: Schema.String
  })
{}

export const ApiTaskWorkflow = Workflow.make({
  name: "ApiTaskWorkflow",
  success: Schema.Void,
  error: ApiTaskWorkflowError,
  payload: Schema.Struct({ date: Schema.String }),
  idempotencyKey: ({ date }) => `ApiTaskWorkflow-${date}`
})

export const ApiTaskWorkflowLogic = (payload: { date: string }) =>
  Effect.gen(function*() {
    const logic = yield* ApiTaskWorkFlowService
    yield* logic.run().pipe(
      Effect.flatMap((ids) => {
        const trigers = ids.map((id) => VectorTaskWorkflow.execute({ id, date: payload.date }))
        return Effect.all(trigers)
      }),
      Effect.asVoid
    )
  })
