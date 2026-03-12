/**
 * ============================================================================
 *  Datum 3D â€” CesiumJS Viewer
 *  
 *  Open source 3D Tiles viewer. No Cesium Ion required.
 *  Loads tileset.json from /tiles/ and displays models at their 
 *  correct geographic positions using ECEF transform matrices.
 * ============================================================================
 */

// â”€â”€â”€ Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CONFIG = {
  // Tileset URL â€” relative to the server root
  tilesetUrl: './tiles/tileset.json',

  // Basemap / imagery provider
  // - osm: OpenStreetMap raster tiles
  // - esri-world-imagery: ArcGIS Online World Imagery (satellite)
  // - esri-world-street: ArcGIS Online World Street Map
  basemap: 'esri-world-imagery', // 'esri-world-imagery', 'esri-world-street', 'osm'

  // Cesium Ion access token â€” ONLY needed for Cesium World Terrain.
  // Get a free token at https://cesium.com/ion/ (no payment required).
  // If you leave this empty, a simple ellipsoid (no terrain) will be used.
  cesiumIonToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YjJkMWY0Yi1iYWY0LTQzN2YtYmRjNS1lMjI3YWNlNjg0YTIiLCJpZCI6NDAxMTY3LCJpYXQiOjE3NzMxMjQzNDN9.VCxXEJpbmru_EdzEKbyeHeyTrQ-6h-MSX_Cue5pOiI8',

  // Alternative open terrain providers (no token needed):
  // - Cesium World Terrain requires Ion token
  // - Maptiler: free tier available at https://www.maptiler.com/
  // - Open-source: use Quantized Mesh tiles from your own server
  terrainProvider: 'cesium-world', // 'cesium-world', 'maptiler', 'ellipsoid'
  maptilerKey: '', // Only if using Maptiler terrain

  // Default camera position (WGS84)
  // Update these to match your model's location!
  defaultCamera: {
    longitude: 49.930,  // degrees East â€” Baku, Caspian Sea area
    latitude: 40.581,   // degrees North
    height: 1500,       // meters above ground
    heading: 0,         // degrees from North
    pitch: -45,         // degrees (negative = looking down)
  },

  // Style
  backgroundColor: '#0a0a14',
  enableShadows: false,
  enableAtmosphere: true,
};


// === 3D Layer Groups (ArcGIS Pro style) =====================================
// Keep the 9 top-level groups in the same order/names as the screenshots.
// `uri` must match the `content.uri` entries in tiles/tileset.json.
const LAYER_GROUPS = [
  {
    id: 'caspian_dream',
    name: 'Caspian Dream',
    items: [
      { uri: 'testcaspian_Import3D_Project_CopyFeatures.glb' },
      // Extra small ground file found in tileset.json (kept here so it is controllable)
      { uri: 'yer_Import3DFiles.glb', defaultVisible: false },
    ],
  },
  {
    id: 'premium_residence',
    name: 'Premium Residence',
    items: [
      { uri: 'prland_Import3DFiles1.glb' },
      { uri: 'prbina1_Import3DFiles.glb' },
      { uri: 'prbina2_Import3DFiles.glb' },
      { uri: 'test_Import3DFiles.glb' },
    ],
  },
  {
    id: 'casino',
    name: 'Casino',
    items: [
      { uri: 'casino_Import3DFiles_Project_CopyFeatures.glb' },
      { uri: 'rixos_Import3DFiles_Project_CopyFeatures.glb' },
      { uri: 'casino_land_Import3D_Project_CopyFeatures.glb' },
    ],
  },
  {
    id: 'arabian_ranches',
    name: 'Arabian Ranches',
    items: [
      { uri: 'arabian_area_Import3DFiles.glb' },
      { uri: 'Arabian_b1_Import3DFiles.glb' },
      { uri: 'Arabian_B2_Import3DFiles.glb' },
      { uri: 'Arabian_b3_Import3DFiles.glb' },
      { uri: 'Arabian_b4_Import3DFiles.glb' },
      { uri: 'Arabian_b5_Import3DFiles.glb' },
      { uri: 'Arabian_b6_Import3DFiles.glb' },
      { uri: 'Arabian_b7_Import3DFiles.glb' },
      { uri: 'Arabian_b7_1_Import3DFiles.glb' },
      { uri: 'Arabian_b7_2_Import3DFiles.glb' },
      { uri: 'Arabian_b7_3_Import3DFiles.glb' },
      { uri: 'Arabian_b8_Import3DFiles.glb' },
      { uri: 'Arabian_b9_Import3DFiles.glb' },
      { uri: 'Arabian_b10_Import3DFiles.glb' },
    ],
  },
  {
    id: 'skypark',
    name: 'Skypark',
    items: [
      { uri: 'Skypark_Import3DFile_Project.glb' },
      { uri: 'Skymall_Import3DFile_Project.glb' },
      // Extra version present in tileset.json; default hidden to avoid double-rendering.
      { uri: 'Skypark_compressed.glb', defaultVisible: false },
    ],
  },
  {
    id: 'digital',
    name: 'Digital',
    items: [
      { uri: 'Digital_land_Import3DFiles.glb' },
    ],
  },
  {
    id: 'monaco',
    name: 'Monaco',
    items: [
      { uri: 'Monaco_landsca_Import3DFiles.glb' },
      { uri: 'Monaco_B1_Import3DFiles.glb' },
      { uri: 'Monaco_B1_Import3DFiles1.glb' },
      { uri: 'Monaco_B1_Import3DFiles2.glb' },
      { uri: 'Monaco_B4_Import3DFiles.glb' },
      { uri: 'Monaco_B4_Import3DFiles1.glb' },
      { uri: 'Monaco_B4_Import3DFiles2.glb' },
    ],
  },
  {
    id: 'harbor',
    name: 'Harbor',
    items: [
      { uri: 'THREE_PLAN_Import3DFiles.glb' },
    ],
  },
  {
    id: 'paradise_prime_2',
    name: 'Paradise_Prime_2',
    items: [
      { uri: 'Paradise_Import3DFiles.glb' },
      { uri: 'paradise_b2_Import3DFiles.glb' },
      { uri: 'Paradise_area_Import3DFiles.glb' },
      { uri: 'prime_resd_Import3DFiles.glb' },
      { uri: 'prime_resd_Import3DFiles1.glb' },
      { uri: 'prime_resd1_Import3DFiles.glb' },
      { uri: 'prime_resd1_Import3DFiles1.glb' },
    ],
  },
];

function basenameUri(uri) {
  if (!uri) return '';
  const s = String(uri);
  const idx = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
  return idx >= 0 ? s.slice(idx + 1) : s;
}

function labelFromUri(uri) {
  const base = basenameUri(uri);
  return base.toLowerCase().endsWith('.glb') ? base.slice(0, -4) : base;
}

function safeToggleShow(obj, visible) {
  // Attempt the common .show paths without hard-coding a single Cesium internal type.
  try { if (obj && 'show' in obj) obj.show = !!visible; } catch (_) { /* ignore */ }
  try { if (obj && obj.model && 'show' in obj.model) obj.model.show = !!visible; } catch (_) { /* ignore */ }
  try { if (obj && obj._model && 'show' in obj._model) obj._model.show = !!visible; } catch (_) { /* ignore */ }
}

function flyToBoundingSphere(viewer, sphere) {
  if (!viewer || !sphere) return;
  const range = Math.max(30, sphere.radius * 2.5);
  viewer.camera.flyToBoundingSphere(sphere, {
    duration: 2.0,
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(-45),
      range
    ),
  });
}

// â”€â”€â”€ Initialize Viewer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function setLoadingStatus(msg) {
  const el = document.getElementById('loading-status');
  if (el) el.textContent = msg;
}

async function createBasemapProvider() {
  if (CONFIG.basemap === 'esri-world-imagery' || CONFIG.basemap === 'esri-world-street') {
    const url = (CONFIG.basemap === 'esri-world-imagery')
      ? 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer';

    if (Cesium.ArcGisMapServerImageryProvider && typeof Cesium.ArcGisMapServerImageryProvider.fromUrl === 'function') {
      return Cesium.ArcGisMapServerImageryProvider.fromUrl(url);
    }
    if (Cesium.ArcGisMapServerImageryProvider) {
      return new Cesium.ArcGisMapServerImageryProvider({ url });
    }
    throw new Error('ArcGisMapServerImageryProvider is not available in this CesiumJS build');
  }

  // Default: OpenStreetMap (no API keys needed)
  return new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  });
}

async function initViewer() {
  setLoadingStatus('Configuring CesiumJS...');

  // Set Ion token if provided (for Cesium World Terrain)
  if (CONFIG.cesiumIonToken) {
    Cesium.Ion.defaultAccessToken = CONFIG.cesiumIonToken;
  }

  // Terrain provider
  let terrainProvider;
  if (CONFIG.terrainProvider === 'cesium-world' && CONFIG.cesiumIonToken) {
    setLoadingStatus('Loading Cesium World Terrain...');
    try {
      terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
    } catch (e) {
      console.warn('Cesium World Terrain failed, falling back to ellipsoid:', e);
      terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  } else if (CONFIG.terrainProvider === 'maptiler' && CONFIG.maptilerKey) {
    setLoadingStatus('Loading Maptiler Terrain...');
    try {
      terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
        `https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/?key=${CONFIG.maptilerKey}`,
        { requestVertexNormals: true }
      );
    } catch (e) {
      console.warn('Maptiler terrain failed, falling back to ellipsoid:', e);
      terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  } else {
    terrainProvider = new Cesium.EllipsoidTerrainProvider();
  }

  // Create viewer
  setLoadingStatus('Creating 3D viewer...');

  // Imagery / basemap
  let imageryProvider;
  try {
    imageryProvider = await createBasemapProvider();
  } catch (e) {
    console.warn('Basemap failed, falling back to OpenStreetMap:', e);
    imageryProvider = new Cesium.OpenStreetMapImageryProvider({
      url: 'https://tile.openstreetmap.org/',
    });
  }


  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: terrainProvider,
    baseLayerPicker: true,
    geocoder: false,
    homeButton: true,
    sceneModePicker: false,
    navigationHelpButton: true,
    animation: false,
    timeline: false,
    fullscreenButton: true,
    vrButton: false,
    infoBox: true,
    selectionIndicator: true,
    shadows: CONFIG.enableShadows,
    shouldAnimate: true,
});

  // Scene settings
  const scene = viewer.scene;
  scene.globe.enableLighting = true;
  scene.fog.enabled = true;
  scene.fog.density = 0.0002;
  scene.skyAtmosphere.show = CONFIG.enableAtmosphere;

  // Background color
  scene.backgroundColor = Cesium.Color.fromCssColorString(CONFIG.backgroundColor);

  // Depth test against terrain
  scene.globe.depthTestAgainstTerrain = true;

  // Anti-aliasing
  if (scene.postProcessStages) {
    scene.postProcessStages.fxaa.enabled = true;
  }

  return viewer;
}


// â”€â”€â”€ Load 3D Tiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadTileset(viewer, url) {
  setLoadingStatus('Loading 3D Tiles...');

  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
      // Performance settings
      maximumScreenSpaceError: 16,        // Lower = higher quality
      maximumMemoryUsage: 512,            // MB
      dynamicScreenSpaceError: true,
      dynamicScreenSpaceErrorDensity: 0.00278,
      dynamicScreenSpaceErrorFactor: 4.0,
      
      // Skip LOD levels for faster loading
      skipLevelOfDetail: true,
      immediatelyLoadDesiredLevelOfDetail: false,
      loadSiblings: false,
      
      // Show bounding volumes for debugging (disable in production)
      debugShowBoundingVolume: false,
      debugShowContentBoundingVolume: false,
      debugWireframe: false,
    });

    viewer.scene.primitives.add(tileset);

    console.log('Tileset loaded successfully');
    console.log('  Root transform:', tileset.root?.transform);
    console.log('  Bounding sphere:', tileset.boundingSphere);

    return tileset;

  } catch (error) {
    console.error('Failed to load tileset:', error);
    setLoadingStatus(`Error: ${error.message}`);
    
    // Show error in panel
    const tilesetList = document.getElementById('tileset-list');
    if (tilesetList) {
      tilesetList.innerHTML = `<p style="color: #ff6b6b; font-size: 0.75rem;">
        Failed to load tileset.<br/>
        Check that tiles/tileset.json exists and contains valid 3D Tiles data.<br/>
        Error: ${error.message}
      </p>`;
    }
    
    return null;
  }
}


// === Layer Tree Controller ==================================================

async function buildTilesetUriIndex(tileset, tilesetUrl) {
  // Map `content.uri` -> Cesium3DTile by reading tileset.json and matching root
  // children by index (our tileset is a 1-level list: root.children).
  const tileByUri = new Map();
  const uriByTile = new Map();

  if (!tileset || !tileset.root) return { tileByUri, uriByTile };

  try {
    const resp = await fetch(tilesetUrl, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`fetch ${tilesetUrl} failed: ${resp.status}`);
    const json = await resp.json();

    const jsonChildren = (json && json.root && json.root.children) ? json.root.children : [];
    const tileChildren = tileset.root.children || [];
    const n = Math.min(jsonChildren.length, tileChildren.length);

    for (let i = 0; i < n; i++) {
      const uri = basenameUri(jsonChildren[i] && jsonChildren[i].content && jsonChildren[i].content.uri);
      if (!uri) continue;
      const tile = tileChildren[i];
      if (!tile) continue;
      tileByUri.set(uri, tile);
      uriByTile.set(tile, uri);
    }
  } catch (e) {
    console.warn('Failed to build tileset uri index:', e);
  }

  return { tileByUri, uriByTile };
}

function computeGroupSphere(group, tileByUri) {
  const spheres = [];
  for (const item of group.items) {
    const uri = basenameUri(item.uri);
    const tile = tileByUri.get(uri);
    if (tile && tile.boundingSphere) spheres.push(tile.boundingSphere);
  }
  if (spheres.length === 0) return null;
  if (spheres.length === 1) return spheres[0];

  let acc = Cesium.BoundingSphere.clone(spheres[0], new Cesium.BoundingSphere());
  for (let i = 1; i < spheres.length; i++) {
    acc = Cesium.BoundingSphere.union(acc, spheres[i], new Cesium.BoundingSphere());
  }
  return acc;
}

function createLayerContextMenu(onAction) {
  let menu = document.getElementById('layer-context-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'layer-context-menu';
    menu.className = 'layer-context-menu hidden';
    menu.innerHTML = `
      <button type="button" data-action="zoom">Zoom to Model</button>
      <button type="button" data-action="toggle">Show/Hide</button>
    `;
    document.body.appendChild(menu);
  }

  function hide() {
    menu.classList.add('hidden');
    menu.style.left = '-9999px';
    menu.style.top = '-9999px';
    menu.dataset.nodeType = '';
    menu.dataset.groupId = '';
    menu.dataset.uri = '';
  }

  function show(x, y, node) {
    menu.dataset.nodeType = node && node.type ? node.type : '';
    menu.dataset.groupId = node && node.groupId ? node.groupId : '';
    menu.dataset.uri = node && node.uri ? node.uri : '';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.remove('hidden');
  }

  menu.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
    if (!btn) return;
    const action = btn.dataset.action;
    const node = {
      type: menu.dataset.nodeType,
      groupId: menu.dataset.groupId,
      uri: menu.dataset.uri,
    };
    hide();
    if (onAction) onAction(action, node);
  });

  // Hide on outside click / escape
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target)) hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  return { show, hide };
}

async function setupLayerTree(viewer, tileset, tilesetUrl) {
  const host = document.getElementById('tileset-list');
  if (!host) return null;

  host.innerHTML = '';

  const tree = document.createElement('div');
  tree.className = 'layer-tree';

  const header = document.createElement('div');
  header.className = 'layer-tree-header';
  header.textContent = '3D Layers';
  tree.appendChild(header);

  host.appendChild(tree);

  const selected = { node: null };

  const { tileByUri, uriByTile } = await buildTilesetUriIndex(tileset, tilesetUrl || CONFIG.tilesetUrl);

  // Visibility state
  const visibleByUri = new Map();
  for (const group of LAYER_GROUPS) {
    for (const item of group.items) {
      const uri = basenameUri(item.uri);
      const def = item.defaultVisible;
      visibleByUri.set(uri, def === undefined ? true : !!def);
    }
  }

  function selectNode(node, rowEl) {
    selected.node = node;
    tree.querySelectorAll('.layer-row.selected').forEach(el => el.classList.remove('selected'));
    if (rowEl) rowEl.classList.add('selected');
  }

  function applyVisibilityToUri(uri, visible) {
    const u = basenameUri(uri);
    visibleByUri.set(u, !!visible);
    const tile = tileByUri.get(u);
    if (tile) {
      safeToggleShow(tile, !!visible);
      safeToggleShow(tile.content, !!visible);
    }
  }

  // Apply visibility when a tile content loads/turns visible
  if (tileset) {
    tileset.tileLoad.addEventListener((tile) => {
      const uri = uriByTile.get(tile);
      if (!uri) return;
      const visible = visibleByUri.get(uri);
      if (visible === false) safeToggleShow(tile && tile.content ? tile.content : null, false);
    });
    tileset.tileVisible.addEventListener((tile) => {
      const uri = uriByTile.get(tile);
      if (!uri) return;
      const visible = visibleByUri.get(uri);
      if (visible === false) safeToggleShow(tile && tile.content ? tile.content : null, false);
    });
  }

  function updateGroupCheckboxState(groupId) {
    const group = LAYER_GROUPS.find(g => g.id === groupId);
    if (!group) return;
    const cb = tree.querySelector(`input[data-kind="group"][data-group-id="${groupId}"]`);
    if (!cb) return;

    const states = group.items.map(it => visibleByUri.get(basenameUri(it.uri)) !== false);
    const allOn = states.every(Boolean);
    const anyOn = states.some(Boolean);
    cb.checked = allOn;
    cb.indeterminate = !allOn && anyOn;
  }

  function updateAllGroupStates() {
    for (const g of LAYER_GROUPS) updateGroupCheckboxState(g.id);
  }

  function toggleGroup(groupId, visible) {
    const group = LAYER_GROUPS.find(g => g.id === groupId);
    if (!group) return;
    for (const item of group.items) {
      const uri = basenameUri(item.uri);
      applyVisibilityToUri(uri, visible);
      const itemCb = tree.querySelector(`input[data-kind="item"][data-uri="${uri}"]`);
      if (itemCb) itemCb.checked = !!visible;
    }
    updateGroupCheckboxState(groupId);
  }

  function toggleItem(groupId, uri, visible) {
    applyVisibilityToUri(uri, visible);
    updateGroupCheckboxState(groupId);
  }

  function zoomToNode(node) {
    if (!node || !viewer) return;

    if (node.type === 'item') {
      const uri = basenameUri(node.uri);
      const tile = tileByUri.get(uri);
      if (tile && tile.boundingSphere) flyToBoundingSphere(viewer, tile.boundingSphere);
      else if (tileset && tileset.boundingSphere) flyToBoundingSphere(viewer, tileset.boundingSphere);
      return;
    }

    if (node.type === 'group') {
      const group = LAYER_GROUPS.find(g => g.id === node.groupId);
      const sphere = group ? computeGroupSphere(group, tileByUri) : null;
      if (sphere) flyToBoundingSphere(viewer, sphere);
      else if (tileset && tileset.boundingSphere) flyToBoundingSphere(viewer, tileset.boundingSphere);
    }
  }

  const ctxMenu = createLayerContextMenu((action, node) => {
    if (!node || !node.type) return;

    if (action === 'zoom') {
      zoomToNode(node);
      return;
    }

    if (action === 'toggle') {
      if (node.type === 'item') {
        const uri = basenameUri(node.uri);
        const next = !(visibleByUri.get(uri) !== false);
        const cb = tree.querySelector(`input[data-kind="item"][data-uri="${uri}"]`);
        if (cb) cb.checked = next;
        toggleItem(node.groupId, uri, next);
      } else if (node.type === 'group') {
        const group = LAYER_GROUPS.find(g => g.id === node.groupId);
        if (!group) return;
        const states = group.items.map(it => visibleByUri.get(basenameUri(it.uri)) !== false);
        const next = !states.every(Boolean);
        const cb = tree.querySelector(`input[data-kind="group"][data-group-id="${node.groupId}"]`);
        if (cb) cb.checked = next;
        toggleGroup(node.groupId, next);
      }
    }
  });

  for (const group of LAYER_GROUPS) {
    const groupWrap = document.createElement('div');
    groupWrap.className = 'layer-group';

    const groupRow = document.createElement('div');
    groupRow.className = 'layer-row group-row';

    const caret = document.createElement('button');
    caret.type = 'button';
    caret.className = 'layer-caret expanded';
    caret.title = 'Collapse/Expand';
    caret.textContent = 'v';

    const groupCb = document.createElement('input');
    groupCb.type = 'checkbox';
    groupCb.className = 'layer-checkbox';
    groupCb.dataset.kind = 'group';
    groupCb.dataset.groupId = group.id;

    const label = document.createElement('span');
    label.className = 'layer-label';
    label.textContent = group.name;

    groupRow.appendChild(caret);
    groupRow.appendChild(groupCb);
    groupRow.appendChild(label);

    const children = document.createElement('div');
    children.className = 'layer-children';

    caret.addEventListener('click', (e) => {
      e.stopPropagation();
      const collapsed = children.classList.toggle('collapsed');
      caret.textContent = collapsed ? '>' : 'v';
      caret.classList.toggle('expanded', !collapsed);
    });

    groupCb.addEventListener('change', (e) => {
      toggleGroup(group.id, e.target.checked);
    });

    groupRow.addEventListener('click', () => {
      selectNode({ type: 'group', groupId: group.id }, groupRow);
    });
    groupRow.addEventListener('dblclick', () => {
      zoomToNode({ type: 'group', groupId: group.id });
    });
    groupRow.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      selectNode({ type: 'group', groupId: group.id }, groupRow);
      ctxMenu.show(e.pageX, e.pageY, { type: 'group', groupId: group.id });
    });

    for (const item of group.items) {
      const uri = basenameUri(item.uri);
      const itemRow = document.createElement('div');
      itemRow.className = 'layer-row item-row';

      const spacer = document.createElement('span');
      spacer.className = 'layer-spacer';
      spacer.textContent = '';

      const itemCb = document.createElement('input');
      itemCb.type = 'checkbox';
      itemCb.className = 'layer-checkbox';
      itemCb.dataset.kind = 'item';
      itemCb.dataset.groupId = group.id;
      itemCb.dataset.uri = uri;
      itemCb.checked = visibleByUri.get(uri) !== false;

      const itemLabel = document.createElement('span');
      itemLabel.className = 'layer-label';
      itemLabel.textContent = labelFromUri(uri);

      if (!tileByUri.has(uri)) {
        itemRow.classList.add('missing');
        itemLabel.title = 'Not found in tileset.json';
      }

      itemCb.addEventListener('change', (e) => {
        toggleItem(group.id, uri, e.target.checked);
      });

      itemRow.addEventListener('click', () => {
        selectNode({ type: 'item', groupId: group.id, uri }, itemRow);
      });
      itemRow.addEventListener('dblclick', () => {
        zoomToNode({ type: 'item', groupId: group.id, uri });
      });
      itemRow.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectNode({ type: 'item', groupId: group.id, uri }, itemRow);
        ctxMenu.show(e.pageX, e.pageY, { type: 'item', groupId: group.id, uri });
      });

      itemRow.appendChild(spacer);
      itemRow.appendChild(itemCb);
      itemRow.appendChild(itemLabel);
      children.appendChild(itemRow);

      // Apply defaults immediately
      applyVisibilityToUri(uri, itemCb.checked);
    }

    groupWrap.appendChild(groupRow);
    groupWrap.appendChild(children);
    tree.appendChild(groupWrap);
  }

  updateAllGroupStates();

  return {
    getSelectedNode: () => selected.node,
    zoomSelected: () => zoomToNode(selected.node),
    zoomToNode,
  };
}
// â”€â”€â”€ Camera Controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function flyToTileset(viewer, tileset) {
  if (!tileset) return;

  viewer.flyTo(tileset, {
    duration: 2.0,
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),     // heading
      Cesium.Math.toRadians(-45),   // pitch
      tileset.boundingSphere.radius * 2.5  // range
    ),
  });
}

function flyToDefaultPosition(viewer) {
  const cam = CONFIG.defaultCamera;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(cam.longitude, cam.latitude, cam.height),
    orientation: {
      heading: Cesium.Math.toRadians(cam.heading),
      pitch: Cesium.Math.toRadians(cam.pitch),
      roll: 0,
    },
    duration: 2.0,
  });
}


// â”€â”€â”€ Height Offset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function applyHeightOffset(tileset, offsetMeters) {
  if (!tileset) return;

  // Get the current model matrix
  const boundingSphere = tileset.boundingSphere;
  const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);

  // Create a new model matrix with the height offset
  const surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    0
  );
  const offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    offsetMeters
  );

  const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}


// â”€â”€â”€ UI Updates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function setupUI(viewer, tileset) {
  // Panel toggle
  const toggle = document.getElementById('panel-toggle');
  const body = document.getElementById('panel-body');
  toggle?.addEventListener('click', () => {
    body.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
  });

  // Zoom to model
  document.getElementById('btn-zoom-model')?.addEventListener('click', () => {
    // If a specific layer/group is selected, zoom there; otherwise zoom to the whole tileset.
    const ctl = window.__layerTreeController;
    const selected = ctl?.getSelectedNode?.();
    if (selected && ctl?.zoomSelected) {
      ctl.zoomSelected();
      return;
    }
    if (tileset) flyToTileset(viewer, tileset);
    else flyToDefaultPosition(viewer);
  });

  // Toggle terrain
  let terrainOn = CONFIG.terrainProvider !== 'ellipsoid';
  const terrainBtn = document.getElementById('btn-toggle-terrain');
  if (terrainOn) terrainBtn?.classList.add('active');
  terrainBtn?.addEventListener('click', async () => {
    terrainOn = !terrainOn;
    terrainBtn.classList.toggle('active');
    if (terrainOn && CONFIG.cesiumIonToken) {
      try {
        viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
      } catch (e) {
        console.warn('Terrain toggle failed:', e);
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        terrainOn = false;
        terrainBtn.classList.remove('active');
      }
    } else {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  });

  // Toggle wireframe
  let wireframe = false;
  const wireBtn = document.getElementById('btn-toggle-wireframe');
  wireBtn?.addEventListener('click', () => {
    wireframe = !wireframe;
    wireBtn.classList.toggle('active');
    if (tileset) {
      tileset.debugWireframe = wireframe;
    }
  });

  // Toggle shadows
  let shadows = CONFIG.enableShadows;
  const shadowBtn = document.getElementById('btn-toggle-shadows');
  if (shadows) shadowBtn?.classList.add('active');
  shadowBtn?.addEventListener('click', () => {
    shadows = !shadows;
    shadowBtn.classList.toggle('active');
    viewer.shadows = shadows;
  });

  // Height offset slider
  const slider = document.getElementById('height-offset');
  const sliderValue = document.getElementById('height-offset-value');
  slider?.addEventListener('input', (e) => {
    const offset = parseFloat(e.target.value);
    sliderValue.textContent = offset;
    if (tileset) {
      const cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
      const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
      const offsetPos = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, offset);
      const translation = Cesium.Cartesian3.subtract(offsetPos, surface, new Cesium.Cartesian3());
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }
  });

  // Camera info updates
  viewer.scene.postRender.addEventListener(() => {
    const cam = viewer.camera;
    const carto = Cesium.Cartographic.fromCartesian(cam.position);
    if (carto) {
      const h = carto.height;
      document.getElementById('camera-height').textContent =
        h > 10000 ? `${(h / 1000).toFixed(1)} km` : `${h.toFixed(0)} m`;
      document.getElementById('camera-position').textContent =
        `${Cesium.Math.toDegrees(carto.longitude).toFixed(4)}Â°, ${Cesium.Math.toDegrees(carto.latitude).toFixed(4)}Â°`;
    }
  });

  // Mouse coordinate tracking
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
    const ray = viewer.camera.getPickRay(movement.endPosition);
    if (!ray) return;
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (cartesian) {
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      document.getElementById('mouse-coords').textContent =
        `Lon: ${Cesium.Math.toDegrees(carto.longitude).toFixed(6)}Â°  ` +
        `Lat: ${Cesium.Math.toDegrees(carto.latitude).toFixed(6)}Â°  ` +
        `H: ${carto.height.toFixed(1)}m`;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // Feature picking (click on model)
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && picked.tileset) {
      console.log('Picked feature:', picked);
      // You can add custom info popups here
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


function updateTilesetInfo(tileset) {
  if (!tileset) return;

  // Count tiles (static tree count, not "loaded now")
  let tileCount = 0;
  function countTiles(tile) {
    tileCount++;
    if (tile.children) {
      tile.children.forEach(countTiles);
    }
  }
  if (tileset.root) countTiles(tileset.root);

  document.getElementById('tile-count').textContent = tileCount;
}
// â”€â”€â”€ Auto-detect Tilesets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function discoverTilesets() {
  /**
   * Check the /api/tilesets endpoint for available tilesets.
   * Falls back to the default CONFIG.tilesetUrl if the API is unavailable.
   */
  try {
    const resp = await fetch('/api/tilesets');
    if (resp.ok) {
      const data = await resp.json();
      if (data.tilesets && data.tilesets.length > 0) {
        return data.tilesets.map(t => t.url);
      }
    }
  } catch (e) {
    // API not available (e.g., static hosting)
  }

  return [CONFIG.tilesetUrl];
}


// â”€â”€â”€ Main Entry Point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

(async function main() {
  try {
    // Initialize viewer
    const viewer = await initViewer();

    // Discover and load tilesets
    const tilesetUrls = await discoverTilesets();
    let primaryTileset = null;
    let primaryTilesetUrl = null;

    for (const url of tilesetUrls) {
      setLoadingStatus(`Loading: ${url}`);
      const tileset = await loadTileset(viewer, url);
      if (tileset && !primaryTileset) {
        primaryTileset = tileset;
        primaryTilesetUrl = url;
      }
    }
    // Setup layer tree UI (groups + visibility + zoom)
    window.__layerTreeController = await setupLayerTree(viewer, primaryTileset, primaryTilesetUrl);

    // Setup UI
    setupUI(viewer, primaryTileset);

    if (primaryTileset) {
      // Cesium3DTileset.fromUrl() returns a ready tileset (no readyEvent needed)
      updateTilesetInfo(primaryTileset);
      flyToTileset(viewer, primaryTileset);
    } else {
      // No tileset â€” fly to default position
      flyToDefaultPosition(viewer);
    }

    // Hide loading overlay
    setTimeout(() => {
      document.getElementById('loading-overlay')?.classList.add('hidden');
    }, 1000);

    // Expose for debugging
    window.viewer = viewer;
    window.tileset = primaryTileset;
    console.log('Datum 3D Viewer ready. Access via: window.viewer, window.tileset');

  } catch (error) {
    console.error('Viewer initialization failed:', error);
    setLoadingStatus(`Fatal error: ${error.message}`);
  }
})();



