pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract SurveyFactory {
    address[] private deployedSurveys;
    mapping(address => address) public users;

    function createSurvey(string name, string school, uint year, uint phone, string homeAddress, string eventType, 
                          string eventField, string guestSpeaker, string suggestion) public payable {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }    

        address newSurvey = new Survey(name, school, year, phone, homeAddress, eventType, eventField, guestSpeaker, suggestion,
                                       msg.sender, users[msg.sender]);
        deployedSurveys.push(newSurvey);
        
        Survey survey = Survey(newSurvey);
        survey.transfer(msg.value);
        Profile(users[msg.sender]).updateToken();
        survey.postSurvey(); 
        
    }

    function createComment(address _survey, string _comment, int _parent) public {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }   
        Survey survey = Survey(_survey);
        survey.comment(_comment, msg.sender, users[msg.sender], _parent);
    }

    function ratingSurveyAt(address _survey, uint _ratingSurvey) public payable{
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        Survey survey = Survey(_survey);
        survey.transfer(msg.value);
        survey.ratingSurvey(_ratingSurvey); 
    }

    function ratingCommentAt(address _survey, uint _ratingComment, uint _index) public payable {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        Survey survey = Survey(_survey);
        survey.transfer(msg.value);
        survey.updateCommentRate(_ratingComment, _index);
    }


    function hasProfile(address _user) public returns(bool) {
        if (users[_user] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getProfile(address _user) public returns(address) {
        require(users[_user] != 0);
        return users[_user];
    }
    
    function getDeployedSurveys() public view returns(address[]) {
        return deployedSurveys;
    }
}    


contract Survey {

    struct Comment {
        string commentHash;
        address commentor; //answerer
        Profile commentorP; //answererP
        uint commentTime; //answerTime
        uint commentRate;  //answerRate
        uint commentNumRate; //answerNumRate
        uint commentSumRate; //answerSumRate
        int parent;
        int id;       //Keep track parent answers
    }

    Comment[] public commentList; //answerList
    string public name;
    string public school;
    uint public year;
    uint public phone;
    string public homeAddress;
    string public eventType;
    string public eventField;
    string public guestSpeaker;
    string public suggestion;
    address public owner;
    Profile public ownerP;
    uint public start;
    uint public surveyRate; //questionRate
    uint public numRate;
    uint public sumRate;
    int public count = 0;

    function() payable { }
    
    function Survey (string _name, string _school, uint _year, uint _phone, string _homeAddress, 
                     string _eventType, string _eventField, string _guestSpeaker, string _suggestion,
                     address _owner, address _ownerP) public {
        name = _name;
        school = _school;
        year = _year;
        phone = _phone;
        homeAddress = _homeAddress;
        eventType = _eventType;
        eventField = _eventField;
        guestSpeaker = _guestSpeaker;
        suggestion = _suggestion;
        owner = _owner;
        ownerP = Profile(_ownerP);
    }

    function getSummary() public view returns (string, string, uint, uint, string, string, string, string, string, address) {
        return(
            name,
            school,
            year,
            phone,
            homeAddress,
            eventType,
            eventField,
            guestSpeaker,
            suggestion,
            owner
        );
    }

    function getEventField() public view returns (string) {
        return eventField;
    }

    function getOwner() public view returns (address){
        return owner;
    }

    function getOwnerP() public view returns (Profile){
        return ownerP;
    }
    
    function getCommentorP(uint _index) public view returns (Profile){
        return commentList[_index].commentorP;
    }

    function getTime() public view returns (uint) {
        return start;
    }

    function ratingSurvey(uint _ratingSurvey) public {
        numRate++;
        sumRate = sumRate + _ratingSurvey;
        surveyRate = sumRate/numRate;
    }

    function getRatingSurvey() public returns (uint){
        return surveyRate;
    }

    
    function postSurvey() public {
        start = now;   
    }

    function comment(string _comment, address _commentor, address _commentorP, int _parent) public {
        int _id;
        if (_parent == -1) {   //a parent answer
            _id = count;   
            count++;
        } else {               //a child answer
            _id = -1;
        }

        Comment memory newComment = Comment({
            commentHash: _comment,
            commentor: _commentor,
            commentorP: Profile(_commentorP),
            commentTime: now,
            commentRate: 0,
            commentNumRate: 0,
            commentSumRate: 0,
            parent: _parent,
            id: _id
        }); 
        
        commentList.push(newComment);
    } 


    function getCommentList() public view returns (Comment[]) {
        return commentList;
    }

    function updateCommentRate(uint _value, uint index) public {
        commentList[index].commentNumRate ++;
        commentList[index].commentSumRate += _value;
        commentList[index].commentRate = commentList[index].commentSumRate/commentList[index].commentNumRate;
    }

    function getCommentRate(uint index) public view returns (uint) {
        return commentList[index].commentRate;
    }

}

contract Profile {

    uint public token;
    address public user;

    function Profile (address _user) public {
        user = _user;
    }

    function updateToken() public {
        token++;
    }

    function getToken() public returns(uint){
        return token;
    }
}
