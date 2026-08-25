import { CaptureWorkspace } from "@/features/capture";

export default async function Page({
  params,
}: PageProps<"/intelligence/capture/operation/[operationId]">) {
  const { operationId } = await params;
  return <CaptureWorkspace selectedId={operationId} />;
}
