import { getHandleStatusClass } from "@/core/handles/utils";
import { getServiceStatusClass } from "@/core/Services/utils";

function Legend() {
  return (
    <div className="flex items-stretch gap-2 rounded border-2 border-black bg-white p-1 text-xs text-black">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold">Handles</h3>
        <div className="flex items-center gap-1">
          <div className="base-handle">
            <div
              className={`handle react-flow__handle border-solid ${getHandleStatusClass(
                "SUCCESS",
              )}`}
            ></div>
          </div>
          <span className="mt-1">Running</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="base-handle">
            <div
              className={`handle react-flow__handle border-solid ${getHandleStatusClass(
                "PENDING",
              )}`}
            ></div>
          </div>
          <span className="mt-1">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="base-handle">
            <div
              className={`handle react-flow__handle border-solid ${getHandleStatusClass(
                "ERROR",
              )}`}
            ></div>
          </div>
          <span className="mt-1">Error</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="base-handle">
            <div
              className={`handle react-flow__handle border-solid ${getHandleStatusClass(
                "OFFLINE",
              )}`}
            ></div>
          </div>
          <span className="mt-1">Offline</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 border-l-2 pl-2">
        <h3 className="font-bold">Edges</h3>
        <div className="flex items-center gap-1">
          <svg
            height="2"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            className="react-flow__edge animated"
          >
            <path
              d="M0 0 L20 0"
              className="react-flow__edge-path custom-edge !stroke-[3px]"
            />
          </svg>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            height="2"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            className="react-flow__edge"
          >
            <path
              d="M0 0 L20 0"
              className="react-flow__edge-path pending-edge !stroke-[3px]"
            />
          </svg>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            height="2"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            className="react-flow__edge"
          >
            <path
              d="M0 0 L20 0"
              className="react-flow__edge-path error-edge !stroke-[3px]"
            />
          </svg>
          <span>Error</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            height="2"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            className="react-flow__edge"
          >
            <path
              d="M0 0 L20 0"
              className="react-flow__edge-path offline-edge !stroke-[3px]"
            />
          </svg>
          <span>Offline</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-nowrap border-l-2 bg-white pl-2">
        <h3 className="font-bold">Services</h3>
        <div className="flex items-center gap-1 pl-2">
          <div className={`status ${getServiceStatusClass("SUCCESS")}`}></div>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-1 pl-2">
          <div className={`status ${getServiceStatusClass("PENDING")}`}></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1 pl-2">
          <div className={`status ${getServiceStatusClass("ERROR")}`}></div>
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
