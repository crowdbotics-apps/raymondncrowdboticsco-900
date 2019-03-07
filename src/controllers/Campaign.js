import moment from 'moment';
import { Firestore, Storage } from '../lib/firebase';

let collection = Firestore.collection('campaigns');

export const addCampaign = async payload => {
  try {
    let questions = [];
    let tasks = payload.questions.map(
      (question, index) =>
        new Promise((resolve, reject) => {
          questions.push({
            type: question.type,
            question: question.question,
            answers: question.answers
          });
          if (question.media) {
            let ref = Storage.ref(`media/${moment().valueOf()}`);
            let task = ref.put(question.media);
            task.on(
              'state_changed',
              snapshot => {},
              error => {},
              () => {
                task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                  questions[index].media = downloadUrl;
                  questions[index].media_type = question.media.type;
                  resolve(downloadUrl);
                });
              }
            );
          } else {
            resolve();
          }
        })
    );

    let data = {
      name: payload.basic.name,
      marketing_name: payload.basic.marketing_name,
      client_id: payload.basic.org,
      from: payload.basic.from.toISOString(),
      to: payload.basic.to.toISOString(),
      participant_group_id: payload.basic.participant_group,
      total_points: parseInt(payload.basic.total_points),
      description: payload.basic.description,
      status: true
    };

    if (payload.basic.logo) {
      tasks.push(
        new Promise((resolve, reject) => {
          let ref = Storage.ref(`media/${moment().valueOf()}`);
          let task = ref.put(payload.basic.logo);
          task.on(
            'state_changed',
            snapshot => {},
            error => {},
            () => {
              task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                data.logo = downloadUrl;
                resolve(downloadUrl);
              });
            }
          );
        })
      );
    } else {
      data.logo = null;
    }
    await Promise.all(tasks);

    let campaignDoc = collection.doc();
    await campaignDoc.set({
      id: campaignDoc.id,
      ...data,
      questions
    });

    // sending invitation emails
    fetch(
      'https://us-central1-social-lens-3a3d5.cloudfunctions.net/inviteParticipants',
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignDoc.id })
      }
    )
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        throw error;
      });
  } catch (error) {
    throw error;
  }
};

export const updateCampaign = async payload => {
  try {
    let questions = [];
    let tasks = payload.questions.map(
      (question, index) =>
        new Promise((resolve, reject) => {
          questions.push({
            type: question.type,
            question: question.question,
            answers: question.answers
          });
          if (question.media && question.media.type) {
            let ref = Storage.ref(`media/${moment().valueOf()}`);
            let task = ref.put(question.media);
            task.on(
              'state_changed',
              snapshot => {},
              error => {},
              () => {
                task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                  questions[index].media = downloadUrl;
                  questions[index].media_type = question.media.type;
                  resolve(downloadUrl);
                });
              }
            );
          } else if (question.media && question.media_type) {
            questions[index].media = question.media;
            questions[index].media_type = question.media_type;
            resolve();
          } else {
            resolve();
          }
        })
    );

    let data = {
      name: payload.basic.name,
      marketing_name: payload.basic.marketing_name,
      client_id: payload.basic.org,
      from: payload.basic.from.toISOString(),
      to: payload.basic.to.toISOString(),
      participant_group_id: payload.basic.participant_group,
      total_points: parseInt(payload.basic.total_points),
      description: payload.basic.description,
      status: payload.basic.status
    };

    if (payload.basic.logo && payload.basic.logo.type) {
      tasks.push(
        new Promise((resolve, reject) => {
          let ref = Storage.ref(`media/${moment().valueOf()}`);
          let task = ref.put(payload.basic.logo);
          task.on(
            'state_changed',
            snapshot => {},
            error => {},
            () => {
              task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                data.logo = downloadUrl;
                resolve(downloadUrl);
              });
            }
          );
        })
      );
    } else {
      data.logo = payload.basic.logo;
    }

    await Promise.all(tasks);

    let campaignDoc = collection.doc(payload.campaignId);
    campaignDoc.update({
      ...data,
      questions
    });
  } catch (error) {
    throw error;
  }
};

export const getCampaignById = async campaignId =>
  new Promise((resolve, reject) => {
    let campaignDoc = collection.doc(campaignId);
    campaignDoc.onSnapshot(async snapshot => {
      let campaignData = snapshot.data();

      let clientDoc = Firestore.collection('clients').doc(
        campaignData.client_id
      );
      clientDoc.onSnapshot(client_snapshot => {
        let client_data = client_snapshot.data();
        campaignData.client = client_data;

        let participantDoc = Firestore.collection('participant_groups').doc(
          campaignData.participant_group_id
        );
        participantDoc.onSnapshot(group_snapshot => {
          let participant_group_data = group_snapshot.data();
          campaignData.participant_group = participant_group_data;
          resolve(campaignData);
        });
      });
    });
  });

export const getCampaigns = async () => {
  try {
    let snapshot = await collection.get();
    let tasks = snapshot.docs.map(campaignDoc =>
      getCampaignById(campaignDoc.id)
    );
    let campaigns = Promise.all(tasks);
    return campaigns;
  } catch (error) {
    throw error;
  }
};

export const deactivateCampaign = async campaignId => {
  try {
    await collection.doc(campaignId).update({
      status: false
    });
  } catch (error) {
    throw error;
  }
};

export const activateCampaign = async campaignId => {
  try {
    await collection.doc(campaignId).update({
      status: true
    });
  } catch (error) {
    throw error;
  }
};
