// AV inputs and outputs that are registered with a Node machine.
export interface AudioVisualIO {
  has_video: boolean;
  has_audio: boolean;
  name: string;
}
