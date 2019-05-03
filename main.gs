//【Ref】 https://qiita.com/nmdk/items/1fc11680897103a5f87c
//【Ref】 https://tonari-it.com/gas-get-trello-card-list/

function archiveCards(){
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //最終更新日からこの日数を経過したカードをアーカイブする
  const day_to_delete = 1;
  //デバッグモード
  const debug = false;

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //GASスクリプトプロパティ
  const scriptProperty = PropertiesService.getScriptProperties().getProperties();
  //Trello APIキー
  const trelloKey = scriptProperty.TRELLO_KEY;
  //Trello APIトークン
  const trelloToken = scriptProperty.TRELLO_TOKEN;
  //アーカイブ対象のリストのID
  const listId = scriptProperty.TRELLO_LIST_ID;

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //現在時刻
  const now = new Date();
  //今日の0:00
  const targetdate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //削除対象日付の0:00
  //更新日時がこれより古いカードをアーカイブする
  targetdate.setDate(targetdate.getDate() - day_to_delete);

  //アーカイブ対象リストの中のすべてのカードを取得
  const cardListURL = 'https://api.trello.com/1/lists/' + listId + '/cards'
  + '?key=' + trelloKey
  + '&token=' + trelloToken
  + '&fields=id,name,dateLastActivity,shortUrl,desc';
  const res = UrlFetchApp.fetch(cardListURL);
  if(debug) Logger.log(res);
  const json = JSON.parse(res.getContentText("UTF-8"));

  //JSON配列を処理
  for (var i = json.length - 1; i >= 0; i--) {
    var carddate = new Date(json[i]["dateLastActivity"]);
    //json[i]["dateLastActivity"] = carddate;
    if(debug) Logger.log("["+ i +"] TARGET_DATE: "+ targetdate.toLocaleString());
    if(debug) Logger.log("["+ i +"] CARD_DATE: "+ carddate.toLocaleString());
    
    if (targetdate < carddate){
      //配列から削除する
      //このカードはアーカイブしない
      json.splice(i, 1);
      if(debug) Logger.log("["+ i +"] TO_BE_STAYED");
    }else{
      //配列から削除しない
      //このカードをアーカイブする
      if(debug) Logger.log("["+ i +"] TO_BE_REMOVED");
    }
  }
  
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //JSON配列に残った、削除対象のカードをアーカイブする
  for (var i in json) {
    var cardurl = 'https://api.trello.com/1/cards/' + json[i]["id"]
    + '?key=' + trelloKey
    + '&token=' + trelloToken
    + '&closed=true';
    UrlFetchApp.fetch(cardurl, {'method' : 'put'});
    if(debug) Logger.log(cardurl);
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
}

////////////////////////////////////////////////////////////////////////////////////
//IDを確認するための関数

function getBoardId() {
  const scriptProperty = PropertiesService.getScriptProperties().getProperties();
  const trelloKey   = scriptProperty.TRELLO_KEY;
  const trelloToken = scriptProperty.TRELLO_TOKEN;
  const userName = scriptProperty.TRELLO_USER_NAME;
  
  const url = 'https://trello.com/1/members/' 
  + userName + '/boards?key=' 
  + trelloKey + '&token=' 
  + trelloToken + '&fields=name';
  const res = UrlFetchApp.fetch(url, {'method':'get'});
  Logger.log(res);
}

function getlistId() {
  const scriptProperty = PropertiesService.getScriptProperties().getProperties();
  const trelloKey   = scriptProperty.TRELLO_KEY;
  const trelloToken = scriptProperty.TRELLO_TOKEN;
  const boardId = scriptProperty.TRELLO_BOARD_ID;
  
  const url = "https://trello.com/1/boards/" 
  + boardId + "/lists?key=" 
  + trelloKey + "&token=" 
  + trelloToken + "&fields=name";
  const res = UrlFetchApp.fetch(url, {'method':'get'});
  Logger.log(res);
}
////////////////////////////////////////////////////////////////////////////////////
