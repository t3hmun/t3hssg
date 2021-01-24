/* Find metadata from within the markdown.  */

const h1Regex = /((^.*?\r?\n)|(^))# (?<h1>.+?)\r?\n/gs;
const descirptionWithH1Regex = /((^.*?\r?\n)|(^))# (.+?)\r?\n(?<description>.+?)\r?\n## /gs;
const descriptionNoH1 = new RegExp(/(?<description>.+?)\r?\n## /gs);

/**
 *
 * params {string} markdown - The markdown of the article (should not have frontmatter).
 */
module.exports.extractMarkdownMetadata = (markdown) => {
  h1Regex.lastIndex = 0;
  const h1Result = h1Regex.exec(markdown);
  const h1 = h1Result?.groups?.h1 ?? null;
  let description;
  if (h1 !== null) {
    descirptionWithH1Regex.lastIndex = 0;
    const result = descirptionWithH1Regex.exec(markdown);
    description = result?.groups?.description?.trim() ?? null;
  } else {
    descriptionNoH1.lastIndex = 0;
    const result = descriptionNoH1.exec(markdown);
    description = result?.groups?.description?.trim() ?? null;
  }

  const metadata = {
    title: h1,
    description: description,
  };
  return metadata;
};
