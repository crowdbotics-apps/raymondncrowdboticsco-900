import React from 'react';
import PropTypes from 'prop-types';

import { ParticipantsController } from 'controllers';
import Pagination from 'react-js-pagination';
import styles from './ParticipantListContainer.module.scss';

var _ = require('lodash');
class ParticipantListContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'Name',
      'Email',
      'Organization',
      'Divisions / Locations',
      'Group',
      'Actions'
    ];

    this.state = {
      data: [],
      keyword: '',
      activePage: 1,
      itemPerPage: 4
    };
  }

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    let data = await ParticipantsController.getParticipants();

    return this.setState({ data });
  };

  deactivateClicked = clientId => async () => {
    // var res = window.confirm('Do you want to deactivate this client?');
    // if (res) {
    //   await ClientController.deactivateClient(clientId);
    //   await this.reload();
    // }
  };

  activateClicked = clientId => async () => {
    // var res = window.confirm('Do you want to activate this client?');
    // if (res) {
    //   await ClientController.activateClient(clientId);
    //   await this.reload();
    // }
  };

  searchInputChanged = e => {
    let filterData = [];

    this.setState(
      {
        keyword: e.target.value
      },
      async () => {
        if (!this.state.keyword || this.state.keyword === '') {
          return this.reload();
        } else {
          await this.reload();
          const { data } = this.state;
          if (data && data.length > 0) {
            await data.map(async item => {
              if (item.name.toLowerCase().includes(this.state.keyword)) {
                filterData.push(item);
              }
            });
          }
        }

        return this.setState({ data: filterData });
      }
    );
  };

  searchInputKeyPressed = async e => {
    let filterData = [];

    if (e.charCode === 13) {
      if (!this.state.keyword) {
        return this.reload();
      } else {
        await this.reload();
        let { data } = this.state;
        if (data && data.length > 0) {
          await data.map(async item => {
            if (item.name.toLowerCase().includes(this.state.keyword)) {
              filterData.push(item);
            }
          });
        }
      }

      return this.setState({ data: filterData });
    }
  };

  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
  }

  createRow() {
    const { data } = this.state;
    let children = [];
    for (
      var i = (this.state.activePage - 1) * this.state.itemPerPage;
      i < this.state.activePage * this.state.itemPerPage;
      i++
    ) {
      let item = data[i];
      children.push(
        _.isEmpty(item) ? null : (
          <tr key={i}>
            <td>{item.name}</td>
            <td>{item.email}</td>
            <td>{item.organization}</td>
            <td>{item.division}</td>
            <td>{item.group}</td>
            <td>
              {item.status === 'active' ? (
                <span onClick={this.deactivateClicked(item)}>
                  <i className={`fa fa-trash-o ${styles.iconTrash}`} />
                </span>
              ) : (
                <span onClick={this.activateClicked(item)}>
                  <i className={`fa fa-refresh ${styles.iconRefresh}`} />
                </span>
              )}
            </td>
          </tr>
        )
      );
    }
    return children;
  }
  render() {
    const { data } = this.state;

    return (
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <div className={styles.searchbar}>
            <i className={`fa fa-search ${styles.iconSearch}`} />
            <input
              type='text'
              placeholder='Type participant name here and press enter to get the result...'
              value={this.state.keyword}
              onChange={this.searchInputChanged}
              onKeyPress={this.searchInputKeyPressed}
            />
          </div>
        </div>
        {data.length ? (
          <div>
            <table>
              <thead>
                <tr className={styles.header}>
                  {this.columns.map(item => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{this.createRow()}</tbody>
            </table>
            <div className={styles.bottom}>
              <Pagination
                activePage={this.state.activePage}
                itemsCountPerPage={this.state.itemPerPage}
                totalItemsCount={data.length}
                onChange={pageNumber => this.handlePageChange(pageNumber)}
                innerClass={styles.pagination}
                activeClass={styles.activeItem}
              />
            </div>
          </div>
        ) : (
          <h3>No Search Result</h3>
        )}
      </div>
    );
  }
}

ParticipantListContainer.propTypes = {
  history: PropTypes.object
};

export default ParticipantListContainer;
