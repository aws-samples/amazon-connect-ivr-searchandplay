import React, { useState, useEffect } from 'react'
import { Card, List, Modal } from 'semantic-ui-react'
import ReactJson from 'react-json-view'

import Player from './Player'

var moment = require('moment');

function RecordDetails(props) {
    const [record, setRecord] = useState({id: 0})
    const [transferUI, setTransferUI] = useState('')

    useEffect(() => {
        const {activeRecord} = props

        console.log(activeRecord)

        if (activeRecord != null) {
            setRecord(activeRecord)

            var transferUI = (
                <List.Item>
                    <List.Icon name='info circle' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>Call termination reason</List.Header>
                        <List.Description>{activeRecord.endReason}</List.Description>
                    </List.Content>
                </List.Item>
            )
    
            var pureCloudUI = (
                <List.Item>
                    <List.Icon name='mixcloud' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>PureCloud ID</List.Header>
                        <List.Description>{activeRecord.purecloudId}</List.Description>
                    </List.Content>
                </List.Item>
            )

            var UI = []

            if (activeRecord.endReason && activeRecord.purecloudId) {

                UI.push(transferUI)
                UI.push(pureCloudUI)

                setTransferUI(
                    UI
                )
            } else if (activeRecord.endReason) {
                setTransferUI(
                    <List.Item>
                        <List.Icon name='info circle' size='large' verticalAlign='middle' />
                        <List.Content>
                            <List.Header>Call termination reason</List.Header>
                            <List.Description>{activeRecord.endReason}</List.Description>
                        </List.Content>
                    </List.Item>
                )
            } else {
                setTransferUI(
                    null
                )
            }
        }
        else {
            
        }
    }, [props])

    function dateTimeFormat(dateTime) {
        if (dateTime !== undefined && dateTime !== null) {
            var dt = moment(dateTime)
            return dt.format("dddd, MMMM Do YYYY, h:mm:ss a")
        }
    }

    function calcDuration(startTime, endTime) {

        if (startTime && endTime) {
            var st = moment(startTime)
            var et = moment(endTime)
            var duration = moment.duration(et.diff(st))

            return duration.minutes() + " minutes and " + duration.seconds() + " seconds"
        } else {
            return ''
        }
    }

    return (
        <div>
            <Card.Group>
                <Card fluid color='blue'>
                    <Card.Content>
                        <Card.Header>Customer Details</Card.Header>
                        <List relaxed>
                            <List.Item>
                                <List.Icon name='user' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>Account number</List.Header>
                                    <List.Description>{record.accountNumber}</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Icon name='building outline' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>Jurisdiction</List.Header>
                                    <List.Description>{record.accountJurisdiction}</List.Description>
                                </List.Content>
                            </List.Item>
                        </List>
                    </Card.Content>
                </Card>
                <Card fluid color='orange'>
                    <Card.Content>
                        <Card.Header>Call Details</Card.Header>
                        <List relaxed>
                            <List.Item>
                                <List.Icon name='phone' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>Telephone number</List.Header>
                                    <List.Description>{record.cli}</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Icon name='time' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>Call start time</List.Header>
                                    <List.Description>{dateTimeFormat(record.startDateTime)}</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Icon name='time' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>Call end time</List.Header>
                                    <List.Description>{dateTimeFormat(record.endDateTime)}</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Icon name='clock outline' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>Call duration</List.Header>
                                    <List.Description>{calcDuration(record.startDateTime, record.endDateTime)}</List.Description>
                                </List.Content>
                            </List.Item>
                            {transferUI}
                            <List.Item>
                                <List.Icon name='dna' size='large' verticalAlign='middle' />
                                <List.Content>
                                    <Modal trigger={<List.Header as='a'>Raw data</List.Header>}>
                                        <Modal.Header>Detailed call data</Modal.Header>
                                        <Modal.Content>
                                            <ReactJson src={record} />
                                        </Modal.Content>
                                    </Modal>
                                </List.Content>
                            </List.Item>
                            
                        </List>
                    </Card.Content>
                </Card>
                <Card fluid color='yellow'>
                    <Card.Content>
                        <Card.Header>Recording Playback</Card.Header>
                        <Player sessionId={record.sessionId}/>
                    </Card.Content>
                </Card>
            </Card.Group>
        </div>
    )
}

export default RecordDetails