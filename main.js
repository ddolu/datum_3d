/**
 * ============================================================================
 *  Datum 3D — CesiumJS Viewer
 *  
 *  Open source 3D Tiles viewer. No Cesium Ion required.
 *  Loads tileset.json from /tiles/ and displays models at their 
 *  correct geographic positions using ECEF transform matrices.
 * ============================================================================
 */

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  // Tileset URL — relative to the server root
  tilesetUrl: './tiles/tileset.json',

  // Cesium Ion access token — ONLY needed for Cesium World Terrain.
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
    longitude: 49.930,  // degrees East — Baku, Caspian Sea area
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


// ─── Initialize Viewer ─────────────────────────────────────────────────────

function setLoadingStatus(msg) {
  const el = document.getElementById('loading-status');
  if (el) el.textContent = msg;
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

    // Use OpenStreetMap as default imagery (free, no token)
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: 'https://tile.openstreetmap.org/',
    }),
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


// ─── Load 3D Tiles ──────────────────────────────────────────────────────────

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


// ─── Camera Controls ────────────────────────────────────────────────────────

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


// ─── Height Offset ──────────────────────────────────────────────────────────

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


// ─── UI Updates ─────────────────────────────────────────────────────────────

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
    if (tileset) {
      flyToTileset(viewer, tileset);
    } else {
      flyToDefaultPosition(viewer);
    }
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
        `${Cesium.Math.toDegrees(carto.longitude).toFixed(4)}°, ${Cesium.Math.toDegrees(carto.latitude).toFixed(4)}°`;
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
        `Lon: ${Cesium.Math.toDegrees(carto.longitude).toFixed(6)}°  ` +
        `Lat: ${Cesium.Math.toDegrees(carto.latitude).toFixed(6)}°  ` +
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

  const listEl = document.getElementById('tileset-list');
  if (!listEl) return;

  // Count tiles
  let tileCount = 0;
  function countTiles(tile) {
    tileCount++;
    if (tile.children) {
      tile.children.forEach(countTiles);
    }
  }
  if (tileset.root) countTiles(tileset.root);

  document.getElementById('tile-count').textContent = tileCount;

  // Tileset info
  const bs = tileset.boundingSphere;
  const carto = Cesium.Cartographic.fromCartesian(bs.center);
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(4);
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(4);

  listEl.innerHTML = `
    <div class="tileset-item">
      <span class="name">📦 3D Model</span>
      <span class="badge">${tileCount} tile(s)</span>
    </div>
    <div class="tileset-item">
      <span class="name">📍 ${lon}°, ${lat}°</span>
      <span class="badge">${(bs.radius).toFixed(0)}m</span>
    </div>
  `;
}


// ─── Auto-detect Tilesets ───────────────────────────────────────────────────

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


// ─── Main Entry Point ───────────────────────────────────────────────────────

(async function main() {
  try {
    // Initialize viewer
    const viewer = await initViewer();

    // Discover and load tilesets
    const tilesetUrls = await discoverTilesets();
    let primaryTileset = null;

    for (const url of tilesetUrls) {
      setLoadingStatus(`Loading: ${url}`);
      const tileset = await loadTileset(viewer, url);
      if (tileset && !primaryTileset) {
        primaryTileset = tileset;
      }
    }

    // Setup UI
    setupUI(viewer, primaryTileset);

    if (primaryTileset) {
      // Cesium3DTileset.fromUrl() returns a ready tileset (no readyEvent needed)
      updateTilesetInfo(primaryTileset);
      flyToTileset(viewer, primaryTileset);
    } else {
      // No tileset — fly to default position
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
