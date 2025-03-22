const hre = require("hardhat");

async function main() {
  console.log("Deploying Alexandria (ALEX) token...");

  const alexToken = await hre.ethers.deployContract("AlexToken");
  await alexToken.waitForDeployment();

  console.log(
    `Alexandria (ALEX) token deployed to: ${await alexToken.getAddress()}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
