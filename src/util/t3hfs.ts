import * as fs from "fs";
import * as path from "path";

export async function readAllFilesInDir(dir: string): Promise<File[]> {
  const infos = await statDir(dir);
  const files = await readAllFiles(infos);
  return files;
}

/**
 * Runs fs.stat on every item in dir returning {dir, name, path, stats}[].
 */
function statDir(dir: string, encoding: BufferEncoding = "utf-8"): Promise<Info[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, encoding, (err, listing) => {
      if (err) reject(err);
      else fsstatAll(dir, listing, resolve, reject);
    });
  });
}

/**
 * Reads all files (skips any items that are dirs)
 * @param {infos[]} infos - An info is a {dir, name, path, stats}, may be a file or dir.
 */
function readAllFiles(infos: Info[]): Promise<File[]> {
  return new Promise<File[]>((resolve, reject) => {
    fsreadfileAll(infos, resolve, reject);
  });
}

function fsreadfileAll(
  infos: Info[],
  resolve: (files: File[]) => void,
  reject: (err: NodeJS.ErrnoException) => void,
  i = 0,
  files: File[] = []
): void {
  const currentItem = infos[i];
  if (currentItem.stats.isFile()) {
    fs.readFile(currentItem.path, "utf-8", (err, data) => {
      if (err) reject(err);
      else files.push({ ...currentItem, data });
      iterate();
    });
  } else {
    iterate();
  }

  function iterate() {
    i++;
    if (i < infos.length) {
      fsreadfileAll(infos, resolve, reject, i, files);
    } else {
      resolve(files);
    }
  }
}

/**
 * Stats all the files in listing one at a time via asynchronous callback recursion.
 * @param {string} dir - Directory that the listing of item comes from.
 * @param {string[]} listing - List of files and directories from a fs.readdir call.
 * @param {number} i - Current index, should be 0 if you are calling this
 * @param resolve - resolve function from Promise that you wrapped this in.
 * @param reject - reject function from Promise that you wrapped this in.
 * @param {number} i - Position in listing for next iteration.
 * @param {[]} infos - Array with results, {dir, name, path, stats}, stats beign the fs.stat result.
 */
function fsstatAll(
  dir: string,
  listing: string[],
  resolve: (info: Info[]) => void,
  reject: (err: NodeJS.ErrnoException) => void,
  i = 0,
  infos: Info[] = []
): void {
  const fileName = listing[i]; // We don't know if this is a file yet.
  const filePath = path.join(dir, fileName);

  fs.stat(filePath, (err, stats) => {
    if (err) reject(err);
    else if (stats.isFile()) {
      const info = {
        dir: dir,
        name: fileName,
        path: filePath,
        stats: stats,
      };
      infos.push(info);
    }
    i++;
    if (i < listing.length) {
      fsstatAll(dir, listing, resolve, reject, i, infos);
    } else {
      resolve(infos);
    }
  });
}

interface Info {
  dir: string;
  name: string;
  path: string;
  stats: fs.Stats;
}

interface File extends Info {
  data: string;
}
