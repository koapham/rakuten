import React, { Component } from 'react';
import {
    Form, 
    Button, 
    Header, 
    Icon, 
    Segment, 
    Divider, 
    Rating, 
    Label,
    Modal,
    Comment,
    Container,
    Table,
    Popup,
    Grid,
    Statistic
} from 'semantic-ui-react';
import moment from 'moment';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import Survey from '../../ethereum/survey';
import web3 from '../../ethereum/web3';
import { getString, getIpfsHash } from '../../utils/ipfs';



class SurveyShow extends Component {

    state = {
        loading: true,
        buffer: null,
        fileUrl: '',
        comment: '',
        commentList: [],
        commentText_arr: [],
        popUpRating: false,
        popUpComment: false,
        popUpRatingSurvey: false,
        errorMessageRatingSurvey: '',
        successMessageRatingSurvey: '',
        loadingRatingSurvey: false,
        disabledRatingSurvey: false,
        popUpRatingComment: false,
        loadingRatingComment: false,
        errorMessageRatingComment: '',
        disabledRatingComment: false,
        rating: 0, //current rating
        submitRate: false, //for question,
        submitRateComment: false,
        totalRating: 0,
        totalRatingComment: 0,
        ratingComment: 0,
        currentIndexComment: -1,
        cannotRate: false,
        toggleChildRep: [],
        disabledMainComment: false
    };


    static async getInitialProps(props) {
        const survey = Survey(props.query.address);
        const summary = await survey.methods.getSummary().call();
        const time = await survey.methods.getTime().call();
        const eventField = await survey.methods.getEventField().call();
        const initialTotalRating = await survey.methods.getRatingSurvey().call();
        const iconList = ['alligator', 'anteater', 'armadillo', 'auroch', 'axolotl',
        'badger', 'bat', 'beaver', 'buffalo', 'camel', 'capybara',
        'chameleon', 'cheetah', 'chinchilla', 'chipmunk', 'chupacabra',
        'cormorant', 'coyote', 'crow', 'dingo', 'dinosaur', 'dolphin',
        'duck', 'elephant', 'ferret', 'fox', 'frog', 'giraffe', 'gopher',
        'grizzly', 'hedgehog', 'hippo', 'hyena', 'ibex', 'ifrit', 'iguana',
        'jackal', 'kangaroo', 'koala', 'kraken', 'lemur', 'leopard',
        'liger', 'llama', 'manatee', 'mink', 'monkey', 'moose', 'narwhal',
        'orangutan', 'otter', 'panda', 'penguin', 'platypus',
        'pumpkin', 'python', 'quagga', 'rabbit', 'raccoon', 'rhino',
        'sheep', 'shrew', 'skunk', 'squirrel', 'tiger', 'turtle', 'walrus',
        'wolf', 'wolverine', 'wombat'];
        const avatarListIcon = iconList.map((item)=>{
            return 'https://ssl.gstatic.com/docs/common/profile/' + item + '_lg.png';
        });
        const avatarListName = iconList.map((item)=>{
            return 'anonymous ' + item;
        });
        const commentList = await survey.methods.getCommentList().call();
        let ratingCommentList = [];
        var i;
        for (i=0; i<commentList.length; i++){
            ratingCommentList.push(commentList[i].commentRate);
        }
        return { 
            address: props.query.address,
            eventType: summary[5],
            eventField: eventField,
            guestSpeaker: summary[7],
            suggestion: summary[8],
            time: time,
            initialTotalRating: initialTotalRating,
            avatarListIcon: avatarListIcon,
            avatarListName: avatarListName,
            ratingCommentList: ratingCommentList,
            publishTime: moment.unix(time).format('dddd, Do MMMM YYYY, h:mm:ss a'),
            publishTimeMs: moment.unix(time).valueOf(),
        };
    }

    async componentDidMount() {
        const survey = Survey(this.props.address);
        const commentList = await survey.methods.getCommentList().call();
        this.setState({ commentList: commentList });

        let {commentText_arr} = this.state;
        var i, j;
        if (commentList !== null) {
            for (i = 0 ; i < commentList.length ; i++) {
                let commentText = await getString('Qm'+commentList[i].commentHash)
                console.log("await getString('Qm'+item.commentHash)", commentText);
                commentText_arr.push(commentText);
            }
            this.setState({ 
                commentText_arr: commentText_arr,
            });
        }

        console.log("this.state.commentText_arr: ", this.state.commentText_arr);
        
        console.log("this.state.commentList: ", this.state.commentList);

        let toggleChildRep = new Array(commentList.length).fill(false);

        this.setState({ loading:false, toggleChildRep: toggleChildRep});

    }


    onSubmitRatingSurvey = async (event)=>{
        event.preventDefault();
        this.setState({ loadingRatingSurvey: true, errorMessageRatingSurvey: '' });
        const accounts = await web3.eth.getAccounts();
        await factory.methods.ratingSurveyAt(this.props.address, this.state.rating).send({
            from: accounts[0],
        });
        const myRating = await Survey(this.props.address).methods.getRatingSurvey().call();
       
        this.setState({ 
                    totalRating: myRating,
                    submitRate: true ,
                    disabledRatingSurvey: true
                });

        this.setState({ loadingRatingSurvey: false ,
                        popUpRatingSurvey: false}); 
    }

    onSubmitRatingComment = async (event, index)=>{
        event.preventDefault();
        this.setState({ loadingRatingComment: true, errorMessageRatingComment: '' });
        const accounts = await web3.eth.getAccounts();
        const survey = Survey(this.props.address);
        const commentList = await survey.methods.getCommentList().call();
        
        if (accounts[0] != commentList[index].commentor){
            console.log("Not same")
            await factory.methods.ratingCommentAt(this.props.address, this.state.ratingComment, index).send({
                from: accounts[0],
            });
            const myRating = await survey.methods.getCommentRate(index).call();
            this.setState({ 
                        totalRatingComment: myRating,
                        loadingRatingComment: false,
                        submitRateComment: true, 
                        popUpRatingComment: false ,
                        disabledRatingComment: true    
                    });
        }
        else {
            console.log("Same");
            this.setState({ cannotRate: true, 
                            loadingRatingComment: false,
                            popUpRatingComment: false,
                            disabledRatingComment: true });
        }
    }


    showSurvey() {
        const {
            publishTime,
            //publishTimeMs,
            eventType,
            eventField,
            guestSpeaker,
            suggestion
        } = this.props;

        const showRating = (this.state.submitRate ? this.state.totalRating : this.props.initialTotalRating)/1;

        return (
            <React.Fragment>                
                <Table definition>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell> Event Field </Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>
                                {eventField}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell> Event Type </Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>
                                {eventType}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Publish Time</Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>{publishTime}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Guest Speaker</Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>{guestSpeaker}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Event suggestion</Table.Cell>
                            <Table.Cell style={{fontSize: '20px', lineHeight: '1.5'}}>
                                {suggestion}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell><span onClick={() => this.setState({ popUpRatingSurvey: true })} style={{cursor: 'pointer', color: 'blue'}}>Vote</span></Table.Cell>
                            <Table.Cell><Rating icon='star' size='huge' rating={showRating} maxRating={5} disabled /></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }

    commentBox = (parent) => {
        return (
            <Form reply>
                <Form.TextArea 
                    placeholder="Enter Reply"
                    value={this.state.comment}
                    onChange={event => this.setState({ comment: event.target.value })}>
                        <div>
                            <Label as='a'>
                                Tag
                                <Icon name='delete' />
                            </Label>
                        </div>
                </Form.TextArea>
                <center disabled>
                    <div style={{marginBottom: '10px'}}>
                    </div>

                    <Button content='Add Reply' labelPosition='left' icon='edit' primary 
                        onClick={(e) => this.onSubmitComment(e, parent)} />
                </center>
                <br />
            </Form>
        );
    }

    showChildComments = (parent) => {
        const {commentList, commentText_arr} = this.state;

        let elmChildren = null;
        if (commentList !== null) {
            elmChildren = commentList.map((item, index) => {
                return (
                    Number(item.parent) == Number(parent) ?
                        <span>
                            <Comment>
                                <Comment.Avatar src={this.props.avatarListIcon[index]} style={{backgroundColor: 'crimson'}} />
                                <Comment.Content>
                                    { <Comment.Author as='a'>{this.props.avatarListName[index]}</Comment.Author> }
                                    <Comment.Metadata>
                                        <div>
                                            {moment.unix(item.commentTime).format('dddd, Do MMMM YYYY, h:mm:ss a')}
                                        </div>
                                    </Comment.Metadata>
                                    <Comment.Text>
                                        {commentText_arr[index]}
                                    </Comment.Text>
                                    <Comment.Actions>
                                        <Comment.Action><span onClick={() => this.setState({ 
                                                                                            popUpRatingComment: true,
                                                                                            currentIndexComment: index
                                                                                            })}>Vote</span></Comment.Action>
                                        <Comment.Action><Rating icon='star' 
                                                            rating={((this.state.submitRateComment&&(this.state.currentIndexComment==index))? this.state.totalRatingComment: this.props.ratingCommentList[index])/1}
                                                            maxRating={5} disabled /></Comment.Action> 
                                    </Comment.Actions>
                                </Comment.Content>
                            </Comment>
                        <br /> 
                    </span>
                    : null
                );
            });
        } 
        return (
            <span>
                {elmChildren}
            </span>
        );
    }

    handleToggleChildRep = (index) => {
        let {toggleChildRep, disabledMainComment} = this.state;
        let i;
        for (i = 0 ; i < toggleChildRep.length ; i++) {
            if (i == index)
                toggleChildRep[index] = !toggleChildRep[index];
            else
                toggleChildRep[i] = false;
        }

        if (toggleChildRep[index] == true)
            disabledMainComment = true;
        else
            disabledMainComment = false;

        this.setState({ 
            toggleChildRep: toggleChildRep,
            disabledMainComment: disabledMainComment,
            comment: ''
        });
    }

    enableMainComment = () => {
        const {commentList} = this.state;
        
        if (this.state.disabledMainComment) {
            this.setState({
                disabledMainComment: false,
                toggleChildRep: new Array(commentList.length).fill(false),
                comment: ''
            });
            console.log("enable");
        }
    }

    Comments = () => {

        const {commentList, commentText_arr, toggleChildRep} = this.state;

        let elmComments = null;
        if (commentList !== null) {
            elmComments = commentList.map((item, index) => {
                return (
                    item.parent == -1 ?
                        <span>
                            <Comment>
                                <Comment.Avatar src={this.props.avatarListIcon[index]} style={{backgroundColor: 'crimson'}} />
                                <Comment.Content>
                                    { <Comment.Author as='a'>{this.props.avatarListName[index]}</Comment.Author> }
                                    <Comment.Metadata>
                                        <div>
                                            {moment.unix(item.commentTime).format('dddd, Do MMMM YYYY, h:mm:ss a')}
                                        </div>
                                    </Comment.Metadata>
                                    <Comment.Text>
                                        {commentText_arr[index]}
                                    </Comment.Text>
                                    <Comment.Actions>
                                        <Comment.Action>
                                            {/* Reply */}
                                            <span onClick={() => this.handleToggleChildRep(index)}>
                                                {toggleChildRep[index] == false ? "Reply" : "Close"}
                                            </span>
                                        </Comment.Action>                                               
                                        <Comment.Action><span onClick={() => this.setState({ 
                                                                                            popUpRatingComment: true,
                                                                                            currentIndexComment: index
                                                                                            })}>Vote</span></Comment.Action>
                                        <Comment.Action><Rating icon='star' 
                                                            rating={((this.state.submitRateComment&&(this.state.currentIndexComment==index))? this.state.totalRatingComment: this.props.ratingCommentList[index])/1}
                                                            maxRating={5} disabled /></Comment.Action>  
                                        </Comment.Actions>

                                    <br /> 
                                    {this.showChildComments(item.id)}
                                    {toggleChildRep[index] == true && this.commentBox(item.id)}
                                </Comment.Content>
                            </Comment> 
                    </span>
                    :null
                );
            });
        } 


        return (
        <Container>
        <Header as='h3' dividing>
            Comments
        </Header>
        <Comment.Group>     
        </Comment.Group>
        
        <Form reply onDoubleClick={() => this.enableMainComment()}>
            <Form.TextArea 
                disabled={this.state.disabledMainComment}
                placeholder="Enter Reply"
                value={this.state.disabledMainComment ? "" : this.state.comment}
                onChange={event => this.setState({ comment: event.target.value })}>
                    <div>
                        <Label as='a'>
                            Tag
                            <Icon name='delete' />
                        </Label>
                    </div>
            </Form.TextArea>
            <center>
                <div style={{marginBottom: '10px'}}>
                    {this.state.disabledMainComment}
                </div>

                <Button content='Add Reply' labelPosition='left' icon='edit' primary 
                        disabled={this.state.disabledMainComment}
                        onClick={(e) => this.onSubmitRatingComment(e, -1)} />        {/* parent = -1 */}  
            </center>
        </Form>
        <Modal
            size="tiny"
            open={this.state.popUpRatingComment}
            onClose={() => this.setState({ popUpRatingComment: false })}
            style={{textAlign: 'center'}}
        >
            <Modal.Header>Rate this comment</Modal.Header>
            <Modal.Content>
                <span textAlign='center'><Rating onRate={(e, {rating} ) => this.setState({ratingComment: rating})} maxRating={5} icon='star' size='massive' /></span>
            </Modal.Content>
            <Modal.Actions>
                <Button negative onClick={() => this.setState({ popUpRatingComment: false })}>
                    <Icon name='remove' />
                    Cancel
                </Button>
                <Button positive onClick={(e) => this.onSubmitRatingComment(e,this.state.currentIndexComment)} loading={this.state.loadingRatingComment} 
                // 
                >
                    <Icon name='checkmark' />
                    Submit
                </Button>
            </Modal.Actions>
            </Modal>
        

        <Modal
            size="tiny"
            open={this.state.popUpRatingSurvey}
            onClose={() => this.setState({ popUpRatingSurvey: false })}
            style={{textAlign: 'center'}}
        >
            <Modal.Header>Rate this survey</Modal.Header>
            <Modal.Content>
                <span textAlign='center'><Rating onRate={(e, {rating} ) => this.setState({rating})} maxRating={5} icon='star' size='massive' /></span>
            </Modal.Content>
            <Modal.Actions>
                <Button negative onClick={() => this.setState({ popUpRatingSurvey: false })}>
                    <Icon name='remove' />
                    Cancel
                </Button>
                <Button positive onClick={(e) => this.onSubmitRatingSurvey(e)}  loading={this.state.loadingRatingSurvey} 
                // disabled={this.state.disabledRatingQuestion}
                >
                    <Icon name='checkmark' />
                    Submit
                </Button>
            </Modal.Actions>
                </Modal>

        <Modal
            size="tiny"
            open={this.state.cannotRate}
            onClose={() => this.setState({ cannotRate: false })}
            style={{textAlign: 'center'}}
        >
            <Modal.Header>You cannot rate your own comment</Modal.Header>
                </Modal>
        </Container>
      );
    }


    onSubmitComment = async (event, parent) => {
        event.preventDefault();

        this.setState({ loading: true, errorMessage: '' });


        try{
            const commentBuf = Buffer.from(reply, 'utf8');
            const commentHash = await getIpfsHash(commentBuf);
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createComment(this.props.address,
                              commentHash.substring(2),
                              parent)
                .send({      
                    from: accounts[0]
                });


            const survey = Survey(this.props.address);
            const commentList = await survey.methods.getCommentList().call();
            this.setState({ commentList: commentList});
            
            //this.setState({replyText_arr: []});
            let {commentText_arr, toggleChildRep} = this.state;
            let newCommentText = await getString('Qm'+commentList[commentList.length - 1].commentHash);
            commentText_arr.push(newCommentText);
            toggleChildRep.push(false);

            this.setState({ 
                commentText_arr: commentText_arr,
                toggleChildRep: toggleChildRep 
            });


            this.setState({
                comment: ''
            });
        
        } catch (err) {
            this.setState({ errorMessage: err.message });
            console.log('error happennnn');
            console.log('errorMessage: ', err.message);
        }
        this.setState({ loading: false });
    }

    render() {


        return(
            <Layout>

                <Divider hidden/>

                {this.showSurvey()}

                <Divider hidden/>
                <Divider hidden/>

                {this.Comments()}

                <Divider hidden/>
            </Layout> 
        );
    }
}

export default SurveyShow;
