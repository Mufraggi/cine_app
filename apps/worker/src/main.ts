import { ClusterWorkflowEngine, RunnerAddress } from "@effect/cluster"
import { FetchHttpClient } from "@effect/platform"
import { NodeClusterSocket, NodeRuntime } from "@effect/platform-node"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { PgLive } from "@template/database/Sql"
import { Uuid } from "@template/domain/Uuid"
import { ImdbClientHttp } from "@template/utils/ImdbClientHttp"
import { ApiTaskWorkflow, ApiTaskWorkflowLogic } from "@template/workflow/etl_movie_embedding/api_task/ApiTaskWorkflow"
import { ApiTaskWorkFlowService } from "@template/workflow/etl_movie_embedding/api_task/ApiTaskWorkflowService"
import { Effect, Layer, Option } from "effect"

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
  Layer.provide(ApiTaskWorkFlowService.Default),
  Layer.provide(RowMovieApiRepository.Default),
  Layer.provide(ImdbClientHttp.Default),
  Layer.provide(RunnerLayer),
  Layer.provide(BaseDependenciesLayer)
)

const AppLayer = Layer.mergeAll(ApiTaskWorkflowWorkerLayer)
Layer.launch(AppLayer)
  .pipe(NodeRuntime.runMain)
