import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import uuid from 'uuid/v4'

import { Games } from '../imports/collections/games'
import { Scrims } from '../imports/collections/scrims'

// refreshh

const games = ['Fortnite Battle Royale', 'Call of Duty WWII', 'CS:GO', 'Halo 5', 'Gears of War 4', 'Rainbow Six Siege', 'Overwatch', 'League of Legends']
const gameImages = {
  'Fortnite Battle Royale': '/images/fortnite.jpg',
  'Call of Duty WWII': '/images/codww2.jpg',
  'CS:GO': '/images/csgo.jpg',
  'Halo 5': '/images/halo5.jpg',
  'Gears of War 4': '/images/gow4.png',
  'Rainbow Six Siege': '/images/r6siege.jpg',
  'Overwatch': '/images/overwatch.jpg',
  'League of Legends': '/images/lol.jpg'
}
const platforms = ['ps4', 'xb1', 'pc']
const platformNames = {
  'ps4': 'Playstation 4',
  'xb1': 'Xbox One',
  'pc': 'PC'
}
const platformImages = {
  'ps4': '/images/ps4.png',
  'xb1': '/images/xb1.png',
  'pc': '/images/pc.jpg'
}

const regions = ['NA East', 'NA West', 'EU', 'Global']

const users = ['Jake', 'Alex', 'Luke']

Meteor.startup(() => {
  Meteor.setInterval(() => {
    Scrims.remove({ expiresAt: { $lte: new Date() } })
  }, 30000)
  // const gamesCount = Games.find().count()
  // if (gamesCount === 0) {
  //   for (let game of games) {
  //     for (let platform of platforms) {
  //       const g = {
  //         id: uuid(),
  //         title: game,
  //         img: gameImages[game],
  //         platform: {
  //           value: platform,
  //           title: platformNames[platform],
  //           img: platformImages[platform]
  //         }
  //       }
  //       Games.insert(g)
  //     }
  //   }
  // }

  // const scrimsCount = Scrims.find().count()
  // if (scrimsCount === 0) {
  //   for (let i = 0; i < 500; i++) {
  //     const user1 = users[Math.floor(Math.random()*users.length)]
  //     const user2 = users[Math.floor(Math.random()*users.length)]
  //     const [ game ] = Games.aggregate([ { $sample: { size: 1 } } ])
  //     const scrim = {
  //       id: uuid(),
  //       createdAt: new Date(),
  //       users: [ user1, user2 ],
  //       title: '2v2 Scrim',
  //       region: regions[Math.floor(Math.random() * regions.length)],
  //       game
  //     }
  //     Scrims.insert(scrim)
  //   }
  // }

  Meteor.publish('user', function() {
    return Meteor.users.find({ _id: this.userId }, { fields: { scrims: 1, accounts: 1, id: 1, links: 1, bio: 1, profile: 1, in8s: 1, poolInfo: 1, savedPoolInfo: 1 } })
  })

  Meteor.publish('users', function() {
    return Meteor.users.find({}, { fields: { scrims: 1, accounts: 1, id: 1, links: 1, bio: 1, profile: 1, in8s: 1, poolInfo: 1 } })
  })

  Meteor.publish('games', function() {
    return Games.find()
  })

  Meteor.publish('scrims', function(scrimsCount = 12 , gameTitle, platformValue, region) {
    const filter = {}
    if (gameTitle) {
      filter['game.title'] = gameTitle
    }
    if (platformValue) {
      filter['game.platform.value'] = platformValue
    }
    if (region) {
      filter['region'] = region
    }
    return Scrims.find(filter, { limit: scrimsCount, sort: { createdAt: -1 } })
  })

})

Meteor.methods({
  'enter8s'({ username, region, role, mlg, cmg, savedPoolInfo }) {
    check(username, String);
    check(region, String);
    check(role, String);
    check(mlg, String);
    check(cmg, String);
    check(savedPoolInfo, Object);

    if (!this.userId) {
      throw new Meteor.Error('You must be logged in!');
    }

    Meteor.users.update({ _id: this.userId }, { $set: { in8s: true, savedPoolInfo, poolInfo: { username, region, role, mlg, cmg } } })

  },
  'leave8s'() {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in!');
    }

    Meteor.users.update({ _id: this.userId }, { $set: { in8s: false } })

  },
  'updateProfile'({ bio, accounts, links }) {
    if (!bio) {
      bio = ''
    }

    for (let platform in accounts) {
      const query = {}
      let key = `accounts.${platform}`
      query[key] = accounts[platform]
      const query2 = { ...query, _id: this.userId }
      if (accounts[platform].length > 0 && Meteor.users.find(query).count() > 0 && Meteor.users.find(query2).count() === 0) {
        throw new Meteor.Error(`${platform} name: ${accounts[platform]} is already linked to a profile. Please contact support if this is your account.`)
      }
    }

    const filteredLinks = links.filter(link => (link.title && link.url && link.color))
    Meteor.users.update({ _id: this.userId}, { $set: { accounts, links: filteredLinks, bio } })

    return { success: 1 }
  }
})

Accounts.onCreateUser((options, user) => {
  if (options.profile) {
    user.profile = options.profile;
  }
  user.in8s = false;
  user.poolInfo = undefined;
  user.bio = ''
  user.links = []
  user.accounts = {
    ps4: '',
    xb1: '',
    steam: '',
    lol: '',
    epicgames: '',
    uplay: '',
    battlenet: ''
  }
  user.id = uuid()
  user.scrims = []
  return user
})
