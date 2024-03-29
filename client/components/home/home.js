import React, { Component } from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import S from 'semantic-ui-react'

import { Games } from '../../../imports/collections/games'

const steps = [
  { key: 1, icon: 'game', title: 'Choose Your Game' },
  { key: 2, icon: 'signup', title: 'Post a Scrim' },
  { key: 3, icon: 'line graph', title: 'Improve Your Skills' }
]

const items = [
  { key: 1, label: 'Users', value: '19,850' },
  { key: 2, label: 'Teams', value: '49,610' },
  { key: 3, label: 'Scrims Found', value: '102,940' }
]

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: props.location.state && props.location.state.message ? props.location.state.message : '',
      showMessage: true
    }
  }

  dismissAlertMessage = () => {
    this.setState({ message: '' })
  }

  dismissMessage = () => {
    this.setState({ showMessage: false })
  }

  render() {
    const { games } = this.props
    const { showMessage, message } = this.state
    return (
      <S.Container textAlign='center'>
        <S.Header
          as='h1'
          style={{ marginTop: '2rem', marginBottom: '2rem' }}
          content='Welcome to Scrims Win!'
          subheader='Improve your skills by quickly and easily finding other players to practice against' />
        <S.Grid stackable container>
          <S.Grid.Row columns={ 1 }>
            <S.Grid.Column>
            {
              message ? <S.Message error onDismiss={ this.dismissAlertMessage } style={{ textAlign: 'left' }} content={ message } /> : ''
            }
            { showMessage ? <S.Message
              onDismiss={ this.dismissMessage }
              style={{ textAlign: 'left' }}
              attached info icon='gift'
              header='13,500 Fornite V-Bucks Giveaway on our Twitter!'
              content={ <a href='http://twitter.com/scrimswin/status/993159620674891776' target='_blank'><S.Button
                style={{ marginTop: '.5rem' }}
                basic icon='right arrow'
                labelPosition='right'
                size='tiny' content='Enter Here' /></a>
              } /> : '' }
              <S.Step.Group fluid items={ steps } />
            </S.Grid.Column>
          </S.Grid.Row>
          <S.Grid.Row columns={ 4 }>
            { games.map((game, i) => (
              <S.Grid.Column key={ i } style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <Link to={ `/scrims?game=${ game.title }` }>
                  <S.Card link fluid>
                  <div style={{ height: '10rem', backgroundPosition: 'center center', backgroundSize: 'cover', backgroundImage: `url(${game.img})` }}></div>
                    <S.Card.Content>
                      <S.Card.Header>
                        { game.title }
                      </S.Card.Header>
                    </S.Card.Content>
                  </S.Card>
                </Link>
              </S.Grid.Column>
            )) }
          </S.Grid.Row>
          <S.Grid.Row columns={1}>
            <S.Grid.Column>
              <Link to='/scrims'>
                <S.Button color='teal' fluid size='large'>Find Scrims</S.Button>
              </Link>
            </S.Grid.Column>
          </S.Grid.Row>
        </S.Grid>
      </S.Container>
    )
  }
}

export default withTracker(() => {
  const games = Games.find({}).fetch()
  const gameTitles = {}
  const uniqueGames = games.filter(game => {
    if (!(game.title in gameTitles)) {
      gameTitles[game.title] = 1
      return game
    }
  })
  return { games: uniqueGames }
})(Home)
