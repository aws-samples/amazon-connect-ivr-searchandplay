import React, { useState, useEffect } from 'react'
import { Container, Grid, Header, Divider } from 'semantic-ui-react'
import * as qs from 'query-string';

import { withOAuth } from 'aws-amplify-react';
import Amplify, {API, Auth, Hub} from 'aws-amplify';

import amplifyconfig from './amplify-config'
// import awsconfig from './aws-exports';

import SearchForm from './components/SearchForm'
import SearchTable from './components/SearchTable'
import RecordDetails from './components/RecordDetails'

import './App.css';

import TopMenu from './components/TopMenu'

Amplify.configure(amplifyconfig);

function App (props) {
    const [recordsData, setRecordsData] = useState(null)
    const [activeRecord, setActiveRecord] = useState(null)
    const [isSearching, setIsSearching] = useState(false)
    const [user, setUser] = useState(null)

    const executeSearch = (evt) => {
        console.log(evt)
        getRecordings(evt)
    }

    useEffect(() => {
        async function authUser() {
            Hub.listen("auth", ({ payload: { event, data } }) => {
                switch (event) {
                  case "signIn":
                    setUser(data)
                    console.log('Logon event')
                    break;
                  case "signOut":
                    setUser(null)
                    console.log('Logout event')
                    break;
                  case "customOAuthState":
                    break;
                  default:
                    console.log('Auth fall-through')
                }
            });

            await Auth.currentAuthenticatedUser()
            .then(user => {
                setUser(user)
    
                if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
                    console.log(user)
                }
    
            })
            .catch(() => {
                if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
                    console.log("Not signed in")
                }

                // look for code in URL
                const _qs = qs.parse(props.location.search)
                if (!_qs['code']) {
                    Auth.federatedSignIn({provider: 'callrecordingidp'})
                }
            });
        }

        authUser()
    },[props.location.search]);

    const setActiveRecording = (evt) => {
        var _activeRecord = recordsData.filter(
            function(data) { return data.sessionId === evt}
        )

        console.log("Active record: ", _activeRecord)
        if (_activeRecord !== undefined && _activeRecord.length === 1) {
            setActiveRecord(_activeRecord[0])
        }
    }

    const getRecordings = async (evt) => {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            console.log("Getting recordings: ", evt)
        }

        setIsSearching(true)

        var apiQS = (evt.pn) ? 
            {queryStringParameters: {pn: evt.pn, d1: evt.d1, d2: evt.d2}} : 
            (evt.acct) ? {queryStringParameters: {acct: evt.acct, d1: evt.d1, d2: evt.d2}} :
            (evt.session) ? {queryStringParameters: {session: evt.session, d1: evt.d1, d2: evt.d2}} :
            (evt.recent === "") ? {queryStringParameters: {recent: 1, d1: evt.d1, d2: evt.d2}} :
            ''

        const response = await API.get('connectapi', '/recordings', apiQS);

        console.log(JSON.stringify(response, null, 2));

        setRecordsData(response)
        setIsSearching(false)
    }

    if (user != null) {
        return (
            <div style={styles}>
                <TopMenu />
                <Grid columns={2} divided>
                    <Grid.Column width={11}>
                        <Container style={{ padding: '2em 2em' }}>
                            <Header as='h1'>Contact Search</Header>
                            <SearchForm onSearch={(e) => executeSearch(e)} 
                                        clearRecord={() => setActiveRecord({})}/>
                            <Divider></Divider>
                            <SearchTable searchResults={recordsData} 
                                        isSearching={isSearching} 
                                        onActiveRecord={(e) => setActiveRecording(e)}/>
                        </Container>
                    </Grid.Column>
                    <Grid.Column floated='right' width={5}>
                        <Container style={{ padding: '2em 0em' }}>
                            <Header as='h1'>Details</Header>
                            <RecordDetails activeRecord={activeRecord}/>
                        </Container>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }
    else
    {
        return (
            <div style={styles}>
                <TopMenu />
            </div>
        )
    }
}

export default withOAuth(App);

const styles = {
    marginRight: '1em'
}