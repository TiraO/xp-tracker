class MessageParser {
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
  nameFromScoreRequest(message) {
    let scoreRequest = /<[^>]*> what..?s ([A-z]+)'s (score|xp)\?/i
    let matchResults = scoreRequest.exec(message);
    let name = matchResults[1];
    return name;
  }
}

module.exports = MessageParser;