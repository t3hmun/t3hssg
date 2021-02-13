import * as fs from "fs";
import * as path from "path";

export async function readAllFilesInDir(dir: string): Promise<File[]> {
  const infos = await statDir(dir);
  const files = await readAllFiles(infos);
  return files;
}

/**
 * Json stingifies and writes each item in an array to file using supplied fuinction to compute filename.
 * Parallel writes should be fast on most systems due to caching and OS magic. Also I hear SSDs can do parallel.
 * Probably bad for large files (>100mb total data i guess?) on a spinning HDD.
 * @param path - A function that computes the path using the data item.
 * @returns promise, rejects on first fail.
 */
export async function writeAllParallel<T>(path: (item: T) => string, data: T[]) {
  await Promise.all(
    data.map(
      (d) =>
        new Promise<void>((resolve, reject) => {
          fs.writeFile(path(d), JSON.stringify(d), (err) => {
            err ? reject(err) : resolve();
          });
        })
    )
  );
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
