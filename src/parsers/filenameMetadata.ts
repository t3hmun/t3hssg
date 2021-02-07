const metadataRegex = /(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d)(-(?<time>\d\d\d\d))?-(?<title>.+)\.md/;

export interface FilenameMetadata {
  date: Date;
  title: string;
}

export function extractMetadataFromFileName(fileName: string): FilenameMetadata {
  metadataRegex.lastIndex = 0;
  const rgxResult = metadataRegex.exec(fileName);
  if (rgxResult === null) throw new Error(`Filename ${fileName} did not match metadata regex.`);
  const groups = rgxResult.groups;
  if (groups === undefined)
    throw new Error(`No groups found on filename ${fileName} when trying to regex the metadata.`);
  const time = groups.time || "0000";
  const hours = time.slice(0, 2);
  const minutes = time.slice(2);
  const date = new Date(
    Number(groups.year),
    Number(groups.month),
    Number(groups.day),
    Number(hours),
    Number(minutes)
  );
  return {
    date: date,
    title: groups.title,
  };
}
