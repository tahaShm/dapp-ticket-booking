// We import Chai to use its assertion functions here.
import { expect } from "./chai-setup";

// we import our utilities
import { setupUsers, setupUser } from "./utils";

// We import the hardhat environment field we are planning to use
import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";
import { BigNumber } from "ethers";

async function setup() {
  let ticket: any;
  let owner: any;
  let customer: any;

  [owner, customer] = await ethers.getSigners();

  // Deploy Ticket contract
  const Ticket = await ethers.getContractFactory("TicketBooking");
  ticket = await Ticket.deploy();
  await ticket.deployed();

  return {
    ticket,
    owner,
    customer,
  };
}

describe("TicketBooking contract", function () {
  let ticket: any;
  let owner: any;
  let customer: any;

  it("test1.1: should not allow booking a ticket with empty movie name", async function () {
    const { ticket, owner, customer } = await setup();
    const emptyMovieName = "";
    const age = 23;
    await expect(
      ticket
        .connect(customer)
        .bookTicket(emptyMovieName, age, "100000000000000000")
    ).to.be.revertedWith(
      "Invalid ticket info: empty movie name or customer age < 18"
    );
  });

  it("test1.2. should not allow booking a ticket with customer age < 18", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 10;
    await expect(
      ticket.connect(customer).bookTicket(movieName, age, "100000000000000000")
    ).to.be.revertedWith(
      "Invalid ticket info: empty movie name or customer age < 18"
    );
  });

  it("test2. should not allow checking-in if the ticket is not valid", async function () {
    const { ticket, owner, customer } = await setup();
    await expect(ticket.connect(customer).checkIn()).to.be.revertedWith(
      "No valid ticket!"
    );
  });

  it("test3. customer cannot refund the ticket if has checked in", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 19;
    await ticket
      .connect(customer)
      .bookTicket(movieName, age, "100000000000000000");
    await ticket.connect(customer).checkIn();
    await expect(ticket.connect(customer).cancelTicket()).to.be.revertedWith(
      "Customer already checked in!"
    );
  });

  it("test4. customer cannot buy another ticket if before they has checked in or canceled the movie ticket", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName1 = "spiderman4";
    const movieName2 = "spiderman5";
    const age = 19;
    await ticket
      .connect(customer)
      .bookTicket(movieName1, age, "100000000000000000");
    await expect(
      ticket.connect(customer).bookTicket(movieName2, age, "100000000000000000")
    ).to.be.revertedWith(
      "Cannot book ticket: Have a valid ticket or not checked in yet!"
    );
  });

  it("test5. customer cannot make a booking if they don't send enough ether to the smart contract", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 19;
    await expect(
      ticket.connect(customer).bookTicket(movieName, age, "10000000")
    ).to.be.revertedWith("Not enough balance!");
  });

  it("test6. if everything ok, customer should make a booking successfully", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 19;
    await ticket
      .connect(customer)
      .bookTicket(movieName, age, "100000000000000000");
    expect(await ticket.connect(customer).balanceOf(customer.address)).to.equal(
      "90000000000000000"
    );
  });

  it("test7. customer should receive the money when they cancel the booking successfully", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 19;
    await ticket
      .connect(customer)
      .bookTicket(movieName, age, "100000000000000000");
    await ticket.connect(customer).cancelTicket();
    expect(await ticket.connect(customer).balanceOf(customer.address)).to.equal(
      "100000000000000000"
    );
  });

  it("test8. customer can check in if everything is good", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 19;
    await ticket
      .connect(customer)
      .bookTicket(movieName, age, "100000000000000000");
    await ticket.connect(customer).checkIn();
    expect(
      await ticket.connect(customer).getCheckInStatus(customer.address)
    ).to.equal(true);
  });

  it("test9. the smart contract should have the correct balance of ethers if a booking has been made", async function () {
    const { ticket, owner, customer } = await setup();
    const movieName = "spiderman4";
    const age = 19;
    await ticket
      .connect(customer)
      .bookTicket(movieName, age, "100000000000000000");
    expect(await ticket.connect(customer).balanceOf(customer.address)).to.equal(
      "90000000000000000"
    );
  });
});
