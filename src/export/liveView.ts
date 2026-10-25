import type * as THREE from 'three';

/** The camera of the 3D view on screen, so an export can include the current view as a photo. */
let live: THREE.PerspectiveCamera | null = null;

export const setLiveCamera = (camera: THREE.PerspectiveCamera | null) => void (live = camera);
export const liveCamera = () => live;
