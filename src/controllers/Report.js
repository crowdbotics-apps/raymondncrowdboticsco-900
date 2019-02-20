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

        let campaign = {
          id: campaignData.id,
          client_id: campaignData.client_id,
          name: campaignData.name,
          participant_group_id: campaignData.participant_group_id,
          participant_group_name: participantData.name,
          division: participantData.division,
          completion: campaignData.total_points,
          answers: campaignData.answers || 0,
          checked: true
        };
        campaigns.push(campaign);
      }
    });

    return campaigns;
  } catch (error) {
    throw error;
  }
};
