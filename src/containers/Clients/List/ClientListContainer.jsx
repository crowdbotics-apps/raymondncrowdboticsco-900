import React from 'react';
import PropTypes from 'prop-types';

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
      'Participants groups',
      'Divisions / Locations',
      'Active Campaigns',
      'Actions'
    ];

    this.state = {
      data: []
    };
  }

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    let data = await ClientController.getClients();
    data = data.map(client => {
      let item = { ...client };
      let emailSet = new Set();
      client.employee_groups.map(group => {
        for (let employee of group.employee_list) {
          emailSet.add(employee.email);
        }
      });
      item.employees = Array.from(emailSet);
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

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <input type='text' placeholder='Search Organization...' />
          <div onClick={this.addClicked}>
            <i className={`fa fa-plus ${styles.icon}`} />
            Add
          </div>
        </div>
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
                <td>{item.employees.length}</td>
                <td>{item.employee_group_ids.length}</td>
                <td>{item.employee_group_ids.length}</td>
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
      </div>
    );
  }
}

ClientListContainer.propTypes = {
  history: PropTypes.object
};

export default ClientListContainer;
