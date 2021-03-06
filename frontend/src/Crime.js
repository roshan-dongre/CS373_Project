import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import 'lodash'
import {Row, Col, Panel, Button, Modal, Well} from 'react-bootstrap'

/* Inline styles for the various components */

var imageStyles = {
    width: '400px',
    height: '350px'
}

var textStyles = {
    color: 'black'
}

var wellStyles = {
    background: '#7f8fa6'
}

var wellSecond = {
    background: '#8C4A51'
}

var button = {
    background: '#2d3436',
    borderColor: '#2d3436'
}

export default class Crime extends Component {

    constructor (props) {
        super (props);

        /*Handle bindings for the modals */

        this.handleShowStates = this.handleShowStates.bind(this);
        this.handleCloseStates = this.handleCloseStates.bind(this);
        this.handleShowCriminals = this.handleShowCriminals.bind(this);
        this.handleCloseCriminals = this.handleCloseCriminals.bind(this);

        let item = "";
        if ('location' in this.props  && this.props.location.state.item !== undefined) {
            item = this.props.location.state.item
        } else if (this.props.item !== undefined) {
            item = this.props.item
        }
        this.state = {
            item: item,
            selectedId: "",
            navigate: false,
            navigateTo: "",
            states: [],
            criminals: [],    
            criminalUnavailable: "No criminals available",
            stateUnavailable: "No states available",
            showStates: false,
            showCriminals: false
        }
    }

    /*Modal methods */
    handleCloseStates() {
        this.setState({ showStates: false });
    }

    handleShowStates() {
        this.setState({ showStates: true });
    }

    handleCloseCriminals() {
        this.setState({ showCriminals: false });
    }

    handleShowCriminals() {
        this.setState({ showCriminals: true });
    }

    componentDidMount() {
        this.callAPI()
        this.getStates()
        this.getCriminals()
    }

    /*Updates the criminal and state lists */
    componentDidUpdate(prevProps, prevState) {
        if (prevState.item.name !== this.state.item.name)
        {
            this.getStates()
            this.getCriminals()
        }
    }

    /*Gets the states using the API */
    getStates() {
        let url = "http://api.ontherun.me/crimestostate/" + this.state.item.id
        let self = this
        axios.get(url)
            .then((res) => {
                // Set state with result
                self.setState({states: res.data});
            })
            .catch((error) => {
                console.log(error)
            });
    }

    /*Gets the criminals using the API */
    getCriminals() {
        if (this.state.item.id !== undefined) {
        let url = "http://api.ontherun.me/crimetocriminals/" + this.state.item.id
        let self = this
        axios.get(url)
            .then((res) => {
                self.setState({criminals: res.data});
            })
            .catch((error) => {
                console.log(error)
            });
        }
    }

    /*Handles the navigation to the other instances */

    handleCriminalNavigation(criminalId, e) {
        e.preventDefault()
        this.setState({
            navigate: true,
            selectedId: criminalId,
            navigateTo: "/Criminal"
        })
    }

    handleStateNavigation(stateId, e) {
        e.preventDefault()
        this.setState({
            navigate: true,
            selectedId: stateId,
            navigateTo: "/State" 
        })
    }

    /*Calls the API to get the information */
    callAPI() {
        let url
        console.log(this.props)
        if (this.props.location !== undefined && this.props.location.state.selectedId !== undefined) {
            url = "http://api.ontherun.me/crimes/"+this.props.location.state.selectedId
        } else {
            url = "http://api.ontherun.me/crimes/"+this.state.item.id
        }

        let self = this
        axios.get(url)
            .then((res) => {
                self.setState({item: res.data});
            })
            .catch((error) => {
                console.log(error)
            });
    }

    render() {

        var _ = require('lodash');

       if (this.state.navigate) {
            return <Redirect to={{pathname: this.state.navigateTo, state: {selectedId: this.state.selectedId}}} push={true} />;
        }
            
        {/* Shows the modal with the criminals and states */ }

        let stateList
        let self = this
        stateList = this.state.states.map((state) => {
            return (
                <tr className="clickable-row" onClick={(e) => self.handleStateNavigation(state.state_abbreviation, e)}>
                    <td><strong>{state.state_name}</strong></td>
                </tr>
            );
        })
        if (stateList.length === 0) {
            stateList = this.state.stateUnavailable
        }

        let criminalList
        criminalList = this.state.criminals.map((criminal) => {
            return (
                <tr className="clickable-row" onClick={(e) => self.handleCriminalNavigation(criminal.criminal_id, e)}>
                    <td><strong>{_.startCase(_.camelCase(criminal.criminal_name))}</strong></td>
                </tr>
            );
        })
        if (criminalList.length === 0) {
        criminalList = this.state.criminalUnavailable
        }

        return (
            <div className="container sub-container">
                <div className="row">
                    <div className="col-md-4">
                        <div className="text-center">
                            <img className="img-thumbnail img-thumbnail-sm" src={this.state.item.image === undefined ? this.state.item.images : this.state.item.image} alt={this.state.item.name} style = {imageStyles}/>
                        </div>
                    </div>
                    <div className="col-md-8" style={textStyles}>
                        <Well style= {wellStyles}>
                        <h2 className="sub-header text-center">{this.state.item.name}</h2>
                        <table className="table table-responsive text-left">
                            <tbody>
                            <tr>
                                <td><strong>Description:</strong></td>
                                <td>{this.state.item.description}</td>
                            </tr>
                            <tr>
                                <td><strong>Crimes:</strong></td>
                                <td>{this.state.item.count} crimes committed in 2016</td>
                            </tr>
                            <tr>
                                <td><strong>Offenders:</strong></td>
                                <td>{this.state.item.offenders} offenders in 2016</td>
                            </tr>
                            <tr>
                                <td><strong>Victims:</strong></td>
                                <td>{this.state.item.victims} victims in 2016</td>
                            </tr>
                            <tr>
                                <td><strong>FBI Info:</strong></td>
                                <td><strong><a href={this.state.item.info == null ? this.state.unknown : this.state.item.info} style={{ color: '#000' }}>{this.state.item.info == null ? this.state.unknown : this.state.item.info}</a></strong></td>
                            </tr>
                            </tbody>
                        </table>

                        </Well>

                        {/*Modal rendering */}

                        <Well style={wellSecond}> 
                         <div class="row">
                        <div class="col-sm-6">
                            <Button bsStyle="primary" bsSize="large" style = {button} onClick={this.handleShowStates}>
                            See States with this Crime!
                            </Button>
                        </div>

                        <div class="col-sm-6">
                            <Button bsStyle="primary" bsSize="large" style = {button} onClick={this.handleShowCriminals}>
                            See Criminals with this Crime!
                            </Button>
                        </div>
                        </div>
                        </Well>

                        <Modal show={this.state.showStates} onHide={this.handleCloseStates} style = {textStyles}>
                        <Modal.Header closeButton>
                            <Modal.Title>States With This Crime</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                              <table className="table table-responsive table-hover text-left">
                                <tbody>
                                {stateList}
                                </tbody>
                              </table>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button onClick={this.handleCloseStates}>Close</Button>
                          </Modal.Footer>
                        </Modal>

                        <Modal show={this.state.showCriminals} onHide={this.handleCloseCriminals} style = {textStyles}>
                            <Modal.Header closeButton>
                                <Modal.Title>Criminals Committing This Crime</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <table className="table table-responsive table-hover text-left">
                                    <tbody>
                                    {criminalList}
                                    </tbody>
                                  </table>
                              </Modal.Body>
                              <Modal.Footer>
                                <Button onClick={this.handleCloseCriminals}>Close</Button>
                              </Modal.Footer>
                        </Modal>

                    </div>
                </div>
            </div>
        );
    }
}