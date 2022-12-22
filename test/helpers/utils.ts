import { ethers } from "hardhat";

let snapshotId: string = "0x1";
export async function takeSnapshot() {
  snapshotId = await ethers.provider.send("evm_snapshot", []);
}

export async function revertToSnapshot() {
  await ethers.provider.send("evm_revert", [snapshotId]);
}
