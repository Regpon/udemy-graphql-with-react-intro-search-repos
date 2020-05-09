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
  "query": "フロントエンドエンジニア"
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
  
              const search = data.search;
              const repositoryCount = search.repositoryCount;
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';

              const title = `GitHub Repositories Serch Results - ${repositoryCount} ${repositoryUnit}`

              return (
                <>
                  <h2>{title}</h2>
                  <ul>
                    {
                      search.edges.map(edge => {
                        const node = edge.node;

                        return (
                          <li key={node.id}>
                            <a href={node.url}>{node.name}</a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </>
              );
            }
          }
        </Query>
      </ApolloProvider>
      
    );
  }

}

export default App;
