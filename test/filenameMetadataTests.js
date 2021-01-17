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
  ];

  tests.forEach(function (test) {
    it(`parse ${test.description}`, function () {
      filenameMetadata
        .extractMetadataFromFileName(test.filename)
        .should.eql(test.expected);
    });
  });
});
