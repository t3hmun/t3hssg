function separateJsonAndDocument(md) {
  let openBraces = 0;
  let finalBraceIndex = 0;
  let escaped = false;
  let withinQuotes = false;

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
    throw new Error(
      `Could not find end of json block, ended with ${openBraces} open braces.`
    );
  }

  const json = md.slice(0, finalBraceIndex + 1);
  const document = md.slice(finalBraceIndex + 1);
  return { json: json, document: document };
}

module.exports.separateJsonAndDocument = separateJsonAndDocument;
