import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import Checkbox from 'rc-checkbox';
import { CSVLink, CSVDownload } from 'react-csv';
import { AppContext } from 'components';
import { ReportController, ClientController } from 'controllers';

import 'rc-checkbox/assets/index.css';
import styles from './ReportContainer.module.scss';

var _ = require('lodash');

const headers = [
  { label: 'Campaign', key: 'name' },
  { label: 'Completions', key: 'completion' },
  { label: 'Organization', key: 'company_name' },
  { label: 'Participants Group', key: 'group_name' },
  { label: 'Division / Location ', key: 'division' }
];

class ReportContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'Select',
      'Campaign',
      'Completions',
      'Organization',
      'Participants Group',
      'Division / Location '
    ];

    this.state = {
      orgSelected: {
        label: 'all',
        value: 0
      },
      loading: true
    };
  }

  handleOrgChange = async orgSelected => {
    await this.setState({ orgSelected });
    await this.getCampaigns();
    if (orgSelected.value !== 0) {
      let filterCampaings = [];
      (await this.state.campaigns) &&
        this.state.campaigns.length !== 0 &&
        this.state.campaigns.map(async campaign => {
          if (campaign.client_id === orgSelected.value) {
            filterCampaings.push(campaign);
          }
        });
      await this.setState({ campaigns: filterCampaings });
    }
    await this.makeCsvData();
  };

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    await this.setState({ loading: true });
    this.context.showLoading();
    let orgs = await ClientController.getClients();
    let orgList = [
      {
        label: 'all',
        value: 0
      }
    ];

    if (orgs && orgs.length > 0) {
      await orgs.map(item => {
        let org = {
          label: item.org,
          value: item.id
        };
        orgList.push(org);
      });
    }

    await this.setState({ orgList });

    await this.getCampaigns();
    await this.makeCsvData();
    this.context.hideLoading();
    this.setState({ loading: false });
  };

  async getCampaigns() {
    this.context.showLoading();
    await this.setState({ loading: true });
    let campaigns = await ReportController.getCampaigns();
    await this.setState({ campaigns });
    this.context.hideLoading();
    await this.setState({ loading: false });
  }

  async select(selectedData) {
    let { campaigns } = this.state;

    await campaigns.map(item => {
      if (item.id === selectedData.id) {
        item.checked = !selectedData.checked;
      }
    });

    await this.setState({ campaigns });

    this.makeCsvData();
  }

  async makeCsvData() {
    let csvData = [];

    this.state.campaigns &&
      this.state.campaigns.length !== 0 &&
      this.state.campaigns.map(campaign => {
        if (campaign.checked) {
          let data = {
            name: campaign.name,
            completion: `${campaign.answers} out of ${campaign.completion}`,
            company_name: campaign.company_name,
            group_name: campaign.participant_group_name,
            division: campaign.division
          };
          csvData.push(data);
        }
      });

    this.setState({ csvData });
  }

  createRow() {
    const { campaigns } = this.state;

    let children = [];
    for (var i = 0; i < campaigns.length; i++) {
      let item = campaigns[i];
      children.push(
        _.isEmpty(item) ? null : (
          <tr key={item.id}>
            <td>
              <Checkbox
                checked={item.checked}
                onChange={() => this.select(item)}
              />
            </td>
            <td
              onClick={() => {
                this.goCampaignReport(item.id);
              }}
            >
              <span className={styles.campaign}>{item.name}</span>
            </td>
            <td>{`${item.answers} out of ${item.completion}`}</td>
            <td>{item.company_name}</td>
            <td>{item.participant_group_name}</td>
            <td>{item.division}</td>
          </tr>
        )
      );
    }

    return children;
  }

  goCampaignReport(id) {
    this.props.history.push(`/campaign-report/${id}`);
  }

  render() {
    const { orgSelected, orgList, campaigns, loading, csvData } = this.state;

    return (
      <div className={styles.wrapper}>
        <div className={styles.selector}>
          <span>Organization:</span>
          <div className={styles.select}>
            <Select
              value={orgSelected}
              onChange={this.handleOrgChange}
              options={orgList}
            />
          </div>
        </div>

        {!loading && campaigns.length ? (
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
        ) : (
          <h3>No Result</h3>
        )}

        <div className={styles.buttonContainer}>
          {!loading && csvData && csvData.length !== 0 && (
            <div className={styles.button}>
              <CSVLink
                data={csvData}
                headers={headers}
                style={{
                  color: '#ffffff',
                  padding: 8,
                  backgroundColor: '#03a9f4',
                  borderRadius: 4,
                  textDecoration: 'none'
                }}
              >
                Download data file
              </CSVLink>
            </div>
          )}
        </div>
      </div>
    );
  }
}

ReportContainer.contextType = AppContext;

ReportContainer.propTypes = {
  history: PropTypes.object
};

export default ReportContainer;
