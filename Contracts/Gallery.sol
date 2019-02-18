pragma solidity >=0.4.22 <0.6.0;

contract ArtGallary{
    enum validation {Done,Remaining}
    enum winner {Declared,NotDeclared}
    enum voting {NotStarted,Started,Done}
    address private owner;
    uint private ts;
    uint private registrationTimeout;
    uint private paintingID;
    uint registrationFee=100000000000000000;
    uint winnerPaintingID;

    struct Painting{
        address artist;
        string Name;
        string Url;
        string emailID;
        uint totalVotes;
    }
    validation state;
    winner result;
    voting voteProcess;
    mapping (uint => Painting) public registeredPaintings;
    mapping (uint => bool) public  certifiedPaintings;

    uint[] public certifiedPaintingsArray;

    mapping (address => bool) voted;

    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }
    modifier checkFee(){
        require(msg.value == registrationFee);
        _;
    }

    modifier isBeforeTO() {
        require(now-ts<registrationTimeout);
        _;
    }

    modifier isAfterTO() {
        require(now-ts>registrationTimeout);
        _;
    }

    modifier arePaintingsValidated() {
        require(state==validation.Done);
        _;
    }
    constructor(uint _registrationTimeout) public {
        owner=msg.sender;
        ts=now;
        registrationTimeout=_registrationTimeout;
        state = validation.Remaining;
        result= winner.NotDeclared;
    }

    function registerArtist(string memory _name,string memory _url,string memory _emailID) public isBeforeTO checkFee payable{
        registeredPaintings[paintingID]=Painting( msg.sender, _name, _url, _emailID, 0);
        paintingID++;
    }

    function validatePaintings(uint256 id) public onlyOwner isAfterTO{
        certifiedPaintings[id]=true;
        certifiedPaintingsArray.push(id);
    }

    function validationDone() public onlyOwner {
        state=validation.Done;
        voteProcess=voting.Started;
    }

    function vote(uint256 _id) public arePaintingsValidated{
        require (voteProcess == voting.Started);
        if(certifiedPaintings[_id]==true){
            if(voted[msg.sender]==false){
                voted[msg.sender]=true;
                registeredPaintings[_id].totalVotes+=1;
            }
        }
    }

    function stopVoting() public onlyOwner {
        voteProcess=voting.Done;
    }

    function declareWinner() public returns (address){
        require (voteProcess == voting.Done);
        require (result == winner.NotDeclared);
        if(certifiedPaintingsArray.length>0){
            winnerPaintingID=certifiedPaintingsArray[0];
            for (uint i=1 ; i< certifiedPaintingsArray.length;i++){
                if(registeredPaintings[winnerPaintingID].totalVotes < registeredPaintings[certifiedPaintingsArray[i]].totalVotes){
                    winnerPaintingID=certifiedPaintingsArray[i];
                }
            }

        }
        result=winner.Declared;
        return registeredPaintings[winnerPaintingID].artist;
        //TODO(Shubham):needs to handle condition where smart contract has some ethers but none of the paintigs are valid.
    }

    function claimReward() public {
        require(result==winner.Declared);
        require(msg.sender==registeredPaintings[winnerPaintingID].artist);
        msg.sender.transfer(address(this).balance);
    }

    function getBalance() public view returns (uint256){
        return address(this).balance;
    }

    function isRegistrationClosed() public view returns (bool){
        if(now-ts>registrationTimeout){
            return true;
        }else{
            return false;
        }
    }

    function timeoutstatus() public view isBeforeTO returns (bool) {
        return true;
    }

    function getTotalPaintings() public view returns (uint256){
        return paintingID;
    }

    function getPaintingInfo(uint id) public view returns(uint, string memory,string memory,string memory,uint256){
        Painting memory p = registeredPaintings[id];
        return(id, p.Name, p.Url, p.emailID, p.totalVotes);
    }

    function isCertifiedPainting(uint id) public view returns (bool){
        return certifiedPaintings[id];
    }

    function isVotingStarted()public view returns(bool){
        if(state==validation.Done){
            return true;
        }
        else {
            return false;
        }
    }


}