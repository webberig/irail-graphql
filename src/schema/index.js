import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema,
} from 'graphql';
import request from 'superagent-es6-promise';

export let schema = buildSchema(`
    type Station {
      latitude: Float
      longitude: Float
      name: String
    }

  type Query {
    stations(q: String): [Station]
  }
`);


export const rootResolver = {
    stations: (args) => {
        return request.get(`https://irail.be/stations/NMBS?q=${args.q}`)
            .set('accept', 'application/json')
            .then(response => {
                let results = [];
                response.body['@graph'].map(station => {
                    results.push({
                        latitude: station.latitude,
                        longitude: station.longitude,
                        name: station.name,
                    });
                });
                return results;
            });
/*
            .catch(error => {
                apiErrorHandler(error);
            });
*/

    },
};
