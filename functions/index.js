const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendQueuedNotifications = onSchedule(
  "every 1 minutes",
  async () => {

    console.log("通知チェック");

    const now = new Date();

    const snapshot = await admin.firestore()
      .collection("notificationQueue")
      .where("sent", "==", false)
      .where("sendAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return null;
    }

    for (const docSnap of snapshot.docs) {

      const data = docSnap.data();

      console.log(`${data.count}件処理`);

      // 全ユーザーのFCMトークン取得
      const usersSnapshot = await admin.firestore().collection("users").get();

      const tokens = [];

      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();

        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });

// 重複を削除
      const uniqueTokens = [...new Set(tokens)];

      console.log(`送信先 ${uniqueTokens.length} 台`);

      // ★ここから修正ブロック
      const bodyText = data.type === 'bubble' 
        ? `${data.author}さんが吹き出しを変更しました` 
        : `${data.author}さんが予定を${data.count}件追加しました`;

      await admin.messaging().sendEachForMulticast({
        notification: {
          title: "ふらっとCafe",
          body: bodyText,
          imageUrl: data.icon ? `https://flatcafe.github.io/flatcalender/${data.icon}` : ""
        },
        tokens: uniqueTokens
      });
      // ★ここまで修正ブロック

      console.log("通知送信成功");
      await docSnap.ref.update({
        sent: true
      });
    }

    return null;
  }
);
