import React from 'react';
import PropTypes from 'prop-types';

import { AppContext } from 'components';
import { CampaignController } from 'controllers';
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
      data: [],
      filter: 'name',
      keyword: ''
    };
  }

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    this.context.showLoading();

    let data = await CampaignController.getCampaigns();
    if (this.state.filter === 'name') {
      data = data.filter(campaign =>
        campaign.name.toLowerCase().includes(this.state.keyword.toLowerCase())
      );
    } else {
      data = data.filter(campaign =>
        campaign.client.org
          .toLowerCase()
          .includes(this.state.keyword.toLowerCase())
      );
    }
    this.setState({
      data
    });

    this.context.hideLoading();
  };

  searchfilterChanged = filter => () => {
    this.setState({
      filter
    });
  };

  addClicked = () => {
    this.props.history.push('/campaigns/add');
  };

  editClicked = campaignId => () => {
    this.props.history.push(`/campaigns/edit/${campaignId}`);
  };

  activateClicked = id => async () => {
    if (window.confirm('Do you want to activate this campaign?')) {
      await CampaignController.activateCampaign(id);
      await this.reload();
    }
  };

  deactivateClicked = id => async () => {
    if (window.confirm('Do you want to deactivate this campaign?')) {
      await CampaignController.deactivateCampaign(id);
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
          <div className={styles.searchContainer}>
            <div className={styles.searchbar}>
              <i className={`fa fa-search ${styles.iconSearch}`} />
              <input
                type='text'
                placeholder='Type here and press enter to get the result...'
                value={this.state.keyword}
                onChange={this.searchInputChanged}
                onKeyPress={this.searchInputKeyPressed}
              />
            </div>
            <div className={styles.searchfilters}>
              <div
                className={styles.filter}
                onClick={this.searchfilterChanged('name')}
              >
                <input
                  type='checkbox'
                  value='name'
                  checked={this.state.filter === 'name'}
                  onChange={this.searchfilterChanged('name')}
                />
                Search by name
              </div>
              <div
                className={styles.filter}
                onClick={this.searchfilterChanged('org')}
              >
                <input
                  type='checkbox'
                  value='org'
                  checked={this.state.filter === 'org'}
                  onChange={this.searchfilterChanged('org')}
                />
                Search by organization
              </div>
            </div>
          </div>
          <div className={styles.btnAdd} onClick={this.addClicked}>
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
                  <td>{item.client.org}</td>
                  <td>{item.status}</td>
                  <td>progress</td>
                  <td>Participant length</td>
                  <td>category</td>
                  <td>group</td>
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

CampaignListContainer.contextType = AppContext;

CampaignListContainer.propTypes = {
  history: PropTypes.object
};
export default CampaignListContainer;
