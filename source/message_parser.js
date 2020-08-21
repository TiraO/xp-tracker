let actionTypes = {
  submitScore: "submitScore",
  getOverallScore: "getOverallScore"
};
class MessageParser {
  constructor() {
    this.scoreMatcher = /<[^>]*> ([A-z' ]+) score[a-z]* (\d+) on (.+)/
  }
  classifyMessage(message) {
    let actionType;
    let isAnAssignment = this.scoreMatcher.exec(message) != null;
    if(isAnAssignment == true) {
      actionType = "submitScore"
    } else {
      actionType = "getOverallScore"
    }
    return actionType
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

