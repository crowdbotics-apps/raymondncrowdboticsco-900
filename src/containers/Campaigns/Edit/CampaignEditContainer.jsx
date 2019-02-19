import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import uuid from 'uuid/v4';

import { AppContext } from 'components';
import { ClientController, CampaignController } from 'controllers';
import QuestionType from '../../../constants/questionType';

import styles from './CampaignEditContainer.module.scss';

class CampaignEditContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      campaignId: props.match.params.id,
      clients: [],
      participant_groups: [],
      // campaign data
      basic: {
        name: '',
        marketing_name: '',
        org: '',
        contact: '',
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        participant_group: '',
        location: '',
        total_points: 0,
        description: '',
        status: 'active'
      },
      questions: [this.generateNewQuestion()]
    };

    this.fileInputs = {};
  }

  async componentDidMount() {
    this.context.showLoading();

    let clients = await ClientController.getClients();
    let participant_groups = await ClientController.getParticipantGroups();

    let { basic, questions } = this.state;
    let data = await CampaignController.getCampaignById(this.state.campaignId);
    // setting basic info
    basic.name = data.name;
    basic.marketing_name = data.marketing_name;
    basic.org = data.client_id;
    let index = clients.findIndex(client => client.id === data.client_id);
    if (index > -1) {
      basic.contact = clients[index].contact;
    }
    basic.from = data.from;
    basic.to = data.to;
    basic.participant_group = data.participant_group_id;
    index = participant_groups.findIndex(
      group => group.id === data.participant_group_id
    );
    if (index > -1) {
      basic.location = participant_groups[index].division;
    }
    basic.total_points = data.total_points;
    basic.description = data.description;
    basic.status = data.status;

    // setting questions
    questions = data.questions.map(question => ({
      id: uuid(),
      ...question
    }));
    this.setState({
      clients,
      participant_groups,
      basic,
      questions
    });

    this.context.hideLoading();
  }

  generateNewQuestion = () => {
    return {
      id: uuid(),
      type: QuestionType.OPEN_TEXT_QUESTION,
      question: '',
      answers: [],
      media: null
    };
  };

  updateClicked = async () => {
    // validation for basic info
    let { basic, questions } = this.state;
    basic['description'] = this.description.innerHTML;

    this.context.showLoading();
    if (!basic.name) {
      alert('Name is empty or invalid!');
      return;
    }
    if (!basic.marketing_name) {
      alert('Marketing Name is empty or invalid!');
      return;
    }
    if (!basic.org) {
      alert('Please select Organization!');
      return;
    }
    if (!basic.participant_group) {
      alert('Please select Participant Group!');
      return;
    }
    if (parseInt(basic.total_points) <= 0) {
      alert('Total point is not valid!');
      return;
    }
    if (!basic.description) {
      alert('Description is empty or invalid!');
      return;
    }

    // validation for questions
    for (var i = 0; i < questions.length; i++) {
      if (!questions[i].question) {
        alert(`Question${i + 1}'s Question Text is empty or invalid!`);
        return;
      }
      if (questions[i].type === QuestionType.MULTIPLE_SELECTION) {
        for (let j = 0; j < questions[i].answers.length; j++) {
          if (!questions[i].answers[j]) {
            alert(`Question${i + 1}'s Question Answers are not completed!`);
            return;
          }
        }
      }
    }

    // updating a campaign
    try {
      await CampaignController.updateCampaign({
        campaignId: this.state.campaignId,
        basic: this.state.basic,
        questions: this.state.questions
      });
      this.props.history.goBack();
    } catch (error) {
      alert(error.message);
    }

    this.context.hideLoading();
  };

  cancelClicked = () => {
    this.props.history.goBack();
  };

  basicInfoChanged = key => e => {
    let { basic } = this.state;
    basic[key] = e.target.value;
    if (key === 'participant_group') {
      let index = this.state.participant_groups.findIndex(
        group => group.id === e.target.value
      );
      basic['location'] = this.state.participant_groups[index].division;
    } else if (key === 'org') {
      let index = this.state.clients.findIndex(
        client => client.id === e.target.value
      );
      basic['contact'] = this.state.clients[index].contact;
    }
    this.setState({ basic });
  };

  selectQuestonType = (qtype, index) => () => {
    let { questions } = this.state;
    questions[index].type = qtype;
    if (qtype === QuestionType.MULTIPLE_SELECTION) {
      questions[index].answers = [''];
    } else {
      questions[index].answers = [];
    }
    this.setState({ questions });
  };

  uploadClicked = id => () => {
    this.fileInputs[id].click();
  };

  fileUploadChange = index => e => {
    let files = e.target.files;
    if (files.length > 0) {
      let { questions } = this.state;
      questions[index].media = files[0];
      this.setState({ questions });
    }
  };

  questionChanged = (key, index) => e => {
    let { questions } = this.state;
    questions[index][key] = e.target.value;
    this.setState({ questions });
  };

  addAnswer = index => () => {
    // multiple option
    let { questions } = this.state;
    questions[index].answers.push('');
    this.setState({ questions });
  };

  removeAnswer = (questionIndex, answerIndex) => () => {
    let { questions } = this.state;
    questions[questionIndex].answers.splice(answerIndex, 1);
    this.setState({ questions });
  };

  answerChanged = (questionIndex, answerIndex) => e => {
    let { questions } = this.state;
    questions[questionIndex].answers[answerIndex] = e.target.value;
    this.setState({ questions });
  };

  addQuestion = () => {
    let { questions } = this.state;
    // question validation
    const last = questions[questions.length - 1];
    if (!last.question) {
      alert('Question Text is empty or invalid!');
      return;
    }
    if (last.type === QuestionType.MULTIPLE_SELECTION) {
      for (let i = 0; i < last.answers.length; i++) {
        if (!last.answers[i]) {
          alert('Question Answer can\'t be empty');
          return;
        }
      }
    }
    questions.push(this.generateNewQuestion());
    this.setState({ questions });
  };

  removeQuestion = index => () => {
    if (window.confirm('Are you sure to remove?')) {
      let { questions } = this.state;
      questions.splice(index, 1);
      this.setState({ questions });
    }
  };

  renderQuestion = (question, index) => {
    return (
      <div key={`${index}`} className={styles.questionContainer}>
        <div className={styles.title}>
          <h2> Question {index + 1} </h2>
          {this.state.questions.length > 1 && (
            <span onClick={this.removeQuestion(index)}>
              <i className='fa fa-minus-circle' />
            </span>
          )}
        </div>

        <div className={styles.qtypeContainer}>
          <div
            className={styles.qtypeRadio}
            onClick={this.selectQuestonType(
              QuestionType.OPEN_TEXT_QUESTION,
              index
            )}
          >
            <input
              type='radio'
              value={`open${index}`}
              checked={question.type === QuestionType.OPEN_TEXT_QUESTION}
              onChange={this.selectQuestonType(
                QuestionType.OPEN_TEXT_QUESTION,
                index
              )}
            />
            Open text question
          </div>
          <div
            className={styles.qtypeRadio}
            onClick={this.selectQuestonType(QuestionType.TRUE_FALSE, index)}
          >
            <input
              type='radio'
              value={`truefalse${index}`}
              checked={question.type === QuestionType.TRUE_FALSE}
              onChange={this.selectQuestonType(QuestionType.TRUE_FALSE, index)}
            />
            True / False
          </div>
          <div
            className={styles.qtypeRadio}
            onClick={this.selectQuestonType(
              QuestionType.MULTIPLE_SELECTION,
              index
            )}
          >
            <input
              type='radio'
              value={`multiple${index}`}
              checked={question.type === QuestionType.MULTIPLE_SELECTION}
              onChange={this.selectQuestonType(
                QuestionType.MULTIPLE_SELECTION,
                index
              )}
            />
            Poll( one or many questions )
          </div>
        </div>
        <div className={styles.inputItem}>
          <span>Question Text</span>
          <input
            placeholder='Type Question here'
            value={question.question}
            onChange={this.questionChanged('question', index)}
          />
        </div>
        <div className={styles.medias}>
          <div className={styles.mediaContainer}>
            <span>Media</span>
            <div>
              <div
                className={styles.btnUpload}
                onClick={this.uploadClicked(question.id)}
              >
                Upload Image/Video
              </div>
              {question.media ? (
                question.media.type ? (
                  <div>
                    {question.media.type.includes('image/') ? (
                      <img
                        className={styles.media}
                        src={URL.createObjectURL(question.media)}
                      />
                    ) : (
                      <video
                        width='200'
                        controls
                        className={styles.media}
                        src={URL.createObjectURL(question.media)}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    {question.media_type.includes('image/') ? (
                      <img className={styles.media} src={question.media} />
                    ) : (
                      <video
                        width='200'
                        controls
                        className={styles.media}
                        src={question.media}
                      />
                    )}
                  </div>
                )
              ) : (
                <div className={styles.nomedia}>
                  No image or video is uploaded
                </div>
              )}
              <input
                ref={ref => (this.fileInputs[question.id] = ref)}
                type='file'
                className={styles.file}
                accept='video/*,image/*'
                onChange={this.fileUploadChange(index)}
              />
            </div>
          </div>
        </div>
        <div className={styles.answers}>
          {question.type === QuestionType.TRUE_FALSE && (
            <div className={styles.answerContainer}>
              <span>Answers</span>
              <div>
                <div className={styles.answerItem}>
                  <input value='True' disabled />
                </div>
                <div className={styles.answerItem}>
                  <input value='False' disabled />
                </div>
              </div>
            </div>
          )}
          {question.type === QuestionType.MULTIPLE_SELECTION && (
            <div className={styles.answerContainer}>
              <span>Answers</span>
              <div>
                {question.answers.map((answer, answerIndex) => (
                  <div key={`${answerIndex}`} className={styles.answerItem}>
                    <input
                      placeholder='Type answer here'
                      value={answer}
                      onChange={this.answerChanged(index, answerIndex)}
                    />
                    {question.answers.length > 1 && (
                      <span onClick={this.removeAnswer(index, answerIndex)}>
                        <i className='fa fa-minus-circle' />
                      </span>
                    )}
                  </div>
                ))}
                <div className={styles.btnAdd} onClick={this.addAnswer(index)}>
                  <i className='fa fa-plus' />
                  Add
                </div>
              </div>
            </div>
          )}
        </div>
        {index === this.state.questions.length - 1 && (
          <div className={styles.btnAddMore} onClick={this.addQuestion}>
            Add More Question
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <h1> Edit campaign </h1>
        <table>
          <thead>
            <tr>
              <td>
                <h2>Basic Information</h2>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Name</span>
                  <input
                    value={this.state.basic.name}
                    onChange={this.basicInfoChanged('name')}
                  />
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Marketing Name</span>
                  <input
                    value={this.state.basic.marketing_name}
                    onChange={this.basicInfoChanged('marketing_name')}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Organization</span>
                  <select
                    value={this.state.basic['org']}
                    onChange={this.basicInfoChanged('org')}
                  >
                    {this.state.clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.org}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Contact</span>
                  <input disabled value={this.state.basic['contact']} />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Starting Date</span>
                  <input
                    type='date'
                    value={this.state.basic.from}
                    onChange={this.basicInfoChanged('from')}
                  />
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Ending Date</span>
                  <input
                    type='date'
                    value={this.state.basic.to}
                    onChange={this.basicInfoChanged('to')}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Participant Group</span>
                  <select
                    value={this.state.basic['participant_group']}
                    onChange={this.basicInfoChanged('participant_group')}
                  >
                    {this.state.participant_groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Location</span>
                  <input disabled value={this.state.basic['location']} />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Total Points</span>
                  <input
                    value={this.state.basic['total_points']}
                    onChange={this.basicInfoChanged('total_points')}
                  />
                </div>
              </td>
              <td>
                <div className={styles.textareaItem}>
                  <span>Description</span>
                  <div
                    ref={ref => (this.description = ref)}
                    className={styles.textContainer}
                    contentEditable
                    dangerouslySetInnerHTML={{
                      __html: this.state.basic['description']
                    }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {this.state.questions.map((question, index) =>
          this.renderQuestion(question, index)
        )}
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

CampaignEditContainer.contextType = AppContext;

CampaignEditContainer.propTypes = {
  history: PropTypes.object
};

export default CampaignEditContainer;
