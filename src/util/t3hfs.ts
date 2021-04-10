import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

export async function readAllFilesInDir(dir: string): Promise<File[]> {
  const infos = await statDirFiles(dir);
  const files = await readAllFiles(infos);
  return files;
}

/**
 * Writes each array item to file using supplied fuinctions to compute filename and contents.
 * Parallel writes should be fast on most systems due to caching and OS magic. Also I hear SSDs can do parallel.
 * Probably bad for large files (>100mb total data i guess?) on a spinning HDD.
 * @param data - Array of items that contain data to be written to file.
 * @param path - A function that computes the path using the data item.
 * @param serialise - A function to get a string to write as the file contents.
 * @returns promise, rejects on first fail.
 */
export async function writeAllParallel<T>(
  data: T[],
  path: (item: T) => string,
  serialise: (item: T) => string
) {
  await Promise.all(
    data.map(
      (d) =>
        new Promise<void>((resolve, reject) => {
          fs.writeFile(path(d), serialise(d), (err) => {
            err ? reject(err) : resolve();
          });
        })
    )
  );
}

/**
 * Writes each array item to file using supplied fuinctions to compute filename and contents.
 * Parallel writes should be fast on most systems due to caching and OS magic. Also I hear SSDs can do parallel.
 * Probably bad for large files (>100mb total data i guess?) on a spinning HDD.
 * @param data - Array of items that contain data to be written to file.
 * @param dirNamer - Function that creatrs a directory name for the file. This will be created if it does not exist.
 * @param fileNamer - Function that creatrs a file name for the file.
 * @param serialise - A function to get a string to write as the file contents.
 * @returns promise, rejects on first fail.
 */
export async function writeAllEnsuredParallel<T>(
  data: T[],
  dirNamer: (item: T) => string,
  fileNamer: (item: T) => string,
  serialise: (item: T) => string
) {
  await Promise.all(
    data.map((d) => {
      const dirPath = dirNamer(d);
      const fileName = fileNamer(d);
      const filePath = path.join(dirPath, fileName);
      ensureDirCreated(dirPath).then(
        () =>
          new Promise<void>((resolve, reject) => {
            fs.writeFile(filePath, serialise(d), (err) => {
              err ? reject(err) : resolve();
            });
          })
      );
    })
  );
}

/**
 * Checks if a dir and its parent dirs exists and creates them if they don't exist.
 * @param dirPath - The path of the dir.
 * @returns - And fs error (from fs.stat or fs.mkdir) or void on success.
 */
export function ensureDirCreated(dirPath: string) {
  return new Promise<void>((resolve, reject) => {
    fs.stat(dirPath, (err) => {
      if (err) {
        // ENOENT is the C error for error no entry, which means missing.
        if (err.code == "ENOENT") {
          let dirAbove = path.join(dirPath, "../");
          // Recursively make sure the super-dir exists before creating this one.
          ensureDirCreated(dirAbove)
            .then(() => {
              fs.mkdir(dirPath, 666, (err) => {
                if (err) {
                  reject(err);
                } else {
                  // Directory created, success.
                  resolve();
                  // There is no more code after this point.
                }
              });
            })
            .catch((err) => {
              // Error in the recursive call, propagate the error down to the original caller.
              reject(err);
            });
        } else {
          // Any fs error that isn't ENOENT must be dealt with by the caller.
          reject(err);
        }
      } else {
        // Directory already exists, success.
        resolve();
      }
    });
  });
}

/**
 * Runs fs.stat on every item in dir returning {dir, name, path, stats}[]. Ignores sub-sirs.
 */
function statDirFiles(dir: string, encoding: BufferEncoding = "utf-8"): Promise<Info[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, encoding, (err, listing) => {
      if (err) reject(err);
      else fsstatAllFiles(dir, listing, resolve, reject);
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
  if (infos.length === 0) resolve(files);
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
 * @param {[]} infos - Array with results, {dir, name, path, stats}, stats being the fs.stat result.
 */
function fsstatAllFiles(
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
        isFile: stats.isFile(),
        isDir: stats.isDirectory(),
        stats: stats,
      };
      infos.push(info);
    }
    i++;
    if (i < listing.length) {
      fsstatAllFiles(dir, listing, resolve, reject, i, infos);
    } else {
      resolve(infos);
    }
  });
}

interface Info {
  /** The dir that contains the named file or dir. */
  dir: string;
  /** The name of this file or dir. */
  name: string;
  /** The full path of this name or dir (is dir and name combined) */
  path: string;
  /** The full fs.Stats including modification timestamps and size. */
  stats: fs.Stats;
  /** Is this a file. This is the stats.isFile() result. */
  isFile: boolean;
  /** Is this a boolean. This is the stats.isDirectory result. */
  isDir: boolean;
}

interface InfoRelative extends Info {
  baseDir: string;
  relDir: string;
}

interface File extends Info {
  data: string;
}

export async function statFilesInDirOnly(dirPath: string): Promise<Info[]> {
  const files = await fsp.readdir(dirPath);

  const allStats = await mapAsyncSequential(files, async (fileName) => {
    const filePath = path.join(dirPath, fileName); //May be a dir.
    const stats = await fsp.stat(filePath);
    return { fileName, filePath, stats };
  });

  return allStats
    .filter((f) => f.stats.isFile())
    .map<Info>((f) => ({
      dir: dirPath,
      name: f.fileName,
      path: f.filePath,
      stats: f.stats,
      isFile: f.stats.isFile(),
      isDir: f.stats.isDirectory(),
    }));
}

async function mapAsyncSequential<Tin, Tout>(
  arr: Tin[],
  func: (item: Tin) => Promise<Tout>
): Promise<Tout[]> {
  const ret = [];
  for (let i = 0; i < arr.length; i++) {
    ret.push(await func(arr[i]));
  }
  return ret;
}
