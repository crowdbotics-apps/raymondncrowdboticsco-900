import { Firestore } from '../lib/firebase';
const { map } = require('p-iteration');

export const getCampaigns = async () => {
  let campaignsCollection = Firestore.collection('campaigns');

  try {
    let snapshot = await campaignsCollection.get();
    let campaigns = [];

    await map(snapshot.docs, async campaign => {
      let campaignData = await campaign.data();

      if (campaignData.participant_group_id) {
        let participant = await Firestore.collection('participant_groups')
          .doc(campaignData.participant_group_id)
          .get();

        let participantData = await participant.data();

        let userDocs = await Firestore.collection('users').get();
        let tasks = participantData.participant_list.map(
          participant =>
            new Promise((resolve, reject) => {
              userDocs.forEach(snapshot => {
                let user = snapshot.data();
                if (user.email === participant.email) {
                  resolve(user.id);
                }
              });
              resolve(null);
            })
        );
        let participantIds = await Promise.all(tasks);
        tasks = participantIds.map(participantId => {
          if (participantId) {
            return Firestore.collection('answers')
              .doc(`${campaignData.id}-${participantId}`)
              .get();
          } else {
            return null;
          }
        });
        let answersSnapshot = await Promise.all(tasks);
        let answers = answersSnapshot.map(snapshot =>
          snapshot ? snapshot.data() : null
        );

        let campaign = {
          id: campaignData.id,
          client_id: campaignData.client_id,
          campaign_name: campaignData.name,
          campaign_questions: campaignData.questions,
          participant_group_id: campaignData.participant_group_id,
          participant_group: participantData,
          answers
        };
        campaigns.push(campaign);
      }
    });

    return campaigns;
  } catch (error) {
    throw error;
  }
};
