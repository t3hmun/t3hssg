const chai = require("chai");
const should = chai.should();

const filenameMetadata = require("../filenameMetadata.js");

describe(`filenameMetadata extractMetadataFromFilename`, function () {
  const tests = [
    {
      description: "no time one word title",
      filename: "2020-10-15-Hello.md",
      expected: { title: "Hello", date: new Date(2020, 10, 15) },
    },
    {
      description: "no time one letter title",
      filename: "2020-10-15-H.md",
      expected: { title: "H", date: new Date(2020, 10, 15) },
    },
    {
      description: "no time two words dash title",
      filename: "2020-10-15-Hello-Something.md",
      expected: { title: "Hello-Something", date: new Date(2020, 10, 15) },
    },
    {
      description: "no time title with dots",
      filename: "2020-10-15-Hello.test.md",
      expected: { title: "Hello.test", date: new Date(2020, 10, 15) },
    },
    {
      description: "with morning time one word title",
      filename: "2020-10-15-0306-Hello.md",
      expected: { title: "Hello", date: new Date(2020, 10, 15, 03, 06) },
    },
    {
      description: "with afternoon time one word title",
      filename: "2020-10-15-1606-Hello.md",
      expected: { title: "Hello", date: new Date(2020, 10, 15, 16, 06) },
    },
  ];

  tests.forEach(function (test) {
    it(`parse ${test.description}`, function () {
      filenameMetadata
        .extractMetadataFromFileName(test.filename)
        .should.eql(test.expected);
    });
  });
});
