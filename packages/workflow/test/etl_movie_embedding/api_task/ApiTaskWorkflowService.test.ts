import { NodeContext } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import { PlatformConfigProvider } from "@effect/platform"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { PgLive } from "@template/database/Sql"
import { Uuid } from "@template/domain/Uuid"
import { ImdbClientHttp } from "@template/utils/ImdbClientHttp"
import * as path from "node:path"
import { ApiTaskWorkFlowService } from "../../../src/etl_movie_embedding/api_task/ApiTaskWorkflowService.js"

describe("ApiTaskWorkflowService", () => {
  it("should run the etl", async () => {
    const program = Effect.gen(function*() {
      const repo = yield* RowMovieApiRepository
      const service = yield* ApiTaskWorkFlowService
      const ids = yield* service.run()
      return yield* yield* repo.findById(ids[0])
    })

    const envLayer = PlatformConfigProvider.layerDotEnv(
      path.join(process.cwd(), ".env")
    )

    const layer = Layer.mergeAll(
      RowMovieApiRepository.Default,
      ImdbClientHttp.InMemory,
      Uuid.Default,
      PgLive,
      NodeContext.layer,
      ApiTaskWorkFlowService.DefaultWithoutDependencies
    ).pipe(Layer.provide(envLayer))

    // On fournit les dépendances MANUELLEMENT

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer)))

    expect(result).toBeDefined()
    expect(result.payload.id).toBe("tt0000001")
    expect(result.payload.type).toBe("movie")
    expect(result.payload.primaryTitle).toBe("Mock Movie")
    expect(result.payload.originalTitle).toBe("Mock Movie Original")
  })
})
