import { Workflow } from "@effect/workflow"
import { Effect, Schema } from "effect"
import { RawMovieApiId } from "../../../../domain/src/rawMovieApi/RawMovieApiType.js"
import { MovieTaskWorkflow } from "../movie_task/MovieTaskWorkflow.js"
import { VectorTaskWorkflowService } from "./VectorTaskWorkflowService.js"

export class VectorTaskWorkflowError
  extends Schema.TaggedError<VectorTaskWorkflowError>("VectorTaskWorkflowError")("VectorTaskWorkflowError", {
    message: Schema.String
  })
{}

export const VectorTaskWorkflow = Workflow.make({
  name: "VectorTaskWorkflow",
  success: Schema.Void,
  error: VectorTaskWorkflowError,
  payload: Schema.Struct({ id: RawMovieApiId, date: Schema.String }),
  idempotencyKey: ({ date, id }) => `VectorTaskWorkflow-${date}-${id}`
})

export const VectorTaskWorkflowLogic = (payload: { id: RawMovieApiId; date: string }) =>
  Effect.gen(function*() {
    const logic = yield* VectorTaskWorkflowService
    yield* Effect.log("Starting VectorTask", payload.id)
    yield* logic.run(payload.id).pipe(
      Effect.flatMap((id) => MovieTaskWorkflow.execute({ id, date: payload.date }, { discard: true })),
      Effect.asVoid
    )
  })
