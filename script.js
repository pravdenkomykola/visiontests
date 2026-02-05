/* ===== NAV ===== */
function startVisionTest(){
  mainPage.style.display="none";
  qaSection.style.display="none";
  testWrapper.style.display="flex";
  showPage(1);
}
function startAstigmatism(){
  mainPage.style.display="none";
  qaSection.style.display="none";
  testWrapper.style.display="flex";
  showPageAstigPrep();
}
function goHome(){
  testWrapper.style.display="none";
  mainPage.style.display="block";
  qaSection.style.display="block";
}
function showPage(n){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page"+n).classList.add("active");
}
function nextPage(n){showPage(n);}

/* ===== VISION TEST ===== */
const levels=[
{label:"2/10",mm:8.87},{label:"2/8",mm:7.1},{label:"2/6",mm:5.32},
{label:"2/5",mm:4.43},{label:"2/4",mm:3.55},{label:"2/3",mm:2.66},
{label:"2/2",mm:1.77},{label:"2/1.5",mm:1.33}
];
const pxPerMm=4;
let levelIndex=0,trial=0,correct=0,currentEye;
let leftEye=0,rightEye=0,currentDirection;
function startTest(eye){
  currentEye=eye;
  levelIndex=trial=correct=0;
  app.innerHTML=`
    <div class="title">Near Vision Screening</div>
    <div class="subtitle">Tumbling E · Arm’s-length</div>
    <div class="test-area">
      <div id="eContainer"></div>
      <div class="controls">
        <div class="e-button" onclick="answer('right')"></div>
        <div class="e-button" onclick="answer('up')"></div>
        <div class="e-button" onclick="answer('down')"></div>
        <div class="e-button" onclick="answer('left')"></div>
      </div>
      <div class="info" id="info"></div>
    </div>`;
  initTest();
}
function initTest(){
  currentDirection=randomDir();
  drawMain();
  ["right","up","down","left"].forEach((d,i)=>{
    drawE(document.querySelectorAll(".e-button")[i],36,d);
  });
}
function randomDir(){return["up","down","left","right"][Math.floor(Math.random()*4)];}
function drawE(t,s,d){
  t.innerHTML="";
  const e=document.createElement("div");
  e.className="e";
  e.style.width=e.style.height=s+"px";
  const stroke=s/5;
  [
    {t:0,l:0,w:s,h:stroke},
    {t:s/2-stroke/2,l:0,w:s*.8,h:stroke},
    {b:0,l:0,w:s,h:stroke},
    {t:0,l:0,w:stroke,h:s}
  ].forEach(b=>{
    const bar=document.createElement("div");
    bar.className="bar";
    Object.assign(bar.style,{
      top:b.t!=null?b.t+"px":"auto",
      bottom:b.b!=null?b.b+"px":"auto",
      left:b.l+"px",width:b.w+"px",height:b.h+"px"
    });
    e.appendChild(bar);
  });
  e.style.transform = {
    up: "rotate(0deg)",
    right: "rotate(90deg)",
    down: "rotate(180deg)",
    left: "rotate(270deg)"
  }[d];
  t.appendChild(e);
}
function drawMain(){
  drawE(eContainer,levels[levelIndex].mm*pxPerMm,currentDirection);
  info.textContent=`Level ${levels[levelIndex].label} · Trial ${trial+1}/3`;
}
function answer(d){
  if(d===currentDirection) correct++;
  trial++;
  if(trial>=3){
    if(correct>=2 && levelIndex<levels.length-1){
      levelIndex++; trial=correct=0;
    }else{
      if(currentEye==="left"){
        leftEye=levelIndex;
        app.innerHTML=`
        <div class="page active">
          <div class="face">
            <div class="eye"><div class="pupil"></div><div class="eyelid"></div></div>
            <div class="eye right"><div class="pupil"></div><div class="eyelid"></div></div>
          </div>
          <p>Cover your <b>right eye</b></p>
          <button class="button" onclick="startTest('right')">Continue</button>
        </div>`;
        return;
      }
      rightEye=levelIndex;
      showResult(); return;
    }
  }
  currentDirection=randomDir();
  drawMain();
}
function showResult(){
  app.innerHTML=`
  <div class="page active">
    <p><b>Screening Complete</b><br><br>
    Left Eye: ${levels[leftEye].label}<br>
    Right Eye: ${levels[rightEye].label}</p>
  </div>`;
}

/* ===== ASTIGMATISM TEST ===== */
let astigEye="", astigRes={left:null,right:null};
function showPageAstigPrep(){
  app.innerHTML=`
    <div class="page active">
      <div class="face">
        <div class="eye"><div class="pupil"></div><div class="eyelid"></div></div>
        <div class="eye right"><div class="pupil"></div><div class="eyelid"></div></div>
      </div>
      <p><b>Astigmatism Clock Dial Test</b><br>Prepare for the test<br>Take off your glasses</p>
      <button class="button" onclick="startAstigEye('left')">Next</button>
    </div>`;
}
function startAstigEye(e){
  astigEye=e;
  app.innerHTML=`
    <div class="page active">
      <p>Cover your ${astigEye} eye. Do some lines look darker or missing?</p>
      ${buildClockDial()}
      <button class="button" onclick="recordAstig(true)">Yes</button>
      <button class="button" onclick="recordAstig(false)">No</button>
    </div>`;
}
function recordAstig(v){
  astigRes[astigEye]=v;
  if(astigEye==="left"){
    startAstigEye("right");
  }else{
    app.innerHTML=`
      <div class="page active">
        <p><b>Astigmatism Screening Result</b><br><br>
        Left Eye: ${astigRes.left?"Possible signs":"No obvious signs"}<br>
        Right Eye: ${astigRes.right?"Possible signs":"No obvious signs"}</p>
      </div>`;
  }
}
function buildClockDial(){
  const cx = 150;
  const cy = 150;
  const innerR = 22;
  const lineLen = 105;
  const gap = 4;
  let svg = `<svg class="astig-svg" viewBox="-10 -10 320 320">`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#000" stroke-width="2"/>`;
  for(let i=0;i<12;i++){
    const angle = (i*30-90)*Math.PI/180;
    const px = Math.cos(angle+Math.PI/2);
    const py = Math.sin(angle+Math.PI/2);
    for(let j=-1;j<=1;j++){
      const ox = px*gap*j;
      const oy = py*gap*j;
      const x1=cx+Math.cos(angle)*innerR+ox;
      const y1=cy+Math.sin(angle)*innerR+oy;
      const x2=cx+Math.cos(angle)*(innerR+lineLen)+ox;
      const y2=cy+Math.sin(angle)*(innerR+lineLen)+oy;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="2"/>`;
    }
    const tx = cx + Math.cos(angle)*(innerR+lineLen+14);
    const ty = cy + Math.sin(angle)*(innerR+lineLen+14);
    svg += `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-size="14">${i===0?12:i}</text>`;
  }
  svg += `</svg>`;
  return svg;
}
