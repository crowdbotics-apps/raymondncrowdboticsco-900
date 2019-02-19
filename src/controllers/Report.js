import { Firestore } from '../lib/firebase';

export const getCampaigns = async () => {
  let campaignsCollection = Firestore.collection('campaigns');

  try {
    let snapshot = await campaignsCollection.get();
    let campaigns = [];
    await snapshot.docs.map(async campaign => {
      let campaignData = await campaign.data();
      console.log(campaignData);

      if (campaignData.participant_group_id) {
        let participant = await Firestore.collection('participant_groups')
          .doc(campaignData.participant_group_id)
          .get();
        console.log(participant);
        let participantData = await participant.data();
        console.log(participantData);

        let campaign = {
          id: campaignData.id,
          name: campaignData.name,
          participant_group_id: campaignData.participant_group_id,
          participant_group_name: participantData.name,
          division: participantData.division,
          completion: campaignData.total_points,
          checked: false
        };
        campaigns.push(campaign);
      }
    });
    console.log(campaigns);
    return campaigns;
  } catch (error) {
    throw error;
  }
};
