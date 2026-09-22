"use strict";

const POINTS_KEY="barmaan_rewards_points";
const READY_KEY="barmaan_rewards_ready";
const LAST_DAY_KEY="barmaan_rewards_last_day";
const CLOUD_INDEX_KEY="barmaan_cloud_code_index";
const CLOUD_REDEEMED_KEY="barmaan_cloud_redeemed";
const FULL_ACCESS_KEY="barmaan_full_access";
const VIEW_MORE_KEY="barmaan_rewards_view_more";
const MISSION_QUESTION_KEY="barmaan_mission_question";
const MISSION_ANSWER_KEY="barmaan_mission_answer";
const MISSION_REWARD_KEY="barmaan_mission_reward";
const MISSION_TYPE_KEY="barmaan_mission_type";

const APP_REWARDS=[
  {code:"10393",value:20,needed:50},
  {code:"30493",value:50,needed:100},
  {code:"29373",value:100,needed:200},
  {code:"97283",value:200,needed:400},
  {code:"02832",value:500,needed:500},
  {code:"02833",value:1000,needed:1000}
];

const CLOUD_CODES=[
  "38423",
  "39099",
  "02833",
  "82731",
  "29373",
  "63742",
  "92382",
  "92842",
  "93832"
];

const pointsDisplay=document.getElementById("pointsDisplay");
const readyDisplay=document.getElementById("readyDisplay");
const claimBtn=document.getElementById("claimBtn");
const missionsBtn=document.getElementById("missionsBtn");
const missionsBox=document.getElementById("missionsBox");
const missionType=document.getElementById("missionType");
const mathQuestion=document.getElementById("mathQuestion");
const mathAnswer=document.getElementById("mathAnswer");
const answerBtn=document.getElementById("answerBtn");
const missionResult=document.getElementById("missionResult");
const appRewards=document.getElementById("appRewards");
const fullAccessBtn=document.getElementById("fullAccessBtn");
const fullAccessCode=document.getElementById("fullAccessCode");
const cloudRedeemBtn=document.getElementById("cloudRedeemBtn");
const cloudCodeArea=document.getElementById("cloudCodeArea");
const messageBox=document.getElementById("messageBox");
const viewMoreBtn=document.getElementById("viewMoreBtn");

function getNumber(key){
  const value=Number(localStorage.getItem(key));

  return Number.isFinite(value)&&value>=0
    ?value
    :0;
}

function setNumber(key,value){
  localStorage.setItem(
    key,
    String(
      Math.max(
        0,
        Math.floor(value)
      )
    )
  );
}

function getPoints(){
  return getNumber(POINTS_KEY);
}

function setPoints(value){
  setNumber(
    POINTS_KEY,
    value
  );
}

function getReady(){
  return getNumber(READY_KEY);
}

function setReady(value){
  setNumber(
    READY_KEY,
    value
  );
}

function todayKey(){
  const date=new Date();

  return date.getFullYear()+
    "-"+
    String(
      date.getMonth()+1
    ).padStart(2,"0")+
    "-"+
    String(
      date.getDate()
    ).padStart(2,"0");
}

function dateFromKey(key){
  if(!key){
    return null;
  }

  const parts=key.split("-");

  if(parts.length!==3){
    return null;
  }

  const date=new Date(
    Number(parts[0]),
    Number(parts[1])-1,
    Number(parts[2])
  );

  return Number.isNaN(
    date.getTime()
  )
    ?null
    :date;
}

function daysBetween(oldKey,newKey){
  const oldDate=dateFromKey(oldKey);
  const newDate=dateFromKey(newKey);

  if(!oldDate||!newDate){
    return 0;
  }

  const diff=
    newDate.getTime()-
    oldDate.getTime();

  return Math.floor(
    diff/86400000
  );
}

function updateDailyReady(){
  const today=todayKey();

  const last=
    localStorage.getItem(
      LAST_DAY_KEY
    );

  if(!last){
    setReady(
      getReady()+20
    );

    localStorage.setItem(
      LAST_DAY_KEY,
      today
    );

    return;
  }

  const days=
    daysBetween(
      last,
      today
    );

  if(days>0){
    setReady(
      getReady()+
      days*20
    );

    localStorage.setItem(
      LAST_DAY_KEY,
      today
    );
  }
}

function formatPoints(value){
  return Math.floor(
    value
  ).toLocaleString()+
    " points";
}

function formatCredit(value){
  return Math.floor(
    value
  ).toLocaleString()+
    "¢";
}

function updateProgress(){
  pointsDisplay.textContent=
    formatPoints(
      getPoints()
    );

  readyDisplay.textContent=
    formatPoints(
      getReady()
    );

  claimBtn.disabled=
    getReady()<=0;
}

function showMessage(text){
  messageBox.textContent=text;

  messageBox.classList.remove(
    "hidden"
  );

  clearTimeout(
    showMessage.timer
  );

  showMessage.timer=
    setTimeout(
      ()=>{
        messageBox.classList.add(
          "hidden"
        );
      },
      2500
    );
}

function switchPage(page){
  document.querySelectorAll(
    ".page"
  ).forEach(
    item=>{
      item.classList.remove(
        "active"
      );
    }
  );

  document.querySelectorAll(
    ".top-btn"
  ).forEach(
    item=>{
      item.classList.remove(
        "active"
      );
    }
  );

  if(page==="progress"){
    document.getElementById(
      "progressPage"
    ).classList.add(
      "active"
    );

    document.querySelector(
      '[data-page="progress"]'
    ).classList.add(
      "active"
    );
  }

  if(page==="rewards"){
    document.getElementById(
      "rewardsPage"
    ).classList.add(
      "active"
    );

    document.querySelector(
      '[data-page="rewards"]'
    ).classList.add(
      "active"
    );

    renderRewards();
  }
}

document.querySelectorAll(
  ".top-btn"
).forEach(
  button=>{
    button.addEventListener(
      "click",
      ()=>{
        switchPage(
          button.dataset.page
        );
      }
    );
  }
);

missionsBtn.addEventListener(
  "click",
  ()=>{
    missionsBox.classList.toggle(
      "hidden"
    );

    prepareMission();
  }
);

claimBtn.addEventListener(
  "click",
  ()=>{
    const ready=getReady();

    if(ready<=0){
      showMessage(
        "There are no points ready to claim."
      );

      return;
    }

    setPoints(
      getPoints()+ready
    );

    setReady(0);

    updateProgress();
    renderRewards();

    showMessage(
      ready+
      " points added to your points."
    );
  }
);

function randomInt(min,max){
  return Math.floor(
    Math.random()*
    (max-min+1)
  )+min;
}

function createMission(){
  const types=[
    "addition",
    "subtraction",
    "multiplication",
    "division"
  ];

  const type=
    types[
      randomInt(
        0,
        types.length-1
      )
    ];

  let a=0;
  let b=0;
  let answer=0;
  let reward=0;
  let symbol="";

  if(type==="addition"){
    a=randomInt(5,100);
    b=randomInt(5,100);

    answer=a+b;
    reward=30;
    symbol="+";
  }

  if(type==="subtraction"){
    a=randomInt(20,120);
    b=randomInt(1,a);

    answer=a-b;
    reward=30;
    symbol="-";
  }

  if(type==="multiplication"){
    a=randomInt(2,15);
    b=randomInt(2,15);

    answer=a*b;
    reward=50;
    symbol="×";
  }

  if(type==="division"){
    b=randomInt(2,12);
    answer=randomInt(2,15);
    a=b*answer;

    reward=100;
    symbol="÷";
  }

  localStorage.setItem(
    MISSION_TYPE_KEY,
    type
  );

  localStorage.setItem(
    MISSION_QUESTION_KEY,
    a+symbol+b
  );

  localStorage.setItem(
    MISSION_ANSWER_KEY,
    String(answer)
  );

  localStorage.setItem(
    MISSION_REWARD_KEY,
    String(reward)
  );
}

function prepareMission(){
  if(!localStorage.getItem(
    MISSION_QUESTION_KEY
  )){
    createMission();
  }

  const question=
    localStorage.getItem(
      MISSION_QUESTION_KEY
    );

  const type=
    localStorage.getItem(
      MISSION_TYPE_KEY
    );

  const reward=
    getNumber(
      MISSION_REWARD_KEY
    );

  missionType.textContent=
    type.charAt(0).toUpperCase()+
    type.slice(1)+
    " • "+
    reward+
    " points";

  mathQuestion.textContent=
    question+
    " = ?";

  mathAnswer.value="";
  missionResult.textContent="";

  answerBtn.disabled=false;
  mathAnswer.disabled=false;
}

answerBtn.addEventListener(
  "click",
  ()=>{
    const input=
      Number(
        mathAnswer.value
      );

    const correct=
      Number(
        localStorage.getItem(
          MISSION_ANSWER_KEY
        )
      );

    if(!Number.isFinite(input)){
      missionResult.textContent=
        "Enter an answer.";

      return;
    }

    if(input!==correct){
      missionResult.textContent=
        "Wrong answer. Try again.";

      return;
    }

    const reward=
      getNumber(
        MISSION_REWARD_KEY
      );

    setPoints(
      getPoints()+reward
    );

    missionResult.textContent=
      "Correct! +"+
      reward+
      " points.";

    updateProgress();
    renderRewards();

    showMessage(
      "Mission complete! +"+
      reward+
      " points."
    );

    createMission();

    setTimeout(
      ()=>{
        prepareMission();
      },
      500
    );
  }
);

function createRewardElement(reward){
  const item=
    document.createElement(
      "div"
    );

  item.className=
    "reward-item";

  const info=
    document.createElement(
      "div"
    );

  info.className=
    "reward-info";

  const value=
    document.createElement(
      "div"
    );

  value.className=
    "reward-value";

  value.textContent=
    formatCredit(
      reward.value
    );

  const needed=
    document.createElement(
      "div"
    );

  needed.className=
    "reward-needed";

  needed.textContent=
    "Need: "+
    reward.needed.toLocaleString()+
    " points";

  info.appendChild(value);
  info.appendChild(needed);

  const button=
    document.createElement(
      "button"
    );

  button.className=
    "redeem-btn";

  button.textContent=
    "Redeem";

  const enough=
    getPoints()>=reward.needed;

  button.disabled=!enough;

  if(!enough){
    button.classList.add(
      "disabled"
    );
  }

  button.addEventListener(
    "click",
    ()=>{
      redeemAppReward(
        reward
      );
    }
  );

  item.appendChild(info);
  item.appendChild(button);

  return item;
}

function redeemAppReward(reward){
  if(getPoints()<reward.needed){
    return;
  }

  setPoints(
    getPoints()-
    reward.needed
  );

  renderRewards();
  updateProgress();

  const rewards=
    localStorage.getItem(
      "barmaan_redeemed_app_rewards"
    );

  let redeemed=[];

  try{
    redeemed=
      rewards
        ?JSON.parse(rewards)
        :[];
  }catch(error){
    redeemed=[];
  }

  if(!Array.isArray(redeemed)){
    redeemed=[];
  }

  if(!redeemed.includes(
    reward.code
  )){
    redeemed.push(
      reward.code
    );
  }

  localStorage.setItem(
    "barmaan_redeemed_app_rewards",
    JSON.stringify(redeemed)
  );

  renderRewards();

  showMessage(
    "Redeemed "+
    formatCredit(
      reward.value
    )+
    ". Code: "+
    reward.code
  );
}

function isAppRewardRedeemed(reward){
  let redeemed=[];

  try{
    redeemed=JSON.parse(
      localStorage.getItem(
        "barmaan_redeemed_app_rewards"
      )||"[]"
    );
  }catch(error){
    redeemed=[];
  }

  return Array.isArray(redeemed)&&
    redeemed.includes(
      reward.code
    );
}

function renderRewards(){
  appRewards.innerHTML="";

  const showAll=
    localStorage.getItem(
      VIEW_MORE_KEY
    )==="true";

  const rewards=
    showAll
      ?APP_REWARDS
      :APP_REWARDS.slice(0,3);

  rewards.forEach(
    reward=>{
      const item=
        createRewardElement(
          reward
        );

      const info=
        item.querySelector(
          ".reward-info"
        );

      if(isAppRewardRedeemed(
        reward
      )){
        const code=
          document.createElement(
            "div"
          );

        code.className=
          "reward-code";

        code.textContent=
          "Code: "+
          reward.code;

        info.appendChild(
          code
        );
      }

      appRewards.appendChild(
        item
      );
    }
  );

  viewMoreBtn.textContent=
    showAll
      ?"View less"
      :"View more";

  updateFullAccess();
  updateCloud();
}

viewMoreBtn.addEventListener(
  "click",
  ()=>{
    const current=
      localStorage.getItem(
        VIEW_MORE_KEY
      )==="true";

    localStorage.setItem(
      VIEW_MORE_KEY,
      String(!current)
    );

    renderRewards();
  }
);

function updateFullAccess(){
  const owned=
    localStorage.getItem(
      FULL_ACCESS_KEY
    )==="true";

  if(owned){
    fullAccessCode.textContent=
      "Code: 1257";

    fullAccessBtn.textContent=
      "Already redeemed";

    fullAccessBtn.disabled=true;

    fullAccessBtn.classList.add(
      "disabled"
    );

    return;
  }

  fullAccessCode.textContent="";

  fullAccessBtn.textContent=
    "Redeem";

  fullAccessBtn.disabled=
    getPoints()<2000;

  if(fullAccessBtn.disabled){
    fullAccessBtn.classList.add(
      "disabled"
    );
  }else{
    fullAccessBtn.classList.remove(
      "disabled"
    );
  }
}

fullAccessBtn.addEventListener(
  "click",
  ()=>{
    if(
      localStorage.getItem(
        FULL_ACCESS_KEY
      )==="true"
    ){
      return;
    }

    if(getPoints()<2000){
      return;
    }

    setPoints(
      getPoints()-2000
    );

    localStorage.setItem(
      FULL_ACCESS_KEY,
      "true"
    );

    updateProgress();
    updateFullAccess();

    showMessage(
      "Full access redeemed. Code: 1257"
    );
  }
);

function getCloudIndex(){
  const value=
    Number(
      localStorage.getItem(
        CLOUD_INDEX_KEY
      )
    );

  if(
    !Number.isInteger(value)||
    value<0
  ){
    return 0;
  }

  return value;
}

function setCloudIndex(value){
  localStorage.setItem(
    CLOUD_INDEX_KEY,
    String(value)
  );
}

function updateCloud(){
  const redeemed=
    localStorage.getItem(
      CLOUD_REDEEMED_KEY
    )==="true";

  cloudCodeArea.innerHTML="";

  if(!redeemed){
    cloudRedeemBtn.textContent=
      "Redeem";

    cloudRedeemBtn.disabled=
      getPoints()<5000;

    if(cloudRedeemBtn.disabled){
      cloudRedeemBtn.classList.add(
        "disabled"
      );
    }else{
      cloudRedeemBtn.classList.remove(
        "disabled"
      );
    }

    return;
  }

  const index=
    getCloudIndex();

  if(index>=CLOUD_CODES.length){
    const empty=
      document.createElement(
        "div"
      );

    empty.className=
      "empty-slot";

    empty.textContent=
      "It looks like there's not empty slot";

    cloudCodeArea.appendChild(
      empty
    );

    cloudRedeemBtn.textContent=
      "GIVE BACK MY MONEY";

    cloudRedeemBtn.disabled=false;

    cloudRedeemBtn.classList.remove(
      "disabled"
    );

    return;
  }

  const code=
    document.createElement(
      "div"
    );

  code.className=
    "cloud-code";

  code.textContent=
    CLOUD_CODES[index];

  const owned=
    document.createElement(
      "button"
    );

  owned.className=
    "owned-btn";

  owned.textContent=
    "Already owned?";

  owned.addEventListener(
    "click",
    ()=>{
      const next=
        getCloudIndex()+1;

      setCloudIndex(next);
      updateCloud();
    }
  );

  cloudCodeArea.appendChild(
    code
  );

  cloudCodeArea.appendChild(
    owned
  );

  cloudRedeemBtn.textContent=
    "GIVE BACK MY MONEY";

  cloudRedeemBtn.disabled=false;

  cloudRedeemBtn.classList.remove(
    "disabled"
  );
}

cloudRedeemBtn.addEventListener(
  "click",
  ()=>{
    const redeemed=
      localStorage.getItem(
        CLOUD_REDEEMED_KEY
      )==="true";

    if(redeemed){
      setPoints(
        getPoints()+5000
      );

      localStorage.removeItem(
        CLOUD_REDEEMED_KEY
      );

      setCloudIndex(0);

      updateProgress();
      updateCloud();

      showMessage(
        "5,000 points returned to your Local Storage."
      );

      return;
    }

    if(getPoints()<5000){
      return;
    }

    const index=
      getCloudIndex();

    if(index>=CLOUD_CODES.length){
      updateCloud();
      return;
    }

    setPoints(
      getPoints()-5000
    );

    localStorage.setItem(
      CLOUD_REDEEMED_KEY,
      "true"
    );

    updateProgress();
    updateCloud();

    showMessage(
      "Cloud credit redeemed."
    );
  }
);

updateDailyReady();
updateProgress();
renderRewards();
prepareMission();
