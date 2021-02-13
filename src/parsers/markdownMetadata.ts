/* Find metadata from within the markdown.  */

const h1Regex = /((^.*?\r?\n)|(^))# (?<h1>.+?)\r?\n/gs;
const descirptionWithH1Regex = /((^.*?\r?\n)|(^))# (.+?)\r?\n(?<description>.+?)\r?\n## /gs;
const descriptionNoH1 = new RegExp(/(?<description>.+?)\r?\n## /gs);

interface MarkdownMetadata {
  title?: string;
  h1Missing: boolean;
  description?: string;
}

export function extractMarkdownMetadata(markdown: string): MarkdownMetadata {
  h1Regex.lastIndex = 0;
  const h1Result = h1Regex.exec(markdown);
  const h1 = h1Result?.groups?.h1 ?? undefined;
  let description;
  if (h1 !== undefined) {
    descirptionWithH1Regex.lastIndex = 0;
    const result = descirptionWithH1Regex.exec(markdown);
    description = result?.groups?.description?.trim() ?? undefined;
  } else {
    descriptionNoH1.lastIndex = 0;
    const result = descriptionNoH1.exec(markdown);
    description = result?.groups?.description?.trim() ?? undefined;
  }

  const metadata = {
    title: h1,
    h1Missing: h1 === undefined,
    description: description,
  };
  return metadata;
}
