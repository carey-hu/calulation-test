<template>
  <div class="page">
    <div class="mesh-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div v-if="toast.show" class="toast-mask">
      <div class="toast-content">{{ toast.title }}</div>
    </div>

    <div v-if="viewState==='home'" class="wrap homeWrap">
      <div class="header-area">
        <div class="title">计算助手</div>
        <div class="subtitle">专项练习：进位加、退位减、大九九除法</div>
      </div>

      <div class="card glass-panel">
        <template v-for="(group, groupKey) in modeGroups" :key="groupKey">
          <div class="rowLabel" v-if="group.label">{{ group.label }}</div>
          
          <div v-if="groupKey === 'divSelect'" style="margin-bottom: 10px;">
              <button class="btnGhost glass-btn" style="margin-top:0; height:45px; line-height:45px; font-size:16px;" @click="toSelectDivisor">
              进入除数选择模式
            </button>
          </div>

          <div class="modeRow" v-else>
            <div 
              v-for="modeKey in group.modes" 
              :key="modeKey"
              :class="['modeItem', currentModeKey === modeKey ? 'active' : '']" 
              @click="setMode(modeKey)"
            >
              <span class="modeTitle">{{ getModeConfig(modeKey).name }}</span>
            </div>
          </div>
        </template>
        
        <div class="rowLabel">空间思维专项</div>
        <div class="modeRow">
           <div class="modeItem" style="flex: 1 0 100%; background: rgba(88, 86, 214, 0.1); border-color: rgba(88, 86, 214, 0.2);" @click="startCubicMode">
              <span class="modeTitle" style="color: #5856d6;">🧊 立体拼合 / 截面训练</span>
           </div>
           <div class="modeItem" style="flex: 1 0 100%; background: rgba(0, 122, 255, 0.08); border-color: rgba(0, 122, 255, 0.2);" @click="startSliceTrainer">
              <span class="modeTitle" style="color: #007aff;">✂️ 立体切面训练</span>
           </div>
        </div>

        <button class="btnPrimary glass-primary main-action-btn homeStartBtn" @click="startGame">开始练习</button>
        <button class="btnHistory glass-btn main-action-btn" @click="openHistory">历史记录</button>
      </div>
    </div>

    <div v-if="viewState==='selectDivisor'" class="wrap homeWrap">
      <div class="header-area">
        <div class="title">选择除数</div>
        <div class="subtitle">点击下方数字开始练习商首位</div>
      </div>
      <div class="card glass-panel">
        <div class="grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">
          <button v-for="item in divisorList" :key="item" 
                  class="k glass-key" style="font-size:20px; height:50px; line-height:50px;" 
                  @click="selectDivisorAndStart(item)">{{item}}</button>
        </div>
        <button class="btnGhost glass-btn main-action-btn" style="margin-top: 20px;" @click="goHome">返回主页</button>
      </div>
    </div>

    <div v-if="viewState==='game'" class="wrap gameRoot">
      <div class="topbar safe-top">
        <button class="btnBack glass-btn" @click="goHome">返回</button>
        <div class="topStats">
          <div class="stat glass-pill">{{progressText}}</div>
          <div class="stat glass-pill timer">⏱ {{totalText}}</div>
        </div>
      </div>
      
      <div class="gameMain">
        <div class="card qCard glass-panel">
          <div :class="['qText', isSmallFont ? 'qText-small' : '']">{{qText}}</div>
          
          <div class="qNote">{{activeConfig.hintNote || activeConfig.hint || '精确到整数'}}</div>
          <div class="ansBox glass-input">答案：{{input ? input : '—'}}</div>
          <div class="hint">{{uiHint}}</div>
        </div>
      </div>
      
      <div class="keypad card glass-panel">
        <div class="fnRow">
          <button class="kFn style-skip" @click="leftAction">{{leftText}}</button>
          <button class="kFn style-clear" @click="clearInput">清空</button>
          <button class="kFn style-del" @click="backspace">退格</button>
        </div>
        <div class="grid">
          <button v-for="item in [1,2,3,4,5,6,7,8,9]" :key="item" class="k glass-key" @click="pressDigit(item)">{{item}}</button>
          <button class="k glass-key" @click="pressDot">.</button>
          <button class="k glass-key" @click="pressDigit(0)">0</button>
          <button class="k confirm glass-key-confirm" @click="confirmAnswer">确认</button>
        </div>
      </div>
    </div>

    <div v-if="viewState==='cubic'" class="wrap full-height" style="padding:0; overflow:hidden;">
      <div id="three-container" style="width:100%; height:100%; display:block; outline:none; touch-action: none;"></div>

      <div class="cubic-ui safe-top">
        <div class="glass-panel" style="padding: 8px 12px; display: flex; gap: 8px; align-items: center; justify-content: space-between; border-radius: 24px; width: 95%; max-width: 600px;">
          <div style="display:flex; gap:8px; align-items:center;">
             <button class="btnBack glass-btn small-btn" @click="quitCubicMode">🔙</button>
             <div class="divider"></div>
             <div class="toggle-group">
                <button :class="['toggle-btn', cubicMode==='build'?'active':'']" @click="switchCubicMode('build')">积木</button>
                <button :class="['toggle-btn', cubicMode==='exam'?'active':'']" @click="switchCubicMode('exam')">截面</button>
             </div>
          </div>
          
          <div v-if="cubicMode==='build'" style="display:flex; gap:8px;">
            <div style="display:flex; gap:4px; margin-right:4px;">
                <div v-for="c in colors" :key="c" 
                     :style="{backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none'}"
                     :class="['color-dot', selectedColor === c && !isDeleteMode ? 'active' : '']"
                     @click="switchColor(c)"></div>
            </div>
            <div class="divider"></div>
            <button :class="['btnIcon', isDeleteMode ? 'active' : '']" @click="toggleDeleteMode">🗑️</button>
            <button class="btnIcon" @click="clearCubes">🔄</button>
          </div>
        </div>

        <div class="view-selector glass-panel">
          <button class="view-btn" @click="setCameraView('front')">正</button>
          <button class="view-btn" @click="setCameraView('back')">后</button>
          <button class="view-btn" @click="setCameraView('left')">左</button>
          <button class="view-btn" @click="setCameraView('right')">右</button>
          <button class="view-btn" @click="setCameraView('top')">俯</button>
          <button class="view-btn active-view" @click="setCameraView('iso')">轴</button>
        </div>

        <template v-if="cubicMode==='exam'">
           <div v-if="!isSliceMenuOpen" class="float-trigger glass-btn" @click="isSliceMenuOpen = true">
              ⚙️ 调整切面
           </div>

           <div v-else class="exam-panel glass-panel">
              <div class="panel-header">
                 <span style="font-weight:700; color:#333;">选择图形</span>
                 <button class="btnGhost small-btn" style="width:30px; height:24px; line-height:24px; padding:0;" @click="isSliceMenuOpen = false">✕</button>
              </div>
              
              <div class="control-row" style="margin-bottom:12px;">
                 <select v-model="selectedShapeKey" @change="loadExamShape" class="shape-select">
                    <option v-for="shape in shapeLib" :key="shape.key" :value="shape.key">{{ shape.name }}</option>
                 </select>
              </div>

              <div class="panel-header" style="margin-bottom:8px; border:none; padding-bottom:0;">
                 <span style="font-weight:700; color:#333; font-size:13px;">切面位置与角度</span>
              </div>

              <div class="slice-controls">
                 <div class="slice-row">
                    <span class="label">位置</span>
                    <input type="range" min="-8" max="8" step="0.1" v-model.number="examSlice.constant" class="slider">
                 </div>
                 <div class="slice-row">
                    <span class="label">X轴</span>
                    <input type="range" min="0" max="180" step="1" v-model.number="examSlice.rotX" class="slider">
                    <span class="val-txt">{{examSlice.rotX}}°</span>
                 </div>
                 <div class="slice-row">
                    <span class="label">Y轴</span>
                    <input type="range" min="0" max="180" step="1" v-model.number="examSlice.rotY" class="slider">
                    <span class="val-txt">{{examSlice.rotY}}°</span>
                 </div>
                 <div class="slice-row">
                    <span class="label">Z轴</span>
                    <input type="range" min="0" max="180" step="1" v-model.number="examSlice.rotZ" class="slider">
                    <span class="val-txt">{{examSlice.rotZ}}°</span>
                 </div>
              </div>
              
              <button class="btnGhost small-btn" style="margin-top:10px; font-size:12px; height:32px;" @click="resetExamSlice">↺ 重置切面参数</button>
           </div>
        </template>

        <div class="tip-toast" v-if="cubicMode==='build' && !isDeleteMode">点击地面放置，点击方块叠加</div>
        <div class="tip-toast" v-if="cubicMode==='exam'">拖动滑块观察截面变化，白色为立体，黑色为截面</div>
      </div>
    </div>

    <div v-if="viewState==='sliceTrainer'" class="wrap full-height slice-trainer" style="padding:0; overflow:hidden;">
      <div id="slice-trainer-container" style="width:100%; height:100%; display:block; outline:none; touch-action: none;"></div>

      <div class="slice-trainer-ui safe-top">
        <div class="glass-panel slice-topbar">
          <button class="btnBack glass-btn small-btn" @click="quitSliceTrainer">🔙</button>
          <div class="divider"></div>
          <div class="slice-select">
            <span>分类</span>
            <select v-model.number="sliceCategoryIndex" @change="changeSliceCategory">
              <option v-for="(cat, idx) in sliceCategories" :key="cat.id" :value="idx">{{ cat.label }}</option>
            </select>
          </div>
          <div class="slice-shape-title">{{ selectedSliceShape.label }}</div>
        </div>

        <div class="glass-panel slice-shape-list">
          <button
            v-for="(item, index) in currentSliceShapes"
            :key="item.id"
            :class="['shape-chip', index === sliceShapeIndex ? 'active' : '']"
            @click="selectSliceShape(index)"
          >
            {{ item.label }}
          </button>
        </div>

        <button
          class="slice-control-btn"
          :class="{ dimmed: !sliceTrainerPanelOpen }"
          @click="toggleSliceTrainerPanel"
        >
          切面调整
        </button>

        <div v-if="sliceTrainerPanelOpen" class="glass-panel slice-panel trainer-panel">
          <div class="slice-row">
            <span class="slice-label">位置</span>
            <input type="range" min="-8" max="8" step="0.1" v-model.number="sliceTrainerConfig.constant" @input="updateSliceTrainerPlane" class="slice-slider">
          </div>
          <div class="slice-row">
            <span class="slice-label">X轴倾斜</span>
            <input type="range" min="-1" max="1" step="0.05" v-model.number="sliceTrainerConfig.x" @input="updateSliceTrainerPlane" class="slice-slider">
          </div>
          <div class="slice-row">
            <span class="slice-label">Y轴倾斜</span>
            <input type="range" min="-1" max="1" step="0.05" v-model.number="sliceTrainerConfig.y" @input="updateSliceTrainerPlane" class="slice-slider">
          </div>
          <div class="slice-row">
            <span class="slice-label">Z轴倾斜</span>
            <input type="range" min="-1" max="1" step="0.05" v-model.number="sliceTrainerConfig.z" @input="updateSliceTrainerPlane" class="slice-slider">
          </div>
          <div class="trainer-actions">
            <button class="btnGhost small-btn" @click="resetSliceTrainer">重置切面</button>
            <button class="btnPrimary small-btn" @click="toggleSliceTrainerPanel">完成</button>
          </div>
        </div>

        <div class="tip-toast slice-tip">拖动模型可旋转视角，滑动调节切面</div>
      </div>
    </div>

    <div v-if="viewState==='result'" class="wrap full-height">
      <div class="header-area safe-header">
        <div class="title">{{resultTitle}}</div>
        <div class="subtitle">{{resultMeta}}</div>
      </div>
      
      <div class="card full-flex glass-panel">
        <div class="resultScroll">
          <template v-if="currentModeKey==='train'">
            <div v-for="(item, index) in trainLog" :key="index" class="row">
              <span class="rowLeft">{{index+1}}. {{item.q}}</span>
              <span class="rowRight">
                <span :style="{ color: parseFloat(item.usedStr) > 2 ? '#ff3b30' : 'inherit' }">{{item.usedStr}}</span> 
                / 错{{item.wrong}}{{item.skipped?'(跳)':''}}
              </span>
            </div>
          </template>
          
          <template v-else>
            <div v-for="(item, index) in results" :key="index" class="row">
              <span class="rowLeft">{{index+1}}. {{item.q}} = {{item.yourAns}}</span>
              <span class="rowRight" style="display:flex; flex-direction:column; align-items:flex-end;">
                  <div>
                      <span style="margin-right:4px; font-size:13px; color:#666;">{{item.usedStr}}</span>
                      <span>{{item.ok ? '✅' : '❌'}}</span>
                      <span v-if="!item.ok" style="color:#ff3b30; font-size:13px; margin-left:2px; font-weight:700;">({{item.realAns}})</span>
                  </div>
                  
                  <div v-if="item.ok && item.exactAns" style="font-size:11px; color:#007aff; margin-top:2px; font-weight:500;">
                      准:{{ item.exactAns }} 误:{{ item.errorRate }}
                  </div>
              </span>
            </div>
          </template>
        </div>
        <div style="margin-top: 15px;">
          <div v-if="isHistoryReview">
            <button class="btnPrimary glass-primary main-action-btn" @click="backToHistory">返回列表</button>
          </div>
          <div v-else>
            <button class="btnPrimary glass-primary main-action-btn" @click="goHome">返回主页</button>
            <button class="btnGhost glass-btn main-action-btn" @click="startGame" style="margin-top:10px;">再来一局</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="viewState==='history'" class="wrap full-height">
      <div class="header-area safe-header">
        <div class="title">历史记录</div>
        <div class="subtitle">仅保留最近5000条训练数据</div>
      </div>
      
      <div class="card full-flex glass-panel">
        <div v-if="showChart" class="chart-container glass-inner">
           <div class="chart-tabs">
             <div 
               v-for="m in availableModes" 
               :key="m"
               :class="['chart-tab-item', chartTab === m ? 'active' : '']"
               @click="switchChartTab(m)"
             >
               {{ m }}
             </div>
           </div>
           <div id="accChart" style="width: 100%; height: 220px;"></div>
           <button class="btnGhost small" style="margin-top:5px; font-size:13px;" @click="closeChart">收起图表</button>
        </div>
        <div v-else>
           <button class="btnGhost glass-btn" style="height:44px; line-height:44px; font-size:16px; margin-bottom:15px; color:#007aff;" @click="initChart">
             📊 按模块分析趋势
           </button>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding:0 8px; font-weight:700; color:#8e8e93; font-size:13px;">
           <span>时间 / 模式</span>
           <span>成绩 / 耗时</span>
        </div>
        
        <div class="resultScroll">
          <div v-if="historyList.length === 0" style="text-align:center; padding: 20px; color:rgba(0,0,0,0.4);">
            暂无记录，快去练习吧！
          </div>
          <div v-else>
            <div v-for="(item, index) in historyList" :key="item.ts" class="row hover-row" @click="viewHistoryDetail(index)" style="cursor:pointer;">
              <div class="rowLeft" style="display:flex; flex-direction:column;">
                <span style="font-size:12px; color:#8e8e93;">{{item.timeStr}}</span>
                <span style="font-weight:700; color:#1d1d1f; font-size:15px;">{{item.modeName}}</span>
              </div>
              <div class="rowRight" style="display:flex; flex-direction:column; align-items:flex-end;">
                <span style="font-size:16px; color:#007aff; font-weight:800;">{{item.summary}}</span>
                <span style="font-size:12px; color:#8e8e93;">{{item.duration}} > </span>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 15px; display:flex; flex-direction: column; gap:10px;">
          <button 
            v-if="historyList.length > 1000" 
            class="btnGhost glass-btn" 
            style="margin:0; height: 40px; font-size: 16px; color: #ff3b30; background: rgba(255,59,48,0.08); border-color: rgba(255,59,48,0.2);" 
            @click="clearOldest"
          >
            🗑️ 清理最早的 1000 条
          </button>

          <div style="display:flex; gap:10px;">
            <button class="btnDanger glass-btn main-action-btn" style="margin:0; flex:1;" @click="clearHistory">清空全部</button>
            <button class="btnPrimary glass-primary main-action-btn" style="margin:0; flex:1;" @click="closeHistory">返回主页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SOLID_SLICE_BANK } from './data/solidSliceBank.js';

// =================================================================
// 公考立体图形库定义
// =================================================================
const createExtrudeShape = (pts) => {
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    for(let i=1; i<pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
    shape.closePath();
    const settings = { depth: 4, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, settings);
    geom.center(); // 居中
    return geom;
};

const SHAPE_LIB = [
  // --- 规则立体图形 ---
  { key: 'cube', name: '【规则】正方体', create: () => new THREE.BoxGeometry(6,6,6) },
  { key: 'cuboid', name: '【规则】长方体', create: () => new THREE.BoxGeometry(4,8,4) },
  { key: 'cylinder', name: '【规则】圆柱体', create: () => new THREE.CylinderGeometry(3,3,8,64) },
  { key: 'cone', name: '【规则】圆锥体', create: () => new THREE.ConeGeometry(4,8,64) },
  { key: 'sphere', name: '【规则】球体', create: () => new THREE.SphereGeometry(4,64,64) },
  { key: 'tetra', name: '【锥体】正四面体', create: () => new THREE.TetrahedronGeometry(5) },
  { key: 'pyramid', name: '【锥体】四棱锥', create: () => {
       // 也就是金字塔，用 Cylinder 模拟，顶半径0，底半径4，4边形
       return new THREE.CylinderGeometry(0, 5, 6, 4);
  }},
  { key: 'prism6', name: '【柱体】六棱柱', create: () => new THREE.CylinderGeometry(4,4,8,6) },
  
  // --- 不规则/组合图形 ---
  { key: 'hollow_cyl', name: '【不规则】空心管', create: () => {
      // 模拟圆管切面，用粗环面模拟截面效果
      return new THREE.TorusGeometry(3, 1.5, 32, 64);
  }},
  { key: 'u_shape', name: '【不规则】凹字形(U型)', create: () => {
      // 凹字
      return createExtrudeShape([
        [-3,3], [-1,3], [-1,0], [1,0], [1,3], [3,3], 
        [3,-3], [-3,-3]
      ]);
  }},
  { key: 'l_shape', name: '【不规则】L字形', create: () => {
      return createExtrudeShape([
        [-3,4], [0,4], [0,0], [3,0], [3,-3], [-3,-3]
      ]);
  }},
  { key: 'cross', name: '【不规则】十字形', create: () => {
      return createExtrudeShape([
        [-1,3], [1,3], [1,1], [3,1], [3,-1], [1,-1], 
        [1,-3], [-1,-3], [-1,-1], [-3,-1], [-3,1], [-1,1]
      ]);
  }}
];

// =================================================================
// 核心逻辑层 (原 math.js 和 gameModes.js 内容整合)
// =================================================================

const shuffle = (arr) => {
  for(let i=arr.length-1;i>0;i--){ 
    const j = Math.floor(Math.random()*(i+1)); 
    [arr[i], arr[j]] = [arr[j], arr[i]]; 
  } 
  return arr; 
};

const buildBasePool = () => {
  const arr = []; 
  for(let d=11; d<=19; d++){ 
    for(let q=1; q<=9; q++){ 
      arr.push({ dividend: d*q, divisor: d, ans: q, symbol: '÷' }); 
    } 
  } 
  return arr;
};

// 游戏模式定义
const GAME_MODES = {
  'train': { name: '训练', title: '基础训练完成！', hintNote: '精确到整数', gen: () => shuffle(buildBasePool()) },
  'speed': { name: '竞速', title: '竞速完成！', hintNote: '精确到整数', gen: () => shuffle(buildBasePool()).slice(0, 10) },
  'first': { name: '首位(随机)', title: '商首位完成！', hintNote: '目标：输入商的第一位数字', gen: (n) => { const pool=[]; for(let i=0;i<n;i++){ const dr=11+Math.floor(Math.random()*9); const dd=100+Math.floor(Math.random()*900); const fd=parseInt(String(Math.floor(dd/dr))[0],10); pool.push({dividend:dd,divisor:dr,ans:fd,symbol:'÷'}); } return pool; } },
  'firstSpec': { name: '商首位专项', title: '商首位专项完成！', gen: (n, ex) => { const d=ex.divisor||12; const pool=[]; for(let i=0;i<n;i++){ const dd=Math.floor(Math.random()*(999-d+1))+d; const fq=Math.floor(dd/d); const fd=parseInt(String(fq)[0],10); pool.push({dividend:dd,divisor:d,ans:fd,symbol:'÷'}); } return pool; } },
  'plus': { name: '进位加', title: '一位数进位加完成！', hintNote: '只填个位尾数', gen: (n) => { const p=[]; for(let i=0;i<n;i++){ let a,b; do{a=Math.floor(Math.random()*9)+1;b=Math.floor(Math.random()*9)+1;a1=a%10;b1=b%10;}while(a+b<10); p.push({dividend:a,divisor:b,ans:(a+b)%10,symbol:'+'});} return p;} },
  'minus': { name: '退位减', title: '一位数退位减完成！', hintNote: '只填个位尾数', gen: (n) => { const p=[]; for(let i=0;i<n;i++){ let a,b; do{a=Math.floor(Math.random()*9)+1;b=Math.floor(Math.random()*9)+1;}while(a>=b); p.push({dividend:a,divisor:b,ans:(10+a-b),symbol:'-'});} return p;} },
  'doublePlus': { name: '双进位加', title: '双进位加完成！', hintNote: '个位十位均需进位', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ let a,b,a1,a2,b1,b2; do{a=Math.floor(Math.random()*90)+10;b=Math.floor(Math.random()*90)+10;a1=Math.floor(a/10);a2=a%10;b1=Math.floor(b/10);b2=b%10;}while(a2+b2<10||a1+b1<10); p.push({dividend:a,divisor:b,ans:a+b,symbol:'+'});} return p;} },
  'doubleMinus': { name: '双退位减', title: '双退位减完成！', hintNote: '个位退，十位不退', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ let a,b,a1,a2,b1,b2; do{a=Math.floor(Math.random()*90)+10;b=Math.floor(Math.random()*90)+10;a1=Math.floor(a/10);a2=a%10;b1=Math.floor(b/10);b2=b%10;}while(!(a2<b2&&a1-1>=b1)); p.push({dividend:a,divisor:b,ans:a-b,symbol:'-'});} return p;} },
  'fourSum': { name: '四数相加', title: '四数相加完成！', hintNote: '计算准确和', isSmallFont:true, gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ const a=Math.floor(Math.random()*90)+10;const b=Math.floor(Math.random()*90)+10;const c=Math.floor(Math.random()*90)+10;const d=Math.floor(Math.random()*90)+10; p.push({dividend:`${a}+${b}+${c}`,divisor:d,ans:a+b+c+d,symbol:'+'});} return p;} },
  'triplePlus': { name: '三进位加', title: '三进位加完成！', hintNote: '个位十位百位均需进位', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ let a,b,a1,a2,a3,b1,b2,b3; do{a=Math.floor(Math.random()*900)+100;b=Math.floor(Math.random()*900)+100;a1=Math.floor(a/100);a2=Math.floor((a%100)/10);a3=a%10;b1=Math.floor(b/100);b2=Math.floor((b%100)/10);b3=b%10;}while(a3+b3<10||a2+b2<10||a1+b1<10); p.push({dividend:a,divisor:b,ans:a+b,symbol:'+'});} return p;} },
  'tripleMinus': { name: '三退位减', title: '三退位减完成！', hintNote: '个十退，百不退', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ let a,b,a1,a2,a3,b1,b2,b3; do{a=Math.floor(Math.random()*900)+100;b=Math.floor(Math.random()*900)+100;a1=Math.floor(a/100);a2=Math.floor((a%100)/10);a3=a%10;b1=Math.floor(b/100);b2=Math.floor((b%100)/10);b3=b%10;}while(!(a3<b3&&(a2-1)<b2&&(a1-1)>=b1)); p.push({dividend:a,divisor:b,ans:a-b,symbol:'-'});} return p;} },
  'tripleAnyPlus': { name: '任意加', title: '任意三数加完成！', hintNote: '任意三位数加法', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ const a=Math.floor(Math.random()*900)+100;const b=Math.floor(Math.random()*900)+100; p.push({dividend:a,divisor:b,ans:a+b,symbol:'+'});} return p;} },
  'tripleAnyMinus': { name: '任意减', title: '任意三数减完成！', hintNote: '任意三位数减法', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ let a=Math.floor(Math.random()*900)+100;let b=Math.floor(Math.random()*900)+100;if(a<b)[a,b]=[b,a]; p.push({dividend:a,divisor:b,ans:a-b,symbol:'-'});} return p;} },
  'tripleMix': { name: '加减混合', title: '三数加减混合完成！', hintNote: '三数加减混合 (结果为正)', isSmallFont:true, gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ let a,b,c,op1,op2,ans; do{a=Math.floor(Math.random()*900)+100;b=Math.floor(Math.random()*900)+100;c=Math.floor(Math.random()*900)+100;op1=Math.random()>0.5?'+':'-';op2=Math.random()>0.5?'+':'-';let step1=(op1==='+')?(a+b):(a-b);ans=(op2==='+')?(step1+c):(step1-c);}while(ans<0); p.push({dividend:`${a}${op1}${b}`,divisor:c,ans:ans,symbol:op2});} return p;} },
  'tripleMult': { name: '三乘一', title: '三乘一完成！', hintNote: '计算准确积', gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ const a=Math.floor(Math.random()*900)+100;const b=Math.floor(Math.random()*8)+2; p.push({dividend:a,divisor:b,ans:a*b,symbol:'×'});} return p;} },
  'tripleDiv': { name: '三除一', title: '三除一完成！', hintNote: '若为小数，填相邻整数均对', check: (v, t) => { if(Number.isInteger(t)){ return {ok:v===t,display:t}; }else{ const f=Math.floor(t),c=Math.ceil(t); return {ok:(v===f||v===c),display:`${f}或${c} (${t.toFixed(2)})`}; } }, gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ const a=Math.floor(Math.random()*900)+100;const b=Math.floor(Math.random()*8)+2; p.push({dividend:a,divisor:b,ans:a/b,symbol:'÷'});} return p;} },
  'divSpecA': { name: '反向放缩', title: '反向放缩完成！', hintNote: '除数111-199 (误差3%内)', check:(v,t)=>{const r=Math.abs(v-t)/t; return {ok:r<=0.03,display:Math.round(t)};}, gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ const dr=Math.floor(Math.random()*(199-111+1))+111;const dd=Math.floor(Math.random()*(99999-10000+1))+10000; p.push({dividend:dd,divisor:dr,ans:dd/dr,symbol:'÷'});} return p;} },
  'divSpecB': { name: '平移法', title: '平移法完成！', hintNote: '商90-111 (误差3%内)', check:(v,t)=>{const r=Math.abs(v-t)/t; return {ok:r<=0.03,display:Math.round(t)};}, gen: (n)=>{ const p=[]; let c=0; while(c<n){ const dr=Math.floor(Math.random()*900)+100;const tq=Math.floor(Math.random()*(111-90+1))+90;const dd=dr*tq+Math.floor(Math.random()*dr); if(dd>=10000&&dd<=99999){ p.push({dividend:dd,divisor:dr,ans:dd/dr,symbol:'÷'}); c++;} } return p;} },
  'divSpecC': { name: '任意五除三', title: '任意五除三完成！', hintNote: '五位数除以三位数 (误差3%内)', check:(v,t)=>{const r=Math.abs(v-t)/t; return {ok:r<=0.03,display:Math.round(t)};}, gen: (n)=>{ const p=[]; for(let i=0;i<n;i++){ const dr=Math.floor(Math.random()*900)+100;const dd=Math.floor(Math.random()*(99999-10000+1))+10000; p.push({dividend:dd,divisor:dr,ans:dd/dr,symbol:'÷'});} return p;} }
};

const MODE_GROUPS = {
  basic: { label: '大九九/除法', modes: ['train', 'speed', 'first'] },
  divSelect: { label: '商首位专项', modes: [] }, 
  single: { label: '一位数专项 (仅填尾数)', modes: ['plus', 'minus'] },
  double: { label: '两位数专项 (完整答案)', modes: ['doublePlus', 'doubleMinus', 'fourSum'] },
  triple: { label: '三位数专项 (完整答案)', modes: ['triplePlus', 'tripleMinus', 'tripleAnyPlus', 'tripleAnyMinus', 'tripleMix', 'tripleMult', 'tripleDiv'] },
  spec: { label: '五除三专项 (允许3%误差)', modes: ['divSpecA', 'divSpecB', 'divSpecC'] }
};

export default {
  data() {
    return {
      viewState: 'home', currentModeKey: 'train', selectedDivisor: 0,
      pool: [], idx: 0, current: null, input: '', uiHint: 'Ready?', totalText: '0:00.0', progressText: '1/81', qText: '—', leftText: '跳过', 
      totalStartTs: 0, qStartTs: 0, timer: null, trainWrong: 0, trainSkip: 0, curWrongTries: 0, trainLog: [], results: [], 
      historyList: [], showChart: false, chartInstance: null, chartTab: '', availableModes: [], isHistoryReview: false,
      toast: { show: false, title: '' },
      modeGroups: MODE_GROUPS, divisorList: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
      
      // --- 3D 模式通用状态 ---
      cubicMode: 'build', // 'build' (积木) | 'exam' (公考截面)
      
      // 积木模式状态
      isDeleteMode: false,
      colors: ['#007aff', '#ff9500', '#333333', '#ffffff'], 
      selectedColor: '#007aff',
      
      // 切面配置
      sliceConfig: {
        constant: 5,
        x: 0,
        y: -1, 
        z: 0
      },

      // 立体切面训练
      sliceCategories: SOLID_SLICE_BANK,
      sliceCategoryIndex: 0,
      sliceShapeIndex: 0,
      sliceTrainerPanelOpen: false,
      sliceTrainerConfig: {
        constant: 1.5,
        x: 0.4,
        y: -0.8,
        z: 0.2
      }
    }
  },
  computed: {
    activeConfig() {
      if(this.currentModeKey === 'firstSpec') {
        return { name: `商首位(除${this.selectedDivisor})`, title: `商首位(除${this.selectedDivisor})完成！`, hintNote: `除数${this.selectedDivisor}专项：只填商首位`, gen: GAME_MODES['firstSpec'].gen };
      }
      return GAME_MODES[this.currentModeKey] || {};
    },
    resultTitle() { return this.activeConfig.title || '训练完成！'; },
    resultMeta() {
       const totalSec = this.totalSec || 0;
       if(this.currentModeKey === 'train') {
         return `用时：${totalSec.toFixed(1)}s｜错误：${this.trainWrong}｜跳过：${this.trainSkip}`;
       } else {
         const correctCount = this.results.filter(x=>x.ok).length;
         const totalCount = this.results.length;
         return `正确：${correctCount}/${totalCount}｜总用时：${totalSec.toFixed(1)}s`;
       }
    },
    isSmallFont() { return this.activeConfig.isSmallFont || (this.currentModeKey === 'fourSum' || this.currentModeKey === 'tripleMix'); },
    currentSliceCategory() {
      return this.sliceCategories[this.sliceCategoryIndex] || this.sliceCategories[0];
    },
    currentSliceShapes() {
      return this.currentSliceCategory?.items || [];
    },
    selectedSliceShape() {
      return this.currentSliceShapes[this.sliceShapeIndex] || this.currentSliceShapes[0] || { label: '' };
    }
  },
  watch: {
    // 监听公考切面参数变化，实时更新
    examSlice: {
      handler() {
        if(this.cubicMode === 'exam') this.updateExamPlane();
      },
      deep: true
    }
  },
  mounted() {
    const history = localStorage.getItem('calc_history');
    if(history) { try { this.historyList = JSON.parse(history); } catch(e){ console.error(e) } }
    window.addEventListener('resize', () => { if(this.chartInstance) this.chartInstance.resize(); });
  },
  beforeUnmount() {
    this.cleanup3D(); 
    this.cleanupSliceTrainer();
  },
  created() {
    this.threeApp = { scene: null, camera: null, renderer: null, controls: null, raycaster: null, pointer: null, objects: [], animationId: null, clippingPlane: null, planeHelper: null };
    this.sliceApp = { scene: null, camera: null, renderer: null, controls: null, animationId: null, mesh: null, clippingPlane: null, slicePlaneMesh: null };
  },
  methods: {
    now() { return Date.now(); },
    getModeConfig(key) { return GAME_MODES[key] || { name: key }; },
    setMode(mode){ this.currentModeKey = mode; },
    toSelectDivisor(){ this.viewState = 'selectDivisor'; },
    selectDivisorAndStart(d){ this.currentModeKey = 'firstSpec'; this.selectedDivisor = d; this.startGame(); },
    showToast(title) { this.toast.title = title; this.toast.show = true; setTimeout(() => { this.toast.show = false; }, 1500); },
    
    // --- 游戏核心逻辑 ---
    startGame(){
      const config = this.activeConfig;
      if (!config.gen) return;
      this.pool = config.gen(10, { divisor: this.selectedDivisor });
      if(this.timer) clearInterval(this.timer);
      const totalStartTs = this.now();
      this.viewState = 'game'; this.idx = 0; this.input = ''; this.uiHint = '请输入答案'; this.leftText = (this.currentModeKey === 'train' ? '跳过' : '重开');
      this.totalStartTs = totalStartTs; this.qStartTs = 0; this.trainWrong = 0; this.trainSkip = 0; this.curWrongTries = 0; this.trainLog = []; this.results = []; this.isHistoryReview = false;
      this.$nextTick(() => { this._nextQuestion(); this.timer = setInterval(()=> this._tick(), 100); });
    },
    _tick(){ const diff = this.now() - this.totalStartTs; this.totalText = this.msToMMSS(diff); },
    _setQuestion(q, shownIdx){ this.current = q; this.qStartTs = this.now(); this.input = ''; this.curWrongTries = 0; this.qText = `${q.dividend}${q.symbol}${q.divisor}`; this.progressText = `${shownIdx}/${this.pool.length}`; },
    _nextQuestion(){ const { idx, pool } = this; if(idx >= pool.length){ this._finish(); return; } this._setQuestion(pool[idx], idx + 1); this.idx = idx + 1; },
    pressDigit(d){ let input = this.input || ''; if(input.length >= 6) return; input += String(d); this.input = input; },
    pressDot(){ let input = this.input || ''; if(input.includes('.')) return; if(input.length >= 6) return; if(input === '') input = '0'; input += '.'; this.input = input; },
    clearInput(){ this.input = ''; },
    backspace(){ this.input = (this.input || '').slice(0, -1); },
    leftAction(){ if(this.currentModeKey !== 'train'){ this.startGame(); return; } const cur = this.current; const used = (this.now() - this.qStartTs)/1000; const log = this.trainLog.concat([{ q: `${cur.dividend}${cur.symbol}${cur.divisor}`, usedStr: used.toFixed(1) + 's', wrong: this.curWrongTries, skipped: true }]); this.trainSkip++; this.trainLog = log; this._nextQuestion(); },
    
    confirmAnswer(){
      const { current: cur, input, currentModeKey: mode, activeConfig } = this; 
      if(!input) return; 
      const n = parseFloat(input); 
      const used = (this.now() - this.qStartTs)/1000;
      
      let correct = false; 
      let realAnsDisplay = cur.ans;
      
      if (activeConfig.check) { 
        const checkResult = activeConfig.check(n, cur.ans); 
        correct = checkResult.ok; 
        realAnsDisplay = checkResult.display; 
      } else { 
        correct = (parseInt(input) === cur.ans); 
      }
      
      if(mode === 'train'){ 
        if(correct){ 
          const log = this.trainLog.concat([{ q: `${cur.dividend}${cur.symbol}${cur.divisor}`, usedStr: used.toFixed(1) + 's', wrong: this.curWrongTries, skipped: false }]); 
          this.trainLog = log; 
          this._nextQuestion(); 
        } else { 
          this.trainWrong++; 
          this.curWrongTries++; 
          this.input = ''; 
          this.uiHint = `错误！答案是：${realAnsDisplay}`; 
        } 
        return; 
      }
      
      let extraInfo = {};
      const estimateModes = ['tripleDiv', 'divSpecA', 'divSpecB', 'divSpecC'];
      
      if (correct && estimateModes.includes(mode)) {
          const exact = cur.dividend / cur.divisor;
          const error = Math.abs(n - exact) / exact;
          const exactStr = Number.isInteger(exact) ? String(exact) : exact.toFixed(1);
          extraInfo = { exactAns: exactStr, errorRate: (error * 100).toFixed(2) + '%' };
      }
      
      const results = this.results.concat([{ 
        q: `${cur.dividend}${cur.symbol}${cur.divisor}`, 
        ok: correct, 
        yourAns: input, 
        realAns: realAnsDisplay, 
        usedStr: used.toFixed(1) + 's',
        ...extraInfo
      }]); 
      
      this.results = results; 
      this._nextQuestion();
    },

    _finish(){ if(this.timer) clearInterval(this.timer); this.totalSec = (this.now() - this.totalStartTs)/1000; let recordSummary = ''; let detailLog = []; if(this.currentModeKey === 'train'){ recordSummary = `错${this.trainWrong}/跳${this.trainSkip}`; detailLog = this.trainLog; } else { const correctCount = this.results.filter(x=>x.ok).length; const totalCount = this.results.length; recordSummary = `正确率 ${Math.round(correctCount/totalCount*100)}%`; detailLog = this.results; } this.viewState = 'result'; this.isHistoryReview = false; this._saveRecord({ totalSec: this.totalSec }, recordSummary, detailLog); },
    _saveRecord(meta, summary, detailLog){ const modeName = (this.currentModeKey === 'firstSpec') ? `商首位(除${this.selectedDivisor})` : (GAME_MODES[this.currentModeKey]?.name || '未知模式'); const record = { ts: this.now(), timeStr: this.formatTime(this.now()), mode: this.currentModeKey, modeName: modeName, duration: meta.totalSec.toFixed(1) + 's', summary: summary, detail: detailLog }; let history = this.historyList; history.unshift(record); if(history.length > 5000) history = history.slice(0, 5000); this.historyList = history; localStorage.setItem('calc_history', JSON.stringify(history)); },
    msToMMSS(ms){ const totalSec = ms / 1000; const m = Math.floor(totalSec / 60); const s = (totalSec % 60).toFixed(1); return `${m}:${s < 10 ? '0' + s : s}`; },
    formatTime(ts) { const date = new Date(ts); const m = date.getMonth() + 1; const d = date.getDate(); const h = date.getHours(); const min = date.getMinutes(); const pad = n => n < 10 ? '0' + n : n; return `${m}/${d} ${pad(h)}:${pad(min)}`; },
    goHome(){ if(this.timer) clearInterval(this.timer); this.viewState = 'home'; },
    openHistory(){ this.viewState = 'history'; if(this.showChart) this.$nextTick(() => this.renderChart(this.chartTab)); },
    viewHistoryDetail(index){ const record = this.historyList[index]; if(!record) return; this.currentModeKey = record.mode; this.totalSec = parseFloat(record.duration.replace('s','')); if(record.mode === 'train'){ this.trainLog = record.detail || []; this.results = []; } else { this.results = record.detail || []; this.trainLog = []; } this.viewState = 'result'; this.isHistoryReview = true; },
    backToHistory(){ this.viewState = 'history'; if(this.showChart) this.$nextTick(() => this.renderChart(this.chartTab)); },
    closeHistory(){ this.viewState = 'home'; },
    clearOldest() { if(confirm(`当前共有 ${this.historyList.length} 条记录。\n确定要清除【最早的 1000 条】数据吗？`)){ const keepCount = this.historyList.length - 1000; this.historyList = this.historyList.slice(0, keepCount); localStorage.setItem('calc_history', JSON.stringify(this.historyList)); this.showToast('清理成功'); if(this.showChart) this.initChart(); } },
    clearHistory(){ if(confirm('【严重警告】\n确定要清空【所有】历史记录吗？\n此操作不可恢复！')){ localStorage.removeItem('calc_history'); this.historyList = []; this.showToast('所有记录已清空'); } },
    initChart() { this.showChart = true; const modeSet = new Set(this.historyList.map(item => item.modeName)); this.availableModes = Array.from(modeSet); if(this.historyList.length > 0 && !this.chartTab) { this.chartTab = this.historyList[0].modeName; } else if (this.availableModes.length > 0 && !this.chartTab) { this.chartTab = this.availableModes[0]; } this.$nextTick(() => { this.renderChart(this.chartTab); }); },
    switchChartTab(modeName) { this.chartTab = modeName; this.renderChart(modeName); },
    renderChart(targetModeName) { const chartDom = document.getElementById('accChart'); if(!chartDom) return; if(this.chartInstance) this.chartInstance.dispose(); this.chartInstance = echarts.init(chartDom); const allData = JSON.parse(JSON.stringify(this.historyList)).reverse(); const filteredData = allData.filter(item => item.modeName === targetModeName); const dateList = []; const accuracyList = []; const timeList = []; filteredData.forEach(item => { let accuracy = 0; if(item.mode === 'train') { let wrong = 0; if(item.detail && item.detail.length > 0) { wrong = item.detail.filter(x => x.wrong > 0).length; } else { const match = item.summary.match(/错(\d+)/); if(match) wrong = parseInt(match[1]); } accuracy = ((81 - wrong) / 81) * 100; } else { if(item.detail && item.detail.length > 0) { const correctCount = item.detail.filter(x => x.ok).length; accuracy = (correctCount / item.detail.length) * 100; } else { const match = item.summary.match(/(\d+)%/); if(match) accuracy = parseInt(match[1]); } } let duration = 0; if(item.duration) { duration = parseFloat(item.duration.replace('s', '')); } dateList.push(item.timeStr); accuracyList.push(accuracy.toFixed(0)); timeList.push(duration.toFixed(1)); }); if(dateList.length === 0) { this.chartInstance.setOption({ title: { text: '该模式暂无数据', left: 'center', top: 'center', textStyle: { color: '#999' } } }); return; } const option = { grid: { top: 30, bottom: 20, left: 30, right: 30, containLabel: true }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: dateList, axisLabel: { color: '#333', fontSize: 10, interval: 'auto', hideOverlap: true } }, yAxis: [ { type: 'value', min: 0, max: 100, position: 'left', splitLine: { show:true, lineStyle: { type: 'dashed', opacity: 0.1 } }, axisLabel: {color: '#007aff', formatter: '{value}%'} }, { type: 'value', position: 'right', splitLine: { show: false }, axisLabel: {color: '#ff3b30', formatter: '{value}s'} } ], series: [ { name: '正确率', type: 'line', yAxisIndex: 0, smooth: true, lineStyle: { color: '#007aff', width: 3 }, itemStyle: { color: '#007aff' }, data: accuracyList }, { name: '耗时', type: 'line', yAxisIndex: 1, smooth: true, lineStyle: { color: '#ff3b30', width: 2, type: 'dashed' }, itemStyle: { color: '#ff3b30' }, data: timeList } ] }; this.chartInstance.setOption(option); },
    closeChart() { this.showChart = false; if(this.chartInstance) { this.chartInstance.dispose(); this.chartInstance = null; } },

    // =================================================================
    // 3D 模块逻辑 (增强：双模式切换 + 实心切面)
    // =================================================================
    startCubicMode() { this.viewState = 'cubic'; this.$nextTick(() => { this.initThree(); }); },
    quitCubicMode() { this.cleanup3D(); this.viewState = 'home'; this.isSliceMode = false; },
    startSliceTrainer() { this.viewState = 'sliceTrainer'; this.$nextTick(() => { this.initSliceTrainer(); }); },
    quitSliceTrainer() { this.cleanupSliceTrainer(); this.viewState = 'home'; },
    switchColor(c) { 
      this.selectedColor = c; 
      this.isDeleteMode = false; 
    },
    toggleDeleteMode() {
      this.isDeleteMode = !this.isDeleteMode;
      if(this.isDeleteMode) this.isSliceMode = false;
    },
    quitCubicMode() { this.cleanup3D(); this.viewState = 'home'; },
    
    // 切换 积木模式 / 截面模式
    switchCubicMode(mode) {
      this.cubicMode = mode;
      this.cleanup3D(); 
      this.$nextTick(() => {
         this.initThree(); 
      });
    },

    // 积木模式相关操作
    switchColor(c) { this.selectedColor = c; this.isDeleteMode = false; },
    toggleDeleteMode() { this.isDeleteMode = !this.isDeleteMode; },
    
    // 公考截面模式核心：加载图形与实心渲染
    loadExamShape() {
      const { scene } = this.threeApp;
      // 清空旧对象（保留Ground和GridHelper）
      this.threeApp.objects = this.threeApp.objects.filter(obj => {
          if (obj.name === 'ground' || obj.type === 'GridHelper') return true;
          scene.remove(obj);
          return false;
      });

      // 隐藏地面网格（考题通常悬空）
      const grid = scene.children.find(c => c.type === 'GridHelper');
      if(grid) grid.visible = false;
      const ground = scene.getObjectByName('ground');
      if(ground) ground.visible = false;

      // 创建新图形
      const def = this.shapeLib.find(s => s.key === this.selectedShapeKey);
      if(!def) return;
      
      const geometry = def.create();
      
      // 创建带有实心切面效果的物体组 (Stencil Buffer Tech)
      const group = this.createStencilGroup(geometry, this.threeApp.clippingPlane);
      scene.add(group);
      this.threeApp.objects.push(group);
      
      this.updateExamPlane();
    },

    createStencilGroup(geometry, plane) {
      const group = new THREE.Group();
      const baseColor = 0xffffff; // 白模
      const cutColor = 0x1d1d1f;  // 黑面

      // 1. 基础材质 (外表面)
      const matBase = new THREE.MeshPhongMaterial({
        color: baseColor,
        shininess: 30,
        clippingPlanes: [plane],
        clipShadows: true,
        side: THREE.DoubleSide
      });
      const meshBase = new THREE.Mesh(geometry, matBase);
      group.add(meshBase);

      // 2. 模板写入 (Back)
      const matStencilBack = new THREE.MeshBasicMaterial({
        depthWrite: false, depthTest: false, colorWrite: false,
        side: THREE.BackSide,
        clippingPlanes: [plane],
        stencilWrite: true,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilFail: THREE.IncrementWrapStencilOp,
        stencilZFail: THREE.IncrementWrapStencilOp,
        stencilZPass: THREE.IncrementWrapStencilOp,
      });
      const meshStencilBack = new THREE.Mesh(geometry, matStencilBack);
      group.add(meshStencilBack);

      // 3. 模板写入 (Front)
      const matStencilFront = new THREE.MeshBasicMaterial({
        depthWrite: false, depthTest: false, colorWrite: false,
        side: THREE.FrontSide,
        clippingPlanes: [plane],
        stencilWrite: true,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilFail: THREE.DecrementWrapStencilOp,
        stencilZFail: THREE.DecrementWrapStencilOp,
        stencilZPass: THREE.DecrementWrapStencilOp,
      });
      const meshStencilFront = new THREE.Mesh(geometry, matStencilFront);
      group.add(meshStencilFront);

      // 4. 封口平面 (Cap) - 仅在 stencil != 0 时渲染黑色
      const planeGeom = new THREE.PlaneGeometry(100, 100);
      const matCap = new THREE.MeshBasicMaterial({
        color: cutColor,
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
        depthWrite: false
      });
      const meshCap = new THREE.Mesh(planeGeom, matCap);
      meshCap.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
      meshCap.onAfterRender = (renderer) => renderer.clearStencil();
      
      group.add(meshCap);
      this.threeApp.capMesh = meshCap;

      return group;
    },

    updateExamPlane() {
      if(!this.threeApp.clippingPlane) return;
      const { constant, rotX, rotY, rotZ } = this.examSlice;
      
      // 欧拉角转法向量
      const euler = new THREE.Euler(
        THREE.MathUtils.degToRad(rotX),
        THREE.MathUtils.degToRad(rotY),
        THREE.MathUtils.degToRad(rotZ)
      );
      const normal = new THREE.Vector3(0, -1, 0); 
      normal.applyEuler(euler).normalize();
      
      // 更新 Three.js 裁剪平面
      this.threeApp.clippingPlane.normal.copy(normal);
      this.threeApp.clippingPlane.constant = constant;
      
      // 更新封口平面位置
      if(this.threeApp.capMesh) {
         const coplanarPoint = new THREE.Vector3().copy(normal).multiplyScalar(-constant);
         this.threeApp.capMesh.position.copy(coplanarPoint);
         this.threeApp.capMesh.lookAt(
             this.threeApp.capMesh.position.clone().add(normal)
         );
      }
    },
    
    resetExamSlice() {
        this.examSlice = { constant: 0, rotX: 90, rotY: 0, rotZ: 0 };
    },

    // 设置正交视图
    setCameraView(type) {
      if (!this.threeApp.camera || !this.threeApp.controls) return;
      const { camera, controls } = this.threeApp;
      const dist = 20; 
      const targetY = 0; // 截面模式居中观察
      
      controls.target.set(0, targetY, 0);

      switch(type) {
        case 'front': camera.position.set(0, targetY, dist); break;
        case 'back': camera.position.set(0, targetY, -dist); break;
        case 'left': camera.position.set(-dist, targetY, 0); break;
        case 'right': camera.position.set(dist, targetY, 0); break;
        case 'top': camera.position.set(0, dist + targetY, 0); break;
        case 'iso': camera.position.set(12, 12 + targetY, 12); break;
      }
      camera.lookAt(0, targetY, 0);
      controls.update();
    },

    initThree() {
      const container = document.getElementById('three-container'); 
      if (!container) return;
      const width = container.clientWidth; 
      const height = container.clientHeight;

      const scene = new THREE.Scene(); 
      scene.background = new THREE.Color('#f2f2f7'); 
      scene.fog = new THREE.Fog('#f2f2f7', 20, 50);

      // 正交相机
      const aspect = width / height;
      const d = 14; 
      const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
      
      const targetY = this.cubicMode === 'build' ? 6 : 0; 
      camera.position.set(12, 12 + targetY, 12); 
      camera.lookAt(0, targetY, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
      renderer.setSize(width, height); 
      renderer.setPixelRatio(window.devicePixelRatio); 
      
      // 开启 stencil 和 localClipping
      renderer.localClippingEnabled = true; 
      container.appendChild(renderer.domElement);

      // 全局裁剪平面 (初始化)
      const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
      this.threeApp.clippingPlane = clippingPlane;

      // 灯光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.7); 
      dirLight.position.set(10, 20, 10); 
      scene.add(dirLight);

      // 地面与网格 (积木模式显示)
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xdddddd); 
      scene.add(gridHelper);

      const planeGeometry = new THREE.PlaneGeometry(20, 20); 
      planeGeometry.rotateX(-Math.PI / 2);
      const planeMaterial = new THREE.MeshBasicMaterial({ visible: true, transparent: true, opacity: 0 }); 
      const plane = new THREE.Mesh(planeGeometry, planeMaterial); 
      plane.name = 'ground'; 
      scene.add(plane);
      
      if(this.cubicMode === 'exam') {
          gridHelper.visible = false;
          plane.visible = false;
      }

      // 控制器
      const controls = new OrbitControls(camera, renderer.domElement); 
      controls.enableDamping = true; 
      controls.dampingFactor = 0.05;
      controls.target.set(0, targetY, 0);
      controls.update();

      // 交互事件
      const raycaster = new THREE.Raycaster(); 
      const pointer = new THREE.Vector2();
      let downTime = 0;

      renderer.domElement.addEventListener('pointerdown', () => { downTime = Date.now(); });
      
      renderer.domElement.addEventListener('pointerup', (event) => {
        if (Date.now() - downTime < 200) {
          const rect = renderer.domElement.getBoundingClientRect(); 
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; 
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          this.handle3DClick(raycaster, pointer, scene, camera);
        }
      });

      this.threeApp.scene = scene;
      this.threeApp.camera = camera;
      this.threeApp.renderer = renderer;
      this.threeApp.controls = controls;
      this.threeApp.objects = [plane]; 

      // 如果是公考模式，立即加载图形
      if(this.cubicMode === 'exam') {
          this.loadExamShape();
      }

      this.animate3D();
    },

    animate3D() { 
      const { scene, camera, renderer, controls } = this.threeApp; 
      if (!renderer) return; 
      this.threeApp.animationId = requestAnimationFrame(this.animate3D); 
      controls.update(); 
      renderer.render(scene, camera); 
    },

    handle3DClick(raycaster, pointer, scene, camera) {
      if(this.cubicMode !== 'build') return; // 仅积木模式响应点击
      
      raycaster.setFromCamera(pointer, camera); 
      const intersects = raycaster.intersectObjects(this.threeApp.objects, false);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        
        if (this.isDeleteMode) {
          if (intersect.object.name !== 'ground') {
             scene.remove(intersect.object);
             const idx = this.threeApp.objects.indexOf(intersect.object);
             if (idx > -1) this.threeApp.objects.splice(idx, 1);
             intersect.object.geometry.dispose();
             intersect.object.material.dispose();
          }
        } else {
          // 放置逻辑
          const voxelPos = new THREE.Vector3().copy(intersect.point).addScaledVector(intersect.face.normal, 0.5);
          voxelPos.divideScalar(1).floor().multiplyScalar(1).addScalar(0.5);
          if (voxelPos.y < 0) return;
          this.addCubeAt(scene, voxelPos);
        }
      }
    },

    addCubeAt(scene, position) {
      const geometry = new THREE.BoxGeometry(1, 1, 1); 
      const material = new THREE.MeshLambertMaterial({ color: this.selectedColor }); 
      const cube = new THREE.Mesh(geometry, material); 
      cube.position.copy(position);
      
      const isDarkBlock = (this.selectedColor === '#333333');
      const edgeColor = isDarkBlock ? 0xffffff : 0x000000;
      const edges = new THREE.EdgesGeometry(geometry); 
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: edgeColor })); 
      cube.add(line);

      scene.add(cube); 
      this.threeApp.objects.push(cube);
    },

    clearCubes() { 
      const { scene, objects } = this.threeApp; 
      for (let i = objects.length - 1; i >= 0; i--) { 
        const obj = objects[i]; 
        if (obj.name !== 'ground' && obj.type !== 'Group') { // Group是公考切面对象，不清除
          scene.remove(obj); 
          obj.geometry.dispose(); 
          obj.material.dispose(); 
          objects.splice(i, 1); 
        } 
      } 
    },
    cleanup3D() { 
      if (this.threeApp.animationId) { cancelAnimationFrame(this.threeApp.animationId); } 
      if (this.threeApp.renderer) { 
        this.threeApp.renderer.dispose(); 
        const container = document.getElementById('three-container'); 
        if (container) container.innerHTML = ''; 
      } 
      this.threeApp = { scene: null, camera: null, renderer: null, controls: null, objects: [] }; 
    },

    // =================================================================
    // 立体切面训练模块
    // =================================================================
    changeSliceCategory() {
      this.sliceShapeIndex = 0;
      this.loadSliceShape();
    },
    selectSliceShape(index) {
      this.sliceShapeIndex = index;
      this.loadSliceShape();
    },
    toggleSliceTrainerPanel() {
      this.sliceTrainerPanelOpen = !this.sliceTrainerPanelOpen;
    },
    resetSliceTrainer() {
      this.sliceTrainerConfig = { constant: 1.5, x: 0.4, y: -0.8, z: 0.2 };
      this.updateSliceTrainerPlane();
    },
    updateSliceTrainerPlane() {
      if (!this.sliceApp.clippingPlane) return;
      const { x, y, z, constant } = this.sliceTrainerConfig;
      const normal = new THREE.Vector3(x, y, z).normalize();
      if (normal.length() === 0) normal.set(0, -1, 0);
      this.sliceApp.clippingPlane.normal.copy(normal);
      this.sliceApp.clippingPlane.constant = constant;
      this.updateSlicePlaneMesh();
    },
    updateSlicePlaneMesh() {
      if (!this.sliceApp.slicePlaneMesh || !this.sliceApp.clippingPlane) return;
      const plane = this.sliceApp.clippingPlane;
      const planePoint = new THREE.Vector3();
      plane.coplanarPoint(planePoint);
      this.sliceApp.slicePlaneMesh.position.copy(planePoint);
      const quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), plane.normal.clone().normalize());
      this.sliceApp.slicePlaneMesh.quaternion.copy(quat);
    },
    initSliceTrainer() {
      const container = document.getElementById('slice-trainer-container');
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#f6f6f9');
      scene.fog = new THREE.Fog('#f6f6f9', 20, 60);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(10, 10, 12);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.localClippingEnabled = true;
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 0.5, 0);
      controls.update();

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 20, 10);
      scene.add(dirLight);

      const gridHelper = new THREE.GridHelper(20, 20, 0xaaaaaa, 0xe2e2e2);
      gridHelper.position.y = -4;
      scene.add(gridHelper);

      const baseNormal = new THREE.Vector3(
        this.sliceTrainerConfig.x,
        this.sliceTrainerConfig.y,
        this.sliceTrainerConfig.z
      ).normalize();
      if (baseNormal.length() === 0) baseNormal.set(0, -1, 0);
      const clippingPlane = new THREE.Plane(baseNormal, this.sliceTrainerConfig.constant);
      const slicePlaneGeometry = new THREE.PlaneGeometry(20, 20);
      const slicePlaneMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const slicePlaneMesh = new THREE.Mesh(slicePlaneGeometry, slicePlaneMaterial);
      scene.add(slicePlaneMesh);

      this.sliceApp = { scene, camera, renderer, controls, animationId: null, mesh: null, clippingPlane, slicePlaneMesh };
      this.loadSliceShape();
      this.updateSliceTrainerPlane();
      this.animateSliceTrainer();
    },
    animateSliceTrainer() {
      const { scene, camera, renderer, controls } = this.sliceApp;
      if (!renderer) return;
      this.sliceApp.animationId = requestAnimationFrame(this.animateSliceTrainer);
      controls.update();
      renderer.render(scene, camera);
    },
    cleanupSliceTrainer() {
      if (this.sliceApp.animationId) cancelAnimationFrame(this.sliceApp.animationId);
      if (this.sliceApp.renderer) {
        this.sliceApp.renderer.dispose();
        const container = document.getElementById('slice-trainer-container');
        if (container) container.innerHTML = '';
      }
      this.sliceApp = { scene: null, camera: null, renderer: null, controls: null, animationId: null, mesh: null, clippingPlane: null, slicePlaneMesh: null };
      this.sliceTrainerPanelOpen = false;
    },
    loadSliceShape() {
      if (!this.sliceApp.scene) return;
      if (this.sliceApp.mesh) {
        this.sliceApp.scene.remove(this.sliceApp.mesh);
      }

      const shape = this.selectedSliceShape;
      const mesh = this.buildSliceMesh(shape);
      if (mesh) {
        this.sliceApp.mesh = mesh;
        this.sliceApp.scene.add(mesh);
      }
    },
    buildSliceMesh(shape) {
      if (!shape) return null;
      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        clippingPlanes: [this.sliceApp.clippingPlane]
      });
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x111111,
        clippingPlanes: [this.sliceApp.clippingPlane]
      });

      const buildMesh = (geometry) => {
        const mesh = new THREE.Mesh(geometry, material);
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, edgeMaterial);
        mesh.add(line);
        return mesh;
      };

      const group = new THREE.Group();
      const { type, params } = shape;

      const addPart = (geom, position = [0, 0, 0], rotation = [0, 0, 0]) => {
        const part = buildMesh(geom);
        part.position.set(...position);
        part.rotation.set(...rotation);
        group.add(part);
      };

      switch (type) {
        case 'box': {
          const geometry = new THREE.BoxGeometry(params.w, params.h, params.d);
          return buildMesh(geometry);
        }
        case 'roundedBox': {
          const geometry = new THREE.BoxGeometry(params.w, params.h, params.d, 4, 4, 4);
          geometry.computeVertexNormals();
          return buildMesh(geometry);
        }
        case 'prism': {
          const geometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height, params.segments);
          return buildMesh(geometry);
        }
        case 'cylinder': {
          const geometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, 32);
          return buildMesh(geometry);
        }
        case 'cone': {
          const geometry = new THREE.ConeGeometry(params.radius, params.height, 32);
          return buildMesh(geometry);
        }
        case 'frustum': {
          const geometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, 32);
          return buildMesh(geometry);
        }
        case 'sphere': {
          const geometry = new THREE.SphereGeometry(params.radius, 32, 24);
          return buildMesh(geometry);
        }
        case 'hemisphere': {
          const geometry = new THREE.SphereGeometry(params.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
          return buildMesh(geometry);
        }
        case 'ellipsoid': {
          const geometry = new THREE.SphereGeometry(params.radius, 32, 24);
          const mesh = buildMesh(geometry);
          mesh.scale.set(params.scale.x, params.scale.y, params.scale.z);
          return mesh;
        }
        case 'torus': {
          const geometry = new THREE.TorusGeometry(params.radius, params.tube, 16, 60);
          return buildMesh(geometry);
        }
        case 'pyramid': {
          const geometry = new THREE.ConeGeometry(params.radius, params.height, params.segments);
          return buildMesh(geometry);
        }
        case 'polyhedron': {
          const { name, radius } = params;
          if (name === 'tetrahedron') return buildMesh(new THREE.TetrahedronGeometry(radius));
          if (name === 'octahedron') return buildMesh(new THREE.OctahedronGeometry(radius));
          if (name === 'dodecahedron') return buildMesh(new THREE.DodecahedronGeometry(radius));
          return buildMesh(new THREE.IcosahedronGeometry(radius));
        }
        case 'capsule': {
          const geometry = new THREE.CapsuleGeometry(params.radius, params.length, 8, 16);
          return buildMesh(geometry);
        }
        case 'doubleCone': {
          const geometry = new THREE.ConeGeometry(params.radius, params.height, 32);
          const top = buildMesh(geometry);
          const bottom = buildMesh(geometry);
          top.position.y = params.height * 0.25;
          bottom.position.y = -params.height * 0.25;
          bottom.rotation.x = Math.PI;
          const combo = new THREE.Group();
          combo.add(top, bottom);
          return combo;
        }
        case 'tilted': {
          const base = this.buildSliceMesh({
            type: params.baseType,
            params
          });
          if (base) {
            base.rotation.z = params.tilt;
          }
          return base;
        }
        case 'stacked': {
          const levels = params.levels || 3;
          const totalHeight = params.height || 4;
          const stepHeight = totalHeight / levels;
          for (let i = 0; i < levels; i++) {
            const width = 3.8 - i * 0.6;
            const depth = 3.2 - i * 0.5;
            const geometry = new THREE.BoxGeometry(width, stepHeight, depth);
            addPart(geometry, [0, -2 + stepHeight * i + stepHeight / 2, 0]);
          }
          return group;
        }
        case 'composite': {
          switch (params.variant) {
            case 'l-shape': {
              addPart(new THREE.BoxGeometry(4, 2, 2), [-1, -1, 0]);
              addPart(new THREE.BoxGeometry(2, 4, 2), [1, 0, 0]);
              return group;
            }
            case 't-shape': {
              addPart(new THREE.BoxGeometry(4, 1.5, 2), [0, 0.8, 0]);
              addPart(new THREE.BoxGeometry(1.6, 3.8, 2), [0, -0.8, 0]);
              return group;
            }
            case 'notched': {
              addPart(new THREE.BoxGeometry(4, 3, 3), [0, 0, 0]);
              addPart(new THREE.BoxGeometry(2, 2, 3), [-1, 1, 0]);
              return group;
            }
            case 'offset-cylinder': {
              addPart(new THREE.CylinderGeometry(1.6, 1.6, 4, 32), [-1, 0, 0]);
              addPart(new THREE.CylinderGeometry(1.2, 1.2, 3, 32), [1, 0.5, 0]);
              return group;
            }
            case 'arch': {
              addPart(new THREE.BoxGeometry(5, 2.5, 2.5), [0, -0.5, 0]);
              addPart(new THREE.CylinderGeometry(1.3, 1.3, 2.5, 32), [0, -0.5, 0], [0, 0, Math.PI / 2]);
              return group;
            }
            case 'bridge': {
              addPart(new THREE.BoxGeometry(5, 1.6, 2.4), [0, 1, 0]);
              addPart(new THREE.BoxGeometry(1.2, 3.2, 2.4), [-1.9, -0.2, 0]);
              addPart(new THREE.BoxGeometry(1.2, 3.2, 2.4), [1.9, -0.2, 0]);
              return group;
            }
            case 'cone-cylinder': {
              addPart(new THREE.CylinderGeometry(2, 2, 2.4, 32), [0, -1.2, 0]);
              addPart(new THREE.ConeGeometry(2, 2.4, 32), [0, 1.2, 0]);
              return group;
            }
            case 'double-cylinder': {
              addPart(new THREE.CylinderGeometry(1.6, 1.6, 4, 32), [-1.2, 0, 0]);
              addPart(new THREE.CylinderGeometry(1.2, 1.2, 4, 32), [1.2, 0, 0]);
              return group;
            }
            case 'box-cylinder': {
              addPart(new THREE.BoxGeometry(3.6, 3.6, 2), [-0.8, 0, 0]);
              addPart(new THREE.CylinderGeometry(1.4, 1.4, 3.6, 32), [1.4, 0, 0]);
              return group;
            }
            case 'sphere-cap': {
              addPart(new THREE.SphereGeometry(2.4, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.7), [0, -0.2, 0]);
              addPart(new THREE.CylinderGeometry(1.6, 1.6, 1.2, 32), [0, -2.1, 0]);
              return group;
            }
            case 'slanted-cone': {
              const geometry = new THREE.ConeGeometry(2.2, 3.6, 32);
              addPart(geometry, [0, 0, 0], [0.3, 0, 0.2]);
              return group;
            }
            case 'offset-pyramid': {
              const base = buildMesh(new THREE.ConeGeometry(2.4, 3.6, 4));
              base.position.set(0.6, 0, 0);
              group.add(base);
              return group;
            }
            case 'slot': {
              addPart(new THREE.BoxGeometry(4.4, 1.6, 2.4), [0, 0.8, 0]);
              addPart(new THREE.BoxGeometry(1.6, 3.2, 2.4), [-1.4, -0.4, 0]);
              addPart(new THREE.BoxGeometry(1.6, 3.2, 2.4), [1.4, -0.4, 0]);
              return group;
            }
            case 'skew-prism': {
              const geometry = new THREE.BoxGeometry(4, 3, 3);
              addPart(geometry, [0, 0, 0], [0, 0.2, 0.3]);
              return group;
            }
            case 'half-cylinder': {
              const geometry = new THREE.CylinderGeometry(2, 2, 4, 32, 1, false, 0, Math.PI);
              addPart(geometry, [0, 0, 0], [0, 0, Math.PI / 2]);
              return group;
            }
            case 'half-cone': {
              const geometry = new THREE.ConeGeometry(2.2, 4, 32, 1, false, 0, Math.PI);
              addPart(geometry, [0, 0, 0], [0, 0, Math.PI / 2]);
              return group;
            }
            case 'half-torus': {
              const geometry = new THREE.TorusGeometry(2.2, 0.7, 16, 60, Math.PI);
              addPart(geometry, [0, 0, 0], [Math.PI / 2, 0, 0]);
              return group;
            }
            case 'wedge': {
              const geometry = new THREE.BoxGeometry(4, 3, 3);
              geometry.translate(0, 0.5, 0);
              addPart(geometry, [0, 0, 0], [0.35, 0, 0]);
              return group;
            }
            case 'offset-arch': {
              addPart(new THREE.BoxGeometry(4.5, 2.4, 2.4), [0.6, -0.4, 0]);
              addPart(new THREE.CylinderGeometry(1.1, 1.1, 2.4, 32), [-0.8, -0.4, 0], [0, 0, Math.PI / 2]);
              return group;
            }
            case 'cross': {
              addPart(new THREE.BoxGeometry(4, 1.4, 2), [0, 0, 0]);
              addPart(new THREE.BoxGeometry(1.4, 4, 2), [0, 0, 0]);
              return group;
            }
            case 'stair-arch': {
              addPart(new THREE.BoxGeometry(4.6, 1.6, 2.4), [0, 1.2, 0]);
              addPart(new THREE.BoxGeometry(3.2, 1.6, 2.4), [0, 0, 0]);
              addPart(new THREE.CylinderGeometry(1.2, 1.2, 2.4, 32), [0, -0.8, 0], [0, 0, Math.PI / 2]);
              return group;
            }
            default:
              return group;
          }
        }
        default:
          return null;
      }
    }
  }
}
</script>

<style scoped>
.homeStartBtn{ margin-top: 14px; }
.page { height: 100vh; min-height: 100vh; background: radial-gradient(at 0% 0%, hsla(210,100%,94%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(260,100%,94%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(300,100%,94%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(180,100%,94%,1) 0, transparent 50%); background-color: #f2f2f7; color: #1c1c1e; display: flex; flex-direction: column; max-width: 480px; margin: 0 auto; box-shadow: 0 0 40px rgba(0,0,0,0.08); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; position: relative; overflow: hidden; }
.mesh-bg { position: absolute; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.7; animation: float 10s infinite alternate ease-in-out; }
.orb-1 { width: 350px; height: 350px; background: #a2d2ff; top: -100px; left: -100px; }
.orb-2 { width: 300px; height: 300px; background: #e2c2ff; bottom: -50px; right: -80px; animation-delay: -3s; }
.orb-3 { width: 200px; height: 200px; background: #ffdfba; top: 40%; left: 30%; opacity:0.5; animation-delay: -6s; }
@keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(20px, 30px); } }
.toast-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; z-index: 999; pointer-events: none; }
.toast-content { background: rgba(0,0,0,0.7); backdrop-filter: blur(20px); color: #fff; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.wrap { padding: 20px 16px 24px; box-sizing: border-box; position: relative; z-index: 1; }
.homeWrap { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-top: max(60px, env(safe-area-inset-top)); padding-bottom: 40px; scrollbar-width: none; }
.homeWrap::-webkit-scrollbar { display: none; }
.full-height { flex: 1; display: flex; flex-direction: column; height: 100vh; }
.full-flex { flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 20px; }
.header-area { margin-bottom: 20px; text-align: center; flex-shrink: 0; }
.title { font-size: 34px; font-weight: 900; margin: 0 0 6px; color: #000; letter-spacing: -0.5px; }
.subtitle { font-size: 15px; color: #8e8e93; font-weight: 500; }
.glass-panel { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(50px) saturate(200%); -webkit-backdrop-filter: blur(50px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.5); }
.card { border-radius: 28px; padding: 16px; }
.rowLabel { font-size: 13px; font-weight: 700; color: #007aff; margin: 16px 0 8px 6px; opacity: 0.9; letter-spacing: 0.5px; }
.modeRow { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.modeItem { flex: 1 0 30%; padding: 14px 4px; border-radius: 16px; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.05); text-align: center; box-sizing: border-box; transition: all 0.1s; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.modeItem:active { transform: scale(0.97); }
.modeItem.active { background: #007aff; border-color: transparent; box-shadow: 0 8px 20px rgba(0,122,255,0.3); }
.modeTitle { display: block; font-size: 16px; font-weight: 700; color: #1c1c1e; }
.modeItem.active .modeTitle { color: #fff; }
button { border: none; outline: none; cursor: pointer; font-family: inherit; }
.btnPrimary { width: 100%; height: 50px; line-height: 50px; border-radius: 16px; background: linear-gradient(135deg, #34c759 0%, #28a745 100%); color: #fff; font-size: 20px; font-weight: 700; box-shadow: 0 10px 25px rgba(0,122,255,0.25); transition: transform 0.1s; }
.btnPrimary:active { transform: scale(0.98); opacity: 0.9; }
.btnGhost { width: 100%; height: 48px; line-height: 48px; border-radius: 16px; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.05); color: #007aff; font-size: 18px; font-weight: 600; box-shadow: 0 2px 10px rgba(0,0,0,0.02); transition: background 0.2s; }
.btnGhost:active { background: rgba(255,255,255,0.8); }
.btnHistory { width: 100%; height: 48px; line-height: 48px; margin-top: 9px; border-radius: 16px; background: rgba(88, 86, 214, 0.1); color: #5856d6; font-size: 20px; font-weight: 700; border: 1px solid rgba(88, 86, 214, 0.2); }
.btnHistory:active { background: rgba(88, 86, 214, 0.2); }
.btnDanger { width: 100%; height: 48px; line-height: 48px; border-radius: 16px; background: rgba(255, 59, 48, 0.1); color: #ff3b30; font-size: 20px; font-weight: 700; border: 1px solid rgba(255, 59, 48, 0.2); }
.btnDanger:active { background: rgba(255, 59, 48, 0.2); }
.main-action-btn { font-size: 20px !important; height: 54px !important; line-height: 54px !important; }
.gameRoot { min-height: 100vh; display: flex; flex-direction: column; padding-bottom: 0; }
.safe-top { padding-top: max(44px, env(safe-area-inset-top)); padding-bottom: 12px; height: auto; box-sizing: content-box; display: flex; align-items: center; gap: 12px; margin-bottom: 5px; }
.safe-header { padding-top: max(44px, env(safe-area-inset-top)); margin-bottom: 20px; }
.btnBack { width: 80px; height: 44px; line-height: 44px; border-radius: 14px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); font-weight: 700; font-size: 16px; margin: 0; color: #1c1c1e; backdrop-filter: blur(10px); }
.topStats { flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; color: #333; }
.glass-pill { background: rgba(255,255,255,0.5); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.03); backdrop-filter: blur(10px); }
.gameMain { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.qCard { text-align: center; padding: 30px 20px; }
.qText { font-size: 64px; font-weight: 800; margin-top: 0; color: #1c1c1e; letter-spacing: -2px; }
.qNote { margin-top: 8px; font-size: 16px; color: #8e8e93; font-weight: 500; }
.ansBox { margin-top: 20px; padding: 15px; border-radius: 20px; background: rgba(255,255,255,0.5); font-size: 44px; font-weight: 800; min-height: 44px; color: #007aff; box-shadow: inset 0 2px 6px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.03); }
.hint { margin-top: 15px; color: #8e8e93; font-size: 15px; font-weight: 600; }
.keypad { border-radius: 28px; overflow: hidden; clip-path: inset(0 0 0 0 round 28px); margin-bottom: calc( 6px + env(safe-area-inset-bottom)); }
.fnRow { display: flex; gap: 9px; margin-bottom: 9px; }
.kFn { flex: 1; height: 65px; line-height: 65px; border-radius: 14px; font-size: 20px; font-weight: 900; margin: 0; color: #fff; border: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(10px); }
.style-skip { background: #34c759; border-color: #248a3d; } 
.style-clear { background: #ff9500; border-color: #e08600; } 
.style-del { background: #ff3b30; border-color: #d63329; } 
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.k { width: 100%; height: 70px; line-height: 70px; border-radius: 14px; background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.03); font-size: 30px; font-weight: 900; margin: 0; color: #000; box-shadow: 0 4px 0 rgba(0,0,0,0.04); transition: all 0.1s; }
.k:active { transform: translateY(4px); box-shadow: none; background: #fff; }
.glass-key-confirm { background: #34c759; color: #fff; border:none; font-size: 28px; box-shadow: 0 4px 0 #248a3d; border-radius: 11px; }
.glass-key-confirm:active { background: #28a745; box-shadow: none; transform: translateY(4px); }
.k.wide { grid-column: 1 / 2; }
.k.wide2 { grid-column: 2 / 4; }
.chart-container { background: rgba(255,255,255,0.4); border-radius: 20px; padding: 15px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.5); }
.chart-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 4px; margin-bottom: 12px; background: rgba(118, 118, 128, 0.12); border-radius: 12px; scrollbar-width: none; }
.chart-tabs::-webkit-scrollbar { display: none; }
.chart-tab-item { flex-shrink: 0; font-size: 13px; padding: 6px 14px; border-radius: 8px; color: #666; cursor: pointer; font-weight: 600; border: 1px solid transparent; }
.chart-tab-item.active { background: #fff; color: #000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.resultScroll { width: 100%; flex: 1; overflow-y: auto; padding-right: 4px; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-weight: 600; white-space: nowrap; color: #1c1c1e; }
.hover-row:active { background: rgba(0,0,0,0.03); border-radius: 12px; }
.rowLeft { flex: 1; overflow: hidden; text-overflow: ellipsis; padding-right: 8px; }
.rowRight { flex-shrink: 0; display: flex; align-items: center; text-align: right; justify-content: flex-end; }
.qText-small { font-size: 52px !important; letter-spacing: -1px !important; white-space: nowrap; margin-top: 10px; overflow: visible; }

.cubic-ui { position: absolute; top: 0; left: 0; width: 100%; padding-left: 10px; padding-right: 10px; padding-bottom: 10px; padding-top: max(60px, calc(env(safe-area-inset-top) + 10px)); box-sizing: border-box; pointer-events: none; z-index: 10; display: flex; flex-direction: column; align-items: center; }
.cubic-ui > * { pointer-events: auto; }
.small-btn { width: auto !important; height: 36px !important; line-height: 36px !important; padding: 0 16px !important; font-size: 14px !important; }
.btnIcon { background: rgba(255,255,255,0.4); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 8px 12px; font-size: 14px; font-weight: 600; color: #333; transition: all 0.2s; }
.btnIcon.active { background: #007aff; color: white; box-shadow: 0 4px 10px rgba(0,122,255,0.3); }
.divider { width: 1px; height: 20px; background: rgba(0,0,0,0.1); margin: 0 5px; }
.tip-toast { margin-top: 10px; background: rgba(0,0,0,0.6); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; backdrop-filter: blur(4px); }

/* Color Dot */
.color-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
.color-dot:active { transform: scale(0.9); }
.color-dot.active { transform: scale(1.1); border-color: #fff; box-shadow: 0 0 0 2px rgba(0,0,0,0.1), inset 0 0 0 2px rgba(255,255,255,0.8); }

/* View Selector */
.view-selector { margin-top: 8px; padding: 6px; display: flex; gap: 6px; border-radius: 20px; flex-wrap: wrap; justify-content: center; }
.view-btn { background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: #333; }
.view-btn:active, .view-btn.active-view { background: #007aff; color: white; }

/* Slice Panel Styles */
.slice-panel {
  margin-top: 8px;
  padding: 12px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 90%;
  max-width: 300px;
}
.slice-trainer { background: #f6f6f9; }
.slice-trainer-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: max(60px, calc(env(safe-area-inset-top) + 10px)) 12px 14px;
  box-sizing: border-box;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}
.slice-trainer-ui > * { pointer-events: auto; }
.slice-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 18px;
  width: 95%;
}
.slice-select {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}
.slice-select select {
  border: none;
  background: rgba(255,255,255,0.7);
  border-radius: 10px;
  padding: 4px 8px;
  font-size: 12px;
}
.slice-shape-title {
  margin-left: auto;
  font-weight: 700;
  font-size: 13px;
  color: #111;
}
.slice-shape-list {
  width: 95%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  border-radius: 18px;
  max-height: 180px;
  overflow-y: auto;
}
.shape-chip {
  border: none;
  border-radius: 12px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255,255,255,0.6);
  color: #333;
}
.shape-chip.active {
  background: #111;
  color: #fff;
}
.slice-control-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  background: rgba(0,0,0,0.85);
  color: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: opacity 0.2s;
}
.slice-control-btn.dimmed {
  opacity: 0.45;
}
.trainer-panel {
  width: 95%;
  max-width: 320px;
}
.trainer-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
}
.slice-tip { margin-top: 0; }
.slice-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
.slice-label {
  width: 50px;
  text-align: right;
}
.slice-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: rgba(0,0,0,0.1);
  border-radius: 2px;
  outline: none;
}
.slice-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
</style>
