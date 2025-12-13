import { Workflow } from "@effect/workflow"
import { RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Effect, Schema } from "effect"
import { MovieTaskWorkflowService } from "./MovieTaskWorkflowService.js"

export class MovieTaskWorkflowError
  extends Schema.TaggedError<MovieTaskWorkflowError>("MovieTaskWorkflowError")("MovieTaskWorkflowError", {
    message: Schema.String
  })
{}

export const MovieTaskWorkflow = Workflow.make({
  name: "MovieTaskWorkflow",
  success: Schema.Void,
  payload: Schema.Struct({ id: RawMovieEmbeddingId, date: Schema.String }),
  idempotencyKey: ({ date, id }) => `MovieTaskWorkflow-${date}-${id}`
})

export const MovieTaskWorkflowLogic = (payload: { id: RawMovieEmbeddingId; date: string }) =>
  Effect.gen(function*() {
    const logic = yield* MovieTaskWorkflowService
    yield* logic.run(payload.id).pipe(
      Effect.asVoid
    )
  })
