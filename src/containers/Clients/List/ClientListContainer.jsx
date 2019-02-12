import React from 'react';
import PropTypes from 'prop-types';

import styles from './ClientListContainer.module.scss';

class ClientListContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'No',
      'Organization',
      'Status',
      'Employees',
      'Employee groups',
      'Divisions',
      'Active Campaigns',
      'Actions'
    ];

    this.state = {
      data: []
    };
  }

  componentDidMount() {
    let data = [
      {
        org: 'test',
        status: 'active',
        employees: 20,
        employee_groups: 4,
        divisions: 5,
        active_campaigns: 7
      },
      {
        org: 'test',
        status: 'active',
        employees: 20,
        employee_groups: 4,
        divisions: 5,
        active_campaigns: 7
      },
      {
        org: 'test',
        status: 'active',
        employees: 20,
        employee_groups: 4,
        divisions: 5,
        active_campaigns: 7
      },
      {
        org: 'test',
        status: 'active',
        employees: 20,
        employee_groups: 4,
        divisions: 5,
        active_campaigns: 7
      }
    ];
    this.setState({ data });
  }

  addClicked = () => {
    this.props.history.push('/clients/add');
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <input type='text' placeholder='Search..' />
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
              <tr key={`${index}`}>
                <td>{`${index + 1}`}</td>
                <td>{item.org}</td>
                <td>{item.status}</td>
                <td>{item.employees}</td>
                <td>{item.employee_groups}</td>
                <td>{item.divisions}</td>
                <td>{item.active_campaigns}</td>
                <td>
                  <i className={`fa fa-pencil-square-o ${styles.iconPencil}`} />
                  <i className={`fa fa-trash-o ${styles.iconTrash}`} />
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
