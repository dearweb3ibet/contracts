import { expect } from "chai";
import { contestContract, makeSuiteCleanRoom, userOne } from "../../setup";

makeSuiteCleanRoom("Contest Permissions", function () {
  it("User should fail to use function to process bet participatns", async function () {
    await expect(
      contestContract.connect(userOne).processClosedBetParticipants([])
    ).to.be.revertedWith("Only bet contract can be sender");
  });
});
