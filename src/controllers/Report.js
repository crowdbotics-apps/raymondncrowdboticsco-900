import { Firestore } from '../lib/firebase';

export const getParticipants = async () => {
  let participantsCollection = Firestore.collection('participant_groups');

  try {
    let snapshot = await participantsCollection.get();
    let participants = [];
    await snapshot.docs.map(async participantsGroupDoc => {
      let participantsGroupData = await participantsGroupDoc.data();
      if (
        participantsGroupData.participant_list &&
        participantsGroupData.participant_list.length > 0
      ) {
        await participantsGroupData.participant_list.map(async data => {
          let participant = {
            name: data.name || '',
            email: data.email || '',
            organization: participantsGroupData.name || '',
            division: participantsGroupData.division || '',
            group: participantsGroupData.name || ',',
            status: data.status || false,
            participants_group_id: participantsGroupDoc.id
          };
          participants.push(participant);
        });
      }
    });
    return participants;
  } catch (error) {
    throw error;
  }
};

export const changeParticipantStatus = async participant => {
  try {
    let participantsDoc = await Firestore.collection('participant_groups')
      .doc(participant.participants_group_id)
      .get();

    let data = await participantsDoc.data();

    await data.participant_list.map(async item => {
      if (item.email === participant.email) {
        item.status = !participant.status;
      }
    });

    return Firestore.collection('participant_groups')
      .doc(participant.participants_group_id)
      .set(data);
  } catch (error) {
    throw error;
  }
};
