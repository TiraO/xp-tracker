class AssignmentParser {
  constructor() {
    this.scoreMatcher = /<[^>]*> ([A-z' ]+) score[a-z]* (\d+) on (.+)/
  }
  messageToAssignment() {
    let matchResults = this.scoreMatcher.exec("asdasd")
    return matchResults
  }
}

module.exports = AssignmentParser;