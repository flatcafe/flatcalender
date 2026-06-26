const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendQueuedNotifications = onSchedule(
  "every 1 minutes",
  async () => {

    const now = new Date();
    // 1分前の未送信キューを取得
    const snapshot = await admin.firestore()
      .collection('notificationQueue')
      .where('sent', '==', false)
      .where('sendAt', '<=', now)
      .get();

    if (snapshot.empty) return null;

    // 全ユーザーのデータを一度に取得
    const usersSnapshot = await admin.firestore().collection('users').get();

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // 通知のメッセージをタイプ別に仕分け
      let titleText = 'ふらっとCafe';
      let bodyText = `${data.author}さんが予定を${data.count}件追加しました`;
      
      if (data.type === 'edit') {
        bodyText = `${data.author}さんが予定を編集しました`;
      } else if (data.type === 'bubble') {
        bodyText = `${data.author}さんが吹き出しを更新しました`;
      }

      // 送信対象のトークンリストを作成（各自の設定チェック）
      const tokens = [];
      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        if (!userData.fcmToken) return;

        // 各自の通知設定をチェック（設定がない場合はデフォルトtrue）
        const isAddOn = userData.notifyAdd ?? true;
        const isEditOn = userData.notifyEdit ?? true;
        const isBubbleOn = userData.notifyBubble ?? true;

        if (data.type === 'add' && !isAddOn) return;
        if (data.type === 'edit' && !isEditOn) return;
        if (data.type === 'bubble' && !isBubbleOn) return;

        tokens.push(userData.fcmToken);
      });

      // 対象のトークンがあれば一斉送信
      if (tokens.length > 0) {
        const message = {
          notification: {
            title: titleText,
            body: bodyText,
          },
          tokens: tokens
        };
        await admin.messaging().sendEachForMulticast(message);
      }

      // キューを送信済みにする
      await docSnap.ref.update({ sent: true });
    }

    return null;
  });
