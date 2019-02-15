pragma solidity >=0.4.22 <0.6.0;

contract ArtGallary{
    address private owner;
    uint private ts;
    uint private registrationTimeout;
    uint paintingID;
    struct Painting{
        uint id;
        address artist;
        string Name;
        string Url;
        string emailID;
        uint totalVotes;
        mapping (address => bool) voted;
    }
    Painting[] public paintingArray;
    
    event printPainting(uint id, address artist ,string name, string url,string email,uint totalVotes);
    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }

    modifier isbeforeTO() {
        require(now-ts<registrationTimeout);
        _;
    }
    constructor(uint _registrationTimeout) public {
        owner=msg.sender;
        ts=now;
        registrationTimeout=_registrationTimeout;
    }
    
    function registerArtist(string memory _name,string memory _url,string memory _emailID) public isbeforeTO{
        paintingArray.push(Painting(paintingID, msg.sender, _name, _url, _emailID, 0));
        paintingID++;
    }
    function getAllPaintings() public  {
        for (uint i=0; i< paintingArray.length; i++){
            Painting memory p = paintingArray[i];
            emit printPainting(p.id,p.artist,p.Name,p.Url,p.emailID,p.totalVotes);

        }
    }
    function getOwner() view public returns (address){
        return owner;
    }
    function getDeployedTS() view public returns (uint){
        return ts;
    }
    function getRegistrationTO() view public returns (uint){
        return registrationTimeout;
    }
    

    
}
