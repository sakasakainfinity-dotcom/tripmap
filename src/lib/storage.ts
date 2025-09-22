export const MEMORIES_BUCKET = "memories";

export const buildPhotoPath = (
  spaceId: string,
  placeId: string,
  memoryId: string,
  fileName: string
) => {
  const extension = fileName.split(".").pop() ?? "jpg";
  return `${spaceId}/${placeId}/${memoryId}/${crypto.randomUUID()}.${extension}`;
};
