import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES ,ME } from './graphql'

const DEFAULT_VARIABLES = {
  "after": null,
  "before": null,
  "first": 5,
  "last": null,
  "query": "React"
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = DEFAULT_VARIABLES;

    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * inputタグの変更に関するイベントハンドラ
   * @param {event} event 
   */
  handleChange(event) {
    this.setState({
      ...DEFAULT_VARIABLES,
      query: event.target.value
    });
    
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const  { query, first, last, before, after } = this.state;
    console.log({query});
    return (
      <ApolloProvider client={client}>
        <form onSubmit={this.handleSubmit} >
          <input value={query} onChange={this.handleChange} />
        </form>
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
