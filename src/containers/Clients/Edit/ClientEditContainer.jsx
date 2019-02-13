import React from 'react';
import PropTypes from 'prop-types';
import Papa from 'papaparse';
import uuid from 'uuid/v4';

import { ClientController } from 'controllers';

import styles from './ClientEditContainer.module.scss';

class ClientEditContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clientId: props.match.params.id,
      basic: {
        org: '',
        contact: ''
      },
      groups: [this.generateNewGroup()]
    };

    this.fileInputs = {};
  }

  async componentDidMount() {
    let data = await ClientController.getClientById(this.state.clientId);
    let groups = data.employee_groups.map(group => {
      let item = { ...group };
      item.employee_list = group.employee_list.map(employee => [
        employee.name,
        employee.email
      ]);
      return item;
    });
    this.setState({
      basic: {
        org: data.org,
        contact: data.contact,
        status: data.status
      },
      groups
    });
  }

  generateNewGroup = () => {
    return {
      id: uuid(),
      name: '',
      division: '',
      number_of_employees: 0,
      employee_list: [],
      newlyAdded: true
    };
  };

  updateClicked = async () => {
    try {
      await ClientController.updateClient(this.state);
      alert('This client is updated.');
      this.props.history.goBack();
    } catch (error) {
      alert(error.message);
    }
  };

  cancelClicked = () => {
    this.props.history.goBack();
  };

  addmoreClicked = () => {
    let { groups } = this.state;

    let last = groups[groups.length - 1];
    if (!last.name || !last.division || !last.number_of_employees) {
      alert('Please complete the current employee group to add more.');
      return;
    }
    groups.push(this.generateNewGroup());
    this.setState({ groups });
  };

  uploadClicked = id => () => {
    this.fileInputs[id].click();
  };

  fileUploadChange = index => e => {
    let files = e.target.files;
    if (files.length > 0) {
      Papa.parse(files[0], {
        error: error => {
          alert(error.message);
        },
        complete: results => {
          let { groups } = this.state;
          groups[index]['employee_list'] = results.data;
          groups[index]['number_of_employees'] = results.data.length;
          this.setState({ groups });
        }
      });
    }
  };

  basicInfoChanged = type => e => {
    let { basic } = this.state;
    basic[type] = e.target.value;
    this.setState({ basic });
  };

  groupChange = (type, index) => e => {
    let { groups } = this.state;
    groups[index][type] = e.target.value;
    this.setState({ groups });
  };

  groupRemove = index => () => {
    let { groups } = this.state;
    groups.splice(index, 1);
    this.setState({ groups });
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <h1> Edit client </h1>
        <div className={styles.container}>
          <h2>Basic Info</h2>
          <div className={styles.inputItem}>
            <span>Organization</span>
            <input
              value={this.state.basic.org}
              onChange={this.basicInfoChanged('org')}
            />
          </div>
          <div className={styles.inputItem}>
            <span>Contact</span>
            <input
              value={this.state.basic.contact}
              onChange={this.basicInfoChanged('contact')}
            />
          </div>
        </div>
        {this.state.groups.map((group, index) => (
          <div key={group.id} className={styles.container}>
            <div className={styles.title}>
              <h2>Employee Group</h2>
              {this.state.groups.length > 1 && (
                <span onClick={this.groupRemove(index)}>
                  <i className={`fa fa-times-circle-o ${styles.iconRemove}`} />
                </span>
              )}
            </div>
            <div className={styles.inputItem}>
              <span>Employee Group Name</span>
              <input
                value={group.name}
                onChange={this.groupChange('name', index)}
              />
            </div>
            <div className={styles.inputItem}>
              <span>Division</span>
              <input
                value={group.division}
                onChange={this.groupChange('division', index)}
              />
            </div>
            <div className={styles.inputItem}>
              <span>Number of Employees</span>
              <input disabled value={group.number_of_employees} />
            </div>
            <div className={styles.inputItem}>
              <span>Employee List</span>
              <div
                className={styles.btnUpload}
                onClick={this.uploadClicked(group.id)}
              >
                Upload CSV
              </div>
              <input
                ref={ref => (this.fileInputs[group.id] = ref)}
                type='file'
                className={styles.file}
                accept='.csv'
                onChange={this.fileUploadChange(index)}
              />
            </div>
            {group.employee_list.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {group.employee_list.map((employee, index) => (
                    <tr key={`${index}`}>
                      <td>{employee[0]}</td>
                      <td>{employee[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {index === this.state.groups.length - 1 && (
              <div className={styles.btnAddMore} onClick={this.addmoreClicked}>
                Add More Employee Group
              </div>
            )}
          </div>
        ))}
        <div className={styles.btnGroup}>
          <div className={styles.btnSave} onClick={this.updateClicked}>
            Update
          </div>
          <div className={styles.btnCancel} onClick={this.cancelClicked}>
            Cancel
          </div>
        </div>
      </div>
    );
  }
}

ClientEditContainer.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
};

export default ClientEditContainer;
