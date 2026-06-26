const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.aggregateAndSendNotification = functions.firestore
  .document('notificationQueue/{docId}')
  .onWrite(async (change, context) => {
    const newData = change.after.exists ? change.after.data() : null;
    const oldData = change.before.exists ? change.before.data() : null;

    if (!newData || newData.sent === true) {
      return null;
    }

    const oldCount = oldData ? (oldData.count || 0) : 0;
    const newCount = newData.count || 0;

    if (newCount > oldCount) {
      const docId = context.params.docId;
      console.log(`ドキュメント ${docId} の更新を検知。現在のカウント: ${newCount}。1分間待ちます...`);

      await new Promise(resolve => setTimeout(resolve, 60000));

      const docRef = admin.firestore().collection('notificationQueue').doc(docId);
      const latestDoc = await docRef.get();
      const latestData = latestDoc.data();

      if (latestData.count > newCount) {
        console.log(`待機中にさらに更新があったため、この送信処理はスキップします。`);
        return null;
      }

      console.log(`1分間更新がなかったため、合計 ${latestData.count} 件の通知を送信します。`);

      const usersSnapshot = await admin.firestore().collection('users').get();
      const tokens = [];
      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });

      if (tokens.length === 0) {
        console.log('送信対象のFCMトークンが見つかりませんでした。');
        return null;
      }

      const message = {
        notification: {
          title: 'ふらっとCafe',
          body: `予定が新たに ${latestData.count} 件追加（更新）されました！`,
        },
        tokens: tokens,
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} 台の端末に通知を正常に送信しました。`);

        await docRef.update({
          sent: true,
          count: 0
        });

      } catch (error) {
        console.error('FCM送信エラー:', error);
      }
    }

    return null;
  });
