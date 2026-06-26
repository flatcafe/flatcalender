const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendQueuedNotifications = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {

    const now = new Date();

    const snapshot = await admin.firestore()
      .collection('notificationQueue')
      .where('sent', '==', false)
      .where('sendAt', '<=', now)
      .get();


    for (const docSnap of snapshot.docs) {

      const data = docSnap.data();

      const message = {
        notification: {
          title: 'ふらっとCafe',
          body:
            `${data.author}さんが予定を${data.count}件追加しました`,
        },
        topic: "calendar"
      };


      await admin.messaging().send(message);


      await docSnap.ref.update({
        sent: true
      });
    }

    return null;
  });
