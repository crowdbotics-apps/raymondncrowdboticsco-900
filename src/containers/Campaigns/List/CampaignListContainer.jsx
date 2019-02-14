import React from 'react';
import PropTypes from 'prop-types';

import styles from './CampaignListContainer.module.scss';

class CampaignListContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'No',
      'Name',
      'Organization',
      'Status',
      'Progress',
      'Participants',
      'Category',
      'Group',
      'Actions'
    ];

    this.state = {
      data: []
    };
  }

  addClicked = () => {};

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
                  <td>{item.name}</td>
                  <td>{item.org}</td>
                  <td>{item.status}</td>
                  <td>{item.progress}</td>
                  <td>{item.participants.length}</td>
                  <td>{item.category}</td>
                  <td>{item.group}</td>
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

CampaignListContainer.propTypes = {
  history: PropTypes.object
};
export default CampaignListContainer;
