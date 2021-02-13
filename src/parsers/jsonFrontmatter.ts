import parseISO from "date-fns/parseISO";

/** Metadata from the JSON frontmatter of the file. Every field is optional. */
export interface JsonMetadata {
  title?: string;
  date?: Date;
  description?: string;
}

export interface JsonMetaAndMd {
  /** Parsed json frontmatter. */
  jsonMetadata: JsonMetadata;
  /** Just the markdown, the json frontmatter removed. */
  markdown: string;
}

export function extractJsonMetaAndMarkdown(fileContents: string): JsonMetaAndMd {
  const jsonEndIndex = findJsonEndIndex(fileContents);
  const jsonBlock = fileContents.slice(0, jsonEndIndex + 1);
  const markdown = fileContents.slice(jsonEndIndex + 1);
  const rawMetadata = jsonBlock.length > 0 ? JSON.parse(jsonBlock) : {};

  // Blanking out the title is not allowed.
  if (isDefinedAndEmpty(rawMetadata.title)) {
    throw new Error(
      `Json frontmatter title was defined but blank, blank title is invalid. It must be either undefined or have text.`
    );
  }

  // A blank description is allowed.

  const jsonMetadata: JsonMetadata = {
    title: rawMetadata.title,
    date: rawMetadata.date ? parseISO(rawMetadata.date) : undefined,
    description: rawMetadata.description,
  };
  return { jsonMetadata, markdown };
}

function isDefinedAndEmpty(value?: string) {
  if (value === undefined) return false;
  if (value === null) return true; // Not sure if this one is possible.
  if (value.trim() === "") return true;
  return false;
}

function findJsonEndIndex(md: string): number {
  let openBraces = 0;
  let finalBraceIndex = 0;
  let escaped = false;
  let withinQuotes = false;

  if (md[0] !== "{") return -1;

  for (let i = 0; i < md.length; i++) {
    const current = md[i];
    if (!escaped && current == '"') withinQuotes = !withinQuotes;

    if (!withinQuotes) {
      if (current == "{") openBraces++;
      else if (current == "}") openBraces--;
    }

    if (openBraces == 0) {
      finalBraceIndex = i;
      break;
    }

    if (current == "\\" && !escaped) escaped = true;
    else escaped = false;
  }

  if (finalBraceIndex == 0) {
    throw new Error(`Could not find end of json block, ended with ${openBraces} open braces.`);
  }

  return finalBraceIndex;
}
