pragma solidity >=0.4.22 <0.6.0;

contract ArtGallary{
    enum validation {Done,Remaining}
    enum winner {Declared,NotDeclared}
    address private owner;
    uint private tsDeployment;
    uint private registrationTimeout;
    uint private votingTO;
    uint private validationDoneTimestamp;
    uint private paintingID;
    uint registrationFee=100000000000000000;
    uint winnerPaintingID;

    //fields associated with Painting
    struct Painting{
        address artist;
        string Name;
        string Url;
        string emailID;
        uint totalVotes;
    }
    validation state;
    winner result;

    //map to store registreded paintings.
    mapping (uint => Painting) public registeredPaintings;

    //map to store paintings which are certified by museum
    mapping (uint => bool) public  certifiedPaintings;

    //Double vote is not allowd
    mapping (address => bool) voted;

    uint[] public certifiedPaintingsArray;


    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }
    modifier checkFee(){
        require(msg.value == registrationFee);
        _;
    }

    modifier isBeforeRegistrationTO() {
        require(now-tsDeployment<registrationTimeout);
        _;
    }

    modifier isBeforeVotingTO() {
        require(now-validationDoneTimestamp<registrationTimeout);
        _;
    }

    modifier isAfterVotingTO() {
        require(now-validationDoneTimestamp>registrationTimeout);
        _;
    }
    modifier isAfterRegistrationTO() {
        require(now-tsDeployment>registrationTimeout);
        _;
    }

    modifier arePaintingsValidated() {
        require(state==validation.Done);
        _;
    }
    //input registrationTimeout and votingTimeout
    //Voting time window will activate only after museum validated paintings.
    constructor(uint _registrationTimeout,uint _votingTO) public {
        owner=msg.sender;
        tsDeployment=now;
        registrationTimeout=_registrationTimeout;
        votingTO=_votingTO;
        state = validation.Remaining;
        result= winner.NotDeclared;
    }

    //Register painting with given details.
    // map it with unique uint ID.
    function registerPainting(string memory _name,string memory _url,string memory _emailID) public isBeforeRegistrationTO checkFee payable{
        registeredPaintings[paintingID]=Painting( msg.sender, _name, _url, _emailID, 0);
        paintingID++;
    }

    //only owner can validate.
    function validatePaintings(uint256 id) public onlyOwner isAfterRegistrationTO{
        certifiedPaintings[id]=true;
        certifiedPaintingsArray.push(id);
    }

    //start time window for voting.
    function validationDone() public onlyOwner {
        state=validation.Done;
        validationDoneTimestamp=now;
        //started voting time period
    }

    //vote transaction
    //check if previously voted or not.
    function vote(uint256 _id) public arePaintingsValidated isBeforeVotingTO{
        if(certifiedPaintings[_id]==true){
            if(voted[msg.sender]==false){
                voted[msg.sender]=true;
                registeredPaintings[_id].totalVotes+=1;
            }
        }
    }


    //returns winners eth address.
    function declareWinner() public isAfterVotingTO returns (address)  {
        require (result == winner.NotDeclared);
        if(certifiedPaintingsArray.length>0){
            winnerPaintingID=certifiedPaintingsArray[0];
            for (uint i=1 ; i< certifiedPaintingsArray.length;i++){
                //TODO(Shubham): needs to decide what to do if both has same votes.
                if(registeredPaintings[winnerPaintingID].totalVotes < registeredPaintings[certifiedPaintingsArray[i]].totalVotes){
                    winnerPaintingID=certifiedPaintingsArray[i];
                }
            }

        }
        result=winner.Declared;
        return registeredPaintings[winnerPaintingID].artist;
        //TODO(Shubham):needs to handle condition where smart contract has some ethers but none of the paintigs are valid.
    }

    //only winner can claim money
    function claimReward() public {
        require(result==winner.Declared);
        require(msg.sender==registeredPaintings[winnerPaintingID].artist);
        msg.sender.transfer(address(this).balance);
    }

    //return total fee collected
    function getBalance() public view returns (uint256){
        return address(this).balance;
    }

    //check if registration is still on.
    function isRegistrationClosed() public view returns (bool){
        if(now-tsDeployment>registrationTimeout){
            return true;
        }else{
            return false;
        }
    }

    //totla no of paintings
    function getTotalPaintings() public view returns (uint256){
        return paintingID;
    }

    //according to ID return painting info
    function getPaintingInfo(uint id) public view returns(uint, string memory,string memory,string memory,uint256){
        Painting memory p = registeredPaintings[id];
        return(id, p.Name, p.Url, p.emailID, p.totalVotes);
    }

    function isCertifiedPainting(uint id) public view returns (bool){
        return certifiedPaintings[id];
    }

    function isVotingON()public view returns(bool){
        if(state==validation.Done && now-validationDoneTimestamp < registrationTimeout){
            return true;
        }
        else {
            return false;
        }
    }


}