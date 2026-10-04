import { createActor } from "@/backend";

/**
 * Shared backend actor accessor.
 *
 * `createActor` is the generated bindgen factory. Every hook passes this
 * reference to `useActor(createActor)` so the actor is created once per
 * identity and shared through React Query.
 */
export { createActor };

export type { Backend } from "@/backend";
