import React, { Component } from 'react'
import { Header, Image, Menu } from 'semantic-ui-react'
import { Link } from "react-router-dom";

export default class TopMenu extends Component {
	render() {
		return (
			<div style={divStyle}>
				<Menu fixed='top' stackable borderless inverted style={menuStyle}>
					<Menu.Item header>
						<Link to='/'>
							<Image src='/images/ic_connect.svg' style={{ marginRight: '1.5em', marginLeft: '4em' }} />
						</Link>
					</Menu.Item>
					<Menu.Menu>
						<Menu.Item>
                            <Header as='h2' inverted>{process.env.REACT_APP_NAME}</Header>
						</Menu.Item>
					</Menu.Menu>
				</Menu>
			</div>
		)
	}
}

const menuStyle = {
	background: '#232f3e'
}

const divStyle = {
	paddingTop: '6em'
}