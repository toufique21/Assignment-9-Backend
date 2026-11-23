/** Converts a Mongo document into the id-based shape used by the client. */
export function serialize(document) {
  if (!document) return document

  const { _id, ...rest } = document

  return { ...rest, id: _id.toString() }
}
