import { Crop } from "smartcrop";

export class CropResult {
  public id: number;
  public result: Crop | null;

  constructor(id: number, result: Crop | null) {
    this.id = id;
    this.result = result;
  }
}
