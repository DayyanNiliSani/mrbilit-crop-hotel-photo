import smartcrop from "smartcrop-sharp";
import axios from "axios";
import { CropResult } from "./cropResult";
import sql from "mssql";
import sqlConfig from "./database";

const MAX_TASKS = 5;
const WIDTH = 676;
const HEIGHT = 378;
const URL_PREFIX = "https://s.mrbilit.com/mrhotel/";

async function getSmartCrop(id: number, photo: string): Promise<CropResult> {
  const fileBuffer = (await (
    await axios({
      baseURL: URL_PREFIX,
      url: photo,
      responseType: "arraybuffer",
      maxContentLength: 1024 * 1024 * 20,
    })
  ).data) as Buffer;

  if (fileBuffer.length == 0) return new CropResult(id, null);

  const crop = (
    await smartcrop.crop(fileBuffer, {
      width: WIDTH,
      height: HEIGHT,
    } as any)
  ).topCrop;

  return new CropResult(id, crop);
}

async function main() {
  await sql.connect(sqlConfig);
  var isLastPage = false;
  while (!isLastPage) {
    const sqlResult = await sql.query(
      `select top ${MAX_TASKS} * from HotelPhotos where TopLeftX is null`
    );
    if (sqlResult.rowsAffected[0] < MAX_TASKS) isLastPage = true;
    var crops: Promise<CropResult>[] = sqlResult.recordset.map((record) =>
      getSmartCrop(record["Id"], record["Photo"])
    );
    const result = await Promise.all(crops);

    var updateQuery = "";

    for (var r of result) {
      if (r.result == null) {
        console.log(
          `photo with id = ${r.id} is not found and should be updated`
        );

        updateQuery +=
          `update HotelPhotos set TopLeftX = ${0}, ` +
          `TopLeftY = ${0}, ` +
          `BottomRightX = ${0}, ` +
          `BottomRightY = ${0} where id = ${r.id}; `;
      } else {
        updateQuery +=
          `update HotelPhotos set TopLeftX = ${r.result.x}, ` +
          `TopLeftY = ${r.result.y}, ` +
          `BottomRightX = ${r.result.x + r.result.width}, ` +
          `BottomRightY = ${r.result.y + r.result.height} where id = ${r.id}; `;
      }
    }
    await sql.query(updateQuery);
  }
}

main();
