export const SOLID_SLICE_BANK = [
  {
    id: 'regular-1',
    label: '规则立体图形1',
    items: [
      { id: 'cube', label: '正方体', type: 'box', params: { w: 4, h: 4, d: 4 } },
      { id: 'rect-prism', label: '长方体', type: 'box', params: { w: 5, h: 3.5, d: 3 } },
      { id: 'tri-prism', label: '三棱柱', type: 'prism', params: { radius: 2.2, height: 4, segments: 3 } },
      { id: 'pent-prism', label: '五棱柱', type: 'prism', params: { radius: 2.4, height: 4, segments: 5 } },
      { id: 'hex-prism', label: '六棱柱', type: 'prism', params: { radius: 2.6, height: 4, segments: 6 } },
      { id: 'oct-prism', label: '八棱柱', type: 'prism', params: { radius: 2.4, height: 4, segments: 8 } },
      { id: 'cylinder', label: '圆柱体', type: 'cylinder', params: { radiusTop: 2.2, radiusBottom: 2.2, height: 4 } },
      { id: 'cone', label: '圆锥体', type: 'cone', params: { radius: 2.5, height: 4 } }
    ]
  },
  {
    id: 'regular-2',
    label: '规则立体图形2',
    items: [
      { id: 'sphere', label: '球体', type: 'sphere', params: { radius: 2.6 } },
      { id: 'hemisphere', label: '半球体', type: 'hemisphere', params: { radius: 2.6 } },
      { id: 'ellipsoid', label: '椭球体', type: 'ellipsoid', params: { radius: 2.2, scale: { x: 1.2, y: 0.8, z: 1 } } },
      { id: 'torus', label: '圆环体', type: 'torus', params: { radius: 2.2, tube: 0.7 } },
      { id: 'frustum', label: '圆台', type: 'frustum', params: { radiusTop: 1.4, radiusBottom: 2.6, height: 3.6 } },
      { id: 'square-pyramid', label: '四棱锥', type: 'pyramid', params: { radius: 2.5, height: 4, segments: 4 } },
      { id: 'pent-pyramid', label: '五棱锥', type: 'pyramid', params: { radius: 2.3, height: 4, segments: 5 } },
      { id: 'tri-pyramid', label: '三棱锥', type: 'pyramid', params: { radius: 2.2, height: 4, segments: 3 } }
    ]
  },
  {
    id: 'regular-3',
    label: '规则立体图形3',
    items: [
      { id: 'tetra', label: '四面体', type: 'polyhedron', params: { name: 'tetrahedron', radius: 2.6 } },
      { id: 'octa', label: '八面体', type: 'polyhedron', params: { name: 'octahedron', radius: 2.6 } },
      { id: 'dodeca', label: '十二面体', type: 'polyhedron', params: { name: 'dodecahedron', radius: 2.4 } },
      { id: 'icosa', label: '二十面体', type: 'polyhedron', params: { name: 'icosahedron', radius: 2.6 } },
      { id: 'capsule', label: '胶囊体', type: 'capsule', params: { radius: 1.6, length: 3.2 } },
      { id: 'oblique-cylinder', label: '斜圆柱', type: 'tilted', params: { baseType: 'cylinder', radiusTop: 2.2, radiusBottom: 2.2, height: 4, tilt: 0.4 } },
      { id: 'oblique-prism', label: '斜棱柱', type: 'tilted', params: { baseType: 'box', w: 4, h: 3.5, d: 3, tilt: 0.35 } },
      { id: 'truncated-cone', label: '截圆锥', type: 'frustum', params: { radiusTop: 0.9, radiusBottom: 2.5, height: 4 } }
    ]
  },
  {
    id: 'regular-4',
    label: '规则立体图形4',
    items: [
      { id: 'tri-prism-tall', label: '高三棱柱', type: 'prism', params: { radius: 2.1, height: 5.2, segments: 3 } },
      { id: 'hex-prism-flat', label: '扁六棱柱', type: 'prism', params: { radius: 2.6, height: 2.4, segments: 6 } },
      { id: 'thin-cylinder', label: '细圆柱', type: 'cylinder', params: { radiusTop: 1.4, radiusBottom: 1.4, height: 4.5 } },
      { id: 'wide-cylinder', label: '粗圆柱', type: 'cylinder', params: { radiusTop: 2.8, radiusBottom: 2.8, height: 3.2 } },
      { id: 'double-cone', label: '双圆锥', type: 'doubleCone', params: { radius: 2.4, height: 4.2 } },
      { id: 'torus-thin', label: '细圆环体', type: 'torus', params: { radius: 2.4, tube: 0.5 } },
      { id: 'torus-thick', label: '厚圆环体', type: 'torus', params: { radius: 2.2, tube: 0.9 } },
      { id: 'rounded-box', label: '圆角长方体', type: 'roundedBox', params: { w: 4.4, h: 3.4, d: 3, radius: 0.4 } }
    ]
  },
  {
    id: 'irregular-1',
    label: '不规则立体图形1',
    items: [
      { id: 'step-block', label: '阶梯体', type: 'stacked', params: { levels: 3 } },
      { id: 'l-block', label: 'L形组合体', type: 'composite', params: { variant: 'l-shape' } },
      { id: 't-block', label: 'T形组合体', type: 'composite', params: { variant: 't-shape' } },
      { id: 'notched-prism', label: '缺角棱柱', type: 'composite', params: { variant: 'notched' } },
      { id: 'offset-cylinder', label: '偏心圆柱', type: 'composite', params: { variant: 'offset-cylinder' } },
      { id: 'step-prism', label: '阶梯棱柱', type: 'stacked', params: { levels: 4, height: 3.8 } },
      { id: 'arch-block', label: '拱形体', type: 'composite', params: { variant: 'arch' } },
      { id: 'bridge-block', label: '桥洞体', type: 'composite', params: { variant: 'bridge' } }
    ]
  },
  {
    id: 'irregular-2',
    label: '不规则立体图形2',
    items: [
      { id: 'cone-cylinder', label: '圆锥+圆柱', type: 'composite', params: { variant: 'cone-cylinder' } },
      { id: 'cylinder-cylinder', label: '双圆柱组合', type: 'composite', params: { variant: 'double-cylinder' } },
      { id: 'box-cylinder', label: '方柱+圆柱', type: 'composite', params: { variant: 'box-cylinder' } },
      { id: 'sphere-cap', label: '球冠体', type: 'composite', params: { variant: 'sphere-cap' } },
      { id: 'cone-cap', label: '斜切圆锥', type: 'composite', params: { variant: 'slanted-cone' } },
      { id: 'offset-pyramid', label: '偏移棱锥', type: 'composite', params: { variant: 'offset-pyramid' } },
      { id: 'double-step', label: '双层阶梯体', type: 'stacked', params: { levels: 2, height: 4.2 } },
      { id: 'slot-block', label: '开槽体', type: 'composite', params: { variant: 'slot' } }
    ]
  },
  {
    id: 'irregular-3',
    label: '不规则立体图形3',
    items: [
      { id: 'skew-prism', label: '斜切棱柱', type: 'composite', params: { variant: 'skew-prism' } },
      { id: 'half-cylinder', label: '半圆柱', type: 'composite', params: { variant: 'half-cylinder' } },
      { id: 'half-cone', label: '半圆锥', type: 'composite', params: { variant: 'half-cone' } },
      { id: 'half-torus', label: '半圆环体', type: 'composite', params: { variant: 'half-torus' } },
      { id: 'wedge-prism', label: '楔形体', type: 'composite', params: { variant: 'wedge' } },
      { id: 'offset-arch', label: '偏置拱体', type: 'composite', params: { variant: 'offset-arch' } },
      { id: 'cross-block', label: '十字组合体', type: 'composite', params: { variant: 'cross' } },
      { id: 'stair-arch', label: '台阶拱体', type: 'composite', params: { variant: 'stair-arch' } }
    ]
  }
];
