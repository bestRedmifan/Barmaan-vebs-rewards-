"use strict";

const POINTS_KEY="barmaan_rewards_points";
const READY_KEY="barmaan_rewards_ready";
const LAST_DAY_KEY="barmaan_rewards_last_day";
const CLOUD_INDEX_KEY="barmaan_cloud_code_index";
const CLOUD_REDEEMED_KEY="barmaan_cloud_redeemed";
const FULL_ACCESS_KEY="barmaan_full_access";
const VIEW_MORE_KEY="barmaan_rewards_view_more";
const APP_REDEEMED_KEY="barmaan_redeemed_app_rewards";

const MISSION_QUESTION_KEY="barmaan_mission_question";
const MISSION_ANSWER_KEY="barmaan_mission_answer";
const MISSION_REWARD_KEY="barmaan_mission_reward";
const MISSION_TYPE_KEY="barmaan_mission_type";
const MISSION_LEVEL_KEY="barmaan_mission_level";

const APP_REWARDS=[
{code:"10393",value:20,needed:50},
{code:"30493",value:50,needed:100},
{code:"29373",value:100,needed:200},
{code:"97283",value:200,needed:400},
{code:"02832",value:500,needed:500},
{code:"02833",value:1000,needed:1000},
{code:"3690",value:0,needed:4000,name:"FLS(flash more services)"}
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
const value=Number(
localStorage.getItem(key)
);

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
return getNumber(
POINTS_KEY
);
}

function setPoints(value){
setNumber(
POINTS_KEY,
value
);
}

function getReady(){
return getNumber(
READY_KEY
);
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

return Math.floor(
(
newDate.getTime()-
oldDate.getTime()
)/86400000
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

const days=daysBetween(
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

showMessage.timer=setTimeout(
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

const button=document.querySelector(
'[data-page="progress"]'
);

if(button){
button.classList.add(
"active"
);
}
}

if(page==="rewards"){
document.getElementById(
"rewardsPage"
).classList.add(
"active"
);

const button=document.querySelector(
'[data-page="rewards"]'
);

if(button){
button.classList.add(
"active"
);
}

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
const operations=[
"addition",
"subtraction",
"multiplication",
"division"
];

const levels=[
"easy",
"medium",
"hard"
];

const type=
operations[
randomInt(
0,
operations.length-1
)
];

const level=
levels[
randomInt(
0,
levels.length-1
)
];

let a=0;
let b=0;
let answer=0;
let symbol="";
let operationReward=0;
let levelReward=0;

if(level==="easy"){
levelReward=20;
}

if(level==="medium"){
levelReward=60;
}

if(level==="hard"){
levelReward=200;
}

if(type==="addition"){
if(level==="easy"){
a=randomInt(1,20);
b=randomInt(1,20);
}

if(level==="medium"){
a=randomInt(20,100);
b=randomInt(20,100);
}

if(level==="hard"){
a=randomInt(100,1000);
b=randomInt(100,1000);
}

answer=a+b;
symbol="+";
operationReward=30;
}

if(type==="subtraction"){
if(level==="easy"){
a=randomInt(1,30);
b=randomInt(1,a);
}

if(level==="medium"){
a=randomInt(50,200);
b=randomInt(1,a);
}

if(level==="hard"){
a=randomInt(200,1500);
b=randomInt(1,a);
}

answer=a-b;
symbol="-";
operationReward=30;
}

if(type==="multiplication"){
if(level==="easy"){
a=randomInt(1,10);
b=randomInt(1,10);
}

if(level==="medium"){
a=randomInt(5,20);
b=randomInt(5,20);
}

if(level==="hard"){
a=randomInt(20,100);
b=randomInt(10,50);
}

answer=a*b;
symbol="×";
operationReward=50;
}

if(type==="division"){
if(level==="easy"){
b=randomInt(2,10);
answer=randomInt(1,10);
}

if(level==="medium"){
b=randomInt(2,20);
answer=randomInt(5,30);
}

if(level==="hard"){
b=randomInt(5,50);
answer=randomInt(10,100);
}

a=b*answer;
symbol="÷";
operationReward=100;
}

const reward=
operationReward+
levelReward;

localStorage.setItem(
MISSION_TYPE_KEY,
type
);

localStorage.setItem(
MISSION_LEVEL_KEY,
level
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

const level=
localStorage.getItem(
MISSION_LEVEL_KEY
);

const reward=
getNumber(
MISSION_REWARD_KEY
);

if(!type||!level||!question){
createMission();

return prepareMission();
}

const typeName=
type.charAt(0).toUpperCase()+
type.slice(1);

const levelName=
level.charAt(0).toUpperCase()+
level.slice(1);

missionType.textContent=
typeName+
" • "+
levelName+
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

showMessage(
"Mission complete! +"+
reward+
" points."
);

createMission();
prepareMission();
}
);

function getRedeemedAppRewards(){
try{
const data=JSON.parse(
localStorage.getItem(
APP_REDEEMED_KEY
)||"[]"
);

return Array.isArray(data)
?data
:[];
}catch(error){
return [];
}
}

function isAppRewardRedeemed(reward){
return getRedeemedAppRewards()
.includes(
reward.code
);
}

function saveAppRewardRedeemed(reward){
const redeemed=
getRedeemedAppRewards();

if(!redeemed.includes(
reward.code
)){
redeemed.push(
reward.code
);
}

localStorage.setItem(
APP_REDEEMED_KEY,
JSON.stringify(
redeemed
)
);
}

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

if(reward.name){
const name=
document.createElement(
"div"
);

name.className=
"reward-name";

name.textContent=
reward.name;

info.appendChild(
name
);
}

const value=
document.createElement(
"div"
);

value.className=
"reward-value";

value.textContent=
reward.name
?"FLS"
:formatCredit(
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

info.appendChild(code);
}

const button=
document.createElement(
"button"
);

button.className=
"redeem-btn";

if(isAppRewardRedeemed(
reward
)){
button.textContent=
"Already redeemed";

button.disabled=true;

button.classList.add(
"disabled"
);
}else{
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
}

item.appendChild(info);
item.appendChild(button);

return item;
}

function redeemAppReward(reward){
if(isAppRewardRedeemed(
reward
)){
return;
}

if(getPoints()<reward.needed){
return;
}

setPoints(
getPoints()-
reward.needed
);

saveAppRewardRedeemed(
reward
);

updateProgress();
renderRewards();

showMessage(
reward.name
?"Redeemed "+
reward.name+
". Code: "+
reward.code
:"Redeemed "+
formatCredit(
reward.value
)+
". Code: "+
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
:APP_REWARDS.slice(
0,
3
);

rewards.forEach(
reward=>{
appRewards.appendChild(
createRewardElement(
reward
)
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

const enough=
getPoints()>=2000;

fullAccessBtn.disabled=
!enough;

if(!enough){
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

fullAccessCode.textContent=
"Code: 1257";

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
setCloudIndex(
getCloudIndex()+1
);

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

if(
getCloudIndex()>=
CLOUD_CODES.length
){
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
