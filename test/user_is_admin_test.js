let { isUserAnAdmin } = require("../source/xp_tracker_server")
let { expect } = require('chai');

describe("isUserAnAdmin", () => {
  describe("when user is admin", () => {

    it("should return true", async () => {
      let result = await isUserAnAdmin("U015ZLPRCGH")
      expect(result).to.eq(true)
    });
  });

  describe("when user is not an admin", () => {
    it("should return false", async () => {
      let result = await isUserAnAdmin("U015");
      expect(result).to.eq(false)
    });
  });
});
