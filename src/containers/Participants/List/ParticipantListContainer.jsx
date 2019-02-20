import React from 'react';
import PropTypes from 'prop-types';
import Pagination from 'react-js-pagination';
import Switch from 'react-switch';

import { AppContext } from 'components';
import { ParticipantsController } from 'controllers';

import styles from './ParticipantListContainer.module.scss';

var _ = require('lodash');

class ParticipantListContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      { title: 'Name', key: 'name' },
      { title: 'Email', key: 'email' },
      { title: 'Organization', key: 'organization' },
      { title: 'Divisions / Locations', key: 'division' },
      { title: 'Group', key: 'group' },
      { title: 'Active', key: 'status' }
    ];

    this.state = {
      data: [],
      keyword: '',
      activePage: 1,
      itemPerPage: 5
    };
  }

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    this.context.showLoading();
    let data = await ParticipantsController.getParticipants();
    this.context.hideLoading();
    return this.setState({ data });
  };

  searchInputChanged = e => {
    this.setState(
      {
        keyword: e.target.value
      },
      async () => {
        if (!this.state.keyword) {
          await this.reload();
        }
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

  async handleChange(participant) {
    let res = window.confirm(
      'Do you want to change active status of this participant?'
    );
    if (res) {
      await ParticipantsController.changeParticipantStatus(participant);

      let { data } = this.state;
      await data.map(item => {
        if (item.email === participant.email) {
          item.status = !participant.status;
        }
      });
      return this.setState({ data });
    }
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
              <Switch
                onChange={() => this.handleChange(item)}
                checked={item.status}
                id='normal-switch'
              />
            </td>
          </tr>
        )
      );
    }
    return children;
  }

  sortBy(key) {
    let { data } = this.state;
    data = _.orderBy(data, key);
    this.setState({ data });
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
                  {this.columns.map((item, index) => (
                    <th key={item.key} onClick={() => this.sortBy(item.key)}>
                      {item.title} &#x21C5;
                    </th>
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

ParticipantListContainer.contextType = AppContext;

ParticipantListContainer.propTypes = {
  history: PropTypes.object
};

export default ParticipantListContainer;
