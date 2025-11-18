import fs from "fs";
import path from "path";

export function saveContest(name, data) {
  const filePath = path.join(process.cwd(), "data", name+".json");

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}