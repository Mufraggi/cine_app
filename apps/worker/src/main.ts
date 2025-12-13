import { ClusterWorkflowEngine, RunnerAddress } from "@effect/cluster"
import { FetchHttpClient, PlatformConfigProvider } from "@effect/platform"
import { NodeClusterSocket, NodeContext, NodeRuntime } from "@effect/platform-node"
import { MovieRepository } from "@template/database/repositories/MovieRepository"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { RawMovieEmbeddingRepository } from "@template/database/repositories/RowMovieEmbeddingRepository"
import { PgLive } from "@template/database/Sql"
import { Uuid } from "@template/domain/Uuid"
import { ImdbClientHttp } from "@template/utils/ImdbClientHttp"
import { VectorLlmClient } from "@template/utils/VectorLlmClient"
import { ApiTaskWorkflow, ApiTaskWorkflowLogic } from "@template/workflow/etl_movie_embedding/api_task/ApiTaskWorkflow"
import { ApiTaskWorkFlowService } from "@template/workflow/etl_movie_embedding/api_task/ApiTaskWorkflowService"
import {
  MovieTaskWorkflow,
  MovieTaskWorkflowLogic
} from "@template/workflow/etl_movie_embedding/movie_task/MovieTaskWorkflow"
import { MovieTaskWorkflowService } from "@template/workflow/etl_movie_embedding/movie_task/MovieTaskWorkflowService"
import {
  VectorTaskWorkflow,
  VectorTaskWorkflowLogic
} from "@template/workflow/etl_movie_embedding/vector_task/VectorTaskWorkflow"
import { VectorTaskWorkflowService } from "@template/workflow/etl_movie_embedding/vector_task/VectorTaskWorkflowService"
import { Effect, Layer, Option } from "effect"
import * as path from "node:path"

const RunnerLayer = Layer.unwrapEffect(
  Effect.succeed(
    NodeClusterSocket.layer({
      shardingConfig: {
        runnerAddress: Option.some(RunnerAddress.make("0.0.0.0", 34431)),
        runnerListenAddress: Option.some(RunnerAddress.make("0.0.0.0", 34431))
      }
    })
  )
)
const ConfigLayer = PlatformConfigProvider.layerDotEnv(
  path.join(process.cwd(), ".env")
)

const PlatformLayer = Layer.mergeAll(
  FetchHttpClient.layer,
  NodeContext.layer
)

const ServicesLayer = Layer.mergeAll(
  PgLive,
  RowMovieApiRepository.Default,
  Uuid.Default,
  ImdbClientHttp.Default,
  RawMovieEmbeddingRepository.Default,
  VectorLlmClient.Default,
  MovieRepository.Default
)

// Combine all base dependencies with proper ordering
const BaseDependenciesLayer = ServicesLayer.pipe(
  Layer.provide(ConfigLayer),
  Layer.provide(PlatformLayer)
)
const ApiTaskWorkflowWorkerLayer = ApiTaskWorkflow.toLayer(ApiTaskWorkflowLogic).pipe(
  Layer.provide(ClusterWorkflowEngine.layer),
  Layer.provide(ApiTaskWorkFlowService.Default),
  Layer.provide(RunnerLayer),
  Layer.provide(BaseDependenciesLayer)
)

const VectorTaskWorkflowWorkerLayer = VectorTaskWorkflow.toLayer(VectorTaskWorkflowLogic).pipe(
  Layer.provide(ClusterWorkflowEngine.layer),
  Layer.provide(VectorTaskWorkflowService.Default),
  Layer.provide(RunnerLayer),
  Layer.provide(BaseDependenciesLayer)
)

const MovieTaskWorkflowWorkerLayer = MovieTaskWorkflow.toLayer(MovieTaskWorkflowLogic).pipe(
  Layer.provide(ClusterWorkflowEngine.layer),
  Layer.provide(MovieTaskWorkflowService.Default),
  Layer.provide(RunnerLayer),
  Layer.provide(BaseDependenciesLayer)
)

const AppLayer = Layer.mergeAll(ApiTaskWorkflowWorkerLayer, VectorTaskWorkflowWorkerLayer, MovieTaskWorkflowWorkerLayer)
Layer.launch(AppLayer)
  .pipe(NodeRuntime.runMain)
