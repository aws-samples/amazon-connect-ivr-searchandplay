import React, { useState, useEffect } from 'react'
import { Form, Button} from 'semantic-ui-react'
import { DateRangePicker } from 'react-dates';

import "moment/locale/en-au"

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import moment from '../../../../../Library/Caches/typescript/3.6/node_modules/moment/moment';

function SearchForm(props) {
    const [searchValue, setSearchValue] = useState('')
    const [searchField, setSearchField] = useState()
    const [searchFieldError, setSearchFieldError] = useState(false)
    const [searchHint, setSearchHint] = useState('')
    const [searchEnabled, setSearchEnabled] = useState(false)
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    });

    useEffect(() => {
        switch (searchField) {
            case 'pn':
                setSearchHint('Customer phone number')
                setSearchEnabled(true)
                break
            case 'acct':
                setSearchHint('Customer account number')
                setSearchEnabled(true)
                break
            case 'recent':
                setSearchHint('')
                setSearchEnabled(false)
                break
            case 'session':
                setSearchHint('Customer session ID')
                setSearchEnabled(true)
                break
            default:
                setSearchHint('')
        }
    }, [searchField])
    
    const [focusedInput, setFocusedInput] = useState(null)

    const { startDate, endDate } = dateRange;

    const handleOnDateChange = (startDate, endDate) =>
        setDateRange(startDate, endDate);

    const handleSubmit = (evt) => {
        evt.preventDefault();

        var _startDate, _endDate

        if (startDate != null) {
            _startDate = startDate.format('YYYY-MM-DD')
        }

        if (endDate != null) {
            _endDate = endDate.format('YYYY-MM-DD')
        }

        if (searchEnabled && searchValue === '') {
            setSearchFieldError(true)
        } else {
            props.onSearch({[searchField]: searchValue, d1: _startDate, d2: _endDate})
            props.clearRecord()
        }
    }

    const handleToday = (evt) => {
        evt.preventDefault()
        setDateRange({startDate: moment(), endDate: moment()})
    }

    const handleWeek = (evt) => {
        evt.preventDefault()
        setDateRange({startDate: moment().startOf('week'), endDate: moment()})
    }

    const searchDropdown = [
        {
            key: 'phoneNumber',
            text: 'Phone number',
            value: 'pn',
            icon: 'phone'
        },
        {
            key: 'accountNumber',
            text: 'Account number',
            value: 'acct',
            icon: 'user circle'
        },
        {
            key: 'recent',
            text: 'Recent calls',
            value: 'recent',
            icon: 'clock outline'
        },
        {
            key: 'session',
            text: 'Session ID',
            value: 'session',
            icon: 'tty'
        }
    ]
    
    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Dropdown
                    placeholder='Select search field'
                    openOnFocus
                    selection
                    options={searchDropdown}
                    width='5'
                    onChange={(e, {value}) => {
                        setSearchField(value)
                        setSearchValue('')
                        setSearchFieldError(false)
                    }}
                />
                <Form.Input
                    placeholder={searchHint}
                    name='searchValue'
                    value={searchValue}
                    icon="search"
                    iconPosition='left'
                    width='11'
                    disabled={!searchEnabled}
                    error={searchFieldError}
                    onChange={e => setSearchValue(e.target.value)}
                />
            </Form.Group>
            <Form.Group inline>
                <label>Select call date range</label>
                <Form.Field>
                    <DateRangePicker
                        noBorder
                        isOutsideRange={() => false}
                        startDateId="startDate"
                        endDateId="endDate"
                        startDate={startDate}
                        endDate={endDate}
                        focusedInput={focusedInput}
                        onDatesChange={handleOnDateChange}
                        onFocusChange={focusedInput => setFocusedInput(focusedInput)}
                    />
                </Form.Field>
                <Form.Field>
                    <Button.Group>
                        <Button color="blue" type='button' onClick={handleToday} style={{ marginLeft: '1em'}} content="Today" icon="calendar alternate outline"/>
                        <Button.Or/>
                        <Button color="violet" type='button' onClick={handleWeek} content="This Week" icon="calendar alternate outline"/>
                    </Button.Group>
                </Form.Field>
            </Form.Group>
            <Button color="green" type='submit'>Search</Button>
        </Form>
    )
}

export default SearchForm