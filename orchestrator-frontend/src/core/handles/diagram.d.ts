import { NEW_STREAM_HANDLE, BASE_HANDLE } from "./constants";

export const handleTypes = [BASE_HANDLE, NEW_STREAM_HANDLE] as const;
export type HandleType = (typeof handleTypes)[number];

type IHandle = {
  isInput: boolean;
  status: IStreamStatus;
  name: string;
  id: string;
  nodeId: string;
  type: HandleType;
  isConnectable: boolean;
  errors?: IError[];
};

interface IPortHandle extends IHandle {
  port: number;
}
