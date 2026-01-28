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
              <button class="btnGhost glass-btn" style="height:48px; font-size:17px;" @click="toSelectDivisor">
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
           <div class="modeItem cubic-mode-item" @click="startCubicMode">
              <span class="modeTitle" style="color: #5856d6;">🧊 立体拼合 / 积木训练</span>
           </div>
        </div>

        <button class="btnPrimary btn-primary homeStartBtn" @click="startGame">开始练习</button>
        <button class="btnHistory main-action-btn" @click="openHistory">历史记录</button>
      </div>
    </div>

    <div v-if="viewState==='selectDivisor'" class="wrap homeWrap">
      <div class="header-area">
        <div class="title">选择除数</div>
        <div class="subtitle">点击下方数字开始练习商首位</div>
      </div>
      <div class="card glass-panel">
        <div class="grid" style="grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <button v-for="item in divisorList" :key="item" 
                  class="k glass-key" style="font-size:22px; height:56px;" 
                  @click="selectDivisorAndStart(item)">{{item}}</button>
        </div>
        <button class="btnGhost glass-btn main-action-btn" style="margin-top: 24px;" @click="goHome">返回主页</button>
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
        <div class="glass-panel" style="padding: 10px 14px; display: flex; gap: 10px; align-items: center; border-radius: 32px; max-width: 95%;">
          <button class="btnBack glass-btn small-btn" @click="quitCubicMode">🔙</button>
          <div class="divider"></div>
          
          <div style="display:flex; gap:10px;">
            <div 
              v-for="c in colors" 
              :key="c" 
              :style="{backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none'}"
              :class="['color-dot', selectedColor === c && !isDeleteMode ? 'active' : '']"
              @click="switchColor(c)"
            ></div>
          </div>

          <div class="divider"></div>

          <button :class="['btnIcon', isDeleteMode ? 'active' : '']" @click="toggleDeleteMode">🗑️</button>
          <button :class="['btnIcon', isSliceMode ? 'active' : '']" @click="toggleSliceMode">🔪</button>
          <button class="btnIcon" @click="clearCubes">🔄</button>
        </div>

        <div class="view-selector glass-panel">
          <button class="view-btn" @click="setCameraView('front')">正</button>
          <button class="view-btn" @click="setCameraView('back')">后</button>
          <button class="view-btn" @click="setCameraView('left')">左</button>
          <button class="view-btn" @click="setCameraView('right')">右</button>
          <button class="view-btn" @click="setCameraView('top')">俯</button>
          <button class="view-btn active-view" @click="setCameraView('iso')">轴</button>
        </div>

        <div v-if="isSliceMode" class="glass-panel slice-panel">
          <div class="slice-row">
            <span class="slice-label">位置</span>
            <input type="range" min="-10" max="15" step="0.1" v-model.number="sliceConfig.constant" @input="updateSlicePlane" class="slice-slider">
          </div>
          <div class="slice-row">
            <span class="slice-label">X倾斜</span>
            <input type="range" min="-1" max="1" step="0.1" v-model.number="sliceConfig.x" @input="updateSlicePlane" class="slice-slider">
          </div>
          <div class="slice-row">
            <span class="slice-label">Y倾斜</span>
            <input type="range" min="-1" max="1" step="0.1" v-model.number="sliceConfig.y" @input="updateSlicePlane" class="slice-slider">
          </div>
          <div class="slice-row">
            <span class="slice-label">Z倾斜</span>
            <input type="range" min="-1" max="1" step="0.1" v-model.number="sliceConfig.z" @input="updateSlicePlane" class="slice-slider">
          </div>
          <div style="text-align:center; margin-top:8px;">
             <button class="btnGhost glass-btn small-btn" style="height:32px; font-size:13px;" @click="resetSlice">重置切面</button>
          </div>
        </div>

        <div class="tip-toast" v-if="!isSliceMode">点击地面放置，点击方块叠加</div>
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
                  <div v-if="item.ok && item.exactAns" style="font-size:11px; color:#007aff; margin-top:2px;">
                      准:{{ item.exactAns }} 误:{{ item.errorRate }}
                  </div>
              </span>
            </div>
          </template>
        </div>
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px;">
          <div v-if="isHistoryReview" style="width:100%">
            <button class="btnPrimary btn-primary main-action-btn" @click="backToHistory">返回列表</button>
          </div>
          <div v-else style="width:100%; display: flex; flex-direction: column; gap: 12px;">
            <button class="btnGhost glass-btn main-action-btn" @click="startGame">再来一局</button>
            <button class="btnPrimary btn-primary main-action-btn" @click="goHome">返回主页</button>
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
           <button class="btnGhost small glass-btn" style="margin-top:10px; font-size:13px; height:32px;" @click="closeChart">收起图表</button>
        </div>
        <div v-else>
           <button class="btnGhost glass-btn" style="height:48px; font-size:16px; margin-bottom:15px; color:#007aff;" @click="initChart">
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
        
        <div style="margin-top: 15px; display:flex; flex-direction: column; gap:12px;">
          <button 
            v-if="historyList.length > 1000" 
            class="btnGhost glass-btn" 
            style="margin:0; height: 44px; font-size: 16px; color: #ff3b30;" 
            @click="clearOldest"
          >
            🗑️ 清理最早的 1000 条
          </button>

          <div style="display:flex; gap:12px;">
            <button class="btnDanger main-action-btn" style="margin:0; flex:1;" @click="clearHistory">清空</button>
            <button class="btnPrimary btn-primary main-action-btn" style="margin:0; flex:1;" @click="closeHistory">返回</button>
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
import { GAME_MODES, MODE_GROUPS } from './logic/gameModes';

// 逻辑部分保持不变
export default {
  data() {
    return {
      viewState: 'home', currentModeKey: 'train', selectedDivisor: 0,
      pool: [], idx: 0, current: null, input: '', uiHint: 'Ready?', totalText: '0:00.0', progressText: '1/81', qText: '—', leftText: '跳过', 
      totalStartTs: 0, qStartTs: 0, timer: null, trainWrong: 0, trainSkip: 0, curWrongTries: 0, trainLog: [], results: [], 
      historyList: [], showChart: false, chartInstance: null, chartTab: '', availableModes: [], isHistoryReview: false,
      toast: { show: false, title: '' },
      modeGroups: MODE_GROUPS, divisorList: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
      
      isDeleteMode: false,
      isSliceMode: false,
      colors: ['#007aff', '#ff9500', '#333333', '#ffffff'], 
      selectedColor: '#007aff',
      
      sliceConfig: {
        constant: 5,
        x: 0,
        y: -1, 
        z: 0
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
    isSmallFont() { return this.activeConfig.isSmallFont || (this.currentModeKey === 'fourSum' || this.currentModeKey === 'tripleMix'); }
  },
  mounted() {
    const history = localStorage.getItem('calc_history');
    if(history) { try { this.historyList = JSON.parse(history); } catch(e){ console.error(e) } }
    window.addEventListener('resize', () => { if(this.chartInstance) this.chartInstance.resize(); });
  },
  beforeUnmount() {
    this.cleanup3D(); 
  },
  created() {
    this.threeApp = { scene: null, camera: null, renderer: null, controls: null, raycaster: null, pointer: null, objects: [], animationId: null, clippingPlane: null, planeHelper: null };
  },
  methods: {
    now() { return Date.now(); },
    getModeConfig(key) { return GAME_MODES[key] || { name: key }; },
    setMode(mode){ this.currentModeKey = mode; },
    toSelectDivisor(){ this.viewState = 'selectDivisor'; },
    selectDivisorAndStart(d){ this.currentModeKey = 'firstSpec'; this.selectedDivisor = d; this.startGame(); },
    showToast(title) { this.toast.title = title; this.toast.show = true; setTimeout(() => { this.toast.show = false; }, 1500); },
    
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
          extraInfo = {
              exactAns: exactStr,
              errorRate: (error * 100).toFixed(2) + '%'
          };
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

    startCubicMode() { this.viewState = 'cubic'; this.$nextTick(() => { this.initThree(); }); },
    quitCubicMode() { this.cleanup3D(); this.viewState = 'home'; this.isSliceMode = false; },
    switchColor(c) { 
      this.selectedColor = c; 
      this.isDeleteMode = false; 
    },
    toggleDeleteMode() {
      this.isDeleteMode = !this.isDeleteMode;
      if(this.isDeleteMode) this.isSliceMode = false;
    },
    toggleSliceMode() {
      this.isSliceMode = !this.isSliceMode;
      if (this.isSliceMode) {
        this.isDeleteMode = false;
        if(this.threeApp.planeHelper) this.threeApp.planeHelper.visible = true;
        this.threeApp.renderer.localClippingEnabled = true;
      } else {
        if(this.threeApp.planeHelper) this.threeApp.planeHelper.visible = false;
        this.threeApp.renderer.localClippingEnabled = false;
      }
    },
    updateSlicePlane() {
      if (!this.threeApp.clippingPlane) return;
      const { x, y, z, constant } = this.sliceConfig;
      const normal = new THREE.Vector3(x, y, z).normalize();
      if (normal.length() === 0) normal.set(0, -1, 0); 
      this.threeApp.clippingPlane.normal.copy(normal);
      this.threeApp.clippingPlane.constant = constant;
    },
    resetSlice() {
      this.sliceConfig = { constant: 5, x: 0, y: -1, z: 0 };
      this.updateSlicePlane();
    },
    setCameraView(type) {
      if (!this.threeApp.camera || !this.threeApp.controls) return;
      const { camera, controls } = this.threeApp;
      const dist = 20; 
      const targetY = 6; 
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
      const aspect = width / height;
      const d = 18; 
      const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
      const targetY = 6; 
      camera.position.set(12, 12 + targetY, 12); 
      camera.lookAt(0, targetY, 0);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
      renderer.setSize(width, height); 
      renderer.setPixelRatio(window.devicePixelRatio); 
      renderer.localClippingEnabled = false; 
      container.appendChild(renderer.domElement);
      const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 5);
      const planeHelper = new THREE.PlaneHelper(clippingPlane, 20, 0xff0000);
      planeHelper.visible = false;
      scene.add(planeHelper);
      this.threeApp.clippingPlane = clippingPlane;
      this.threeApp.planeHelper = planeHelper;
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.7); 
      dirLight.position.set(10, 20, 10); 
      scene.add(dirLight);
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xdddddd); 
      scene.add(gridHelper);
      const planeGeometry = new THREE.PlaneGeometry(20, 20); 
      planeGeometry.rotateX(-Math.PI / 2);
      const planeMaterial = new THREE.MeshBasicMaterial({ visible: true, transparent: true, opacity: 0 }); 
      const plane = new THREE.Mesh(planeGeometry, planeMaterial); 
      plane.name = 'ground'; 
      scene.add(plane);
      const controls = new OrbitControls(camera, renderer.domElement); 
      controls.enableDamping = true; 
      controls.dampingFactor = 0.05;
      controls.target.set(0, targetY, 0);
      controls.update();
      const raycaster = new THREE.Raycaster(); 
      const pointer = new THREE.Vector2();
      let downTime = 0;
      renderer.domElement.addEventListener('pointerdown', () => { downTime = Date.now(); });
      renderer.domElement.addEventListener('pointerup', (event) => {
        if (Date.now() - downTime < 200) {
          const rect = renderer.domElement.getBoundingClientRect(); 
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; 
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          this.handle3DClick(raycaster, pointer, scene, camera, plane);
        }
      });
      this.threeApp.scene = scene;
      this.threeApp.camera = camera;
      this.threeApp.renderer = renderer;
      this.threeApp.controls = controls;
      this.threeApp.objects = [plane]; 
      this.updateSlicePlane();
      this.animate3D();
    },
    animate3D() { 
      const { scene, camera, renderer, controls } = this.threeApp; 
      if (!renderer) return; 
      this.threeApp.animationId = requestAnimationFrame(this.animate3D); 
      controls.update(); 
      renderer.render(scene, camera); 
    },
    handle3DClick(raycaster, pointer, scene, camera, plane) {
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
          const voxelPos = new THREE.Vector3().copy(intersect.point).addScaledVector(intersect.face.normal, 0.5);
          voxelPos.divideScalar(1).floor().multiplyScalar(1).addScalar(0.5);
          if (voxelPos.y < 0) return;
          this.addCubeAt(scene, voxelPos);
        }
      }
    },
    addCubeAt(scene, position) {
      const geometry = new THREE.BoxGeometry(1, 1, 1); 
      const material = new THREE.MeshLambertMaterial({ 
        color: this.selectedColor,
        polygonOffset: true,
        polygonOffsetFactor: 1, 
        polygonOffsetUnits: 1,
        clippingPlanes: [this.threeApp.clippingPlane] 
      }); 
      const cube = new THREE.Mesh(geometry, material); 
      cube.position.copy(position);
      const isDarkBlock = (this.selectedColor === '#333333');
      const edgeColor = isDarkBlock ? 0xffffff : 0x000000;
      const edges = new THREE.EdgesGeometry(geometry); 
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: edgeColor,
        clippingPlanes: [this.threeApp.clippingPlane] 
      });
      const line = new THREE.LineSegments(edges, lineMaterial); 
      cube.add(line);
      scene.add(cube); 
      this.threeApp.objects.push(cube);
    },
    clearCubes() { 
      const { scene, objects } = this.threeApp; 
      for (let i = objects.length - 1; i >= 0; i--) { 
        const obj = objects[i]; 
        if (obj.name !== 'ground') { 
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
    }
  }
}
</script>

<style scoped>
.page { 
  height: 100vh; 
  background-color: #f2f2f7; 
  display: flex; 
  flex-direction: column; 
  max-width: 480px; 
  margin: 0 auto; 
  box-shadow: 0 0 60px rgba(0,0,0,0.05); 
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
  position: relative; 
  overflow: hidden; 
}

/* 动态流动背景 */
.mesh-bg { position: absolute; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; }
.orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.65; animation: float 8s infinite alternate ease-in-out; }
.orb-1 { width: 400px; height: 400px; background: #a2d2ff; top: -120px; left: -120px; }
.orb-2 { width: 350px; height: 350px; background: #e2c2ff; bottom: -80px; right: -100px; animation-delay: -3s; }
.orb-3 { width: 250px; height: 250px; background: #ffdfba; top: 35%; left: 20%; opacity:0.4; animation-delay: -5s; }

.toast-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; z-index: 999; pointer-events: none; }
.toast-content { background: rgba(0,0,0,0.6); backdrop-filter: blur(25px); color: #fff; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }

.wrap { padding: 20px 18px 24px; box-sizing: border-box; position: relative; z-index: 1; }
.homeWrap { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-top: max(60px, env(safe-area-inset-top)); padding-bottom: 40px; scrollbar-width: none; }
.homeWrap::-webkit-scrollbar { display: none; }

.full-height { flex: 1; display: flex; flex-direction: column; height: 100vh; }
.full-flex { flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 20px; }

.header-area { margin-bottom: 24px; text-align: center; flex-shrink: 0; }
.title { font-size: 36px; font-weight: 900; margin: 0 0 6px; color: #1d1d1f; letter-spacing: -0.5px; }
.subtitle { font-size: 15px; color: var(--color-text-secondary); font-weight: 500; }

.card { padding: 20px; }
.rowLabel { font-size: 13px; font-weight: 700; color: var(--color-primary); margin: 20px 0 10px 6px; opacity: 0.8; letter-spacing: 0.5px; text-transform: uppercase; }

.modeRow { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.modeItem { 
  flex: 1 0 30%; 
  padding: 16px 4px; 
  border-radius: 20px; 
  background: rgba(255,255,255,0.45); 
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.4); 
  text-align: center; 
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); 
  cursor: pointer; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.01); 
}
.modeItem:active { transform: scale(0.96); }
.modeItem.active { 
  background: rgba(255,255,255,0.75); 
  box-shadow: 0 8px 24px rgba(0,122,255,0.15), inset 0 0 0 1px rgba(0,122,255,0.2);
}
.modeTitle { display: block; font-size: 16px; font-weight: 600; color: #1d1d1f; }
.cubic-mode-item {
  flex: 1 0 100%;
  background: rgba(88, 86, 214, 0.1); 
  border: 1px solid rgba(88, 86, 214, 0.15);
}

.homeStartBtn{ margin-top: 24px; height: 56px; border-radius: 22px; font-size: 21px; }
.main-action-btn { height: 56px !important; border-radius: 22px !important; font-size: 19px !important; }

.gameRoot { min-height: 100vh; display: flex; flex-direction: column; padding-bottom: 0; }
.safe-top { padding-top: max(44px, env(safe-area-inset-top)); padding-bottom: 12px; height: auto; box-sizing: content-box; display: flex; align-items: center; gap: 12px; margin-bottom: 5px; }
.safe-header { padding-top: max(44px, env(safe-area-inset-top)); margin-bottom: 20px; }

.btnBack { width: 88px; height: 44px; line-height: 44px; border-radius: 16px; font-weight: 600; font-size: 16px; color: #1c1c1e; }
.topStats { flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; color: #333; }
.glass-pill { padding: 8px 16px; font-size: 14px; color: rgba(0,0,0,0.7); }
.timer { color: var(--color-primary); }

.gameMain { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 10px 0; }
.qCard { text-align: center; padding: 40px 20px; border-radius: 32px; }
.qText { font-size: 72px; font-weight: 800; margin: 0; color: #000; letter-spacing: -3px; line-height: 1.1; }
.qText-small { font-size: 56px !important; letter-spacing: -2px !important; }
.qNote { margin-top: 8px; font-size: 16px; color: var(--color-text-secondary); font-weight: 500; }
.ansBox { margin-top: 24px; padding: 16px; font-size: 48px; font-weight: 800; min-height: 80px; display:flex; align-items:center; justify-content:center; color: var(--color-primary); }
.hint { margin-top: 20px; color: var(--color-text-secondary); font-size: 15px; font-weight: 600; min-height: 20px; }

.keypad { border-radius: 32px; padding: 16px; margin-bottom: calc(10px + env(safe-area-inset-bottom)); }
.fnRow { display: flex; gap: 10px; margin-bottom: 10px; }
.kFn { flex: 1; height: 60px; border-radius: 18px; font-size: 19px; font-weight: 700; border: none; backdrop-filter: blur(15px); }
.style-skip { background: rgba(52, 199, 89, 0.15); color: #207d33; } 
.style-clear { background: rgba(255, 149, 0, 0.15); color: #b86e00; } 
.style-del { background: rgba(255, 59, 48, 0.15); color: #cd2b22; } 

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.k { width: 100%; height: 72px; border-radius: 20px; font-size: 32px; font-weight: 500; color: #000; }
.glass-key-confirm { background: rgba(52, 199, 89, 0.25); color: #0f5120; border: 1px solid rgba(52, 199, 89, 0.2); font-weight: 700; font-size: 24px; }
.glass-key-confirm:active { background: rgba(52, 199, 89, 0.4); }

.chart-container { border-radius: 24px; padding: 16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.4); }
.chart-tabs { display: flex; gap: 6px; overflow-x: auto; padding: 4px; margin-bottom: 12px; background: rgba(118, 118, 128, 0.12); border-radius: 12px; }
.chart-tab-item { flex-shrink: 0; font-size: 13px; padding: 6px 14px; border-radius: 8px; color: #666; cursor: pointer; font-weight: 600; }
.chart-tab-item.active { background: #fff; color: #000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.resultScroll { width: 100%; flex: 1; overflow-y: auto; padding-right: 4px; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-weight: 600; color: #1c1c1e; }
.rowLeft { flex: 1; overflow: hidden; text-overflow: ellipsis; padding-right: 8px; }
.rowRight { flex-shrink: 0; display: flex; align-items: center; text-align: right; justify-content: flex-end; }

/* 3D Mode UI */
.cubic-ui { position: absolute; top: 0; left: 0; width: 100%; padding: 0 10px; box-sizing: border-box; pointer-events: none; z-index: 10; display: flex; flex-direction: column; align-items: center; }
.cubic-ui > * { pointer-events: auto; margin-bottom: 10px; }
.small-btn { padding: 0 16px !important; font-size: 14px !important; height: 36px !important; border-radius: 12px !important; }
.btnIcon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); }
.btnIcon.active { background: var(--color-primary); color: white; box-shadow: 0 4px 12px rgba(0,122,255,0.3); }
.divider { width: 1px; height: 20px; background: rgba(0,0,0,0.1); margin: 0 4px; }
.tip-toast { background: rgba(0,0,0,0.6); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; backdrop-filter: blur(10px); }

.color-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s; cursor: pointer; }
.color-dot.active { transform: scale(1.15); border-color: #fff; box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }

.view-selector { padding: 8px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; border-radius: 20px; }
.view-btn { background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 6px 16px; font-size: 13px; font-weight: 600; color: #333; }
.view-btn.active-view { background: var(--color-primary); color: white; border-color: transparent; }

.slice-panel { padding: 16px; display: flex; flex-direction: column; gap: 10px; width: 90%; max-width: 320px; border-radius: 24px; }
.slice-row { display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; color: #333; }
.slice-label { width: 50px; text-align: right; opacity: 0.7; }
.slice-slider { flex: 1; -webkit-appearance: none; height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; }
.slice-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 0.5px solid rgba(0,0,0,0.1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
</style>