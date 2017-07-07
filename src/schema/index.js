import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema,
} from 'graphql';
import request from 'superagent-es6-promise';
const graphqlFields = require('graphql-fields');

export let schema = buildSchema(`
    type Departure {
        direction: String
        time: Int
        platform: String
    }

    type Station {
      id: String
      latitude: Float
      longitude: Float
      name: String
      departures: [Departure]
    }

  type Query {
    stations(q: String): [Station]
    liveboard(station: String!): [Departure]
  }
`);
function getLiveboard(station) {
    let url = `https://api.irail.be/liveboard/?station=${station}&fast=true&format=json`;
    console.log(url, "Adding a liveboard!");
    return request.get(url)
        .set('accept', 'application/json')
        .then(response => {
            console.log("Liveboard data received!");
            let departures = [];
            response.body.departures.departure.map(departure => {
                 departures.push({
                     direction: departure.station,
                     time: departure.time,
                     platform: departure.platform,
                 });
            });
            return departures;
        });
    //

}

export const rootResolver = {
    stations: (args, source, context) => {
        const fields = graphqlFields(context);

        let url = 'https://irail.be/stations/NMBS';
        if (args && args.q) {
            url += `?q=${args.q}`;
        }

        return request.get(url)
            .set('accept', 'application/json')
            .then(response => {
                let results = [];
                response.body['@graph'].map(station => {
                    results.push({
                        id: station['@id'].replace("http://irail.be/stations/NMBS/", "BE.NMBS."),
                        latitude: station.latitude,
                        longitude: station.longitude,
                        name: station.name,
                        departures: () => {
                                return getLiveboard(station['@id'].replace("http://irail.be/stations/NMBS/", "BE.NMBS."));
                        }
                    });
                });
                return results;
            });
    },
    liveboard: (args) => {
        return getLiveboard(args.station);
    }
};
