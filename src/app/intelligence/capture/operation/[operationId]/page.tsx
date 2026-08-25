import { CaptureForm } from "@/features/capture";

export default async function Page({
  params,
}: PageProps<"/intelligence/capture/operation/[operationId]">) {
  const { operationId } = await params;
  // The `key` forces a remount when the operation changes: the form keeps its
  // draft in local state and without this it would carry into the next site.
  return <CaptureForm key={operationId} operationId={operationId} />;
}
