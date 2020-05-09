import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES ,ME } from './graphql'

const VARIABLES = {
  "after": null,
  "before": null,
  "first": 5,
  "last": null,
  "query": "React"
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = VARIABLES;
  }
  render() {
    const  { query, first, last, before, after } = this.state;
    return (
      <ApolloProvider client={client}>
        <Query 
          query={SEARCH_REPOSITORIES}
          variables={{ query, first, last, before, after }}
        >
          {
            ({ loading, error, data }) => {
              if (loading) return 'loading...';
              if (error) return `Error! ${error.message}`;
  
              console.log({data});
              return <div></div>;
            }
          }
        </Query>
      </ApolloProvider>
    );
  }

}

export default App;
