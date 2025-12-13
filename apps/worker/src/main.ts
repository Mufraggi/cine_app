import { ClusterWorkflowEngine, RunnerAddress } from "@effect/cluster"
import { FetchHttpClient } from "@effect/platform"
import { NodeClusterSocket, NodeRuntime } from "@effect/platform-node"
import { PgLive } from "@template/database/Sql"
import { ApiTaskWorkflow, ApiTaskWorkflowLogic } from "@template/workflow/etl_movie_embedding/api_task/ApiTaskWorkflow"
import { Effect, Layer, Option } from "effect"
import { RowMovieApiRepository } from "../../../packages/database/src/repositories/RowMovieApiRepository.js"
import { ImdbClientHttp } from "../../../packages/utils/src/ImdbClientHttp.js"
const RunnerLayer = Layer.unwrapEffect(Effect.succeed(
  NodeClusterSocket.layer({
    shardingConfig: {
      runnerAddress: Option.some(RunnerAddress.make("0.0.0.0", 34431)),
      runnerListenAddress: Option.some(RunnerAddress.make("0.0.0.0", 34431))
    }
  })
))
const BaseDependenciesLayer = Layer.mergeAll(
    Uuid,
  PgLive,
  FetchHttpClient.layer
)

const ApiTaskWorkflowWorkerLayer = ApiTaskWorkflow.toLayer(ApiTaskWorkflowLogic).pipe(
  Layer.provide(ClusterWorkflowEngine.layer),

    Layer.provide(RowMovieApiRepository.Default),
  Layer.provide(ImdbClientHttp.Default)
  
  Layer.provide(RunnerLayer),
     Layer.provide(BaseDependenciesLayer),

 
)



const AppLayer = Layer.mergeAll()
Layer.launch(AppLayer)
  .pipe(NodeRuntime.runMain)
