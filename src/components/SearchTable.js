import React, {useState, useEffect} from 'react'
import { Table, Loader, Segment, Dimmer, Menu, Icon } from 'semantic-ui-react'

var moment = require('moment');

function SearchTable (props) {
    const {searchResults, isSearching} = props
    const PAGE_SIZE = 15

    const [menuDefinition, setMenuDefinition] = useState('')
    const [menuIndex, setMenuIndex] = useState(1)
    const [menuMaxIndex, setMenuMaxIndex] = useState(0)
    const [tableItems, setTableItems] = useState(<Table.Row></Table.Row>)
    const [activeRow, setActiveRow] = useState()

    useEffect(() => {

        if (searchResults !== undefined && searchResults != null) {

            var _searchResults = searchResults.slice((menuIndex - 1) * PAGE_SIZE, ((menuIndex - 1) * PAGE_SIZE) + PAGE_SIZE)

            setTableItems(
                _searchResults.map(((record, index) => {
                    var callDate = moment(record.startDateTime)
                    return(
                        <Table.Row 
                            key={record.sessionId} 
                            onClick={() => {
                                props.onActiveRecord(record.sessionId)
                                setActiveRow(record.sessionId)
                                }}
                            active={record.sessionId === activeRow}
                        >
                            <Table.Cell>{record.cli}</Table.Cell>
                            <Table.Cell>{record.accountNumber}</Table.Cell>
                            <Table.Cell>{callDate.format("DD/MM/YYYY h:mmA")}</Table.Cell>
                        </Table.Row>
                    )
                }))
            )
        }

    }, [props, searchResults, menuIndex, activeRow])

    useEffect(() => {
        const handlePagerClick = (e, {name}) => {
        
            switch(name) {
                case 'previous':
                    if (menuIndex > 1) {setMenuIndex(menuIndex - 1)}
                    break
                case 'next':
                    if (menuIndex < menuMaxIndex) {setMenuIndex(menuIndex + 1)}
                    break
                default:
                    setMenuIndex(name)
            }
        }

        if (searchResults !== undefined && searchResults != null) {
            var searchItems = searchResults.length

            var pages = Math.ceil(searchItems / 15)
            setMenuMaxIndex(pages)

            var items = [...Array(pages).keys()].map((pageNumber) => {
                return (
                    <Menu.Item
                        as='a'
                        key={pageNumber + 1}
                        name={(pageNumber + 1).toString()}
                        active={menuIndex === pageNumber + 1}
                        onClick={handlePagerClick}
                    />
                )
            })

            setMenuDefinition(
                <Menu floated='right' pagination>
                    <Menu.Item as='a' name='previous' icon onClick={handlePagerClick}>
                        <Icon name='chevron left' />
                    </Menu.Item>
                    {items}
                    <Menu.Item as='a' name='next' icon onClick={handlePagerClick}>
                        <Icon name='chevron right' />
                    </Menu.Item>
                </Menu>
            )
        }
    }, [searchResults, menuIndex, menuMaxIndex])

    return (
        <div>
            <Segment basic>
                <Dimmer active={isSearching} inverted>
                    <Loader active={isSearching} inline='centered' inverted>Searching...</Loader>
                </Dimmer>

                <Table celled striped selectable>
                    <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>Phone number</Table.HeaderCell>
                        <Table.HeaderCell>Account number</Table.HeaderCell>
                        <Table.HeaderCell>Call timestamp</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    {tableItems}
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='3'>
                            {menuDefinition}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        </div>
    )
}

export default SearchTable