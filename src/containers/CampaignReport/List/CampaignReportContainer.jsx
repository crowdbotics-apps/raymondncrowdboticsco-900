import React from 'react';
import PropTypes from 'prop-types';
import { CSVLink, CSVDownload } from 'react-csv';
import { AppContext } from 'components';
import { CampaignReportController } from 'controllers';

import styles from './CampaignReportContainer.module.scss';

var _ = require('lodash');
const { map } = require('p-iteration');

class CampaignReportContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    await this.setState({ loading: true });
    this.context.showLoading();
    await this.getCampaigns();
    this.context.hideLoading();
    this.setState({ loading: false });
  };

  async getCampaigns() {
    this.context.showLoading();

    await this.setState({ loading: true });

    let recepCampaigns = [];
    let campaigns = await CampaignReportController.getCampaigns();

    await map(campaigns, async campaign => {
      let headers = ['User name', 'Email'];
      let rows = [];
      (await campaign.campaign_questions) &&
        campaign.campaign_questions.length &&
        map(campaign.campaign_questions, async question => {
          headers.push(question.question);
        });

      (await campaign.campaign_user_list) &&
        campaign.campaign_user_list.length &&
        map(campaign.campaign_user_list, async user => {
          let row = [user.name, user.email];

          (await campaign.campaign_questions) &&
            campaign.campaign_questions.length &&
            map(campaign.campaign_questions, async question => {
              let que_answer = '';

              (await campaign.campaign_answers) &&
                campaign.campaign_answers.length &&
                map(campaign.campaign_answers, async answer => {
                  if (
                    answer.email === user.email &&
                    answer.question === question.question
                  ) {
                    que_answer = answer.answer;
                  }
                });
              row.push(que_answer);
            });

          rows.push(row);
        });

      let receptCampaign = {
        name: campaign.campaign_name,
        headers: headers,
        rows: rows,
        show: false
      };
      recepCampaigns.push(receptCampaign);
    });

    await this.setState({ recepCampaigns });

    this.context.hideLoading();

    await this.setState({ loading: false });
  }

  async showCampaign(campaign) {
    let { recepCampaigns } = this.state;

    await map(recepCampaigns, async data => {
      if (data.name === campaign.name) {
        data.show = !campaign.show;
      }
    });

    this.setState({ recepCampaigns });
  }

  renderCampaign(campaign, index) {
    return (
      <div className={styles.campaign}>
        <div className={styles.tab} onClick={() => this.showCampaign(campaign)}>
          <span>
            {`${campaign.name} details tab`}
            <i
              className={!campaign.show ? 'fa fa-arrow-down' : 'fa fa-arrow-up'}
            />
          </span>
        </div>
        {campaign.show && (
          <table key={index}>
            <thead>
              <tr className={styles.header}>
                {campaign.headers.map(item => (
                  <th key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaign.rows.map((row, index1) => (
                <tr key={index1}>
                  {row &&
                    row.map((column, index2) => <td key={index2}>{column}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {campaign.show && (
          <div className={styles.buttonContainer}>
            <div className={styles.button}>
              <CSVLink
                data={campaign.rows}
                headers={campaign.headers}
                style={{
                  color: '#ffffff',
                  padding: 8,
                  backgroundColor: '#03a9f4',
                  borderRadius: 4
                }}
              >
                Download csv
              </CSVLink>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { recepCampaigns, loading } = this.state;

    return (
      <div className={styles.wrapper}>
        {!loading &&
          recepCampaigns.length &&
          recepCampaigns.map((campaign, index) => {
            return this.renderCampaign(campaign);
          })}
      </div>
    );
  }
}

CampaignReportContainer.contextType = AppContext;

CampaignReportContainer.propTypes = {
  history: PropTypes.object
};

export default CampaignReportContainer;
