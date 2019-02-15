import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import Checkbox from 'rc-checkbox';
import 'rc-checkbox/assets/index.css';

import { ClientController } from 'controllers';
import styles from './ReportContainer.module.scss';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
];

class ReportContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'Select',
      'Category',
      'Campaign',
      'Completions',
      'Employee Group',
      'Divisions / Locations'
    ];

    this.state = {
      data: [],
      keyword: '',
      selectedOption: null
    };
  }

  handleChange = selectedOption => {
    this.setState({ selectedOption });
    console.log('Option selected:', selectedOption);
  };

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
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
        });
        item.participants = Array.from(emailSet);
        return item;
      });
    this.setState({
      data
    });
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

  select(id) {
    console.log('select', id);
  }

  render() {
    const { selectedOption } = this.state;

    return (
      <div className={styles.wrapper}>
        <div className={styles.selector}>
          <span>Organization:</span>
          <div className={styles.select}>
            <Select
              value={selectedOption}
              onChange={this.handleChange}
              options={options}
            />
          </div>
        </div>
        <div className={styles.selector}>
          <span>Market filter By:</span>
          <div className={styles.select}>
            <Select
              value={selectedOption}
              onChange={this.handleChange}
              options={options}
            />
          </div>
        </div>
        <div className={styles.selector}>
          <span>Bulk Action:</span>
          <div className={styles.select}>
            <Select
              value={selectedOption}
              onChange={this.handleChange}
              options={options}
            />
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
                  <td>
                    <Checkbox
                      checked={item.checked}
                      onChange={() => this.select(item.id)}
                    />
                  </td>
                  <td>{item.org}</td>
                  <td>{item.status}</td>
                  <td>{item.participants.length}</td>
                  <td>{item.participant_group_ids.length}</td>
                  <td>{item.participant_group_ids.length}</td>
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

ReportContainer.propTypes = {
  history: PropTypes.object
};

export default ReportContainer;
