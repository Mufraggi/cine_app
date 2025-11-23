import { Schema } from "effect"

export const RawMovieApiId = Schema.UUID.pipe(Schema.brand("RawMovieApiId"))
export type RawMovieApiId = typeof RawMovieApiId.Type
