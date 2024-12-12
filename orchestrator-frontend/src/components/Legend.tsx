function Legend() {
  return (
    <div className="flex items-start gap-2 rounded border-2 border-black bg-white p-1 text-xs text-black">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold">Handles</h3>
        <div className="flex items-center gap-1">
          <div className="handle react-flow__handle handle--running"></div>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="handle react-flow__handle handle--stopped"></div>
          <span>Stopped</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="handle react-flow__handle handle--error"></div>
          <span>Error</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="handle react-flow__handle handle--offline"></div>
          <span>Offline</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-nowrap border-l-2 bg-white pl-2">
        <h3 className="font-bold">Nodes</h3>
        <div className="flex items-center gap-1 pl-2">
          <div className="status status--running"></div>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-1 pl-2">
          <div className="status status--stopped"></div>
          <span>Stopped</span>
        </div>
        <div className="flex items-center gap-1 pl-2">
          <div className="status status--error"></div>
          <span>Error</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="custom-node--offline custom-node h-5 w-5"></div>
          <span>Offline</span>
        </div>
        <div className="selected flex items-center gap-1">
          <div className="custom-node custom-node h-5 w-5"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}

export default Legend;
