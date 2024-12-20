export function getHandleStatusClass(status: IStreamStatus) {
  switch (status) {
    case "SUCCESS":
      return "handle--running";
    case "ERROR":
      return "handle--error";
    case "OFFLINE":
      return "handle--offline";
    case "PENDING":
    case "PENDING_DELETE":
      return "handle--pending";
    default:
      return "handle--offline";
  }
}
