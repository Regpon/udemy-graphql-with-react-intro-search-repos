import React, { Component } from 'react';
import { ApolloProvider, Mutation, Query } from 'react-apollo';
import client from './client';
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'

const StarButton = props => {
  const { node, query, first, last, before, after } = props;

  const starCount = node.stargazers.totalCount;
  const starUnit = node.viewerHasStarred ? 'starred' : '-';
  const starCountStr = starCount === 1 ? '1 star' : `${starCount} stars`;

  const StarStatus = ({changeStarMutaion}) => {
    return (
      <button
        onClick={
          () => changeStarMutaion({
            variables: { input: {starrableId: node.id } },
            update: (store, { data: { addStar, removeStar } }) => {
              const { starrable } = addStar || removeStar;
              console.log({addStar});
              console.log({removeStar});
              console.log({starrable});
              const data = store.readQuery(
                {
                  query: SEARCH_REPOSITORIES,
                  variables: { query, first, last, after, before }
                }
              );
              const edges = data.search.edges;

              data.search.edges = edges.map(edge => {
                if (edge.node.id === node.id) {
                  const totalCount = edge.node.stargazers.totalCount;
                  const diff = starrable.viewerHasStarred ? -1 : 1;
                  edge.node.stargazers.totalCount = totalCount + diff;

                }
                return edge;
              });
              store.writeQuery({ query: SEARCH_REPOSITORIES, data })
            }
          })
        }
      >
        {starCountStr} | {starUnit}
      </button>
    );
  }

  return (
    <Mutation 
      mutation={node.viewerHasStarred ? REMOVE_STAR : ADD_STAR}
    >
      {
        changeStar => <StarStatus changeStarMutaion={changeStar}/>
      }
    </Mutation>
  );
}

const PER_PAGE = 5;

const DEFAULT_VARIABLES = {
  "after": null,
  "before": null,
  "first": PER_PAGE,
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

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    });
  }

  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
    });
  }

  render() {
    const  { query, first, last, before, after } = this.state;
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
                            <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                            &nbsp;
                            <StarButton node={node} {...{ query, first, last, before, after }} />
                          </li>
                        )
                      })
                    }
                  </ul>
                  {
                    search.pageInfo.hasPreviousPage === true ?
                    <button 
                      onClick={this.goPrevious.bind(this, search)}
                    >
                      Previous
                    </button>
                    :
                    null
                  }

                  {
                    search.pageInfo.hasNextPage === true ?
                    <button 
                      onClick={this.goNext.bind(this, search)}
                    >
                      Next
                    </button>
                    :
                    null
                  }
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
