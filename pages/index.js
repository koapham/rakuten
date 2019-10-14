import React, { Component } from 'react';
import {Statistic, Divider, Grid, Table, Message, Rating, Icon, Button,
         Menu, Container, Segment} from 'semantic-ui-react';
import { ethers } from 'ethers';
import factory from '../ethereum/factory';
import Survey from '../ethereum/survey';
import Layout from '../components/Layout';
import { Router } from '../routes';
import moment from 'moment';
import web3 from '../ethereum/web3';
import {search} from '../utils/search';

class SurveyIndex extends Component {
    state = {
        currentIndex: 0,
        activeEventField: 'Technology',
        availableSurveys: [],
        guestSpeaker: [], 
        suggestion: [], 
        time: [], 
        surveyRating: []
    }

    static async getInitialProps({ req, query }) { 
        
        let deployedSurveys = await factory.methods.getDeployedSurveys().call();
        deployedSurveys.reverse();

        let deployedCat1 = [];
        let deployedCat2 = [];
        let deployedCat3 = [];
        let deployedCat4 = [];
        let searchItem;
        //filter the questions based on search value
        if (query.value != undefined && query.value != 'favicon.ico') {
            searchItem = decodeURIComponent(query.value.substring(7));
            deployedSurveys = await search(searchItem,deployedSurveys);
        }
        
        await Promise.all(
            deployedSurveys.map(async (item) => {
                const itemCat = await Survey(item).methods.getEventField().call();
                console.log(itemCat);
                switch (itemCat) {
                    case "Technology":   {
                        deployedCat1.push(item);
                        break;
                    }   
                    case "Art": {
                        deployedCat2.push(item);
                        break;
                    }   
                    case "Business":  {
                        deployedCat3.push(item);
                        break;
                    }   
                    case "Politic":  {
                        deployedCat4.push(item);
                        break;
                    } 
                }

            }))
        return {deployedCat1, deployedCat2, deployedCat3, deployedCat4, searchItem};
    }

    componentDidMount = async () => {
        
        await this.renderData("Technology");
    }

    componentDidUpdate = async (prevProps) =>{
        if (prevProps.searchItem != this.props.searchItem){
        await this.renderData(this.state.activeEventField);
        }
    }

    renderData = async (category) => {

        const {deployedCat1, deployedCat2, deployedCat3, deployedCat4} = this.props;

        let availableSurveys = [];

        switch (category) { 
            case "Technology": {
                availableSurveys = deployedCat1;
                break;
            }   
            case "Art": {
                availableSurveys = deployedCat2;
                break;
            }   
            case "Business": {
                availableSurveys = deployedCat3;
                break;
            }  
            case "Politic": {
                availableSurveys = deployedCat4;
                break;
            } 
        }

        let guestSpeaker = [];
        let suggestion = [];


        const summary = await Promise.all(
            availableSurveys
                .map((address) => {
                    return Survey(address).methods.getSummary().call();
                })  
        );

        summary.forEach(function(item){
            guestSpeaker.push(item[7]);
            suggestion.push(item[8]);
        });



        const timeArray = await Promise.all(
            availableSurveys.map((address)=>{
                return Survey(address).methods.getTime().call();
            })
        );
        
        const timeStart = timeArray.map((time)=>
            {return moment.unix(parseInt(time)).format('dddd, Do MMMM YYYY, h:mm:ss a')});


        const surveyRating = await Promise.all(
            availableSurveys.map((address) => {
                return Survey(address).methods.getRatingSurvey().call();
            })
        );

        this.setState({
            availableSurveys: availableSurveys,
            guestSpeaker: guestSpeaker, 
            suggestion: suggestion, 
            timeStart: timeStart, 
            surveyRating: surveyRating
        });
    }



    handleEventFieldClick = async (e, { name }) => {
        this.setState({ 
            activeEventField: name
        });
        const {activeEventField} = this.state;
        this.renderData(activeEventField);
    }

    renderRentsDesktop() {
        const {activeEventField} = this.state;

        const items = this.state.availableSurveys.map((address, i) => {
        const rating = this.state.surveyRating[i];
        const timeStart = this.state.timeStart[i];
        const guestSpeaker = this.state.guestSpeaker[i];
        const suggestion = this.state.suggestion[i];

            return <Table.Row key={i} style={{cursor:'pointer'}} onClick={() => Router.pushRoute(`/surveys/${address}`)}>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span 
                                            style={{fontSize: 15, color: '#6A737C'}}><Rating icon='star' size='huge' 
                                            rating={rating}
                                            maxRating={5} disabled />
                                        </span></Statistic.Value>
                        <Statistic.Label><span style={{fontSize: 15, color: '#6A737C'}}>votes</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='center' width={2}>
                    <Message compact size='mini'
                            header={'Guest Speaker: '+guestSpeaker}
                        />
                </Table.Cell>
                <Table.Cell textAlign='center'>
                    <p>{suggestion}</p>
                </Table.Cell> 
                <Table.Cell textAlign='center'>
                    <Message compact size='mini'
                            header={'Time published: '+timeStart}
                        />
                </Table.Cell> 
            </Table.Row>
        });

        return ( 
            <Container>
                <Menu tabular color={'green'}>
                    <Menu.Item name='Technology' active={activeEventField === 'Technology'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleEventFieldClick} />
                    <Menu.Item name='Art' active={activeEventField === 'Art'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleEventFieldClick} />
                    <Menu.Item name='Business' active={activeEventField === 'Business'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleEventFieldClick} />
                    <Menu.Item name='Politic' active={activeEventField === 'Politic'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleEventFieldClick} />
                </Menu>
                <Table>
                    <Table.Body>
                        {items}
                    </Table.Body>
                </Table>
            </Container>
        )
    }


    render() {
        const itemsLength = this.state.availableSurveys? this.state.availableSurveys.length : 0;

        return(
            <Layout searchItem = {this.props.searchItem} >
                
                <h2>Surveys</h2>
                <Divider hidden/>

                {this.renderRentsDesktop()}

                <Divider hidden/>
                <div style={{ marginTop: 20 }}>Found {itemsLength} Item(s).</div>
                <Divider hidden/>
            </Layout>
        );
    }
}

export default SurveyIndex;
