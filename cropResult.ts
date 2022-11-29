import { Crop } from "smartcrop";

export class CropResult {
  public id: number;
  public result: Crop;

  constructor(id: number, result: Crop) {
    this.id = id;
    this.result = result;
  }
}
