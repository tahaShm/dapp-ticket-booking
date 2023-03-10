// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TicketBooking {
    
    struct MovieTicket {
        bool isValidTicket;
        string movieName;
        uint customerAge;
        bool hasCheckedIn;
    }

    uint256 public ticketPrice = 10**16; // 0.01 ETH
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public pays; //saves the paid ethers for every customer
    mapping(address => MovieTicket) public tickets;

    
    modifier validTicketInfo(string memory _movieName, uint _customerAge) {
        require(bytes(_movieName).length > 0 && _customerAge >= 18, "Invalid ticket info: empty movie name or customer age < 18");
        _;
    }
    
    modifier validTicket(address _sender) {
        require(tickets[_sender].isValidTicket, "No valid ticket!");
        _;
    }
    
    modifier notCheckedIn(address _sender) {
        require(!tickets[_sender].hasCheckedIn, "Customer already checked in!");
        _;
    }

    modifier hasEnoughBalance(address _sender, uint256 transfered_amount) {
        require (transfered_amount + balances[_sender] > ticketPrice, "Not enough balance!");
        _;
    }

    // modifier checkedIn(address _sender) {
    //     require(tickets[_sender].hasCheckedIn, "Customer not checked in!");
    //     _;
    // }
    
    modifier canBookTicket(address _sender) {
        require(!tickets[_sender].isValidTicket || tickets[_sender].hasCheckedIn, "Cannot book ticket: Have a valid ticket or not checked in yet!");
        _;
    }

    function checkIn() public notCheckedIn(msg.sender) validTicket(msg.sender) {
        tickets[msg.sender].hasCheckedIn = true;
    }
    
    function bookTicket(string memory _movieName, uint _customerAge, uint256 transfered_amount) public payable 
        canBookTicket(msg.sender) 
        validTicketInfo(_movieName, _customerAge) 
        hasEnoughBalance(msg.sender, transfered_amount) 
    {
        tickets[msg.sender] = MovieTicket(true, _movieName, _customerAge, false);
        balances[msg.sender] += (transfered_amount - ticketPrice);
        pays[msg.sender] += ticketPrice;
    }
    
    function cancelTicket() payable public validTicket(msg.sender) notCheckedIn(msg.sender) {
        tickets[msg.sender].isValidTicket = false;
        balances[msg.sender] += ticketPrice;
        pays[msg.sender] -= ticketPrice;
    }

    function getCheckInStatus(address account) public view returns (bool){
        return tickets[account].hasCheckedIn;
    }
    
    // function withdraw() public {
    //     require(balances[msg.sender] > 0, "No balance to withdraw");
    //     uint256 amount = balances[msg.sender];
    //     pays[msg.sender] += balances[msg.sender];
    //     balances[msg.sender] = 0;
    //     payable(msg.sender).transfer(amount);
    // }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}