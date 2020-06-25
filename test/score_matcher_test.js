let AssignmentParser = require("../source/assignment_parser")
let {expect} = require('chai');

describe("AssignmentParser", () => {
  let parser;
  beforeEach(() => {
    parser = new AssignmentParser();
  });

  describe("scoreMatcher", () => {

    it('should parse out the student name, score, and assignment name', function () {
      let matchResults = parser.scoreMatcher.exec("<@ASDASD123> Eric scored 97 on assignment 3");
      expect(matchResults).to.deep.eq([
        "<@ASDASD123> Eric scored 97 on assignment 3",
        "Eric", "97", "assignment 3"])
    });
  });

  describe("messageToAssignment", () => {
    it('should return an assignment with the student name, score and assignment name', function () {
      let assignment = parser.messageToAssignment("<@ASDASD123> Eric scored 97 on assignment 3")
      expect(assignment).to.deep.eq({
        person: "Eric",
        score: 97,
        description: "assignment 3"
      })
    });
  });
})
