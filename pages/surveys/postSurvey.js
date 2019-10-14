import React, { Component } from 'react';
import { Form, Button, TextArea, Message, Dropdown,
        Modal, Header, Segment, Icon, Divider, Label, Input } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import Profile from '../../ethereum/profile';
import web3 from '../../ethereum/web3';
import { getIpfsHash } from '../../utils/ipfs';

class SurveyNew extends Component {
    state = {
        errorMessage: '',
        successMessage: '',
        loading: false,
        disabled: false,
        popup: false,
        eventType: '',
        eventField: '',
        name: '',
        year: '',
        school: '',
        phone: '',
        homeAddress: '',
        guestSpeaker: '',
        suggestion: ''
    };


    onSubmit = async (event) => {
        event.preventDefault();
        const {  name, school, year, phone, homeAddress, eventType, eventField, guestSpeaker, suggestion,  } = this.state;
        this.setState({ loading: true, popup: false, errorMessage: '' });

        try{
            const accounts = await web3.eth.getAccounts();
            try {
                 await factory.methods.hasProfile(accounts[0]).call();}
            catch (err){
                throw Error("You have to be a user to post a survey");}

            await factory.methods
                .createSurvey(name, 
                              school,
                              Number(year),
                              Number(phone),
                              homeAddress,
                              eventType,
                              eventField,
                              guestSpeaker,
                              suggestion)
                .send({
                    from: accounts[0],
                });
                console.log("LOADINGGG " + this.state.loading)
            this.setState({ disabled: true, 
                successMessage: "You have submitted the survey successfully" });
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }
        console.log("LOADINGGG " + this.state.loading)
        this.setState({ loading: false });
    }


    render() {

        const typeOfEvent = [
            {
                key: 'Workshop',
                text: 'Workshop',
                value: 'Workshop',
                label: { color: 'red', empty: true, circular: true },
            },
            {
                key: 'Career Talk',
                text: 'Career Talk',
                value: 'Career Talk',
                label: { color: 'blue', empty: true, circular: true },
            },
            {
                key: 'Exhibition',
                text: 'Exhibition',
                value: 'Exhibition',
                label: { color: 'green', empty: true, circular: true },
            },
            {
                key: 'Festival',
                text: 'Festival',
                value: 'Festival',
                label: { color: 'yellow', empty: true, circular: true },
            }
          ]

        
          const field = [
            {
                key: 'Technology',
                text: 'Technology',
                value: 'Technology',
                label: { color: 'red', empty: true, circular: true },
            },
            {
                key: 'Art',
                text: 'Art',
                value: 'Art',
                label: { color: 'blue', empty: true, circular: true },
            },
            {
                key: 'Business',
                text: 'Business',
                value: 'Business',
                label: { color: 'green', empty: true, circular: true },
            },
            {
                key: 'Politic',
                text: 'Politic',
                value: 'Politic',
                label: { color: 'yellow', empty: true, circular: true },
            }
        ]
        
        return (
            <Layout>
                <h2>Welcome to our survey</h2>
                <Form error={!!this.state.errorMessage} success={!!this.state.successMessage}>
                    <Form.Field>
                        <label>Your Name</label>
                        <Input 
                            focus
                            value={this.state.name}
                            onChange={event => this.setState({ name: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>School</label>
                        <Input 
                            focus
                            value={this.state.school}
                            onChange={event => this.setState({ school: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Year</label>
                        <Input 
                            focus
                            value={this.state.year}
                            onChange={event => this.setState({ year: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Phone</label>
                        <Input 
                            focus
                            value={this.state.phone}
                            onChange={event => this.setState({ phone: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Address</label>
                        <Input 
                            focus
                            value={this.state.homeAddress}
                            onChange={event => this.setState({ homeAddress: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Type of the event that you prefer</label>
                        <Dropdown placeholder='Choose one ...'
                                  openOnFocus
                                  selection
                                  options={typeOfEvent}
                                  onChange={event => this.setState({ eventType: event.target.textContent })}>
                        </Dropdown>
                    </Form.Field>
                    <Form.Field>
                        <label>Field that you prefer</label>
                        <Dropdown placeholder='Choose one ...'
                                  openOnFocus
                                  selection
                                  options={field}
                                  onChange={event => this.setState({ eventField: event.target.textContent })}>
                        </Dropdown>
                    </Form.Field>
                    <Form.Field>
                        <label>Preferred guest speaker/company</label>
                        <Input 
                            focus
                            value={this.state.guestSpeaker}
                            onChange={event => this.setState({ guestSpeaker: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Event suggestion</label>
                        <TextArea 
                            placeholder="Enter your idea"
                            value={this.state.suggestion}
                            onChange={event => this.setState({ suggestion: event.target.value })}
                        />
                    </Form.Field>
        
                    <Button loading={this.state.loading} primary disabled={this.state.disabled} onClick={() => this.setState({ popup: true })}>Submit your survey</Button>
                    <Message error header="Oops! Something went wrong" content={this.state.errorMessage} />
                    <Message success header="Success!" content={this.state.successMessage} />
                </Form>

                <Divider hidden />

                <Modal
                    size="small"
                    open={this.state.popup}
                    onClose={() => this.setState({ popup: false })}
                >
                    <Modal.Header>Do you want to submit this survey?</Modal.Header>
                    <Modal.Content>
                        <p>
                            Event ideas are to be published
                        </p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={() => this.setState({ popup: false })}>
                            <Icon name='cancel' />
                            Cancel
                        </Button>
                        <Button positive onClick={(e) => this.onSubmit(e)}>
                            <Icon name='upload' />
                            Submit and Publish Now
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Layout>
        );
    }
}

export default SurveyNew;
