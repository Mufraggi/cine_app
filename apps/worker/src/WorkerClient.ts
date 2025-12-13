import { ClusterWorkflowEngine } from "@effect/cluster"
import { NodeClusterSocket } from "@effect/platform-node"
import { PgLive } from "@template/database/Sql"
import { Effect, Layer } from "effect"

const ShardingLayer = Layer.unwrapEffect(
  Effect.gen(function*() {
    yield* Effect.log("ShardingLayer")
    return NodeClusterSocket.layer({
      clientOnly: true,
      // storage: "sql",
      shardingConfig: {
        // shardManagerAddress: RunnerAddress.make(shardManagerHost, 8080)
      }
    })
  })
).pipe(
  Layer.orDie
)

export const ClusterLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(ShardingLayer),
  Layer.provideMerge(PgLive)
)
