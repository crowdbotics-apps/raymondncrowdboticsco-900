import React from 'react';
import PropTypes from 'prop-types';

import { AppContext } from 'components';
import { ClientController } from 'controllers';
import styles from './ClientListContainer.module.scss';

class ClientListContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'No',
      'Organization',
      'Status',
      'Participants',
      'Participant groups',
      'Divisions / Locations',
      'Active Campaigns',
      'Actions'
    ];

    this.state = {
      data: [],
      keyword: ''
    };
  }

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    this.context.showLoading();

    let data = await ClientController.getClients();

    data = data
      .filter(client =>
        client.org.toLowerCase().includes(this.state.keyword.toLowerCase())
      )
      .map(client => {
        let item = { ...client };
        let emailSet = new Set();
        client.participant_groups.map(group => {
          for (let participant of group.participant_list) {
            emailSet.add(participant.email);
          }
          return;
        });
        item.participants = Array.from(emailSet);
        return item;
      });
    this.setState({
      data
    });
    this.context.hideLoading();
  };

  addClicked = () => {
    this.props.history.push('/clients/add');
  };

  editClicked = clientId => () => {
    this.props.history.push(`/clients/edit/${clientId}`);
  };

  deactivateClicked = clientId => async () => {
    var res = window.confirm('Do you want to deactivate this client?');
    if (res) {
      await ClientController.deactivateClient(clientId);
      await this.reload();
    }
  };

  activateClicked = clientId => async () => {
    var res = window.confirm('Do you want to activate this client?');
    if (res) {
      await ClientController.activateClient(clientId);
      await this.reload();
    }
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
    if (e.charCode === 13) {
      // enter pressed
      await this.reload();
    }
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <div className={styles.searchbar}>
            <i className={`fa fa-search ${styles.iconSearch}`} />
            <input
              type='text'
              placeholder='Type organization name here and press enter to get the result...'
              value={this.state.keyword}
              onChange={this.searchInputChanged}
              onKeyPress={this.searchInputKeyPressed}
            />
          </div>
          <div onClick={this.addClicked}>
            <i className={`fa fa-plus ${styles.icon}`} />
            Add
          </div>
        </div>
        {this.state.data.length ? (
          <table>
            <thead>
              <tr className={styles.header}>
                {this.columns.map(item => (
                  <th key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.state.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{`${index + 1}`}</td>
                  <td>{item.org}</td>
                  <td>{item.status}</td>
                  <td>{item.participants.length}</td>
                  <td>{item.participant_group_ids.length}</td>
                  <td>{item.participant_group_ids.length}</td>
                  <td>N/A</td>
                  <td>
                    <span onClick={this.editClicked(item.id)}>
                      <i
                        className={`fa fa-pencil-square-o ${styles.iconPencil}`}
                      />
                    </span>
                    {item.status === 'active' ? (
                      <span onClick={this.deactivateClicked(item.id)}>
                        <i className={`fa fa-trash-o ${styles.iconTrash}`} />
                      </span>
                    ) : (
                      <span onClick={this.activateClicked(item.id)}>
                        <i className={`fa fa-refresh ${styles.iconRefresh}`} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h3>No Search Result</h3>
        )}
      </div>
    );
  }
}

ClientListContainer.contextType = AppContext;

ClientListContainer.propTypes = {
  history: PropTypes.object
};

export default ClientListContainer;
