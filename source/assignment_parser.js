class AssignmentParser {
  constructor() {
    this.scoreMatcher = /<[^>]*> ([A-z' ]+) score[a-z]* (\d+) on (.+)/
  }
  messageToAssignment(message) {
    let matchResults = this.scoreMatcher.exec(message)
    return {
      description: matchResults[3],
      person: matchResults[1],
      score: Number.parseInt(matchResults[2])
    }
  }
}

module.exports = AssignmentParser;