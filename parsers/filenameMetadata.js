const metadataRegex = new RegExp(
  /(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d)(-(?<time>\d\d\d\d))?-(?<title>.+)\.md/
);

module.exports.extractMetadataFromFileName = (fileName) => {
  const rgxResult = metadataRegex.exec(fileName);
  if (rgxResult === null)
    throw new Error(`Filename ${fileName} did not match metadata regex.`);
  const groups = rgxResult.groups;
  const time = groups.time || "0000";
  const hours = time.slice(0, 2);
  const minutes = time.slice(2);
  const date = new Date(groups.year, groups.month, groups.day, hours, minutes);
  return {
    date: date,
    title: groups.title,
  };
};
