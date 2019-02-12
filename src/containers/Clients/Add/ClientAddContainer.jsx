import React from 'react';
import PropTypes from 'prop-types';

import styles from './ClientAddContainer.module.scss';

class ClientAddContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  saveClicked = () => {
    console.log('save pressed');
  };

  cancelClicked = () => {
    this.props.history.goBack();
  };

  addmoreClicked = () => {
    console.log('add more employee group');
  };

  uploadClicked = () => {
    this.fileInput.click();
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <h1> Add a new client </h1>
        <div className={styles.container}>
          <h2>Basic Info</h2>
          <div className={styles.inputItem}>
            <span>Organization</span>
            <input />
          </div>
          <div className={styles.inputItem}>
            <span>Contact</span>
            <input />
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.title}>
            <h2>Employee Group</h2>
            <div className={styles.btnAddMore} onClick={this.addmoreClicked}>
              Add More
            </div>
          </div>
          <div className={styles.inputItem}>
            <span>Employee Group Name</span>
            <input />
          </div>
          <div className={styles.inputItem}>
            <span>Division</span>
            <input />
          </div>
          <div className={styles.inputItem}>
            <span>Number of Employees</span>
            <input />
          </div>
          <div className={styles.inputItem}>
            <span>Employee List</span>
            <div className={styles.btnUpload} onClick={this.uploadClicked}>
              Upload CSV
            </div>
            <input
              type='file'
              className={styles.file}
              ref={ref => (this.fileInput = ref)}
            />
          </div>
          <table>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
            <tr>
              <td>Name</td>
              <td>Email</td>
            </tr>
          </table>
        </div>
        <div className={styles.btnGroup}>
          <div className={styles.btnSave} onClick={this.saveClicked}>
            Save
          </div>
          <div className={styles.btnCancel} onClick={this.cancelClicked}>
            Cancel
          </div>
        </div>
      </div>
    );
  }
}

ClientAddContainer.propTypes = {
  history: PropTypes.object
};

export default ClientAddContainer;
